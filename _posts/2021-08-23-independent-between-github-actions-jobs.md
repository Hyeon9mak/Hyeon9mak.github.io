---
title: "Github-actions 작업간 독립성"
date: 2021-08-23
tags:
    - github actions
    - workflow
toc: true
toc_sticky: true 
toc_label: "Github-actions 작업간 독립성"
---

## 🐹 summary
스프링부트 서버 빌드와 소나큐브 서버 빌드를 하나의 `workflow.yml` 파일로 관리하던 중,
소나큐브 서버 빌드시 동작하는 jacoco가 스프링부트 서버 빌드에서 진행되는 테스트코드 결과물(부산물)을 필요로 한다는 걸 깨닫고 
스프링부트 서버 빌드가 소나큐브 서버 빌드보다 먼저 실행되도록 `needs` 키워드를 통해 의존성을 부여했다.

```yml
...(생략)
jobs:
  deploy-build:
    runs-on: deploy

    steps:
    - uses: actions/checkout@v2
    - name: Set up JDK 8
      uses: actions/setup-java@v2
      with:
        java-version: '8'
        distribution: 'adopt'

    - name: gradlew 권한 변경
      working-directory: ./back/babble
      run: chmod +x gradlew

    - name: 빌드 진행
      ...(생략)

  sonarqube-build:
    runs-on: deploy
    needs: deploy-build    # <- needs 키워드

    steps:
    - uses: actions/checkout@v2
    - name: Set up JDK 11
      uses: actions/setup-java@v2
      with:
        java-version: '11'
        distribution: 'adopt'

    - name: gradlew 권한 변경
      working-directory: ./back/babble
      run: chmod +x gradlew

    - name: 소나큐브 빌드 진행
      ...(생략)

```

![image](https://user-images.githubusercontent.com/37354145/129822858-755fd20b-7336-42e1-a48c-1aab8c999e75.png)

그렇게 PR을 작성했는데, 포츈이 `gradlew` 파일의 권한을 매 번 바꾸는 것에 대해 의문을 표했다.

![image](https://user-images.githubusercontent.com/37354145/129823232-82ab8ec5-7fea-43f4-8ae3-a786cb83f204.png)

작업 단위인 `job` 간에는 서로 독립된 환경을 이룰 것이라고 생각하고 있었는데, 포츈의 의견도 충분히 일리가 있었다.
때문에 직접 테스트를 진행해보게 되었다.

<br>

## 🐹 테스트 1번 - 파일 권한 변화가 영구적으로 유지되는가?
우선 파일 권한의 변화가 영구적으로 유지되는지 테스트가 필요했다. 
이를 위해서 파일 권한을 변경하는 action 동작을 총 2회 수행시켰다.

### 테스트 1번 - 1차 실행 
```yml
jobs:
  build:

    runs-on: ubuntu-latest

    steps:
    - uses: actions/checkout@v2
    - name: Set up JDK 11
      uses: actions/setup-java@v2
      with:
        java-version: '11'
        distribution: 'adopt'
        
    - name: graldew 파일 권한 확인
      run: ls -l gradlew
    - name: graldew 파일 권한 수정
      run: chmod 777 gradlew
    - name: graldew 파일 권한 확인
      run: ls -l gradlew
```

![image](https://user-images.githubusercontent.com/37354145/128650717-cccc0841-70b0-4bdc-81a0-1dda89adb7d5.png)

1차 실행을 통해 파일 권한의 기본 값이 `-rwxr-xr-x(755)` 인 것을 알 수 있다. 
1차 실행에서 파일의 권한을 `-rwxrwxrwx(777)`로 변경해두었다. 
2차 실행시 기대 값은 `-rwxrwxrwx(777)`에서 `-rw-r--r--(644)`로 변경되는 것이다.

### 테스트 1번 - 2차 실행
```yml
jobs:
  build:

    runs-on: ubuntu-latest

    steps:
    - uses: actions/checkout@v2
    - name: Set up JDK 11
      uses: actions/setup-java@v2
      with:
        java-version: '11'
        distribution: 'adopt'
        
    - name: graldew 파일 권한 확인
      run: ls -l gradlew
    - name: graldew 파일 권한 수정
      run: chmod 644 gradlew
    - name: graldew 파일 권한 확인
      run: ls -l gradlew
```
![image](https://user-images.githubusercontent.com/37354145/128650753-8c19df30-81ac-4b0a-b5de-576f5deaefc6.png)

파일 권한이 `-rwxrwxrwx(777)`로 유지되지 않고 기본 값 `-rwxr-xr-x(755)`로 돌아와 있는 것을 볼 수 있었다.

### 테스트 1번 - 결론
파일 권한은 영구적으로 적용되지 않는다.

<br>

## 🐹 테스트 2번 - job 끼리는 서로 같은 환경에서 동작하는가?
테스트 1번을 통해 매 action 마다 환경이 초기화 된다는 것을 확인할 수 있었다.
그렇다면 하나의 action에서 job 단위로 구분하는 경우에도 초기화가 될까?
아니면 서로 같은 환경에서 데이터를 공유할까?

이번엔 2개의 job을 담아 action 동작을 총 1회 수행시켰다.

```yml
jobs:
  first-build:
    runs-on: ubuntu-latest

    steps:
    - uses: actions/checkout@v2
    - name: Set up JDK 11
      uses: actions/setup-java@v2
      with:
        java-version: '11'
        distribution: 'adopt'
        
    - name: graldew 파일 권한 확인1
      run: ls -l gradlew
      
    - name: graldew 파일 권한 수정1
      run: chmod 777 gradlew
      
    - name: graldew 파일 권한 확인1
      run: ls -l gradlew

  second-build:
    runs-on: ubuntu-latest
    needs: first-build

    steps:
    - uses: actions/checkout@v2
    - name: Set up JDK 11
      uses: actions/setup-java@v2
      with:
        java-version: '11'
        distribution: 'adopt'
        
    - name: graldew 파일 권한 확인2
      run: ls -l gradlew
```

### 테스트 2번 - 실행
![image](https://user-images.githubusercontent.com/37354145/128650913-8f15bdce-7533-4008-8739-2f9e8dfac5d7.png)
![image](https://user-images.githubusercontent.com/37354145/128650923-1586c84e-5d62-4288-b265-462cefbe5abb.png)

`first-build`를 `second-build`의 needs로 의존성을 부여해서 순서를 명확히 강제하고 의존관계를 갖게 했음에도
`first-build`에서 변경시킨 파일권한 `-rwxrwxrwx(777)`이 유지 되지 않고 `-rwxr-xr-x(755)`로 초기화 된 걸 확인 가능했다.

### 테스트 2번 - 결론
job 간에도 파일 권한은 공유되지 않는다. 별개의 환경에서 동작한다.

<br>

## References
- [워크플로우 동작 사이 의존성 부여 - 2021-babble PR](https://github.com/woowacourse-teams/2021-babble/pull/369)

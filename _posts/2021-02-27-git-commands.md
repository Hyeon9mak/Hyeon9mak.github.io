---
title: "깃 명령어 정리"
date: 2021-02-27
tags:
- git
toc: true
toc_sticky: true
toc_label: "깃 명령어 정리"
---

함께 제이슨 팀에 속해있는 [매력덩어리 와일더](https://github.com/lns13301) 가 깃 명령어에 대해 공부하고 
이를 정리하여 테코톡 형식으로 발표를 진행했었다. 와일더의 발표를 들으면서 새롭게 배운 명령어들이 많아 
기억속에서 잊혀지기 전에 정리해보고자 한다!

## 브랜치(branch)
브랜치가 뭔지는 안다. 그런데 누군가 "브랜치가 뭔가요?" 라고 물으면 무어라 답해야할지 난감하다. 
와일더에 이에 대해 잘 정리해서 알려줬다. **하나의 소스코드 내에서 나누어낸 독립적인 작업 영역**이라고 보면 되겠다.

![슬라이드1](https://user-images.githubusercontent.com/37354145/109371491-8a1f8780-78e8-11eb-810f-32179247dd1b.png)

현재 `main` 브랜치가 `커밋0`, `커밋1`을 이어가고 있는 상황이다. 
여기서 `step1` 이라는 새로운 브랜치를 만들어보자.

```java
% git branch step1
```

![슬라이드2](https://user-images.githubusercontent.com/37354145/109371493-8c81e180-78e8-11eb-8159-b2a98451b1ca.png)

새로운 `step1` 브랜치가 생성된 것을 볼 수 있다. 그러나 `*`는 여전히 `main` 브랜치를 가리키고 있다. 
`*`의 위치를 `step1`으로 변경시켜주어야 작업 내역이 `step1` 브랜치에 기록된다.

`*`의 위치를 변경시키기 위한 명령어가 2가지 존재한다. 흔하고 널리 쓰이는 것이 `checkout`인데,
[`checkout` 명령어 하나가 가진 기능이 너무 많기 때문](https://git-scm.com/docs/git-checkout) 에
Git 2.23 버전부터 `switch`, `resotre` 명령어로 `checkout`의 기능을 분리시켰다.

```
% git checkout step1
% git switch step1
```

![슬라이드3](https://user-images.githubusercontent.com/37354145/109371495-8d1a7800-78e8-11eb-951c-68fdd484f146.png)

`checkout` 또는 `switch` 명령어를 사용한 후, `*`가 `step1`을 가리키게 된 것을 확인 할 수 있다. 
이제 원하는 작업 진행 후 커밋을 해보자. 커밋 단계까지 명령어들은 아래와 같다.

- `status` : 현재 작업 영역에 포함된 파일들의 상태 확인
- `add` : 커밋에 등록시킬 파일 선택
- `commit` : 커밋 진행

```java
% git status
% git add .
% git commit -m "test: 커밋하고 있슈"
```

![슬라이드4](https://user-images.githubusercontent.com/37354145/109371497-8db30e80-78e8-11eb-9745-ef31043b81a2.png)

위의 그림과 같이 `main` 브랜치는 `커밋1` 에서 유지되고 있고, `step1` 브랜치만 `커밋2`를 생성함과 함께 
커밋 내역을 갱신시켜 나감을 확인 할 수 있다.

<br>

## 작업 합치기 - Merge
![슬라이드5](https://user-images.githubusercontent.com/37354145/109373878-dec8ff80-78f4-11eb-96f0-02d7733914ea.png)

`커밋2` 에서 버그가 발생한 후 `bugFix` 브랜치를 생성하여 버그를 수정한 상태이다. 
버그를 수정한 `bugFix` 브랜치를 `step1` 브랜치에 합치고 싶다면 어떻게 해야할까? 
우선 `step1` 브랜치로 이동해보자.

```
% git switch step1
```

![슬라이드6](https://user-images.githubusercontent.com/37354145/109373881-e12b5980-78f4-11eb-8f5d-4fb5fa681ad7.png)

`step1` 브랜치로 이동한 상태에서 `bugFix` 브랜치를 합친다. 합치는 명령어는 `merge`다.

```
% git merge bugFix
```

![슬라이드7](https://user-images.githubusercontent.com/37354145/109373882-e1c3f000-78f4-11eb-8033-b257b3940e36.png)

`merge` 명령어가 수행되면 `커밋2`와 `커밋3`이 합쳐진 `커밋4`가 생성된다.  
  
이 때! 만약 `커밋2`와 `커밋3`의 소스코드 수정 영역이 동일하다면 충돌이 발생하게 된다. 
그럴 경우 가져갈 최종 코드만 남겨두고, 나머지 충돌되는 코드는 지워야한다. (충돌해결) 
현재 예시는 충돌 문제가 없었으므로 `커밋4`가 곧장 생성되었다.  
  
`bugFix`는 여전히 `커밋3`을 가리키고 있다. 저대로 두어도 상관없지만, 만일 `bugFix`도 최신화 시켜주고 싶다면 
어떻게 해야할까? 우선 `bugFix` 브랜치로 이동해보자.

```
% git switch bugFix
```

![슬라이드8](https://user-images.githubusercontent.com/37354145/109373884-e25c8680-78f4-11eb-9c4d-43719e17de79.png)

`bugFix` 브랜치로 이동된 상태에서 다시 `step1` 브랜치로 합치게 되면 `bugFix` 브랜치도 최신화가 된다.  

```
% git merge step1
```

![슬라이드9](https://user-images.githubusercontent.com/37354145/109373887-e2f51d00-78f4-11eb-855b-39b04ac57c29.png)

`step1` 브랜치에서 `bugFix` 브랜치를 합칠 때처럼, `bugFix` 브랜치에서 `step1` 브랜치를 합칠 때에도 
새로운 `커밋5`를 만들면서 뻗어나갈 수 있었을텐데 최신화만 이루어진 이유는 무엇일까?  
  
간단하게 생각해서 **이미 `커밋4` 쪽으로 로그(화살표)가 뻗어나갔기 때문**에 로그를 따라 최신화만 진행했다고 
생각하면 되겠다.

<br>

## 작업 합치기 - Rebase


## HEAD

## 복구

## Remote

## Cherry-pick
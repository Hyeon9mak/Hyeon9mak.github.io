---
title: "깃 브랜치 전략"
date: 2021-03-08
tags:
    - git
    - 우아한테크코스
toc: true
toc_sticky: true
toc_label: "깃 브랜치 전략"
---

우아한테크코스가 시작되었던 첫주차 주말, Racing Car 미션 저장소의 브랜치들이 모두 사라지는 사고가 발생했었다. 
크루원들의 브랜치명이 잘못되었다는 것을 알아차리고 재빠르게 브랜치들을 복구한 제이슨. 
그리고 그 과정을 지켜보던 웨지가 "어떤 브랜치를 사용하건 커밋은 커밋인데 왜 브랜치 나누기를 중요시하지?" 라는 
의문을 가지고 제이슨에게 질문 DM을 보냈다가 발표까지 하게 되었다고 한다. 🤣
  
[우아한테크코스 낮고 울리는 목소리 투탑 중 한명인 웨지](https://github.com/sihyung92) 가 발표해준 
깃 브랜치 전략에 대해 정리해보자.

<br>

## 🍟 브랜치를 계속 나누는 이유
우테코 미션들을 살펴보면 미션 저장소의 중심을 잡고 있는 `master` 브랜치, 
각각의 크루들이 미션을 시작할 때 생성하는 `자신들의 닉네임` 브랜치, 
미션을 진행하면서 개발한 코드(커밋)들이 직접적으로 포함되는 `step1`, `step2` 브랜치로 
한 사람당 최소 4개의 브랜치를 확인할 수 있다.  
  
이렇게까지 브랜치를 나누는 이유는 무엇일까? 
그것은 바로 자연스럽게 **git-flow 브랜치 전략**을 체화시키기 위함이다.  
  
브랜치 전략이란 **여러 개발자가 하나의 저장소를 사용하는 환경에서 
저장소를 효과적으로 활용하기 위한 work-flow다.** 
브랜치의 생성, 삭제, 병합 등 git의 유연한 구조를 활용해서 각 개발자들의 혼란을 최대한 줄이며 
다양한 방식으로 소스를 관리하는 역할을 한다.  
  
즉, 브랜치 생성에 규칙을 만들어서 협업을 유연하게 하는 방법론이다.

<br>

## 🍟 브랜치 전략이 없으면?
"깃 자체도 복잡한데 브랜치 전략까지 익혀야하나?" 라고 충분히 생각할 수 있다. 
안타깝게도 대답은 "그렇다."이다. 브랜치 전략이 없을 때 단점은 깃을 사용한지 얼마 안됐던 개발자라면 
모두 겪어본 상황들이다.

> - 어떤 브랜치가 최신 브랜치지?  
>   어떤 브랜치를 끌어와서 개발을 시작해야 하지?  
>   어디에 Push를 보내야 하지?
> - 핫픽스를 해야하는데 어떤 브랜치를 기준으로 수정해야할까?
>   배포 버전은 어떤 걸 골라야하지?

규모가 어느정도 이상 되는 저장소를 상대로 충분히 겪어본 상황일 것이다. 
이런 상황을 최소화하기 위해 사용되는 것이 브랜치 전략이다.  
  
브랜치 전략을 사용해야할 당위성을 찾았으니, 어떤 브랜치 전략을 사용하면 좋을지를 고민해보아야 한다. 
우리는 그 중에서 가장 유명하고, 가장 널리 사용되는 2가지에 대해 알아볼 것이다.

<br>

## 🍟 간단하고 민첩한 Github-flow
![슬라이드1](https://user-images.githubusercontent.com/37354145/110271722-ed599a00-800b-11eb-99c9-d9fe8bed0f20.png)

**Github-flow** 는 1개의 `master` 브랜치와 PR을 활용한 단순하고 민첩한 브랜치 전략이다.
`master` 브랜치는 제품이 릴리즈되는 가장 최신 버전의 브랜치이며, 모든 개발 내용이 `master` 브랜치를
중심으로 이루어진다.  
  
순서대로 그림을 따라가면서 Github-flow 개발 프로세스를 이해해보자.

<br>

### 1. 브랜치 생성
![슬라이드2](https://user-images.githubusercontent.com/37354145/110271724-ed599a00-800b-11eb-9709-116491dab98d.png)

Github-flow 전략은 기능 개발, 버그 픽스 등 어떤 이유로든 새로운 브랜치를 생성하는 것으로 시작된다. 
단, 이때 체계적인 분류 없이 브랜치 하나에 의존하게 되기 때문에 
**브랜치 이름을 통해 의도를 명확하게 드러내는 것이 매우 중요**하다.

<br>

### 2. 열심히 개발! 열심히 커밋!
![슬라이드3](https://user-images.githubusercontent.com/37354145/110271726-edf23080-800b-11eb-96db-f48d64cbc249.png)

열심히 개발을 진행하면서 열심히 커밋을 남긴다!  
이때도 브랜치와 같이 커밋 메세지에 의존해야 하기 때문에, 커밋 메세지를 최대한 상세하게 적어주는 것이 중요하다.

<br>


### 3. PR 생성
![슬라이드4](https://user-images.githubusercontent.com/37354145/110271727-edf23080-800b-11eb-9911-87845f27da16.png)

개발이 완료되었다면 `master` 브랜치 쪽으로 Pull-Request를 생성한다.

<br>

### 4. 리뷰, 토의, 리뷰, 토의
![슬라이드5](https://user-images.githubusercontent.com/37354145/110271728-ee8ac700-800b-11eb-82a0-744c87163305.png)

추웅~분한 리뷰와 토의를 거친다. 
Pull-Request가 `master` 브랜치 쪽에 합쳐진다면 곧장 라이브 서버에 배포되는 것과 다름 없으므로 
굉장히 상세한 리뷰와 토의가 이루어져야만 한다.

<br>

### 5. 토의가 끝났어도 테스트
![슬라이드6](https://user-images.githubusercontent.com/37354145/110271729-ee8ac700-800b-11eb-8834-fd0f077f337e.png)

리뷰와 토의가 끝났다면 해당 내용을 라이브 서버(혹은 테스트 환경)에 배포해본다. 
배포시 문제가 발생한다면 곧장 `master` 브랜치의 내용을 다시 배포하여 초기화 시킨다.

<br>

### 6. 최종 Merge
![슬라이드7](https://user-images.githubusercontent.com/37354145/110271731-ef235d80-800b-11eb-84d3-e4d52dbddc55.png)

라이브 서버(혹은 테스트 환경)에 배포했음에도 문제가 발견되지 않았다면 그대로 `master` 브랜치에 푸시를 하고, 
즉시 배포를 진행한다. 대부분의 Github-flow 에선 `master` 브랜치를 최신 브랜치라고 가정하기 때문에 
배포 자동화 도구를 이용해서 Merge 즉시 배포를 시킨다.

<br>

## 🍟 Github-flow의 특징
- 브런치 전략이 단순하며 git을 처음 접하는 사람도 쉽게 접근할 수 있다.
- CI / CD 가 자연스럽게 이루어 진다.

---

**CI(Continuous Integration)**는 
소스코드 변경 사항이 정기적으로 빌드 및 테스트되어 remote 저장소에 통합되는, 즉 빌드 및 테스트의 자동화를 의미한다. 
지속적인 통합을 통해서 코드의 품질을 유지시키며, 여러 개발자가 동시에 소스코드 수정작업을 할 때 충돌을 최대한 줄여준다.  
  
**CD(Continuous Deployment)**는 배포를 일일히 개발자가 하면 힘드니까 자동화 시키는 것, 즉 배포의 자동화다.  
  
Github-flow는 하나의 `master` 브랜치에 의존하기 때문에 자연스럽게 CI/CD가 진행된다.

<br>

## 🍟 복잡하지만 체계적인 git-flow
![0](https://user-images.githubusercontent.com/37354145/110271699-e894e600-800b-11eb-9b96-d89a29033f5d.png)

**git-flow**는 5가지의 브랜치를 이용해서 저장소를 운영하는 브랜치 전략이다. 
5가지 중 항시 유지되는 메인 브랜치 `master`, `develop` 2가지와 
merge 되면 사라지는 보조 브랜치 `feature`, `release`, `hotfix` 3가지로 구성된다.

---
- `master` : 라이브 서버에 제품으로 출시되는 브랜치.
- `develop` : 다음 출시 버전을 대비하여 개발하는 브랜치.
- `feature` : 기능 개발 브랜치. `develop` 브랜치에 들어간다.
- `release` : 다음 버전 출시를 준비하는 브랜치. `develop` 브랜치를 
    `release` 브랜치로 옮긴 후 QA, 테스트를 진행하고 `master` 브랜치로 합친다.
- `hotfix` : `master` 브랜치에서 발생한 버그를 수정하는 브랜치.

---

git-flow 역시 그림을 따라가면서 개발 프로세스를 이해해보자.

### 1. 신규 기능 개발
![1](https://user-images.githubusercontent.com/37354145/110271706-ea5ea980-800b-11eb-8403-16aba0345fd6.png)

개발자는 `develop` 브랜치로부터 본인이 신규 개발할 기능을 위한 `feature` 브랜치를 생성한다. 
`feature` 브랜치에서 기능을 완성하면 `develop` 브랜치에 merge를 진행하게 된다.

### 2. 라이브 서버로 배포
![2](https://user-images.githubusercontent.com/37354145/110271716-eb8fd680-800b-11eb-9d53-67016448f9bf.png)

`feature` 브랜치들이 모두 `develop` 브랜치에 merge 되었다면 QA와 테스트를 위해 `release` 브랜치를 생성한다. 
`release` 브랜치를 통해 오류가 확인된다면 `release` 브랜치 내에서 수정을 진행한다. 
QA와 테스트를 모두 통과했다면, 배포를 위해 `release` 브랜치를 `master` 브랜치 쪽으로 merge하며, 
만일 `release` 브랜치 내부에서 오류 수정이 진행되었을 경우 동기화를 위해 `develop` 브랜치 쪽에도 
merge를 진행한다.

### 3. 배포 후 관리
![3](https://user-images.githubusercontent.com/37354145/110271720-ecc10380-800b-11eb-9357-0d3929ac93dc.png)

만일 배포된 라이브 서버(`master`)에서 버그가 발생된다면, `hotfix` 브랜치를 생성하여 
버그 픽스를 진행하고, 종료된 버그 픽스를 `master`와 `develop` 양 쪽에 merge하여 동기화 시킨다.

<br>

## 🍟 git-flow의 특징
- 주기적으로 배포하는 서비스에 적합하다.
- 가장 유명한 전략인 만큼 수 많은 IDE에서 시각화 도구, GUI 도구를 지원해준다.

---

브랜치별 명명법이 조금씩 다른데, `master`는 `main`과 혼용하여 사용되고 있다. 
([혼용하여 사용되는 이유는 여기를 확인하자.](https://hyeon9mak.github.io/github-default-branch-main/)) 
보조 브랜치들은 `feature-네이밍`, `realse-네이밍`, `hotfix-네이밍` 형태로 사용된다.

위 예시 그림들은 모두 공동(remote) 저장소의 상황을 표현한 것이고, 
개발자 개인별 로컬에서는 `feature` 브랜치를 하나 땡겨와서 개발하는 등의 그림이 그려질 것이다.  
  
**"그럼 git-flow 전략을 사용하면 CI?CD가 어려운가?"** 라는 궁금증이 생길 수 있다. 
이에 대한 웨지의 답변은 "Github-flow가 상대적으로 쉽다는 것이지, git-flow가 어려울 것은 없다."고 한다. 

<br>

## 🍟 그래서 뭘 쓰라고?
결론부터 말하자면, **상황마다 다르다.**  
  
굳이 사용처를 나누자면 아래와 같다.

---

- 1개월 이상의 긴 호흡으로 개발하여 주기적으로 배포, QA 및 테스트, hotfix 등 수행할 수 있는  
  여력이 있는 팀이라면 **git-flow**가 적합하다
  
- 수시로 릴리즈 되어야 할 필요가 있는 서비스를 지속적으로 테스트하고 배포하는 팀이라면  
  **github-flow** 와 같은 간단한 work-flow가 적합하다

---

<br>

이렇게 웨지의 깃 브랜치 전략 발표를 정리해보았다. 
회를 먹을 때 '모르고 먹는 것보다 알고 먹는게 더 맛있다.' 라는 말을 좋아한다. 
마찬가지로 깃 브랜치 전략을 모를 땐 `step1`, `step2` 브랜치를 나누고 미션을 진행하는 것이 번거롭게만 
느껴졌지만, 브랜치 전략을 공부하고 나니 git-flow 전략을 체화하는 과정으로 의미있게 느껴지고 있다.  
  
배울게 참 많다. 끗!

<br>

## References
- [우린 Git-flow를 사용하고 있어요](https://woowabros.github.io/experience/2017/10/30/baemin-mobile-git-branch-strategy.html)
- [A successful Git branching model](https://nvie.com/posts/a-successful-git-branching-model/)
- [Git flow, GitHub flow, GitLab flow](https://ujuc.github.io/2015/12/16/git-flow-github-flow-gitlab-flow/)
- [git 브랜칭 전략과 git flow](https://ohgyun.com/402)
- [GitHub Flow](https://scottchacon.com/2011/08/31/github-flow.html)
- [Understanding the GitHub flow](https://guides.github.com/introduction/flow/)
- [Git Flow vs Github Flow](https://lucamezzalira.com/2014/03/10/git-flow-vs-github-flow/)
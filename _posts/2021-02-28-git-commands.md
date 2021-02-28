---
title: "깃 명령어 정리"
date: 2021-02-28
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

## 브랜치를 끌고나가는 - HEAD
![슬라이드14](https://user-images.githubusercontent.com/37354145/109405835-c4a42580-79b7-11eb-90fc-807a05c7fcc6.png)

계속해서 `*` 기호가 브랜치 이름 옆에 등장할 것이다. 과연 이 `*`의 정체는 무엇일까?
현재 최신 작업 내용이 기록되어 있는 커밋의 해쉬코드 값으로 브랜치를 변경해보면 정답을 알 수 있다.

```
% git checkout (커밋1의 해쉬코드값)
```

![슬라이드15](https://user-images.githubusercontent.com/37354145/109405836-c53cbc00-79b7-11eb-92e5-7394f1de59b5.png)

짜잔. `HEAD`라는 녀석이 튀어나왔다.

`HEAD`는 현재 `checkout`된 (혹은 `switch`)된 커밋을 가리킨다. 즉, 현재 작업중인 커밋이라는 이야기다.
`HEAD`는 항상 현재 작업트리의 최신 커밋을 가리키고 있다.**작업트리에 변화를 주는 모든 git 명령어**는 `HEAD`를 기준으로 시작된다.

궁금증을 해결했으니 `HEAD`를 다시 원상복귀 시켜보자.

```
% git checkout main
```

![슬라이드16](https://user-images.githubusercontent.com/37354145/109405837-c5d55280-79b7-11eb-883a-57be50e58543.png)

원상복귀 되었다. 원래 하던 작업을 그대로 이어나가면 된다.

<br>

## 커밋위치 상대참조
![슬라이드17](https://user-images.githubusercontent.com/37354145/109405839-c5d55280-79b7-11eb-923b-ee2c4eb45b92.png)

복잡해보이는 커밋로그에서 원하는 커밋으로 작업환경을 이동시키려면 어떻게 해야할까? 
다행스럽게도 깃에서는 상대참조 기능을 제공하고 있다. 상대참조를 사용하기 위해선 
우선 현재 `HEAD`의 위치부터 파악해야 한다. 위 예시에서 `HEAD`의 위치는 `step1 - 커밋5`다.  
  
`HEAD`가 `커밋4`를 가리키도록 상대참조를 해보자.

```
% git checkout HEAD^
```

![슬라이드18](https://user-images.githubusercontent.com/37354145/109405840-c66de900-79b7-11eb-85f6-a089d7731b41.png)

`HEAD`가 `커밋4`로 이동한 것을 확인할 수 있다. 즉, 상대참조는 `^` 기호를 통해서 수행할 수 있다. 
`~` 기호 역시 동일한 기능을 제공하므로 참고해두자.  
  
만일 여러 커밋을 한 번에 2개 건너뛰어 이동하고 싶다면 어떻게 하면 될까? 2가지 방법이 존재한다.

```
% git checkout HEAD^^
```
```
% git checkout HEAD^2
```

![슬라이드19](https://user-images.githubusercontent.com/37354145/109405841-c66de900-79b7-11eb-9494-54915ac4eb72.png)

2가지 방법 중 하나를 이용하면 위와 같이 여러 커밋을 한 번에 건너뛰어 이동시킬 수 있다.  
  
상대참조는 `HEAD`뿐만 아니라 브랜치가 가리키고 있는 커밋 또한 변경시켜 줄 수 있다. 
현재 `커밋7`을 가리키고 있는 `step2`를 `커밋3`을 가리키도록 바꿔보자.

```
% git branch -f step2 step1~2
```

![슬라이드20](https://user-images.githubusercontent.com/37354145/109405842-c7067f80-79b7-11eb-8bc1-809472e02e99.png)

`branch` 명령을 통해 `step2` 브랜치가 가리키는 지점을 이동시킬 것을 명령하고, 그 지점은 `step1`에서 2칸 
떨어진 지점임을 상대참조 시켰다. (`-f` 옵션은 **force**, 명령어를 강제로 수행할 것을 의미한다.)

<br>

## 작업 합치기 - Merge
![슬라이드5](https://user-images.githubusercontent.com/37354145/109373878-dec8ff80-78f4-11eb-96f0-02d7733914ea.png)

`커밋2` 에서 버그가 발생한 후 `bugFix` 브랜치를 생성하여 버그를 수정한 상태이다. 
버그를 수정한 `bugFix` 브랜치를 `step1` 브랜치에 합치고 싶다면 어떻게 해야할까? 
우선 `step1` 브랜치로 이동해보자.

```
% git checkout step1
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
% git checkout bugFix
```

![슬라이드8](https://user-images.githubusercontent.com/37354145/109373884-e25c8680-78f4-11eb-9c4d-43719e17de79.png)

`bugFix` 브랜치로 이동된 상태에서 다시 `step1` 브랜치로 합치게 되면 `bugFix` 브랜치도 최신화가 된다.  

```
% git merge step1
```

![슬라이드9](https://user-images.githubusercontent.com/37354145/109376193-4b002f00-7906-11eb-9b27-938048cfaf6a.png)

`step1` 브랜치에서 `bugFix` 브랜치를 합칠 때처럼, `bugFix` 브랜치에서 `step1` 브랜치를 합칠 때에도 
새로운 `커밋5`를 만들면서 뻗어나갈 수 있었을텐데 최신화만 이루어진 이유는 무엇일까?  
  
그 이유는 `step1` 브랜치에서 `bugFix` 브랜치를 합치면서 `커밋4`가 생성되는 과정에서 
`커밋3` 이 `커밋4`와 연결선을 갖게 되었기 때문이다. 간단하게 생각해서 **이미 `커밋4` 쪽으로 
로그(화살표)가 뻗어나갔기 때문**에 로그를 따라 최신화만 진행했다고 생각하면 할 수 있다.  
  
`merge` 명령에 대해 알아보았다. 그런데 그림을 살펴보면 알다싶이, `merge` 명령어를 사용하면 
커밋 히스토리가 그대로 남는다. 커밋 히스토리를 남기지 않고 깔끔하게 브랜치들을 합치고 싶다면 `rebase` 
명령을 사용해야 한다.

<br>

## 작업 합치기 - Rebase
![슬라이드10](https://user-images.githubusercontent.com/37354145/109376194-4cc9f280-7906-11eb-8534-6f0b8933a50c.png)

`merge` 명령을 수행하기 전과 완전히 동일한 상황이다. 이번에도 `bugFix` 작업내용을 `step1` 쪽으로 합치려고 한다. 

이번엔 `merge` 명령어 때와 달리, `bugFix` 브랜치에서 `rebase` 명령을 사용한다.

```
% git rebase step1
```

![슬라이드11](https://user-images.githubusercontent.com/37354145/109376195-4dfb1f80-7906-11eb-98b1-6cee38bf53f6.png)

`rebase` 명령이 수행되면, 기존 `커밋3`이 `커밋1` 과의 연결을 끊고, `step1` 브랜치의 가장 최신 커밋인 
`커밋2` 쪽에 연결된다.  
  
여전히 `step1` 브랜치는 최신화가 되지 않았으므로 마저 작업을 진행해보자. 브랜치를 `step1`으로 변경해준다.

```
% git checkout step1
```

![슬라이드12](https://user-images.githubusercontent.com/37354145/109376196-4e93b600-7906-11eb-899f-dbd3e5d8f440.png)

곧이어 `rebase` 명령을 이용해 `bugFix` 브랜치 쪽으로 이동을 시킨다.

```
% git rebase bugFix
```

![슬라이드13](https://user-images.githubusercontent.com/37354145/109376197-4f2c4c80-7906-11eb-8b8e-44701349b675.png)

`bugFix` 브랜치가 이미 `step1` 브랜치의 커밋 뒤에 붙어있었으므로, `step1`의 `커밋2`는 이동하지 않고 
`step1`이 가리키는 커밋만 `커밋3'`으로 변경된 것을 확인할 수 있다.  
  
`merge`와 `rebase`는 결국 커밋 기록을 합치고 최신화 시킨다는 것은 동일하지만, 병합 기록을 남기느냐 안남기느냐의 
차이가 존재한다. 병합기록이 남지 않을 경우 깔끔하다는 장점도 있지만, 복구가 어렵다는 단점 또한 존재한다.  
  
와일더의 조사에 따르면 해외에서는 `merge`가, 국내에서는 `rebase`가 선호도가 높다고 한다. 
개인적으로는 **버전 관리 툴**의 의의를 생각해서, `merge`를 자주 활용하는 것이 좋다고 생각된다!

<br>

## 커밋 되돌리기
> "아..! 큰일 났다."  
> 작업을 하다가 실수를 했을 때 가장 먼저 드는 생각이죠?

와일더의 열연 😂

로컬 환경에서 커밋을 잘못 작성했을 때, 추가해야할 파일을 빠뜨렸을 때 커밋을 되돌리는 방법은 무엇이 있을까?

![슬라이드21](https://user-images.githubusercontent.com/37354145/109405843-c7067f80-79b7-11eb-8dc2-0369a524e7f3.png)

현재 `커밋3`이 의도한대로 작성되지 않은, 마음에 들지 않는 커밋이라고 가정하고 되돌려보자.

```
% git reset HEAD^
```

![슬라이드22](https://user-images.githubusercontent.com/37354145/109405844-c79f1600-79b7-11eb-9677-fdabd413afbf.png)

`커밋3`이 깔끔하게 사라지고 `커밋2` 로 `HEAD`가 이동된 것을 확인할 수 있다.  
  
그러나 `reset` 명령어는 `커밋3`을 커밋하지 않은 상태로 되돌린다는 특성, 즉 완전히 히스토리를 고쳐쓴다는 점 때문에 
다른 사람들이 사용하는 remote branch에서는 사용하지 않는 방법이다. 대신 `revert` 명령어를 사용할 수 있다.  
  
현재 상태에서 `커밋2` 도 마음에 안든다고 가정하고 `revert` 명령어를 사용해보자.

```
% git revert HEAD
```

![슬라이드23](https://user-images.githubusercontent.com/37354145/109405846-c79f1600-79b7-11eb-8b9f-bab7e1ffc657.png)

`커밋2`가 살아있으면서 새로운 `커밋2'`가 생성된 것을 확인 할 수 있다.  
  
이렇게 `revert` 명령어는 기존 커밋로그를 남기면서도, 같은 이름으로 다시 커밋을 남김으로서 다른 사용자들에게도 
"마음에 안들어서 바꾼거야." 라는 의사를 명확하게 남길 수 있다.

<br>

## 삭제한 커밋, 브랜치 복구
깃의 모든 명령 수행에는 고유의 해쉬코드가 부여된다. 그게 `reset` 을 이용한 삭제행위일지라도 말이다. 
이 때문에 해쉬코드를 이용해서 삭제한 커밋과 브랜치를 복구할 수 있다.

![슬라이드24](https://user-images.githubusercontent.com/37354145/109405848-c837ac80-79b7-11eb-8db4-ccff421e9a5a.png)

현재 `커밋2`와 `step2 - 커밋3` 가 삭제되어 있는 상태다. 우선 삭제된 커밋의 해쉬코드를 확인하기 위해 
아래와 같이 명령어를 입력해보자.

```
% git reflog
```
```
ee92974 HEAD@{0}: commit: init commit
2381ea9 HEAD@{1}: commit: feat: add nice method
d78830c HEAD@{2}: commit: feat: add nice parameter in method
bbffa9e HEAD@{3}: commit: refactor: fix method name
.
.
.
```

`reflog` 명령어를 이용하면 해쉬코드를 포함한 커밋 내역을 모두 확인할 수 있다. 
여기서 `커밋2`에 해당하는 해시코드를 `reset` 명령어와 함께 입력하게 되면 커밋이 되살아난다.

```
% git reset --hard d78830c
```

![슬라이드25](https://user-images.githubusercontent.com/37354145/109405849-c837ac80-79b7-11eb-88e9-6fec88ca6a47.png)

커밋 뿐만 아니라 브랜치도 되살릴 수 있다. 브랜치는 기존 삭제되었던 `step2` 라는 이름을 그대로 사용해도 되고, 
새로운 이름으로 지정할 수도 있다. 예시에서는 `step3` 로 복구해보자.

```
% git checkout -c step3 bbffa9e
```

![슬라이드26](https://user-images.githubusercontent.com/37354145/109405850-c8d04300-79b7-11eb-8fc7-0b871ffdf053.png)

이렇게 브랜치도 복구된 것을 확인할 수 있다.

해시코드를 이용할때는 모든 해시코드를 다 입력할 필요없이, 앞에서부터 5~6글자 정도까지만 입력해도 
식별이 가능하다는 점도 참고해두자.

<br>

## 원격 저장소 다루기
원격 저장소(remote repository)를 로컬(local)에서 다루기 위해서는 `clone` 명령어부터 시작된다. 

![슬라이드30](https://user-images.githubusercontent.com/37354145/109405854-ca017000-79b7-11eb-8296-e87a40008ef8.png)

깃허브를 기준으로 복제하기를 원하는 저장소의 링크주소를 사용하면 된다. `내 미션` 이름을 가진 저장소를 가져와보자.

```
% git clone https://github.com/hyeon9mak/내-미션.git
```

![슬라이드31](https://user-images.githubusercontent.com/37354145/109405855-ca9a0680-79b7-11eb-95a6-368fe937eeac.png)

로컬로 복제가 완료되었다. `remote` 명령어를 통해서 현재 로컬의 저장소가 어떤 원격저장소와 연결되어 있는지 확인해볼 수 있다.

```
% git remove -v
```
```
origin https://github.com/hyeon9mak/내-미션/ (fetch)
origin https://github.com/hyeon9mak/내-미션/ (push)
```

하나의 로컬 저장소에 여러 개의 원격 저장소를 연결시킬 수도 있다.

```
% git remote add upstream https://github.com/hyeon9mak/미션.git
```

(예시에서 사용하는 `upstream` 은 내 로컬 저장소에 등록되는 원격저장소의 이름이다. 자유롭게 지을 수 있다.)

![슬라이드32](https://user-images.githubusercontent.com/37354145/109405856-ca9a0680-79b7-11eb-8d0f-40ef72651560.png)

```
% git remove -v
```
```
origin https://github.com/hyeon9mak/내-미션/ (fetch)
origin https://github.com/hyeon9mak/내-미션/ (push)
upstream https://github.com/hyeon9mak/미션/ (fetch)
upstream https://github.com/hyeon9mak/미션/ (push)
```

하나의 로컬 저장소에 2개의 원격 저장소가 연결된 것을 확인할 수 있다. 
그러나 연결만 되어 있을뿐, 작업에 필요한 브랜치를 따로 가져오는 동작은 아직 수행하지 않았다.  
  
이번에는 `upstream` 저장소의 `branch1` 브랜치를 가져와보자.

```
% git fetch upstream branch1
```

`fetch` 명령을 통해 `branch1`의 최신 코드(커밋) 정보를 가져온다.

![슬라이드33](https://user-images.githubusercontent.com/37354145/109405857-cb329d00-79b7-11eb-8aa3-f2206595e088.png)

그 후 이어서 `pull` 명령을 통해 내 로컬 저장소에 등록시켜보자.

```
% git pull upstream branch1
```

![슬라이드34](https://user-images.githubusercontent.com/37354145/109405858-cb329d00-79b7-11eb-964d-dcd5500bddcc.png)

내 로컬 저장소에도 `branch1` 브랜치가 등록된 것을 확인할 수 있다.

내 로컬 저장소에 등록되어 있는 브랜치 정보를 다른 원격 저장소에 올리는 방법은 무엇이 있을까? 
바로 자주 사용되는 `push`가 그 정답이다.

```
% git push origin branch1
```

![슬라이드35](https://user-images.githubusercontent.com/37354145/109405860-cbcb3380-79b7-11eb-804b-6309576d6563.png)

명령이 수행되면 위와 같이 원격 저장소에도 내 로컬 저장소와 같은 브랜치가 생성되면서 브랜치 정보가 등록됨을 확인할 수 있다.

<br>

## 체리-픽(cherry-pick)
![image](https://user-images.githubusercontent.com/37354145/109408728-97637180-79cf-11eb-811d-bcaab07cd47a.png)

탐스러운 체리 케이크 위에 체리만 골라서 먹는다는 뜻의 **Cherry-pick**, 즉 원하는 커밋만 골라서 더하는 기능이다. 
체리-픽을 통해서 원하는 커밋만 추가시켜보자.

![슬라이드27](https://user-images.githubusercontent.com/37354145/109405851-c968d980-79b7-11eb-9db4-9e0c861c9b4d.png)

현재 `step2` 브랜치는 위와 같은 상태이다. 여기서 추가시키고 싶은 커밋 로그를 찾기 위해 명령어를 입력해보자.

```
% git log
```
```
commit 59e9efbf1easdfgg......
Author: hyeon9mak <jinha3507@gmail.com>
Date:   Thu Feb 25 15:54:32 2021 +0900

    feat: 기능추가

commit 9bbd507e0ffdfsdd......
Author: hyeon9mak <jinha3507@gmail.com>
Date:   Sun Feb 21 23:56:56 2021 +0900

    style: 개행추가
.
.
.
```

여러가지 커밋 기록들 중에 "feat: 기능추가" 커밋을 현재 작업중인 브랜치에 추가시킬 생각이다. 명령어를 입력해보자.

```
% git cherry-pick 59e9ef
```

(앞서 말했듯 해시코드는 5~6글자만 입력해도 식별이 가능하다.)

![슬라이드28](https://user-images.githubusercontent.com/37354145/109405852-c968d980-79b7-11eb-9046-c6abac60a73c.png)

`cherry-pick` 명령어와 해시코드를 입력해서 현재 작업중인 브랜치에 `커밋1`이 추가되었다. 
이어서 "style: 개행추가" 커밋도 추가시켜보자.

```
% git cherry-pick 9bbd50
```

![슬라이드29](https://user-images.githubusercontent.com/37354145/109405853-ca017000-79b7-11eb-9fcf-5b6887ef5215.png)

`커밋2`를 통해 "style: 개행추가"가 가져와진 것을 볼 수 있다.  
  
이처럼 `cherry-pick` 명령어는 원하는 커밋 로그를 가져와서 현재 브랜치에 등록시킬 수 있는 명령어다. 
1개씩 뿐만 아니라 해시코드를 띄어쓰기 기준으로 여러개 나열함으로서 여러 커밋을 동시에 가져올 수도 있다.

```
% git cherry-pick hash1 hash2 hash3
```

열댓개의 커밋까지는 해쉬코드를 일일히 입력해서 가져올 수 있겠다. 그런데 만일 가져오고 싶은 로그가 수백개라면 
체리픽을 포기애햐하는 것일까? 다행스럽게도 범위 지정이 가능하다.

```
% git cherry-pick oldestCommit^..lastestCommit
```

시작 커밋과 끝 커밋 사이에 `^..`를 붙임으로서 범위내의 모든 커밋을 가져올 수 있게 된다. 만일 `^..`가 아닌 
`..`만 사용할 경우 시작 커밋이 범위에 포함되지 않는다. 주의하자.

<br>

---

<br>

이렇게 잘 알려지지 않은 여러가지 깃 명령어들에 대해 정리해보았다.  
  
와일더의 발표 덕분에 여러가지 새로운 깃 명령어들을 알 수 있었고, 
그에 대한 예시를 워낙 잘 준비해줘서 쉽게쉽게 이해할 수 있었다. 
와일더의 발표를 워낙 감명깊게 본 덕분에 "꼭 정리해둬야겠다!" 라고 마음 먹은게 벌써 일주일이 넘었다. 
오늘에서라도 정리를 해서 다행이다. 앞으로 더 부지런하게 움직여야지...

끗!

<br>

## References
- [누구나 쉽게 이해할 수 있는 Git 입문](https://backlog.com/git-tutorial/kr/stepup/stepup1_1.html)
- [Learn Git Branching](https://learngitbranching.js.org/?locale=ko)
- [와일더가 쓴 깃 명령어 정리 글!](https://lns13301.github.io/github-blog/git-commands-tutorial/)
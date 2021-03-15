---
title: "Github 비밀번호 변경 후 로컬 깃에 반영하기"
date: 2021-03-15
tags:
    - git
toc: true
toc_sticky: true
toc_label: "Github 비밀번호 변경 후 로컬 깃에 반영하기"
---

## 🗝️ 비밀번호를 변경하게 된 계기
일주일 전부터 깃허브 메인화면 상단에 이상한 알림이 보이기 시작했다. 관심을 잘 갖지 않고 있다가 
지하철에서 한 번 열어봤는데, 얼레? 😲

![image](https://user-images.githubusercontent.com/37354145/111107800-e518d600-859a-11eb-8def-5eb6d6ff4a44.png)

[Javable 블로그](https://woowacourse.github.io/javable/) 에 댓글을 몇 번 달은적은 있지만 
최근에 저런 댓글을 달은 적은 없었다. 나는 "깨지지 않은 링크 첨부합니다." 이런 화법을 사용하지도 않는다. 
도대체 무슨 일일까, 누구일까 고민을 하다가 결국 제이슨한테 물어봤다.

![image](https://user-images.githubusercontent.com/37354145/111108589-881e1f80-859c-11eb-95c5-7622ce63c25e.png)

"페어 중에 실수로 남긴 건 아닐까요?" 라는 제이슨의 이야기에 포츈이 바로 떠올랐다.

![image](https://user-images.githubusercontent.com/37354145/111108649-a4ba5780-859c-11eb-83d6-06184a431041.png)

*"응~ 나 아니야~"*  
  
포츈도 아니라고 한다. 그럼 도대체 누굴지 고민하다가 큰 문제도 없었고, 그다지 중요한 것도 아닌 것 같아서 
비밀번호나 바꾸기로 했다.

<br>

## 🗝️ Github 비밀번호 변경
![d](https://user-images.githubusercontent.com/37354145/111109147-830da000-859d-11eb-9fd1-a8f3e4c4a665.png)

그림에 표시한 순서에 따라 `프로필 이미지` - `Settings` - `Account security` 를 클릭하면 비밀번호 변경을 진행할 수 있다.

<br>

## 🗝 왜 Push가 안돼?
```
~/Hyeon9mak.github.io master*
Hyeon9mak:~/Hyeon9mak.github.io% git commit -m "docs: publish post"
[master 2a944de] docs: publish post
 1 file changed, 1 insertion(+), 1 deletion(-)

~/Hyeon9mak.github.io master ⇡
Hyeon9mak:~/Hyeon9mak.github.io% git push origin master
remote: Invalid username or password.
```

비밀번호 변경 후 블로그 글을 작성하다가 Push를 했는데 Push가 안됐다.

```
remote: Invalid username or password.
```

보아하니 로컬 깃에는 Github에 변경한 비밀번호가 업데이트가 자동으로 되지 않는 모양이다. 
수동으로 비밀번호를 다시 등록해줄 수 밖에 없다.

<br>

## 🗝 로컬 깃에 변경된 비밀번호 반영하기
로컬 깃에 변경된 비밀번호 반영은 생각보다 훨씬 쉬웠다. 우선 해당 계정을 사용중인 아무 로컬 저장소로 이동하자. 
그 후 아래 명령어를 입력하면 Github 인증이 초기화 된다.

```
% git config --unset credential.helper
```

이제 다시 Push를 진행하면 계정과 비밀번호를 요구할 것이다.

```
% git push origin master
```
```
Username for 'https://github.com': 
Password for 'https://Hyeon9mak@github.com':
```

Github에서 사용중인 계정명과, 새로 변경한 비밀번호를 입력하면 정상적으로 Push가 수행된다! 
다른 로컬 저장소 쪽에도 새로운 Github 인증이 등록되므로, 추가로 반영해줄 필요는 없다.  
  
끗!

<br>

## References
- [Updating your GitHub access credentials](https://docs.github.com/en/github/authenticating-to-github/updating-your-github-access-credentials)
- [Github 패스워드 교체시 로컬 비밀번호도 변경하기](https://jojoldu.tistory.com/467)

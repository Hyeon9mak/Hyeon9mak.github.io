---
title: "블로그 댓글 utterances로 변경하기"
date: 2020-10-23 20:00:38
categories:
    - Etc
tags:
    - 개발자
    - 블로그
    - 깃허브
    - Github
    - utterances
    - 댓글
toc: true
toc_sticky: true
toc_label: "블로그 댓글 utterances로 변경하기"
---
## 💡 utterances에 관심을 가지게 된 계기
얼마전 내 블로그에 처음으로 댓글이 달렸다! 🎉🎉🎉  
[[Python : 프로그래머스] 가장 큰 수](hyeon9mak.github.io/python/Python-프로그래머스-가장_큰_수/) 포스팅인데,  
감사하게도 질문 댓글을 달아주셔서 다시 짚어볼 계기가 되었다.  
  
풀이를 댓글로 설명하는 과정에서 Disqus의 마크업 작성방식이 굉장히 불편했는데,  
얼마전 알게된 [한돌님의 블로그](https://blog.haandol.com/2020/03/09/what-you-should-ask-on-interview2.html) 댓글 기능이 떠올랐다.  
  
'깃허브 계정이 사용되던데... 대체 무슨 서비스일까...'
  
호기심을 가지던 중에, **utterances**를 통해 동작한다는 걸 알게 되었다!  
그렇다고 무작정 utterances를 적용 할 수는 없었다.  
Disqus과 utterances의 차이점, 장단점에 대해서 조사해보았다.  

## 🤔 Disqus vs utterances
### Disqus
- 마크업 기법으로 작성되기 때문에, 작성이 불편하다.
- 무겁다.
- 별도의 회원가입을 필요로 한다.

### utterances
- 마크다운 기법으로 작성되기 때문에, 여러가지 표현이 가능!
- Disqus에 비해 가볍다.
- 깃허브 계정이 있다면 OK!

Disqus가 무겁다는 의견에 대해서는 [disqus를 버리자 (feat. utterances)](https://blueshw.github.io/2020/05/20/disqus-to-utterances/)를 참고했다.  
계정 문제는... 요즘 개발자라면 깃허브 계정은 다들 있으니까? ~~없으면 이참에 만드세요!~~  
내 경우 아직 블로그에 댓글이 많이 달리지 않았기 때문에, 옮기려면 지금이 적기라고 판단했다.  
  
## 🖊️ utterances 적용전 고려사항
적용하기 이전에 고려해야할 부분이 있었다.  
대부분의 utterances 적용 가이드에서는 새로운 repository를 개설하라고 한다.  
어떤 이유가 있을까 생각해봤는데, 아무리 고민해봐도 아래 밖에 떠오르지 않는다.

1. 가이드 작성자가 repository issue 탭을 따로 사용 중이다.
2. github pages가 아닌 다른 블로그 서비스에 utterances를 적용하려 한다.
3. 블로그 repository의 보안상 이유

1번의 경우 utterances가 repository의 issue탭을 기반으로 동작하기 때문에  
issue탭을 따로 사용중이었던 사람에게는 충분히 새로 개설할만한 이유가 된다.  
그러나 나는 issue탭을 사용중이지 않다.  
  
3번 보안상 이유가 조금 걸리긴 하는데...  
어차피 **github pages는 public repository에만 적용**된다.  
Github pro 계정이 아닌 이상 private repository로 전환시  
Github pages 블로그 호스팅 서비스를 제공 받을 수 없다.  
  
그래서! 나는 대부분의 가이드와 달리 현재 사용중인 블로그 repository에  
utterances를 바로 적용시켜보기로 했다!  

## 🔧 utterances 적용!
[github.com/apps/utterances](github.com/apps/utterances)로 접속하자!  
![image](https://user-images.githubusercontent.com/37354145/96987998-ba33d400-155e-11eb-9b31-8b4d3ffee9e1.png){: .align-cetner}
  
블로그 repository를 선택하고, Install을 누른다!  
  

![image](https://user-images.githubusercontent.com/37354145/96988344-2ca4b400-155f-11eb-8a95-99baf027758e.png){: .align-center}
  
Install이 완료되면, 자동으로 페이지가 전환된다.  
  

![image](https://user-images.githubusercontent.com/37354145/96988405-447c3800-155f-11eb-9b45-6aa262ac76ae.png){: .align-center}
  
스크롤을 살짝 내려보면, **Repository**, **issue 맵핑 방식**, **테마**, **issue Tag** 등  
어려가지 옵션들을 설정 할 수 있다. 천천히 읽어보면서 설정을 완료하자!  
  
  
![image](https://user-images.githubusercontent.com/37354145/96989002-0f241a00-1560-11eb-9ef4-839d6baa1a84.png){: .align-center}
  
설정이 모두 끝나면 위 사진과 같이 script가 자동으로 작성되어 있다!  
바로 script를 덮어씌워서 적용이 가능한 테마를 사용중인 사람은 덮어 씌우면 되고,  
나와 같이 minimal mistakes 테마를 사용중인 사람은 방법이 조금 다르다.  
우선 script 내용을 잘 기억해 두자.  
  
## 🛠️ utterances on minimal mistakes
**_config.yml** 파일에서 **comments** 옵션 설정을 변경하자.

```
...
comments:
  provider               : "utterances"
...
  utterances:
    theme                : "github-light" #(default), "github-dark"
    issue_term           : "pathname" #(default)
...
```
그 후 **_includes/comments-providers/utterances.html** 파일을 찾아간다.  
파일 내용 중심부에 script 설정을 자신이 선택한 옵션에 맞게 수정한다!  
```
var script = document.createElement('script');
script.setAttribute('src', 'https://utteranc.es/client.js');
script.setAttribute('repo', 'Hyeon9mak/Hyeon9mak.github.io');  # 특히 이놈이 중요하다.
script.setAttribute('issue-term', '{{ site.comments.utterances.issue_term | default: "pathname" }}');
script.setAttribute('theme', '{{ site.comments.utterances.theme | default: "github-light" }}');
script.setAttribute('label', 'blog-comment')
script.setAttribute('crossorigin', 'anonymous');
```
주석 달아놓은 바와 같이, **repo** 옵션에 경로를 직접 지정해줘야 잘 등록 될 것이다.  
등록이 완료되었다면 테스트를 진행해보자!  

![image](https://user-images.githubusercontent.com/37354145/96992392-cde23900-1564-11eb-9b1d-d64e66f35220.png){: .align-center}
야호! 잘된다!  


## 달아주셨던 댓글은?
Disqus의 Export 기능을 이용해 xml 파일을 구한 다음,  
xml 파일 내부에서 댓글을 추출해서 옮기는 방법이 있었는데,  
그렇게 한다해도 계정정보가 따로 변경되지는 않더라 😭
  
결국 그냥 링크만 남겨두었다.  
![image](https://user-images.githubusercontent.com/37354145/96996015-1b14d980-156a-11eb-82cc-7330a7974381.png){: .align-center}

꼭 더 강한(?) 블로그로 키우도록 하겠습니다!  
utterances 이동 포스팅 끝!
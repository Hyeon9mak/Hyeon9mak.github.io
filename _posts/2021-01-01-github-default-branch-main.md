---
title: "Github default branch 가 main으로 나온다."
date: 2021-01-01
categories:
    - Etc
tags:
    - 개발자
    - 깃허브
    - Github
    - branch
    - Git
toc: false
toc_sticky: true
toc_label: "Github default branch 가 main으로 나온다."
---
## `master` 가 아니라 `main` 이네?
2020년 11월 개설한 Agile Java 실습 Repository에 처음 push를 진행할 때였다. 

```
~/student-information-system% git push origin master
error: src refspec master does not match any.
error: failed to push some refs to
        'https://github.com/Hyeon9mak/student-information-system.git'
```

*엥?*  
따로 개설한 branch가 있는 것도 아닌데, `master` branch가 없다고 에러가 발생했다. 
자세히 살펴보니 default branch가 `master`가 아닌 `main`으로 잡혀 있었다.

```git
~/student-information-system main ⇡
```

당시엔 *'으잉? 별 일이네.'* 하고 간단히 넘겼지만, 여유가 생긴 오늘 천천히 깃허브를 살펴보며 
그 때 일을 회상해보니 참 특이한 일이었다. 2020년 10월 말에 개설한 이펙티브 자바 스터디 
Repository도 default branch가 `master` 로 잡혀있었기 때문이다. 
무슨 일일까 궁금해서 **["Github default branch main"](https://www.google.com/search?newwindow=1&ei=FbHuX5itLIio-QaPsLKwAw&q=Github+default+branch+main&oq=Github+default+branch+main&gs_lcp=CgZwc3ktYWIQAzICCAAyAggAMgIIADIGCAAQCBAeMgYIABAIEB46BQgAEM0CUL_vLVi_7y1gt4MuaAFwAHgAgAGHAogBoQOSAQUwLjEuMZgBAKABAqABAaoBB2d3cy13aXrAAQE&sclient=psy-ab&ved=0ahUKEwjYi-es_vntAhUIVN4KHQ-YDDYQ4dUDCA0&uact=5)** 키워드로 구글링을 해보았다. 
그리고 곧바로 이유를 확인 할 수 있었다.  

---
  
Github 측에서 [조지 플로이드 사건](https://ko.wikipedia.org/wiki/%EC%A1%B0%EC%A7%80_%ED%94%8C%EB%A1%9C%EC%9D%B4%EB%93%9C_%EC%82%AC%EB%A7%9D_%EC%82%AC%EA%B1%B4) 
에 발맞춰 `master`, `slave` 용어를 더 이상 사용하지 않기로 결정한 것. 
추가적으로 모든 사용자에게 default branch 이름을 설정할 수 있는 기능을 제공하고 있으며, 
default branch 이름을 결정하지 않을 경우 자동으로 `main` branch 가 제공된다.

<br>

---

<br>

컴퓨터 구조 관련해서는 이미 오래전부터 `master`,`slave` 네이밍이 자주 쓰여 왔기 때문에 
Github 서비스에 꼭 나쁜 시선이 닿지는 않았을 것인데, 발 빠르게 대응한 것이 눈에 띈다. 
개발자로서도 사회적인 현상에 대해 항상 눈과 귀를 열어두어야 하는구나를 배운다.
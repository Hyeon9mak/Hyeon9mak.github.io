---
title: "객체지향 프로그래밍에 관한 고찰"
date: 2022-12-19
tags:
    - oop
toc: true
toc_sticky: true
toc_label: "객체지향 프로그래밍에 관한 고찰"
---

얼마전 회사에서 조영호님의 객체지향 프로그래밍 강연이 진행되었다. 
그간 '객체지향이란 무엇인가', '객체지향 프로그래밍을 왜 해야 하는가?' 홀로 고민이 많았는데,
조영호님의 강연을 통해 그것들이 헛되거나 틀리지 않았음을 느껴 너무나 행복했다.
조금은 자신감을 갖고 객체지향에 대한 내 생각을 풀어봐도 좋을 것 같아서 글을 남긴다.

<br>

## 💾 안녕 객체지향

2021년 2월, 우아한테크코스를 통해 Java와 객체지향을 처음으로 접했다. 
항상 C와 절차지향으로 프로그래밍을 하던 나에게 객체지향은 너무나 낯설고 먼 개념이었다. 
절차지향보다 읽기도 어렵고 보일러 플레이트 코드만 많아지고. 
도대체 객체지향이 왜 좋은건지, 사람들이 왜 그토록 객체지향을 찬양하는지 이해할 수 없었다.

‘우선 사전적 정의를 읽어보자.’

> 프로그램 설계방법론이자 개념의 일종으로, 명령형 프로그래밍에 속한다.
> 프로그램을 단순히 데이터와 처리 방법으로 나누는 것이 아니라, 
> 프로그램을 수많은 '객체(object)'라는 기본 단위로 나누고 이들의 상호작용으로 서술하는 방식이다. 
> 객체란 하나의 역할을 수행하는 '메소드와 변수(데이터)'의 묶음으로 봐야 한다.
> 
> 출처 - [나무위키](https://namu.wiki/w/%EA%B0%9D%EC%B2%B4%20%EC%A7%80%ED%96%A5%20%ED%94%84%EB%A1%9C%EA%B7%B8%EB%9E%98%EB%B0%8D)

‘그렇군. 대충 저렇게 하면 객체지향적 코드를 짜게 되는 군. 그걸로 끝인가?’

눈을 씻고 찾아봐도 객체지향적인 코드 작성을 통해 해서 얻는 이점이 없었다. 
새로운 로직을 개발하는 시점에서 앞으로 어떻게 쓰일지 모르는 객체를 위해 역할과 책임 같은 
두리뭉술한 개념을 생각한다는게 여간 쉬운 일이 아니었다. 
시간이 흘러 ‘대충 이렇게 짜면 객체지향적 코드’ 같은 패턴이 눈에 익고선, 
여전히 장점은 모르는 채로 ‘이렇게 짜니까 객체지향적이고 이쁘네.’ 라며 만족할 뿐이었다.

사람들에게 “객체지향 프로그래밍이 뭐에요?” 라고 물으면 “객체 단위로 클래스를 나눈다.”, “SOLID 원칙에 따라…” 와 같은 대답을 들려주었다. 
하지만 “객체지향 프로그래밍을 하면 뭐가 좋아요?”, “왜 하는거에요?” 라고 물으면 명쾌하게 답해주는 사람이 없었다. 
객체지향을 왜 해야하는지, 객체지향의 장점이 무엇인지를 꼭 눈으로 보고 피부로 느끼고 싶다는 갈증이 서서히 커져갔다.

<br>

## 💾 왜 객체지향 프로그래밍

눈으로 보고 싶다는 갈증은 정말 뜬금없는 타이밍에 해소되었다. 2021년 10월, 의존성 역전을 공부하기 위해 본 
[조영호님의 우아한객체지향 영상](https://youtu.be/dJ5C4qRqAgA?t=4781) 속 `OrderValidator` 클래스를 읽는 순간이었다. 

<img width="1139" alt="image" src="https://user-images.githubusercontent.com/37354145/208308846-2f0c72c6-568c-4e2c-9584-11483d972057.png">

“아.” 라는 탄식이 절로 흘러나왔다. 영상 속 `OrderValidator` 는 놀랍게도 절차지향으로 작성되어 있다. 
객체지향 강의에서 절차지향이라니? 심지어 조영호님은 이런 말씀도 하신다. 

“여러 객체를 오가며 로직을 파악하는 객체지향보다 한눈에 읽히는 절차지향이 가독성이 더 뛰어나요.” 

그렇다. 객제치향 프로그래밍을 해야하는 이유, 객체지향의 본질. 바로 유지보수성 때문이었다. 
처음 짤 때가 아닌 나중에 볼 때를 위한 코드 작성. 
절차지향 프로그래밍으로 보기 좋은 코드가 작성되어 유지보수가 쉬워진다면 객체지향 따위 중요한게 아니었다.

유지보수성이 뛰어난 코드는 어떤 효과를 만들어낼까? 보기에 이쁘다? 한눈에 이해할 수 있다? 
모두 맞는 말이지만 나는 ‘인간의 뇌가 가지는 인지범위의 한계를 인정하는 효과’가 가장 크다고 생각한다.

프로그래머의 뇌 책에 따르면 개발자가 단기간 동안 인지(STM: Short Term Memoery)할 수 있는 항목의 최대치가 12개를 넘지 않는다고 한다. 
실제로도 그런 것 같다. 기능을 개발할 때도 클래스파일 수십개를 오고가다보면 언제, 어디서 어떤 로직을 구현 중이었는지 금새 까먹곤 한다. 
새로운 하나를 떠올리면 다른 하나를 잊고 놓치기 쉽상이다. 
요구사항 체크리스트를 작성하고 체크해가면서 중요한 작업을 놓치지 않기 위해 노력하지만, 
갑자기 떠오른 ‘아! 이 클래스 나중에 이렇게 바꾸면 되겠는데?’ 하는 기가막힌 아이디어가 
기억 저편 너머로 흘러가는 것 까진 막아주지 못한다. 개발자가 흔하게 겪은 일이자 흔히 하는 실수다.

객체지향 프로그래밍은 역할과 책임에 따라 클래스를 나누기 때문에 수정해야할 코드를 찾을 때 
“이 책임(로직, 메서드)은 이 역할(패키지, 클래스)이 갖고 있겠지.” 라고 생각의 흐름을 도와준다. 
그렇게 재빠르게 수정해야할 코드를 탐색하고, 최소한으로 코드를 수정한다. 
변경되는 범위가 인지 범위 내이므로 사이드이펙트도 예측할 수 있는 범위 내에서 발생한다. 
적은 범위를 인지하고 작업을 진행하기 때문에 코드의 퀄리티도 훨씬 높다. 덕분에 다음 유지보수에도 도움이 된다. 
아! 이것이 객체지향 프로그래밍이구나. 뇌의 한계를 인정하고 유지보수 단계에서 인지 범위를 최소한으로 좁혀 
확인할 수 있는 코드를 만들어주는 프로그래밍 기법이다.

<br>

## 💾 이래서 객체지향 프로그래밍

피부로 느끼고 싶다는 갈증은 현업에 뛰어든 이후 해소되었다. 
회사 프로젝트 저장소에 올라온 Pull Request 를 읽을 때 보통 어디를 먼저 보게 될까? 
사람마다 다르겠지만 나는 **Files changed** 에 가장 먼저 눈이 간다.

![image](https://user-images.githubusercontent.com/37354145/208309056-08aaf94b-8501-482e-b110-4bbb95643544.png)

Files changed 28개에 +1,584 라인. 벌써 STM 12개를 아마득히 넘기는 숫자다. 
절반이 넘는 클래스는 제대로 이해하지 못하고 넘길 것이라는 가정이 깔린다. 
장엄한 길이의 코드들을 흐린 눈으로 넘기며 스크롤을 내리다가 겨우 눈에 띄는 코드에 코멘트 한두개를 남기고선, 
"LGTM 👍" 메세지와 함께 Approve 를 할 것이다.

![image](https://user-images.githubusercontent.com/37354145/208309062-8f117208-6ba0-4680-a049-c81a012b50ab.png)

반대로 Files changed 8개에 +200 라인 PR은 어떨까? 
절대적인 분량이 적기 때문에 전체 흐름을 이해하기 용이하고, 리뷰해야할 양이 많지 않음을 인지하기 때문에 집중도도 올라간다.
메서드 하나하나 단위로 세심한 리뷰를 진행하고, 시간이 남으면 로컬에 Pull 받아 테스트 코드도 돌려볼 수 있을 것 같다.

> 이러한 인간의 심리를 잘 노린 [Stacked Changes 형상관리 방법](https://hyeon9mak.github.io/pull-requests-vs-stacked-changes/))도 존재한다.

이처럼 유지보수를 하는 사람에게나, 유지보수 된 코드를 읽어주는 사람에게나 유지보수의 범위를 좁히는 일은 굉장히 중요하다. 
그리고 객체지향 프로그래밍은 인지범위를 좁혀주고 나아가 유지보수성을 높이기 아주 적합하다. 
그래서 우리는 객체지향 프로그래밍을 하는 것이다.

사실 혼자 끊임없이 개발하는 프로젝트라면 객체지향을 도입할 이유가 없다.
보일러 플레이트 코드가 많아 절차지향보다 생산성이 떨어지고, 프로젝트의 규모가 필요 이상으로 비대해진다.
모든게 자신의 인지(컨텍스트) 내라면 굳이 객체지향의 도움 없이도 유지보수가 가능하다.
그러나 다른 사람과 함께 하는 개발이라면 이야기가 다르다.
나와 타인의 컨텍스트는 무조건 다를 수 밖에 없고, 컨텍스트에 도움을 줄 수 있는 코드를 짜야한다.
당연한 상호간의 예의라고도 볼 수 있다. 물론, 이 타인에는 컨텍스트가 달라진 훗날의 나 자신 역시 포함된다.

<br>

## 💾 객체지향 프로그래밍 실천

객체지향 프로그래밍은 결국 유지보수를 위해 존재한다. 그렇다면 유지보수를 위한 코드를 쉽게 작성하는 방법은 무엇일까?
나는 요즘 [이펙티브 코틀린 미션에서 유지보수와 관련된 코멘트](https://github.com/next-step/kotlin-blackjack/pull/344#discussion_r1044280926)를 남길 때 아래와 같은 방법을 사용한다.

> 추가로 카드를 받을지 말지 결정이 "y", "n" 문자열 입력으로 이루어지고 있군요~
> 한번 간단한 상상을 해볼까요?
>
> 만일 동료 개발자가 "y 문자열 입력 대신 1 숫자 입력으로 바꿔주세요." 라는 요구사항을 접수하면,
> `InputView` 와 `BlackJackController` 중 어떤 클래스를 먼저 열어볼까요? 💭

항상 '내'가 아닌 '동료'로, '지금'이 아닌 '나중'에 코드를 읽는다는 상황을 가정한다.
완전히 컨텍스트를 비운 동료의 입장에서 코드를 읽는다고 가정하면,
현재 메서드나 프로퍼티의 위치가 올바른지 아닌지를 바로 알아낼 수 있다.
특히나 "이걸 왜 여기다 짜놨어?" 를 경험해본 개발자일 수록 말이다.

> 저같아도 `InputView` 를 먼저열어보겠네요..! 좋은 피드백 감사합니다 🙇🏻

이렇게 생각하는 연습을 하다보면, 코드를 작성할 때 자연스럽게 패키지 구조를 어디로 나눠야 할지,
클래스를 분리하는 기준은 어떻게 해야할지 점점 쉽게 결정할 수 있게 되는 것 같다.

<br>

## 💾 객체지향은 예술이 아니야
 
결국 객체지향 프로그래밍은 빠르게 코드를 고치고 정시에 퇴근하고 싶다는 선대 개발자들의 욕망이 담긴 개념이라 것을 알 수 있다. 
본질은 쉬운 유지보수가 가능한 코드 작성. 따라서 요즘 유행하는 아키텍쳐, 디자인 패턴을 따라 구현하는 것에만 몰두되어선 안된다.
항상 자기 자신이 이해하기 쉬운 코드를 작성하고 있는지, 일반적인 형태로 코드를 작성하고 있는지,
혹시 예술적으로 프로그래밍을 하는 것은 아닌지 의심해야 한다.

> 데이크스트라는 예술적 프로그래밍과 과학적 프로그래밍을 이야기한다.
> 예술적 프로그래밍은 문제 해결에 대해 성능과 영감, 아름다움 등에 몰두한다.
> 반면 과학적 프로그래밍은 표준화에 몰두한다.
> 예술적 프로그래밍은 훌륭하고 나도 선망하는 가치이긴 하지만 과학적 프로그래밍 관점에서는 문제가 있는데
> 특정한 환경에 맞춰 기가막힌 작업물을 만들어내긴 하지만 일반화하기는 어려운 트릭이 생산된다는 점.
> 데이크스트라에 의하면 이런 트릭에 대한 지식은 해당 환경의 수명에 영향을 받으므로 인류의 지식에 별로 기여하는 바가 없다.
> 고립된 환경에서 독자적인 생태계를 구축하는 것과 비슷하다.
>
> 그래서 **괴상한 트릭을 사용해 기발하게 문제를 해결하는 것이 아니라 성능상의 피해가 있다 하더라도 표준적인 방식으로 코딩하고,**
> **훗날의 상식을 가진 다른 사람이 읽더라도 이해할 수 있게 만드는 것이 중요**하다.
> 
> 출처 - [이종립님의 과학적 프로그래밍에 대한 메모](https://johngrib.github.io/wiki/article/science-and-delete/)

유지보수성을 고려하지 않은 아키텍처 설계, 패턴 사용은 빛 좋은 개살구일 뿐이다.

가장 뛰어난 객체지향 프로그래밍은, 나와 팀원이 모두 동일한 컨텍스트로 이해할 수 있는 코드를 짜는 것이다. 
설사 MVC 패턴에서 Model 이 View 를 의존하게 되더라도, 그게 나와 팀원이 코드를 이해하는데 도움이 되고
유지보수에 도움이 된다면, 더 뛰어난 객체지향 프로그래밍이라고 볼 수 있겠다.

> 물론 그렇다고 아키텍쳐와 디자인 패턴에 대한 공부를 소홀히 해도 된다는 것은 아니다. 
> 특히나 개발자는 이직과 팀 변경이 잦기 때문에 팀 컨벤션을 길게 유지하기가 쉽지 않다. 
> 대중적으로 갖춘 배경 지식을 기반으로 빠르게 코드를 파악하기 위해서, 빠르게 파악할 수 있는 코드를 작성해주기 위해서. 
> 서로 일을 잘하기 위한 상호협약, 예의범절 같은 것이라고 생각한다.

<br>

## References

- [우아한객체지향 by 우아한형제들 개발실장 조영호님](https://youtu.be/dJ5C4qRqAgA?t=4781)
- [코드 리뷰의 또 다른 접근 방법: Pull Requests vs Stacked Changes](https://hyeon9mak.github.io/pull-requests-vs-stacked-changes/)
- [이펙티브 코틀린 블랙잭 미션 MVC 패턴 관련 질문](https://github.com/next-step/kotlin-blackjack/pull/344#discussion_r1044348596)
- [이펙티브 코틀린 블랙잭 미션 유지보수 관련 코멘트](https://github.com/next-step/kotlin-blackjack/pull/344#discussion_r1044280926)
- [기계인간 John Grib - 과학적 프로그래밍에 대한 메모](https://johngrib.github.io/wiki/article/science-and-delete/)
- [프로그래머의 뇌](http://www.yes24.com/Product/Goods/105911017?pid=123487&cosemkid=go16418003457693686&gclid=CjwKCAiAkfucBhBBEiwAFjbkr_mz-FKPU9dMfVbb6ml9_RcYC4ho7Dfn1r-jSrJKSLBNHppnJ3X0PBoCg7EQAvD_BwE)

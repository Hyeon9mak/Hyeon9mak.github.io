---
title: "Java package-private 은 안쓰나요?"
date: 2021-02-17
tags:
    - Java
toc: true
toc_sticky: true
toc_label: "package-private 은 안쓰나요?"
---

![프레젠테이션1](https://user-images.githubusercontent.com/37354145/107908298-0cc74f00-6f99-11eb-8232-9b8d81286f28.png)

자동차 경주 구현 미션을 진행하던 중, 패키지 구조를 정리하다보니 접근제한자에 대한 고민이 생겨났다.  
  
"어차피 `car` 내부에서만 사용되는 메서드나 생성자라면... `package-private`으로 두는게 더 좋지 않은가?"  
  
접근제한자에 대한 생각이 마구마구 솓아났고, 접근제한 범위를 최대한 좁히라던 이펙티브 자바 내용도 떠올라 
과감하게 `public` 접근제한자를 모두 `package-private`으로 바꿨다.  
  
그러자 리뷰어 **hue**가 아래와 같은 피드백을 남겼다.

![프레젠테이션2](https://user-images.githubusercontent.com/37354145/107912147-51ef7f00-6fa1-11eb-824b-d545543dff3d.png)

접근제한 범위를 최대한 좁히는게 좋다고 배웠고, `car` 패키지 내부에서만 사용되는 메서드들이 많았기 때문에 
`package-private`을 활용하는 것이 당연하다고 생각했었다. 혹시나 `package-private` 때문에 
접근제한자를 붙이지 않았음이 전달되지 않았을까하는 마음에 곧바로 DM을 보냈다.

![프레젠테이션3](https://user-images.githubusercontent.com/37354145/107912573-173a1680-6fa2-11eb-97ee-736df1a9b917.png)

그러자 충격적이게도 **"현업에서 `package-private`이 잘 사용되지 않는다."** 라는 답변을 받을 수 있었다. 
`package-private`이 잘 사용되지 않는 이유가 궁금했으나, 우선 다음 단계의 피드백을 받아야했으므로 
`package-private` 접근제한자를 사용했던 곳들에 다른 접근제한자를 붙여 다음 단계를 위한 리퀘스트를 푸시하기로 했다.

<br>

## 그럼 뭘로 package-private을 대체하지?
막상 `package-private`을 대체하려 하니, `protected`과 `public` 중에 고민이 되었다. 
`protected`를 사용하자니 **"내가 하위 객체까진 열어줄 의사가 있어" 라고 상속 가능성을 표시하는 것** 같았고, 
`pulbic`을 사용하자니 **접근 권한을 너무 개방시켜놓는게 아닌가** 하는 걱정이 피어났다.  
  
> "Java에서 `final` 키워드는 배열이나 Collections 객체 원소의 불변을 지켜주진 못하지만, 
> 그것들 앞에 붙임으로서 해당 API 개발자들에게 **불변을 특히 신경쓸 것을 경고**하는 방식으로 사용된다."

결국 `final` 키워드와 같은 방식으로 `protected`를 해석했다. 당장 `package-private`을 대체하는 것에 
`protected` 접근제한자가 사용되기에는 `protected` 접근제한자가 내포하는 의미가 더 클 것 같아서 `public`을 채택했다.
그러나 역시 확신은 없었기 때문에, 이 부분에 대해서 추가로 질문을 남겼다.

<br>

## 일단 package-private은 안쓰는게 맞아

![프레젠테이션4](https://user-images.githubusercontent.com/37354145/107914949-cbd63700-6fa6-11eb-9917-5904a3423bde.png)

두 번째 피드백을 받는 과정에서 접근제한자에 대한 hue의 상세한 의견을 들을 수 있었다.  
  
hue는 무의식적으로 `package-private`을 사용하지 않았다고 한다. 그정도로 `package-private`이 사용되지 않는다는 것이다. 
실제로 `package-private`을 효율적으로 사용한 사례를 보기 힘들었다고... 
그와 더불어 `package-private`을 **사용해야 한다는 관점**과 **사용하지 말아야한다는 관점** 두 가지에 대한 
글도 추천해주셨다.  
  
사용해야 한다는 관점에서는 `java.util.*`을 예시로 `package-private` 
가 효율적으로 접근제한을 할 수 있음을 이야기하고 있고, 사용하지 말아야한다는 관점에서는 
실제 `package-private`이 그렇게 유의미하게 사용되지는 못한다는 것과 패키지 구조가 잘못된 경우가 많아 
접근제한을 `package-private`으로 둘 필요가 없다는 것이었다.  
  
즉, 다시 정리하면 `package-private` 접근제한을 잘 활용하는 경우가 분명히 존재하긴 하나, 
**대부분의 경우 `package-private`을 제대로 활용하기가 어려운 편**이다. 특히나 규모가 계속해서 커지는 
프로젝트의 경우, **패키지 구조가 변경될 때마다 접근제한자가 발목을 잡을 가능성이 매우 높다**는 디메리트가 있었다.  
  
<br>

## protected vs public  
`protected` vs `public`의 경우, 역시 **상속관계의 접근수준을 제한**하는 것이 `protected`의 주역할이기 때문에 
`public`을 사용하는 것이 더 나은 선택이었던 것 같다. 그리고 hue의 조언과 같이 불확실한 상속관계를 미리 걱정하고 
접근을 제한하는 것은 [YANGNI(eXtreme Programming)](https://ko.wikipedia.org/wiki/YAGNI) 원칙에도 
위배하는 것이라 생각되어서, 마음 편히 `public`을 사용하기로 결론 지을 수 있었다.

<br>

## 현업의 차이가 느껴지십니까?
책에서 배운 내용대로만 접근제한자를 관리하면, 접근제한자는 권한을 적게 줄수록 좋으므로 `package-private`을 사용하는 것이 
무조건 옳아 보였다. 그러나 실제 현업에서는 거쳐가는 서비스를 관리한다는 특성 때문에 기피되고 있다는 걸 배울 수 있었다.  
  
책과 현업의 차이... 이론과 실전의 차이...  
**"현업 개발자에게 리뷰를 받는다는 것이 이런거구나!"**  
참 행복한 시간이구나. 더 열심히 리뷰어들을 괴롭혀야겠다.

<br>

## References
- [[1단계 - 자동차 경주 구현] 현구막(최현구) 미션 제출합니다.](https://github.com/woowacourse/java-racingcar/pull/181)
- [[2단계 - 자동차 경주 리팩토링] 현구막(최현구) 미션 제출합니다.](https://github.com/woowacourse/java-racingcar/pull/199)
- [Is Java package level scope useful?](https://softwareengineering.stackexchange.com/questions/294640/is-java-package-level-scope-useful)
- [Don’t use package private in java](https://hummusandmagnets.tumblr.com/post/52285020299/dont-use-package-private-in-java)
- YANGNI를 알려주신 제이슨과 히로 고맙습니다! 😂

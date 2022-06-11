---
title: "검색 기능 트러블 슈팅기 - 동등성 비교"
date: 2022-06-11
tags:
    - kotlin
    - data-class
    - equals
toc: true
toc_sticky: true
toc_label: "검색 기능 트러블 슈팅기 - 동등성 비교"
---

## 🔍 트러블 발생

<img width="780" alt="image" src="https://user-images.githubusercontent.com/37354145/171799560-bee61efb-70d7-4613-8174-4ed86a6169c0.png">

시터와 부모간 매칭을 전담하시는 매칭 매니저분들이 새롭게 사용하실 어드민 페이지 오픈을 앞두고 있다.
어드민 페이지에서 **날짜, 신청 상태, 담당 매니저**라는 3가지 조건으로
원하는 결과를 빨리 찾으실 수 있도록 검색 기능을 구현 중이다.
검색 기능 구현을 위해서 QueryDSL 사용을 고려했는데, 
검색 조건으로 사용되는 데이터들이 엔티티 4개를 조합(`JOIN`)한 분량이라는 점과
그것들을 모두 반환하기엔 불필요하게 노출되는 정보가 너무 많다는 점 때문이다.
때문에 QueryDSL을 사용해 조회된 결과를 별도의 data class(`CareApplyAndScheduleAndSitterDTO`)에 담아 반환하도록 
기능을 구현했다.

<img width="724" alt="image" src="https://user-images.githubusercontent.com/37354145/173176999-2e9316ad-d712-45b4-bcc3-88c29b94bbac.png">

조회에 필요한 정보만 프로퍼티로 가진 data class를 준비하고 
그 data class에 정보를 담아 전달 할 수 있는 쿼리를 작성한 뒤,
조회가 성공할 것이라는 확신과 함께 기쁜 마음으로 테스트를 실행했는데 
예상치 못한 부분에서 테스트가 실패했다.

<img width="587" alt="image" src="https://user-images.githubusercontent.com/37354145/171800690-dd12ae0f-e336-44b0-8d68-015835c44959.png">

[QueryDSL은 WHERE절에 null을 전달하는 경우 조건문을 아예 생성하지 않는다.](https://jojoldu.tistory.com/394)
때문에 검색 조건을 모두 `null`로 전달했을 경우 성공할 수 밖에 없는 테스트다.
마침 조회 되어야 할 원소의 개수는 7개고, `조회결과_리스트`의 크기도 7 이다.
그런데도 테스트는 실패했다.

data class 내부 모든 원소들 역시 primitive type 이거나 data class 였기 때문에 
동등성 비교로 문제가 생길리 없다.
분명 논리적으로 문제가 되는 부분이 없는데, 컴파일러는 계속해서 데이터가 일치하지 않는다고 우기고 있었다.

홧김에 '테스트고 뭐고 데이터 잘 나오는건 확실한데 그냥 배포할까...' 생각도 들었지만,
혹여나 검색 로직이 변경된다면 든든한 방패가 되어줄 테스트임이 분명했다.
결국 모든 원소를 하나하나 비교해가며 테스트를 통과시키기 위한 여정을 시작했다.

<br>

## 🔍 왜 동등성 비교에 실패하지?

<img width="903" alt="image" src="https://user-images.githubusercontent.com/37354145/171801794-4aaccd15-8eeb-4208-acc4-c821e129cb59.png">

우선 '어떤 녀석이 일치하지 않는가'부터 시작했다.
`shouldContainExactlyInAnyOrder`의 대상이 되는 원소들을 하나씩 분리 후
`shouldContain`를 통해 리스트에 포함되어 있는지 테스트를 진행해보았다.
그러자 공통적으로 `돌봄희망일`을 가진 경우에 동등성 비교에 실패하는 걸 확인할 수 있었다.
`돌봄희망일 == 스케줄`이었으므로, 스케줄 정보를 가지고 있는 data class에서 동등성 비교가 실패함을 추측 가능했다.

이번에는 `shouldBe`로 대놓고 동등성 비교를 테스트해보았다.
그러나 동등성 비교를 테스트하면서 더욱 미궁속으로 빠져들었는데,
동등성 비교 실패로 보여준 정보가 서로 완전히 완전히 동일했기 때문이다.

<img width="1775" alt="image" src="https://user-images.githubusercontent.com/37354145/171811521-e8176d78-bd82-4370-8df9-df375aad07f2.png">

미치고 펄쩍 뛸 노릇이다. 
일반 class가 아닌 data class라서 동등성 비교를 진행할게 분명하고,
보기엔 완전히 동일한 데이터인데 동등성 비교에 실패한다니.
'혹시 data class를 잘못 사용한게 아닐까?' 걱정되어 
완전히 동일한 data class 인스턴스를 2개 만들어 비교도 해보았다.

<img width="1101" alt="image" src="https://user-images.githubusercontent.com/37354145/171813595-71d0a92b-1bd7-4d62-8337-a9f08e4345c2.png">

그러자 이번에는 통과하는 모습을 보여줬다. 
이 즈음부터 '영속성 컨텍스트를 다녀온 data class에는 무언가 변화가 생기는가?' 의심이 피어났지만,
'영속성 컨텍스트를 다녀와 봐야 data class는 data class지.' 라며 의심을 접고
다시 data class 내부 원소들을 하나씩 뜯어보기 시작했다.

<img width="763" alt="image" src="https://user-images.githubusercontent.com/37354145/171803218-26c397b1-6d41-495d-b59a-be8f5c17118c.png">
<img width="1096" alt="image" src="https://user-images.githubusercontent.com/37354145/171811456-5f35690d-bbd1-4bc2-85b7-f62615d77261.png">

우선 스케줄 data class인 `RegularScheduleDto`와 그 내부 프로퍼티들을 하나하나 테스트 해보았다.
그 결과 `RegularSchedule` 세부 정보에 해당하는 `RegularScheduleOption` data class 에서 문제가 발생하고 있었다.

<img width="710" alt="image" src="https://user-images.githubusercontent.com/37354145/171812061-d309f088-e0ee-4c16-896c-ef8c4947ab92.png">

그러나 `RegularScheduleOption` data class만 별도로 동등성 비교를 진행해봐도 여전히 원인을 파악할 수 없었다. 
'혹시나 `DayOfWeek` 클래스간 동등성 비교가 안되는 건 아닐까', '`LocalTime` 소수점 값에 차이가 있던건 아닐까' 등 여러가지 
테스트를 추가로 진행해보았지만 진전이 없었다.

<img width="916" alt="image" src="https://user-images.githubusercontent.com/37354145/173177544-34d9ef65-7ff8-4967-b31d-a47e5f78bd4d.png">

*RegularScheduleDto 짜증난다...*

<br>

## 🔍 팀원분들께 도움을 받자
결국 문제를 해결하지 못하고 하루를 통째로 날렸다.
다음 날 점심 시간 내려가는 엘레베이터에서 팀원분들께 현상황을 툴툴거리며 말씀드렸더니
곰곰히 듣고 계시던 20년차 백엔드 개발자 현웅님께서 여러가지 접근 방법을 제시해주셨다.
점심식사 후 현웅님이라면 해결의 실마리를 잡아주실 수도 있을거라는 기대감에 무작정 노트북을 들고 찾아갔다. 
한참 채팅기능 개선으로 바쁘신 와중에도 흔쾌히 문제를 같이 살펴봐주셨고,
10분도 안되어 실마리를 잡아내주셨다.

<img width="981" alt="image" src="https://user-images.githubusercontent.com/37354145/171814389-0286a5f1-c9d4-40b5-9926-dc6c44e7912b.png">

현웅님은 디버깅 모드로 데이터 타입부터 확인해주셨다.
'눈에 보이는 데이터가 모두 일치하는데 동등성 비교가 실패한다면,
데이터의 타입이 달라서 동등성 비교를 시도조차 하지 않는다.'는 접근이셨다.
실제로 `RegularScheduleDto` 내부 `timeSlots` 컬렉션의 데이터 타입이 달랐다.

<img width="1055" alt="image" src="https://user-images.githubusercontent.com/37354145/173177884-2bcc385e-bd7b-434b-ad84-ba042c631a19.png">

영속성 컨텍스트에 진입하지 않은 컬렉션은 본래 데이터 타입을 유지하고 있지만,

<img width="1047" alt="image" src="https://user-images.githubusercontent.com/37354145/173177892-87fdc0f8-cad9-4a54-99de-3275fdc1c855.png">

영속성 컨텍스트에 진입한 컬렉션은 `PersistentBag`으로 감싸진다.
[JPA가 영속성 컨텍스트에 속한 컬렉션을 보다 쉽게 관리하기 위해서 감싸는 것이다.](https://joont92.github.io/jpa/%EC%BB%AC%EB%A0%89%EC%85%98%EA%B3%BC-%EB%B6%80%EA%B0%80%EA%B8%B0%EB%8A%A5/)

<img width="697" alt="image" src="https://user-images.githubusercontent.com/37354145/173177905-ac1f3f74-dac7-47c5-a124-d5a0f7f2cbdd.png">

결국 `PersistentBag`과 `ArrayList`로 데이터 타입부터가 다르니까 동등성 비교에 실패하는게 당연했던 것이다.

<br>

## 🔍 해결 방법

원인이 명확히 밝혀지니 해결은 수월했다.
`엔티티 -> data class`로 변환을 할 때 `toList()` 메서드를 통해 컬렉션으로 변환을 명시적으로 하거나, 
테스트 코드에서 data class간 동등성 비교가 아닌 data class 내부 값을 직접 꺼내서 비교를 진행하면 
문제를 해결할 수 있었다.

나의 경우 실제로 API 호출시 `CareApplyAndScheduleAndSitterDTO`를 반환하므로
`CareApplyAndScheduleAndSitterDTO`를 비교하는 테스트가 더 의미있다고 생각해서
`toList()` 메서드를 통해 명시적으로 컬렉션 반환을 하도록 했다.

<img width="571" alt="image" src="https://user-images.githubusercontent.com/37354145/171815352-cf747d54-ae97-418f-9c02-b77e902eb2a3.png">
<img width="1756" alt="image" src="https://user-images.githubusercontent.com/37354145/173177918-42ade696-bd31-49b2-b0d6-754cfdaaaad6.png">

감사합니다 현웅님! 🙇‍♂️

<br>

## 🔍 그래서 뭘 배웠는가
'왜 동등성 비교가 안될까?', '`equals`나 `shouldBe`가 다르게 동작하는 부분이 있나?' 와 같이
익숙한 부분에서만 원인을 찾으려 했던 점이 아쉬웠다. 
수 많은 개발자가 믿고 사용하는 `equals`와 `shouldBe` 등을 의심했고, 
의심과정에서 그간 알고 있던 개념이 흐트러질까봐 혼란스러워 하고 스트레스를 받았다. 
그러나 현웅님께서는 자연스럽게 hashCode 부터 확인하셨다. 
모두가 믿고 사용하는 라이브러리에는 원인이 없을게 당연하니 
디버깅 모드로 문제가 발생할 수 있는 영역만 체크하신거 같다.
결국 정리하면 아래와 같다.

- 모두가 믿고 사용하는 것에는 이유가 있다.
- 디버깅 모드와 더욱 친해져보자.
- 모르는게 있다면 주변 동료분들께 더더욱 적극적으로 도움을 요청하자

> [이렇게 해피엔딩이 되나 싶었지만, 배포 후 또 다른 문제를 마주치게 되었다.](https://hyeon9mak.github.io/search-function-troubleshooting-query-dsl-cast) 

<br>

## References

- [[jpa] 컬렉션과 부가기능 - 기록은 기억의 연장선](https://joont92.github.io/jpa/%EC%BB%AC%EB%A0%89%EC%85%98%EA%B3%BC-%EB%B6%80%EA%B0%80%EA%B8%B0%EB%8A%A5/)
- [[Querydsl] 다이나믹 쿼리 사용하기 - 기억보단 기록을](https://jojoldu.tistory.com/394)

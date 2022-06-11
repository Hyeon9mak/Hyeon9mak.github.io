---
title: "검색 기능 트러블 슈팅기 - QueryDSL Cast"
date: 2022-06-12
tags:
    - kotlin
    - query-dsl
toc: true
toc_sticky: true
toc_label: "검색 기능 트러블 슈팅기 - QueryDSL Cast"
---

> 이전 글: [검색 기능 트러블 슈팅기 - 동등성 비교](https://hyeon9mak.github.io/search-function-troubleshooting-data-class-equals)

## 🔍 트러블 발생
앞서 동등성 비교 문제를 해결하고, 성공적으로 배포까지 완료했다.
매칭 매니저분들께서 활용하실 어드민 페이지에 API를 연결하고 동작 결과를 확인하려 하는데...
화면이 순간적으로 멈추었다.

<img width="1489" alt="image" src="https://user-images.githubusercontent.com/37354145/173180594-ad0a506b-1b71-4f49-922d-4ae42e761e1d.png">

약 6~7초가 지나서야 검색 결과를 조회할 수 있었다.
[페이지 로딩이 3초 이상 걸리면 이용자의 50%가 이탈](https://www.thinkwithgoogle.com/intl/en-ca/marketing-strategies/app-and-mobile/mobile-page-speed-new-industry-benchmarks/)
하는 시대에 7초가 걸리는 검색 기능을 제공한다는 건 말도 안되는 일이다.
곧바로 쿼리의 병목이 발생하는 지점을 찾아나서기 시작했다.

<br>

## 🔍 병목 지점 찾기

<img width="583" alt="image" src="https://user-images.githubusercontent.com/37354145/173178574-a76fc1e2-f3a2-4060-b528-ec7e01bc6251.png">

`MomsitterUser`와 `SitterCareManager`에 대한 인덱스 테이블이 빠져있긴 했으나,
인덱스 테이블이 없다고 해서 30만건도 안되는 데이터를 조회하는데 7초가 걸릴 리는 없었다. 
원인이 가늠이 안가던 중에, 현웅님께 질문을 드린 후 쉽게 해결책을 찾았던 기억이 떠올라
옆자리에서 집중중이신 경수님께 무작정 질문을 드렸다.

"경수님, 돌봄 신청 어드민페이지에서 목록 조회하는 쿼리가 6~7초가 걸리는데 어떤게 문제일까요...?"  
"7초?? ㅋㅋㅋ 쿼리 한번 넘겨주세요."

경수님께서는 곧바로 `explain` 명령을 통해 쿼리의 실행계획을 살펴보셨다.
쿼리 내부에서 인덱스 테이블이 있음에도 인덱스를 타지 못하는 모습을 발견할 수 있었는데,
그걸 통해 7초가 소요되는 이유를 추측할 수 있었다.

<img width="787" alt="image" src="https://user-images.githubusercontent.com/37354145/173178640-b506551c-ad83-4545-98d8-baa6218fd46f.png">

`MomsitterUser` 엔티티는 이전에 탈퇴한 회원의 정보를 클렌징하는 과정에서 
PK의 데이터 타입을 `Long`에서 `Integer`로 바꾼 이력을 갖고 있다.
이 때문에 QueryDSL을 작성할 때 `MomsitterUser`의 PK값을 `id.longValue()`을 통해 변환했는데,
변환이 오래걸리기 때문에 병목일 발생한 것으로 추측한 것이다.
(인덱스를 태우는 것 자체도 성능개선이 있겠지만 드라마틱한 변화는 없을 것으로 예상)

<img width="677" alt="image" src="https://user-images.githubusercontent.com/37354145/173178656-2431bed2-629c-45af-9945-30956e4adff7.png">

실제로 하이버네이트가 날리는 쿼리에서 cast 동작을 확인할 수 있었다.
30만개의 데이터에서 모두 cast가 발생하니, 7초짜리 쿼리가 탄생할 수 밖에 없었다. 

<img width="467" alt="image" src="https://user-images.githubusercontent.com/37354145/173178657-d693772b-7d66-4583-8566-54e1e3436e89.png">

결국 `id.longValue()` 없이도 `MomsitterUser`와 `ParentCareApply`를 조인시킬 방법을 구상해야했다.

<br>

## 🔍 해결 방법

처음엔 `MomsitterUser` 엔티티의 PK를 `Integer`에서 `Long`으로 되돌리는 방법을 떠올렸다.
어차피 대부분의 엔티티가 PK를 `Long`으로 가지고 있고, `MomsitterUser` 엔티티 역시
언젠가는 `Integer`에서 `Long`으로 마이그레이션이 진행되어야하는데
'이왕 하는 김에 그걸 내가 하면 되겠지.' 라는 생각이었다.

때문에 `MomsitterUser` 클렌징을 진행하셨던 민영님께 DM을 드렸는데, 민영님께서 겁을 주셨다.

<img width="616" alt="image" src="https://user-images.githubusercontent.com/37354145/173178662-03c3e342-3fb4-4f37-8811-46e475c62bfd.png">

실제로 `MomsitterUser` 엔티티를 살펴보다가 연관관계를 맺고 있는 `MomsitterUserRole` 엔티티를 발견했고,
이 녀석 또한 PK를 `Integer`로 갖고 있음을 확인했다.
'서버 전체에서 전역적으로 사용되는 엔티티의 PK를 바꾸는 일이라 큰 공사일 것임은 예상했지만 이정도 일줄은...'
생각을 갖고 있었는데, 거기에 더해 또 다른 엔티티도 `Integer` PK를 가진 채 
연관관계를 맺고 있다는 이야기를 접하니 도저히 엄두가 안났다.

<img width="792" alt="image" src="https://user-images.githubusercontent.com/37354145/173178666-59832209-42b6-423d-a18d-71b830b0a0eb.png">

결국 `ParentCareApply` 엔티티에서 `MomsitterUser`의 PK를 
`Integer`로 변경하고, 이를 꺼내서 사용하는 부분만(getter/setter) `Long` 타입을 사용하도록 하여 해결했다.
이를 통해 QueryDSL 조인 파트에서는 `Integer` 타입 PK 끼리 성공적으로 조인이 이루어지고,
코틀린 코드에서는 `Long` 타입을 통한 핸들링을 이전처럼 진행할 수 있게 된다.
(추후 PK의 값이 커지면 역시나 `Long`으로 마이그레이션을 진행해야하긴 하지만...)

<img width="586" alt="image" src="https://user-images.githubusercontent.com/37354145/173178718-a74f4747-234a-4155-8b58-6c7f650b375c.png">

결국 cast 동작이 제거되어 10배의 성능 개선 결과를 얻을 수 있었고,
쾌적한 돌봄신청 목록 조회가 가능해졌다!

<br>

## 🔍 뭘 배웠는가

- 개발 히스토리를 알고 있는 사람은 중요하다.
- 몇 십만건에 해당하는 데이터 조회는 생각보다 오래 걸리지 않는다.
- 몇 십만건에 해당하는 데이터에 인덱스가 드라마틱한 변화를 주진 않는다.
- 항상 쿼리 실행계획을 잘 살펴보자. 인덱스 테이블을 만들 때만 유용한게 아니다.
- 주변 팀원분께 질문 드린건 잘한거 같다!

<img width="468" alt="image" src="https://user-images.githubusercontent.com/37354145/173178724-331287fc-7209-4443-a276-ea0c153af864.png">

항상 감사합니다 경수님 🙇‍♂️

<br>

## References

- [Find Out How You Stack Up to New Industry Benchmarks for Mobile Page Speed](https://www.thinkwithgoogle.com/intl/en-ca/marketing-strategies/app-and-mobile/mobile-page-speed-new-industry-benchmarks/)

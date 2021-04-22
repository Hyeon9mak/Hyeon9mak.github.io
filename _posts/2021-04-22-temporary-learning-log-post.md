---
title: "임시 학습 로그 회고 포스트"
date: 2021-04-22
tags:
    - 우아한테크코스
toc: true
toc_sticky: true
toc_label: "임시 학습 로그 회고 포스트"
---

## [로또 미션](https://hyeon9mak.github.io/우아한테크코스-로또-미션-회고/)
### 테스트 코드 우선 작성
```
## [TDD] 테스트 코드 우선 작성 - 5
### 내용
- 구현 기능 목록을 먼저 작성하는 연습
- 테스트 시작전 최대한의 설계 진행
- 테스트 작성이 쉬운 설계 고민
- 구현 기능 목록을 지속적으로 업데이트하면서 테스트 진행
### 링크
- https://gmlwjd9405.github.io/2018/07/06/strategy-pattern.html
```

---

### 원시값 포장
```
## [OOP] 원시값 포장 - 3
### 내용
- `LottoNumber`, `Money`, `Rank` 등의 원시 값을 포장
- `getter/setter` 사용을 지양함으로서, '객체에 메세지를 보내라'를 지키려함
- 포장한 객체의 검증로직을 통해 원시값을 신뢰하고 서비스 로직을 구현 해나갈 수 있음
### 링크
- https://manualz.kr/entry/JAVA-원시값-포장에-대해서-알아보록-하겠습니다
```

---

### 일급 컬렉션
```
## [OOP] 일급 컬렉션 - 4
### 내용
- `List<LottoNumber>` 를 `LottoNumbers`로 대체
- `List<LottoTicket>`을 `LottoTickets`로 대체
### 링크
- https://jojoldu.tistory.com/412
```

---

### Enum
```
## [JDK] Enum - 5
### 내용
- 맞춘 로또 번호별 등수와 상금을 정리하기 위한 `Rank` enum 클래스 생성
- `Rank` 상수 하나당 일치하는 번호 개수, 보너스 번호 일치 여부, 상금, 메세지 출력 양식을 저장시킴
### 링크
- https://inor.tistory.com/12
```

---

### Stream API
```
## [JDK] Stream API - 3
- `Rank` enum 클래스에서 Stream API의 filter를 적극 활용하여 `Rank` 상수 감별
- 추가적인 Stream API 함수 학습 후 `LottoTickets`의 `joinLottoTickets` 메서드를 작성함
### 링크
- https://github.com/woowacourse/java-lotto/pull/275/commits/723fe500538cc8339b60cae1193513472ac089b3
- https://codechacha.com/ko/java8-stream-concat/
```

---

### 점진적 리팩토링
```
## [TDD] 점진적 리팩토링 - 2
### 내용
- '로또 피드백' 페이지에 제시되어 있는 점진적 리팩토링을 시도해보았으나, 익숙하지 않아 많은 어려움을 겪음
- '우선 돌아가는 프로그램 상태를 유지하고, 조금씩 수정을 진행하라' 는 메세지만 이해한 것 같음
### 링크
- https://techcourse.woowahan.com/s/zmAj9jfu/ls/npw8YN4M
```

---

### 캐싱
```
## [OOP] 캐싱 - 4
### 내용
- 중복되어 사용되는 1~45의 `LottoNumber` 인스턴스를 캐싱하는 방법에 대해 공부
- `LottoNumber` 클래스에 `static` 키워드를 통해 인스턴스 캐싱을 진행함
- `LottoNumber` 인스턴스를 생성하여 사용하는 로직들을 캐싱된 인스턴스를 사용하도록 수정함
### 링크
- https://woowacourse.github.io/javable/post/2020-06-24-caching-instance/
```

<br>

## [블랙잭 미션](https://hyeon9mak.github.io/우아한테크코스-블랙잭-미션-회고/)

---

### Stream
```
# [JDK] Stream - 1
## 내용
- stream API로 나열중인 데이터들을 곧바로 조합해주는 `.collect(joining())` 메서드에 대해 학습 후 적용함
## 링크
- https://codechacha.com/ko/java8-stream-collect/
```

---

### 점진적 리팩토링
```
# [TDD] 점진적 리팩토링 - 3
## 내용
- '우선 돌아가는 프로그램 상태를 유지하고, 조금씩 수정을 진행하라' 는 메세지를 지킴
- 컴파일 에러를 최대한 회피하면서 점진적 리팩토링을 진행함
## 링크
- https://techcourse.woowahan.com/s/zmAj9jfu/ls/npw8YN4M
```

---

### 캐싱
```
# [OOP] 캐싱 - 2
## 내용
- 중복되어 사용되는 52장의 `Card` 객체를 캐싱함
- 최초에는 `CardGenerator` 객체를 생성해서 캐싱했으나, 인비와의 대화를 통해 `Card` 클래스에 직접 캐싱하는 것이 더 자연스럽다고 판단하여 `Card` 클래스 내부에 `static` 키워드를 통해 인스턴스 캐싱을 진행함
## 링크
- https://github.com/Hyeon9mak/java-blackjack/commit/110209b6ba847aefb19e8c8cf73c5d5db4647d5d
```

---

### Service layer, Dto
```
# [OOP] Service layer, Dto - 5
## 내용
- `BlackjackManager` 객체를 서비스 레이어로 생각해보면서 Dto개념을 도입함
## 링크
- https://umbum.dev/1066
- https://github.com/Hyeon9mak/java-blackjack/commit/db5bd0c1847b67755e02823bc8d98aae577e86a4
```

---

### 인터페이스와 추상 클래스
```
# [OOP] 인터페이스와 추상 클래스 - 5
## 내용
- 유한상태머신 패턴에서 인터페이스와 추상 클래스가 혼용되는 이유에 의문을 가짐
- 제이슨과의 대화를 통해 추상 클래스가 혼용되는 이유에 대한 이해를 가짐
## 링크
- https://hyeon9mak.github.io/why-do-you-use-abstract-class
```

---

### 메세지의 방향, 캡슐화
```
# [OOP] 메세지의 방향, 캡슐화 - 5
## 내용
- 블랙잭 게임 상태별 배팅 반환 금액을 계산하기 위한 분기문을 줄이기 위해 유한상태머신 패턴을 적용함
- 유한상태머신을 구현하는 과정에서 객체의 책임과 위치에 대한 기준을 찾지 못함
- 미립으로부터 "캡슐화", "메세지의 방향" 키워드를 제공 받음
- 캡슐화와 메세지 방향 키워드를 통해 객체의 책임과 위치에 대한 기준을 선정하고 구현을 진행함
## 링크
- https://hyeon9mak.github.io/우아한테크코스-블랙잭-미션-회고/
```

---

### 은유와 객체
```
# [OOP] 은유와 객체 - 5
## 내용
- 객체지향의 사실과 오해 책을 통해 "객체지향은 현실세계의 모방이다" 라는 도시전설에 대해 재해석하는 시간을 가짐
  - 객체는 현실세계의 모방이 아니다. 현실세계를 재창조하는 것이다.
      - 객체는 하나의 생명체가 되어야한다. 즉, 객체는 능동적이어야한다.
      - `RacingCar`라는 객체는 현실세계의 자동차가 아니다. 자동차와 비슷한 협력과 책임을 가진 객체 덩어리다. 우리는 `RacingCar` 라는 이름을 통해 "앞으로 전진하거나 달리겠군." 이라고 객체의 행동을 유추할 수 있다.
  - 객체의 상태를 먼저 결정하고 행동을 결정하면 상태의 내부가 공용 인터페이스에 노출될 가능성이 높아지고(캡슐화 저해), 객체를 고립되게 만들며, 객체의 재사용성이 저하되게 된다. 객체의 행동(협력)부터 결정하고 그에 따른 적절한 상태를 선택하자.
      - 이와 관련해서 TDD가 도움을 줄 수 있다. TDD에선 우선 객체가 수행할 행동(메서드)부터 작성해나가기 시작하므로, 자연스럽게 객체의 행동을 중점으로 적합성을 결정할 수 있다.
- 결국 객체지향과 현실세계는 서로 아무런 연관이 없지만, 모두가 알고 있는 일반적인 현실세계 형태로 객체의 이름을 표현하여 객체의 책임과 역할을 유추하기 쉽도록 하는 것이다.
## 링크
- http://www.yes24.com/Product/Goods/18249021
```

<br>

## [체스 미션](https://hyeon9mak.github.io/우아한테크코스-체스-미션-회고/)

---

### 커맨드 패턴
```
# [OOP] 커맨드 패턴 - 5
## 내용
- 커맨드패턴에 대한 학습 진행 후 체스게임의 명령어 `start`, `move`, `status`, `end`에 커맨드 패턴을 적용함
## 링크
- https://gmlwjd9405.github.io/2018/07/07/command-pattern.html
- https://github.com/Hyeon9mak/java-chess/commit/afb789dfe72eeb829e3ba5b411a5242dde4bc725
```

---

### flatMap
```
# [JDK] flatMap - 3
## 내용
- 페어 에드로부터 Stream API의 flatMap 메서드에 대해 배운 후 체스미션에 전반적으로 적용함
## 링크
- https://github.com/Hyeon9mak/java-chess/commit/971c7eb1607b18a53ddf9a5827b651d5e6fa045a
```

---

### 이벤트 소싱
```
# [OOP] 이벤트 소싱 - 5
## 내용
- 이벤트 소싱 기법에 대해 학습한 후, 체스게임 명령을 기록하는 방식으로 데이터베이스를 구현함
## 링크
- https://mjspring.medium.com/%EC%9D%B4%EB%B2%A4%ED%8A%B8-%EC%86%8C%EC%8B%B1-event-sourcing-%EA%B0%9C%EB%85%90-50029f50f78c
- https://github.com/woowacourse/java-chess/pull/240/files/5308f2fbc2149f2ccaf6db8a846b2f5e8669a02f#diff-bdbc4966c729e860f82b005ab3903fd146b59de79b1c7c168f8374b3381ada6e
```

---

### 이벤트 버블링, 이벤트 캡처, 이벤트 위임
```
# [Javascript] 이벤트 버블링, 이벤트 캡처, 이벤트 위임 - 2
## 내용
- Javascript의 이벤트 범위와 버블링, 캡처를 이해하고 이벤트를 위임하는 방식에 대해 학습 후 적용함
## 링크
- https://joshua1988.github.io/web-development/javascript/event-propagation-delegation/
- https://github.com/woowacourse/java-chess/pull/240/files/5308f2fbc2149f2ccaf6db8a846b2f5e8669a02f#diff-bdbc4966c729e860f82b005ab3903fd146b59de79b1c7c168f8374b3381ada6e
```

---

### Custom Exception
```
# [Java] Custom Exception - 2
## 내용
- `printStackTrace()` 사용에 대한 피드백을 받은 후 Custom Exception을 적용함
## 링크
- https://github.com/woowacourse/java-chess/pull/240#discussion_r606782916
- https://hyeon9mak.github.io/%EC%9A%B0%EC%95%84%ED%95%9C%ED%85%8C%ED%81%AC%EC%BD%94%EC%8A%A4-%EC%B2%B4%EC%8A%A4-%EB%AF%B8%EC%85%98-%ED%9A%8C%EA%B3%A0/#%EF%B8%8F-custom-exception
```

---

### try-with-resources
```
# [Java] try-with-resources - 4
## 내용
- 데이터베이스 연결 자원 자동 회수를 위한 try-with-resources 구분 사용법과 자원이 자동으로 회수되는 원리 (AutoCloseable 구현)를 학습하고 적용함
## 링크
- https://hyeon9mak.github.io/%EC%9A%B0%EC%95%84%ED%95%9C%ED%85%8C%ED%81%AC%EC%BD%94%EC%8A%A4-%EC%B2%B4%EC%8A%A4-%EB%AF%B8%EC%85%98-%ED%9A%8C%EA%B3%A0/#%EF%B8%8F-try-with-resources
```
---
title: "랜덤 뽑기(가챠) 시스템 구현하기"
date: 2024-02-18
tags:
    - 일지
toc: true
toc_sticky: true
toc_label: "랜덤 뽑기(가챠) 시스템 구현하기"
---


![](https://i.imgur.com/5whRMOQ.png)

어릴적 문방구 앞에서 100원 짜리 가챠(랜덤 뽑기)를 돌려본 경험이 있는가?
광고 포스터 속 캐릭터 피규어를 보면서 설레이는 마음에 100원이라는 거금을 투자했지만, 알사탕이 들어있는 캡슐이 데구르르 굴러 나올 때 그 절망감은 평생 잊을 수가 없겠다.
나는 이런 가챠류에서 항상 운이 좋지 않았기 때문에, 그다지 가챠 시스템을 선호하지 않는다.

우연히 업무중 "사용자들에게 캐릭터 카드 랜덤 뽑기 기능을 제공해보면 어떨까?" 라는 아이디어가 등장했고, 테스트를 위해 이를 구현해보게 되었다. 내가 가챠 시스템을 선호하지 않는 것과 별개로 직접 구현해보는 과정은 상당히 즐거웠기 때문에 이를 남겨볼까 한다.

<br>

## 요구사항

- 캐릭터 카드는 1~5성 까지의 등급을 갖는다.
- 각각의 카드는 중복 뽑기가 가능하다.
- 투자한 재화량에 따라 각 등급별 등장확률이 달라진다.
    - 재화를 3개 투자한다면 1~3성이
    - 재화를 5개 투자한다면 4성이
    - 재화를 10개 투자한다면 5성이 더 잘 등장한다.

1~5성 까지의 등급이 존재하는 것은 여타 TCG 카드 게임, 모바일 게임에서 흔하게 보았던 시스템이라 쉽게 이해하고 정의할 수 있다.

![](https://i.imgur.com/ohiwQjR.png)

*대략 이런 느낌일 것*

고민이 많았던 부분이 바로 '투자 재화별 등장 확률 변경' 인데, 초기에는 카드 별로 등장 확률을 관리해볼까 고민했다. 그러나 카드마다 확률을 관리하는 방법은 아래와 같은 이유로 불가능하다 판단하여 빠르게 포기하게 된다.

1. 매 다른 뽑기 방법마다 확률 관리가 불가능하다.
2. 카드가 새로 추가될 때마다 전체 카드들의 확률을 재조정 해주어야 한다.

![](https://i.imgur.com/SpW7BMU.png)

매번 전체 카드들의 확률을 재조정해야한다는 문제점을 차치하더라도, 뽑기 방법이 추가될 때마다 확률 관리가 불가능하다는 점이 가장 리스키했다.

결국 현실적으로 선택할 수 있는 방법은 뽑기 자체마다 확률을 별도로 관리하는 것이다. 다행스럽게도 '특정 카드의 등장 확률이 높아진다.' 대신 '특정 등급에 해당하는 카드들의 등장 확률이 높아진다.' 이므로, 보다 편리하게 로직을 구상해볼 수 있다.

<br>

## 뽑기별 확률 구성

![](https://i.imgur.com/FHhXyCj.png)

위와 같이 총량을 100% 로 하고, 소모되는 재화별 뽑기의 확률을 달리하면 관리가 간편해진다. 만약 재화를 30개 소모해서 무조건 3~5성만 등장하도록 하는 뽑기를 만들고 싶다면 아래와 같은 확률표 관리도 가능해진다.

![](https://i.imgur.com/nYvBYO9.png)

그렇다면 어떻게 각 등급별로 확률에 맞추어 카드가 등장하게 끔 만들 수 있을까?
현재 100% 를 나타내는 상태에서 1~100 까지의 숫자를 각 확률 별로 고르게 분포시키면 된다.

![](https://i.imgur.com/bLEKotN.png)

그리고 매 뽑기 로직마다 1~100 까지의 정수 중 랜덤한 하나의 숫자를 뽑으면 된다.
가령 재화 5개 뽑기 중 72 라는 난수가 뽑힌 경우?

![](https://i.imgur.com/ULL6yiG.png)

`51~75` 까지 분포된 3성 등급이 대상이 된다. 준비되어 있는 3성 카드들 중 하나를 랜덤하게 뽑아 사용자에게 지급하면 된다.

만약 등장 확률을 소수점 하위까지 관리하고 싶다면? 수의 범위를 100 이상으로 늘리면 된다.
(소수점 첫째자리는 `1~1,000`, 둘째자리는 `1~10,000`) 당연히 뽑는 숫자도 그에 맞춰서 늘려주면 된다.

<br>

## 카드 랜덤 뽑기 구현
Kotlin + Spring + JPA 환경에서 간단하게 랜덤 뽑기를 구현해보자.

```kotlin
// 카드
@Entity
class Card(  
  @Column(nullable = false)  
  var name: String,
  
  @Column(nullable = false)  
  @Enumerated(EnumType.STRING)  
  var grade: CardGrade,  
) {
  @GeneratedValue(strategy = GenerationType.IDENTITY)  
  @Id  
  val id: Long = 0L

  override fun equals(other: Any?): Boolean {  
    if (this === other) return true  
    if (javaClass != other?.javaClass) return false  
    
    other as Card  
    
    return id == other.id  
  }  
    
  override fun hashCode(): Int {  
    return id.hashCode()  
  }
}
```

```kotlin
// 랜덤 뽑기
@Entity  
class CardRandomDraw(  
  
  @Column(nullable = false)  
  val name: String,
  
  @Column(name = "need_money", nullable = false)  
  val need_money: Int,  
  
  @ElementCollection(fetch = FetchType.EAGER)  
  @CollectionTable(  
  name = "card_random_draw_range_by_grade",  
  joinColumns = [JoinColumn(name = "card_random_draw_id")]  
  )  
  @AttributeOverrides(  
  value = [  
    AttributeOverride(name = "grade", column = Column(name = "grade", nullable = false),),  
    AttributeOverride(name = "startRange", column = Column(name = "start_range", nullable = false)),  
    AttributeOverride(name = "endRange", column = Column(name = "end_range", nullable = false))  
  ]  
  )  
  private val ranges: MutableList<CardRandomDrawRangeByGrade>  
) {  
  @GeneratedValue(strategy = GenerationType.IDENTITY)  
  @Id  
  val id: Long = 0L  
  
  init {  
  validateDuplicateGrade()  
  validatePercentRange()  
  }  
  
  private fun validateDuplicateGrade() {  
  val gradeSet = ranges.map { it.grade.value }.toSet()  
  require(gradeSet.size == ranges.size) { "중복되는 등급(별)이 존재합니다. 등급(별): ${gradeSet.joinToString(", ")}" }  
  }  
  
  private fun validatePercentRange() {  
  val percentRange = ranges.map { it.startRange..it.endRange }.flatten()  
  require(percentRange.size == 100) { "확률의 범위는 1~100까지의 숫자로만 이루어질 수 있습니다." }  
  }  
  
  fun randomDrawGrade(): CardGrade {  
  val randomValue = (1..100).random()  
  return ranges.first { it.isInRange(randomValue) }.grade  
  }  
  
  override fun equals(other: Any?): Boolean {  
  if (this === other) return true  
  if (javaClass != other?.javaClass) return false  
  
  other as CardRandomDraw  
  
  return id == other.id  
  }  
  
  override fun hashCode(): Int {  
  return id.hashCode()  
  }  
}
```

```kotlin
// 랜덤 뽑기 등급별 범위
@Embeddable  
data class CardRandomDrawRangeByGrade(  
  @Enumerated(EnumType.STRING)
  val grade: CardGrade,  
  val startRange: Int,  
  val endRange: Int,  
) {  
  
  init {  
    require(startRange <= endRange) { "확률의 시작 범위는 끝 범위보다 작거나 같아야 합니다." }  
    require(startRange >= 1) { "확률의 범위는 1~100까지의 숫자로만 이루어질 수 있습니다." }  
    require(endRange <= 100) { "확률의 범위는 1~100까지의 숫자로만 이루어질 수 있습니다." }  
  }  
  
  fun isInRange(value: Int): Boolean = value in startRange..endRange  
}
```

![](https://i.imgur.com/1QKduC0.png)

자세히 보면 1:N 구조를 나타내는 `card_random_draw_range_by_grade` 에는 별개 PK 가 존재하지 않는다. `card_random_draw_range_by_grade` 1 row 로서는 비즈니스적으로 아무런 가치를 지니지 않고, `card_random_draw` 와 함께 다 같이 조회되었을 때 실질적으로 가치를 지니므로, 생명주기를 `card_random_draw` 와 함께한다는 의미로 `@ElementCollection`, `@CollectionTable` 을 활용했다.

> `@ElementCollection`, `@CollectionTable` 에 대해서는 아래 글을 참고하자.   [https://github.com/Hyeon9mak/WIL/blob/2e7a35895b85107b664fa44e5c3b9e57e85d51f9/jpa/jpa-value-type.md#%EA%B0%92-%ED%83%80%EC%9E%85-%EC%BB%AC%EB%A0%89%EC%85%98](https://github.com/Hyeon9mak/WIL/blob/2e7a35895b85107b664fa44e5c3b9e57e85d51f9/jpa/jpa-value-type.md#%EA%B0%92-%ED%83%80%EC%9E%85-%EC%BB%AC%EB%A0%89%EC%85%98)

> 또 하나 살펴볼 점은 `CardRandomDrawRangeByGrade` 에서 `@Embeddable` 어노테이션을 사용중인데, 이 이유는 [No-arg compiler-plugin 의 지원을 받기 위해](https://hyeon9mak.github.io/kotlin-jpa-essentials/)서다.

구체적으로 확률별 랜덤한 등급을 뽑기 코드는 아래와 같이 동작한다.

```kotlin
  fun randomDrawGrade(): CardGrade {  
    val randomValue = (1..100).random()  
    return ranges.first { it.isInRange(randomValue) }.grade  
  }  
```

1. 1~100 사이의 난수를 뽑는다.
2. 카드 랜덤 뽑기에 존재하는 확률 범위 중에서 난수에 해당되는 등급을 뽑아낸다.

```kotlin
  val cardGrade = cardRandomDraw.randomDrawGrade()
  val drewCards = cardRepository.findByGrade(grade = cardGrade)
  val drewCard = drewCards.random()
  return drewCard
```

3. 뽑아낸 등급을 기준으로 카드 저장소에서 같은 등급의 카드들을 모두 찾아낸다.
4. 찾아낸 카드 리스트에서 랜덤한 한 장을 뽑아서 반환한다.

<br>

## 응용과 한계

만약 특정 카드에 대한 등장 확률을 높이고 싶다면, 아래와 같은 방식으로 추가 관리가 가능하다.

![](https://i.imgur.com/gR9Utqe.png)

요즘 모바일 게임 가챠에서 많이 보이는 `사용자별 N 회 이상 뽑기시 특정 카드 무조건 지급`과 같은 로직의 경우 사용자별로 뽑기 내역 테이블을 별개로 관리하면서 뽑기 직전 `N 회 이상` 조건에 도달했는지 체크하는 것으로 간단히 구현이 가능하겠다!

다만 `사용자별 N 회 이상 뽑기시 5성 카드 등장확률 20% 증가` 와 같은 경우 다른 등급의 등장확률을 줄이고 5성 카드 등장 확률을 늘릴 것인지, 아니면 1~100 을 넘어 1~120 까지의 범위를 다루어 등장 확률을 늘릴 것인지 등 여러가지 고민이 추가로 필요할 것 같다.

<br>

## 마치며

가챠 시스템이 '대략 이런식으로 구현 되어 있겠지' 라고 막연하게 생각만 해왔는데, 
직접 구현해보니 생각보다 복잡하고 다양한 응용이 가능한 시스템이다. 
물론 현재 수준은 간단히 테스트를 진행한 것이므로, 실제 비즈니스에서는 훨씬 더 복잡하고 다양한 요구사항이 존재할 것이다.

역시나 "생각만 해보는 것과 직접 해보는 것은 다르다." 를 다시 한번 느끼게 해준 재밌는 경험.
항상 직접 손으로 만들어보는 습관을 들이자.

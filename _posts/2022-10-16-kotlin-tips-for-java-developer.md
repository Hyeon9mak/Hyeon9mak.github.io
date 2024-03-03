---
title: "Java 개발자가 보면 좋을 Kotlin 팁 모음"
date: 2022-10-16
tags:
    - kotlin
    - java
toc: true
toc_sticky: true
toc_label: "Java 개발자가 보면 좋을 Kotlin 팁 모음"
---

NEXTSTEP [TDD, 클린 코드 with Kotlin](https://edu.nextstep.camp/c/Z9QeJlCi) 강의를 통해 
Kotlin 공부를 진행하면서 정리해둔 팁과 생각을 모아보았다.

**[Kotlin tour](https://kotlinlang.org/docs/kotlin-tour-hello-world.html) 사이트를 함께 활용하면
눈으로 보는 것보다 학습 효과가 더욱 뛰어나겠다.**

> - 2024-03-03 Kotlin tour 사이트 링크 추가 (thanks to [웨지](https://github.com/sihyung92/))
> - 2022-10-18 range, asSequence, 관례, Kotlin 어노테이션 추가

## 💬 Kotlin 기본 소개

Kotlin 은 Java7 에서 Java8 로 올라가는 사이에 'Java 가 영 불편한데...' 라는 고민과 함께 탄생했다.
JetBrains 에서 만들었으며, 기존 Java 코드와의 상호 운용성을 굉장히 중요시 여기며 설계되었다.
Kotlin code 에서 Byte code 까지 변경에는 시간이 좀 걸리지만,
Byte code 로 변경이 완료되면 Java 와 속도(효율성)가 비슷해진다.

<br>

## 💬 타입 추론 (type inference)

```kotlin
val number: Int = 1
val number = 1
```

Kotlin 은 타입 추론을 지원한다. 정적 타입 지정 언어에서 프로그래머가 일일히 타입을 선언해야하는 불편함이 사라진다.
이따금 과도한 타입 추론으로 인해 불편함을 느낄 수 있다. 이럴 땐 IntelliJ 가 지원하는 설정을 통해 해소 가능하다.

**Preferences > Editor > Inlay Hints > Types > Kotlin > Types** 를 통해 확인할 수 있다.

![image](https://user-images.githubusercontent.com/37354145/194847888-54549b24-1b51-4774-89ce-53de44feeeef.png)

<br>

## 💬 최상위 수준에 함수 정의

Java 는 클래스가 꼭 필요하다. 클래스 없이는 함수를 정의할 수 없다.
하지만 Kotlin 은 최상위 수준에 함수만 정의할 수 있다.

```java
// java
public class Applicant {
    public static void main(String[] args) {
        System.out.println("Hello, World!");
    }
}
```
```kotlin
// kotlin
fun main() {
    println("Hello, World!")
}
```

> Kotlin 1.3 이전 버전의 경우 `main()`는 `Array<String>`의 매개 변수를 가져야 한다.

<br>

## 💬 함수를 만드는 방법

### 블록이 본문인 함수
```kotlin
fun max(a: Int, b: Int) : Int {
    return if (a > b) a else b
}
```

### 식이 본문인 함수
```kotlin
fun max(a: Int, b: Int) : Int = if (a > b) a else b
```

식이 본문인 함수를 통해 조금 더 높은 가독성을 확보할 수 있다.
팀원간 컨벤션에 따라 블록 본문이 더 좋은 경우도 존재한다.

<br>

## 💬 이름 붙인 인자 (named arguments)

아래의 인자로 전달한 각 문자열이 어떤 역할을 하는지 구분 할 수 있는가?

```kotlin
Person("최현구", 1996, "현구막")
```

함수의 시그니처를 살펴보지 않고는 이런 질문에 대답하기 어렵다. Kotlin 으로 작성한 함수를 호출할 때는 인자 중 일부나 전체를 명시해줄 수 있다. 이것을 [이름 붙인 인자(named arguments)](https://kotlinlang.org/docs/functions.html#named-arguments)라고 부른다.

```kotlin
"이름 붙인 인자" {
    val people = listOf(
        Person("최현구", 27, "현구막"),
        Person("최현구", 27, nickname = "현구막"),
        Person(
            name = "최현구",
            nickname = "현구막",
            age = 27
        )
    )

    people.forAll {
        it.name shouldBe "최현구"
    }
}
```

> - Java Builder Pattern 참고
> - Kotlin 에서는 테스트 함수 이름을 백틱(`)으로 감싸면 한글 + 띄어쓰기 조합으로 만들 수 있다.

<br>

## 💬 주생성자 (primary constructor)

```kotlin
class Person {
    val name: String
    val age: Int
    var nickname: String?

    constructor(name: String, age: Int, nickname: String?) {
        this.name = name
        this.age = age
        this.nickname = nickname
    }
}
```

클래스 이름 옆에 붙은 소괄호가 생성자의 역할을 대신해줄 수 있다. (`constructor` 키워드 생략)

```kotlin
class Person(
    val name: String,
    val birth: Int,
    var nickname: String?,
)
```

<br>

## 💬 Nullable 관리

```kotlin
class Person(
    val name: String,
    val birth: Int,
    var nickname: String?,
)
```

`?` 키워드를 통해 nullable 함을 명시할 수 있다.
(반대로 `?` 키워드가 없다면 절대 non-nullable 하다.)

```kotlin
"널 타입" {
    val person = Person("최현구", 27, null)
    person.name shouldBe "최현구"
    person.age shouldBe 27
    person.nickname shouldBe null
}
```

<br>

## 💬 기본 인자

Java 에선 생성자의 인자 개수가 다른경우 부생성자를 만들어야만 했다.
Kotlin 에서는 프로퍼티(필드)에 기본 인자를 채워주는 것으로 간단히 해결 가능하다.

```kotlin
class Person(
    val name: String,
    val birth: Int,
    var nickname: String? = "현구막",
)
```
```kotlin
"기본 인자" {
    val person = Person("최현구", 27)
    person.name shouldBe "최현구"
    person.age shouldBe 27
    person.nickname shouldBe "현구막"
}
```

<br>

## 💬 클래스 작성 순서

프로퍼티, 초기화 블록, 부 생성자, 함수, 동반 객체 순으로 작성한다.

```kotlin
class Car(val name: String, position: Int = DEFAULT_POSITION) {
    var position: Int = position
        private set

    fun move() {
        if (getRandomNumber() >= FORWARD_NUMBER) position++
    }
    
    private fun getRandomNumber(): Int {
        return Random.nextInt(MAX_BOUND)
    }

    companion object {
        const val DEFAULT_POSITION: Int = 0
        const val FORWARD_NUMBER: Int = 4
        const val MAX_BOUND: Int = 9
    }
}
```

<br>

## 💬 주 생성자 부 생성자

Kotlin 언어 레벨에서 주 생성자, 부 생성자 개념을 제공해준다.

- 주 생성자는 클래스 이름 뒤에 오는 괄호를 둘러싸인 코드.
- 주 생성자는 생성자 파라미터를 지정하고 그 생성자 파라미터에 의해 초기화 되는 프로퍼티를 정의하는 2가지 목적으로 쓰인다.

```kotlin
class Car(val name: String)
```

- 주 생성자는 제한적이기 때문에 별도의 코드를 포함할 수 없으므로 초기화 블록이 필요하다.
- 필요하다면 클래스 안에 여러 초기화 블록을 선언할 수 있다.

```kotlin
class Car(val name: String) {
    var position: Int
    
    init {
        position = 0
    }
}
```

초기화 블록은 프로퍼티 선언에 포함시킬 수 있어서 생략할 수 있다.

```kotlin
class Car(val name: String) {
    var position: Int = 0
}
```

> 만약 아래와 같은 경우 어떻게 초기화될까?
>
> ```kotlin
> class Car(val name: String) {
>     var position: Int = 0
>     
>     init {
>         position = 10_000
>     }
> }
> ```
>
> 우선 0으로 초기화 된 후 뒤따라 10_000 이 초기화 된다.
>
> ```kotlin
> class Car(val name: String) {
>     var position: Int = 0
>     
>     init {
>         position = 10_000
>     }
>
>     init {
>         position = 20_000
>     }
> }
> ```
>
> 위의 경우에도 0 -> 10_000 -> 20_000 순으로 초기화 된다. 때문에 클래스 선언 순서가 중요하다.

- 클래스 인스턴스를 생성할 때 파라미터 목록이 다른 생성 방법이 여럿 존재하는 경우에는 부 생성자(secondary constructor) 를 둘 수 있다.
- 부 생성자가 주 생성자를 호출하도록 만든다.

```kotlin
class Car(val name: String, var position: Int) {
    constructor(name: String) : this(name, 0)
}
```

인자에 대한 기본 값을 제공하기 위해 부 생성자를 여럿 만들지 말고 매개 변수의 기본 값을 사용하라.

```kotlin
class Car(val name: String, var position: Int = 0)
```

> "인텔리제이가 하자는대로 하면 이펙티브 Kotlin이 된다."

주 생성자에서는 프로퍼티가 내부에서
만 가변, 외부에서는 불변이게 할 수 없다. 
때문에 이와 같은 상황 해결을 원할 경우 클래스 내부에
프로퍼(`asSequance` 티를 선언해야한다. 
(이 때 프로퍼티 선언은 val, var 키워드를 사용한 것을 의미한다.)

```kotlin
class Car(val name: String, var position: Int = 0)

class Car(val name: String, position: Int = 0) { 
    var position: Int = position
}
```

<br>

## 💬 커스텀 getter/setter

```kotlin
class Car(val name: String, position: Int = 0) {
    var position: Int = position
        get() = 0
        set(value) = ...
}
```

접근제어자를 통해 getter/setter를 숨겨줄 수도 있다.

```kotlin
class Car(val name: String, position: Int = 0) {
    var position: Int = position
        private set
}
```

> 프로퍼티를 private 하게 선언하는 순간 getter를 제공해줄 수 없다.
>
> ```kotlin
> class Car(val name: String, position: Int = 0) {
>     private var position: Int = position
>         public get() // 이건 안된다.
> }
> ```

<br>

## 💬 상수 선언

> Java's `static` == Kotlin's `object`

### 최상위 수준(클래스 파일 레벨)에 선언하기

```kotlin
private const val DEFAULT_POSITION = 0

class Car(val name: String, positon: Int = DEFAULT_POSITION)
```

### 동반 객체(companion object)에 선언하기

```kotlin
class Car(val name: String, positon: Int = DEFAULT_POSITION) {
    companion object {
        private const val DEFAULT_POSITION = 0
    }
}
```

보통 동반 객체에 선언을 선택한다. Java 와 Kotlin 언어가 한 프로젝트에 혼용되는 경우
최상위 수준에 상수를 선언하면 Java 로 디컴파일 되는 과정에서 코드가 굉장히 복잡하고 지저분해지기 때문이다.

<br>

## 💬 require & check

- `require()`는 값을 만족하지 않으면 IllegalArgumentException을 발생
- `check()`는 값을 만족하지 않으면 IllegalStateException을 발생

```kotlin
fun calculate(text: String?): Int {
    require(text.isNotNull)
    val tokens = text.split(" ")
    // ...
}
```

<br>

## 💬 Smart Cast

어떤 변수가 원하는 타입인지 검사하고 나면 굳이 변수를 원하는 타입으로 캐스팅하지 않아도 
마치 처음부터 그 변수가 원하는 타입으로 선언된 것처럼 사용할 수 있다.
하지만 실제로는 컴파일러가 캐스팅을 수행해주며 이를 Smart Cast 라고 부른다.

```kotlin
fun calculate(text: String?): Int {
    if (text.isNullOrBlank()) {
        throw IllegalArgumentException()
    }
    val tokens = text.split(" ")
    // ...
}
```

파라미터로 넘겨 받을 땐 null 인지 아닌지 여부를 알 수 없으나,
검사 이후 null 이 아님이 확정되었으므로 `.split(" ")` 이 제한없이 가능해진다.

<br>

## 💬 get 메서드 관례 (Indexed access operator)

```kotlin
val names = listOf("Jason", "Pobi")

// as-is
names.get(0)

// to-be
names[0]
```

<br>

## 💬 람다 사용 관례 (Passing a lambda to the last parameter)

```kotlin
// as-is
check(false, { -> "Check failed." })

// to-be
check(false) { "Check failed." }
```

<br>

## 💬 연산자 오버로딩(Operator overlaoding)

```kotlin
// as-is
Point(0, 1).plus(Point(1, 2))

data class Point(val x: Int, val y: Int) {
    fun plus(other: Point): Point = Point(x + other.x, y + other.y)
}
```
```kotlin
// to-be
Point(0, 1) + Point(1, 2)

data class Point(val x: Int, val y: Int) {
    operator fun plus(other: Point): Point = Point(x + other.x, y + other.y)
}
```

<br>

## 💬 data class

`equals()`, `toString()`, `hashCode()`, `copy()`, `componentN()` 가 자동으로 구현된 data class 를 활용할 수 있다.

```kotlin
class Person(
    val name: String,
    val age: Int,
    var nickname: String? = "현구막",
)

"기본 클래스" {
    val person1 = Person("최현구", 27)
    val person2 = Person("최현구", 27)
    person1 shouldBe person2 // 테스트 실패
}
```
```kotlin
data class Person(
    val name: String,
    val age: Int,
    var nickname: String? = "현구막",
)

"기본 클래스" {
    val person1 = Person("최현구", 27)
    val person2 = Person("최현구", 27)
    person1 shouldBe person2 // 테스트 성공
}
```

<br>

## 💬 시퀀스(asSequence)

Kotlin 컬렉션의 함수는 결과 컬렉션을 즉시 생성한다. 
이는 컬렉션 함수를 연쇄하면 매 단계마다 계산 중간 결과를 새로운 컬렉션에 임시로 담는다는 말이다. 
시퀀스(`asSequence` 를 사용하면 중간 임시 컬렉션을 사용하지 않고도 컬렉션 연산을 연쇄할 수 있다.

```kotlin
people.map(Person::name)
    .filter { it.startWith("A") }
```

이 연쇄 호출은 리스트를 2개 만든다. 
한 리스트는 `filter`의 결과를 담고, 다른 하나는 `map`의 결과를 담는다. 
원본 리스트에 원소가 2개 밖에 없다면 리스트가 2개 더 생겨도 큰 문제가 되지 않겠지만, 원소가 수백만 개가 되면 훨씬 더 효율이 떨어진다.

이를 더 효율적으로 만들기 위해서는 각 연산이 컬렉션을 직접 사용하는 대신 시퀀스를 사용하게 만들어야 한다.

```kotlin
people.asSequence()
    .map(Person::name)
    .filter { it.startWith("A") }
    .toList()
```

중간 결과를 저장하는 컬렉션이 생기지 않기 때문에 원소가 많은 경우 성능이 눈에 띄게 좋아진다. 
시퀀스의 원소는 필요할 때 비로소 계산된다. 따라서 중간 처리 결과를 저장하지 않고도 연산을 연쇄적으로 적용해서 효율적으로 계산을 수행할 수 있다.
Java 의 stream 과 유사하다. 

이정도로 효율이 좋다면 Sequence를 default로 지원하면 될텐데 왜 그럴까? 
가장 큰 Java 하위버전과의 하위호환성을 지키기 위해서다.

또한 항상 뛰어난 성능을 보여주는 것은 아니다. **컬렉션 변환이 잦지 않은 상황(sorted 등)에서는 오히려 사용하지 않는 편이 유리하다.**

<br>

## 💬 범위표현(range)

```kotlin
in (1..5) // 1~5 사이에 포함
!in (1..5) // 1~5 사이 미포함
```

아래와 같이 활용 가능하다. 

```kotlin
private val NAME_LENGTH_RANGE: IntRange = (1..5)
val randomNumber = (0..9).random()
```

<br>

## 💬 원하는 크기 만큼의 List 생성

```kotlin
val count = 3
List(count) { /* do somthing */ }
```

<br>

## 💬 원하는 횟수만큼 반복

```kotlin
// as-is
for (i in 1..5) {
    println("hello 현구")
}

// to-be
repeat(5) { println("hello 현구") }
```

<br>

## 💬 Nested Function

Kotlin 은 함수 내에서 함수를 정의할 수 있다.

```kotlin
fun match(
    userLotto: List<LottoNumber>,
    winningLotto: List<LottoNumber>,
    bonusNumber: LottoNumber
): Int {
    fun match(userLotto: Lotto, winningLotto: Lotto, bonusNumber: LottoNumber): Int {
        val matchCount = userLotto.values.count { winningLottol.values.contains(it) }
        val matchBonus = userLotto.values.contains(bonusNumber)
        return Rank.of(matchCount, matchBonus)
    }

    return match(Lotto(userLotto), Lotto(winningLotto), bonusNumber)
}
```

<br>

## 💬 Fake Constructor Pattern

가짜 생성자 패턴을 통해 테스트의 가독성을 높일 수 있다.

```kotlin
// 기존
row(LottoNumbersFixture.of(setOf(11, 12, 13, 14, 15, 16)), 0),
row(LottoNumbersFixture.of(setOf(1, 12, 13, 14, 15, 16)), 1),
row(LottoNumbersFixture.of(setOf(1, 2, 13, 14, 15, 16)), 2),
row(LottoNumbersFixture.of(setOf(1, 2, 3, 14, 15, 16)), 3),
row(LottoNumbersFixture.of(setOf(1, 2, 3, 4, 15, 16)), 4),
row(LottoNumbersFixture.of(setOf(1, 2, 3, 4, 5, 16)), 5),
row(LottoNumbersFixture.of(setOf(1, 2, 3, 4, 5, 6)), 6),
```
```kotlin
// 개선
LottoNumbers(11, 12, 13, 14, 15, 16, bonus = 0),
LottoNumbers(1, 12, 13, 14, 15, 16, bonus = 1),
LottoNumbers(1, 2, 13, 14, 15, 16, bonus = 2),
LottoNumbers(1, 2, 3, 14, 15, 16, bonus = 3),
LottoNumbers(1, 2, 3, 4, 15, 16, bonus = 4),
LottoNumbers(1, 2, 3, 4, 5, 16, bonus = 5),
LottoNumbers(1, 2, 3, 4, 5, 6, bonus = 6),

// Fake Constructor
fun LottoNumbers(
    n1: Int,
    n2: Int,
    n3: Int,
    n4: Int,
    n5: Int,
    n6: Int,
    bonus: Int
): Row2<LottoNumbers, Int> =
    row(LottoNumbersFixture.of(setOf(n1, n2, n3, n4, n5, n6)), bonus)
```

<br>

## 💬 확장함수

```kotlin
fun match(userLotto: Lotto, winningLotto: Lotto, bonusNumber: LottoNumber): Int {
    // 기존
    match(userLotto, winningLotto)
    // 확장함수
    userLotto.match(winningLotto)
}

// 기존
private fun match(userLotto: Lotto, winningLotto: Lotto): Int {
    /* ... */
}

// 확장함수
private fun Lotto.match(winningLotto: Lotto): Int {
    /* ... */
}
```

<br>

## 💬 위임패턴 (by)

Kotlin 에서는 `by` 키워드로 위임패턴 구현방법을 제공한다.

```kotlin
class Lotto(val numbers: List<LottoNumber>) : List<LottoNumber> by numbers {
    init {
        require(numbers.distinct().size == 6)
    }

    fun match(lotto: Lotto): Int {
        return numbers.count { lotto.numbers.contains(it) }
    }

//    by 키워드를 통해 사라질 수 있다.
//    fun contains(number: LottoNumber) {
//        return numbers.contains(number)
//    }
}
```

<br>

## 💬 Kotlin 에서 간단한 getter 는 프로퍼티로 표현

```kotlin
fun getValue(): Int = 3

// 자바로 변환하면 동일하다.

val value: Int = 3
```

> 단, JPA Entity 의 경우 Proxy 패턴 활용으로 인해 프로퍼티 표현이 불가능하다.

<br>

## 💬 가변인자(vararg) 활용

- Kotlin 에서는 가변인자로 `vararg`를 활용할 수 있다. 
- 가변인자를 배열로 전달할 때는 `*`를 붙여서 전달할 수 있다.

```kotlin
functionName(*arrayOf(some, thing))
```

<br>

## 💬 Kotlin 어노테이션

간혹 data class 등의 프로퍼티(필드)에 어노테이션을 붙이면 제대로 동작하지 않음을 알 수 있다.
어노테이션이 동작하지 않는 이유는 지원 범위의 순서가 정해져있기 때문이다.

1. parameter
2. property
3. getter, setter 등…

```kotlin
data class CancelRequest(
  @param:JsonProperty("imp_uid")
  @get:JsonProperty("imp_uid")
  val impUid: String,

  @param:JsonProperty("merchant_uid")
  @get:JsonProperty("merchant_uid")
  val merchantUid: String,
  val amount: Long,
  val checksum: Long,
  val reason: String?
) {
    constructor(agencyusageId: String, refund: Refund) : this(
      agencyusageId,
      refund.paymentId,
      refund.amount,
      refund.checksum,
      refund.reason,
    )
}
```

Java 코드로 치면 프로퍼티들이 생성자 파라미터이자, 필드이자, 게터가 된다.
그렇기 때문에 useSite (어노테이션을 어디에 붙일 것인지)를 명시해주어야 한다.

<br>

## 💬 지연초기화(lateinit) 활용

- 생성자를 통해 의존성을 주입하는 것이 가장 좋다. 
  - 그러나 때때로 프로퍼티(필드)를 통해 주입해야하는 경우가 생김
- 의존성이 주입될 프로퍼티를 null 로 미리 초기화 해둘 수 있지만, null은 많은 불편을 초래한다. 
- Kotlin 에서는 `lateinit` 키워드를 붙이면 프로퍼티를 나중에 초기화해줄 수 있다. 
  - 단, 무조건 var 이어야 한다.

```kotlin
private lateinit var objectMapper: ObjectMapper
```

<br>

## 💬 import wildcard 금지

[ktlint](https://pinterest.github.io/ktlint/) 에서는 import wildcard 사용을 금지하고 있다.

import wildcard 사용을 멈추면 다른 패키지에 동일한 클래스가 존재한다는 것을 쉽게 인지할 수 있고,
무엇보다 Kotlin 의 경우 패키지 레벨의 함수도 선언할 수 있기 때문에 혼란을 줄일 수 있다.
IntelliJ 는 기본적으로 하나의 패키지에서 5개 이상의 import 가 이루어지는 순간
자동으로 wildcard 를 사용하므로, 이를 별개 설정을 통해 해제해주도록 하자.

> Editor > Code Style > Kotlin

<br>

## 💬 data class vs value class

### data class

- 일반적으로 Java 개발자가 생각하는 DTO에 가장 유사한 형태의 클래스
- `equals()`, `toString()`, `hashCode()`, `copy()`, `componentN()`를 자동으로 구현해주므로 보일러 플레이트 코드가 사라짐 
- 프로퍼티를 val, var 로 모두 구현할 수 있다. 
- 상속을 허용하지 않으며, abstract, open, sealed, inner 클래스도 될 수 없음 
- 주 생성자에 1개 이상의 프로퍼티가 무조건 선언되어야 함 
- 비유하자면 **고유 식번호를 가진 1,000원 권 지폐**

### value class

- `equals()`, `toString()`, `hashCode()` 까지만 자동으로 구현해줌
- 프로퍼티를 val 로만 구현할 수 있다. 무조건적인 불변제약
- 동일성(identity) 개념이 없다. 동등성 개념만 존재. 즉, '값 그 자체'를 뜻하는 클래스
- 비유하자면 **1,000원 이라는 금액 그 자체**
- 현재는 프로퍼티를 1개만 가질 수 있지만, 곧 data class 처럼 여러개의 프로퍼티를 가질 수 있게 될 예정
- 향후 젯브레인사의 Valhalla 프로젝트가 적용되면, JVM이 컴파일단계에서 value 클래스를 JVM 기본 클래스로 구현할 수 있게 된다고 함 (엄청난 최적화 가능성)

> - [Kotlin 1.5에 추가된 value class에 대해 알아보자](https://velog.io/@dhwlddjgmanf/Kotlin-1.5%EC%97%90-%EC%B6%94%EA%B0%80%EB%90%9C-value-class%EC%97%90-%EB%8C%80%ED%95%B4-%EC%95%8C%EC%95%84%EB%B3%B4%EC%9E%90)
> - [Kotlin 1.4.30의 새로운 언어 기능 테스트 버전](https://blog.jetbrains.com/ko/kotlin/2021/02/new-language-features-preview-in-kotlin-1-4-30/)

<br>

## 💬 abstract class vs sealed class

abstract class 와 sealed class 는 각각 언제 사용하는가?
흔히 kotlin에서 sealed class를 "완전한(제한적인) 계층 구조를 표현할 때", "안전한 계층 구조를 갖고 싶을 때" 사용한다고 한다. 
abstract class와 동일한 기능을 제공하면서, 더욱 뛰어난 안정성(아무나 서브 클래싱하여 확장할 수 있는 가능성을 없앰)을 제공하기 때문에 
sealed class를 사용하지 않을 이유가 없었다. 그렇다면 도대체 kotlin에서 abstract class는 언제 사용되는 것일까?

실제로 sealed class 와 abstract class의 차이는 구현체가 동일 패키지 안에 있어야하는지 아닌지의 여부 뿐이고,
그 차이로 인해 라이브러리나 프레임워크를 개발할 때는 abstract class를 활용하는 경우가 많으며(구현체를 클라이언트의 패키지에 두기 때문에), 
실무에서도 같은 이유에서 abstract class 를 활용할 수 있다. 그러나 그 외의 경우라면 sealed class 를 사용하는게 더 좋겠다.

> - [abstract class와 sealed class는 어느경우에 나눠 사용하나요?](https://www.inflearn.com/questions/545726)

<br>

## References

- [TDD, 클린 코드 with Kotlin](https://edu.nextstep.camp/c/Z9QeJlCi)
- [Kotlin Docs - named arguments](https://kotlinlang.org/docs/functions.html#named-arguments)
- [abstract class와 sealed class는 어느경우에 나눠 사용하나요?](https://www.inflearn.com/questions/545726)
- [Kotlin 1.5에 추가된 value class에 대해 알아보자](https://velog.io/@dhwlddjgmanf/Kotlin-1.5%EC%97%90-%EC%B6%94%EA%B0%80%EB%90%9C-value-class%EC%97%90-%EB%8C%80%ED%95%B4-%EC%95%8C%EC%95%84%EB%B3%B4%EC%9E%90)
- [Kotlin 1.4.30의 새로운 언어 기능 테스트 버전](https://blog.jetbrains.com/ko/kotlin/2021/02/new-language-features-preview-in-kotlin-1-4-30/)

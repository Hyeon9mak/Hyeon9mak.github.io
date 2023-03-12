---
title: "Kotlin Scope function 올바르게 사용하기"
date: 2023-03-12
tags:
    - kotlin
toc: true
toc_sticky: true
toc_label: "Kotlin Scope function 올바르게 사용하기"
---

`let`, `also` 와 같은 Scope function 을 오래전부터 사용해왔지만 정확히 어떤 상황에 어떤 Scope function 을 사용하면 좋을지 감이 잘 안잡혔다.
그러다 마침 Scope function 관련 질문도 받았었겠다, 각각의 Scope function 들에 대해 공부하고 어떤 상황에서 사용하면 좋을지 정리해보았다.

<br>

## 🔭 Scope function 소개

Kotlin 표준 라이브러리에는 객체 내부에서 코드를 실행할 수 있는 여러 함수가 제공된다.
그들 중 일부는 람다 표현식이 제공되고, 임시 스코프가 형성된다. 
이 스코프에서는 객체의 이름을 사용하지 않고 객체에 접근이 가능하다. (`it`, `this` 등을 활용)
이러한 함수를 Scope function 이라고 한다.

```kotlin
Person("현구막", 28, "집").let {
    println(it)
    it.moveTo("사무실")
    it.incrementAge()
    println(it)
}
```

Scope function 은 일반적으로 코드 블록을 실행하는 것과 동일하다. 단지 표현이 다를 뿐이다.

```kotlin
val hyeon9mak = Person("현구막", 28, "집")
println(hyeon9mak)
hyeon9mak.moveTo("사무실")
hyeon9mak.incrementAge()
println(hyeon9mak)
```

Scope function 에는 `let`, `run`, `with`, `apply`, `also` 가 있다.

| Function | Object reference | Return value     | Is extension function                       |
|----------|------------------|------------------|---------------------------------------------|
| `let`    | `it`             | Lambda result    | Yes                                         |
| `run`    | `this`           | Lambda result    | Yes                                         |
| `run`    | -                | Lambda result    | No: called without the context object       |
| `with`   | `this`           | Lambda result    | No: takes the context object as an argument |
| `apply`  | `this`           | Object reference | Yes                                         |
| `also`   | `it`             | Object reference | Yes                                         |

자세히 살펴보면 크게 2가지로 분류가 된다.

1. Object reference 호출 방식이 `it` 이냐, `this` 냐
2. 반환 값이 Lambda result 냐, Object reference 냐

그렇게 분류를 하면 `let`, `run`, `apply`, `also` 가 나뉘는데, 특이하게 `with`이 남는다.
`with` 은 다른 Scope function 들과 다르게 extension function 으로 정의되어있지 않다. 대신 argument 로 context object 를 받는다.

그냥 표만 보아서는 어떤 상황에 어떤 Scope function 을 사용해야 할지 감이 잘 안온다.
사실 큰 차이는 없고 적절한 Scope function 이라고 생각되는 걸 골라 사용하면 된다.
이번 글에서는 어떤 경우에 어떤 Scope function 을 사용하는게 조금 더 편한지 살펴보자.

<br>

## 🔭 with

객체 할당 이후 이름 그대로 객체에게 다양한 작업들을 함께(with) 할 때 쓰면 좋다.

```kotlin
inline fun <T, R> with(receiver: T, block: T.() -> R): R
```

앞선 설명과 같이 `with` 은 extension function 이 아니다. `with` 은 객체를 argument 로 받아 사용한다. 
두 번째 인자로 Lambda function 을 받기 때문에 곧바로 Lambda function 에 해당하는 코드 블록을 작성할 수 있다.
반환 값은 Lambda result 이다.

`with` 은 이미 생성된 객체에 일괄적인 작업을 처리할 때 유용하다.
실제로 공식 가이드에서는 with 을 사용하는 상황에 대해 "Grouping function calls on an object" 라고 설명하고 있다.

아래는 `with` 을 사용하기 전 코드.

```kotlin
hyeon9mak.isCool = true
hyeon9mak.isAwesome = true
hyeon9mak.koreanName = “현구막”
```

반복되는 코드를 줄일 수 있고, 코드의 가독성이 높아진다.

```kotlin
with(hyeon9mak) {
    this.isCool = true
    this.isAwesome = true
    this.koreanName = “현구막"
}
```

`this` 를 이용해서 객체 그 자체를 참조하기 때문에, `this` 키워드를 생략할 수 있다.

```kotlin
with(hyeon9mak) {
    isCool = true
    isAwesome = true
    koreanName = “현구막"
}
```

반환 값이 Lambda result 기 때문에 마지막 라인에 다른 데이터를 추가하면 이를 반환할 수 있다.

```kotlin
val result = with(hyeon9mak) {
    isCool = true
    isAwesome = true
    koreanName = “현구막"
    "nice"
}
// result = "nice"
```

<br>

## 🔭 apply

이름 그대로 객체에 무언가를 적용(apply) 할 때 쓰면 좋다.
(공식 문서 속 "Object configuration" 에 해당)

```kotlin
inline fun <T> T.apply(block: T.() -> Unit): T
```

`apply` 는 `with` 와 비슷하지만 extension function 이며, 반환 값이 Object reference 이다.
인자로 Lambda function 을 받기 때문에 곧바로 Lambda function 에 해당하는 코드 블록을 작성할 수 있다.

`with` 은 인자로 context object 를 받지만, `apply` 는 extension function 이기 때문에 객체를 생성해서 할당하기 전에 사용이 가능하다.
`apply` 코드 블록이 모두 수행된 후 인스턴스가 할당되기 때문에 `apply` 는 객체 생성시점에서 초기화를 할 때 유용하다.

```kotlin
val hyeon9mak = Person(
    email = "jinha3507@gmail.com",
    age = 28,
).apply { name = "현구막" }
```

<br>

## 🔭 also

이름 그대로 객체에게 명령을 내리기 직전에 추가적인(also) 작업을 함께 수행시키고 싶을 때 쓰면 좋다.
(공식 문서 속 "Additional effects" 에 해당)

```kotlin
inline fun <T> T.also(block: (T) -> Unit): T
```

`also`는 extension function 이며, 반환 값이 Object reference 이다.
인자로 Lambda function 을 받기 때문에 곧바로 Lambda function 에 해당하는 코드 블록을 작성할 수 있다.

`apply` 와 굉장히 유사해보이는데 차이가 무엇일까? `apply` 는 Lambda function 에 인자를 넘겨주지 않기 때문에 `this`를 이용해 참조한다.
그에 반해 `also`는 Lambda function 에 인자를 넘겨주기 때문에 인자를 `it` 이나 다른 이름을 부여해 참조가 가능하다.

먼저 `apply` 를 사용한 예시다.

```kotlin
val people = listOf(
    Person(
        email = "jinha3507@gmail.com",
        age = 28,
    ),
    Person(
        email = "another@email.com",
        age = 58,
    )
)
people.first()
    .apply { 
        println("이메일 길이: ${email.length}")
        name = "현구막" 
    }
```

코드 라인이 복잡해진다면 몇 번째 `Person` 을 대상으로 하는지 식별하기 어려워진다. 
이 때 `also`의 강점이 드러난다.

```kotlin
val people = listOf(
    Person(
        email = "jinha3507@gmail.com",
        age = 28,
    ),
    Person(
        email = "another@email.com",
        age = 58,
    )
)
people.first()
    .also {
        println("이메일 길이: ${it.email.length}")
        println("현재 나이: ${it.age}")
    }.increaseAge()
```
```kotlin
val people = listOf(
    Person(
        email = "jinha3507@gmail.com",
        age = 28,
    ),
    Person(
        email = "another@email.com",
        age = 58,
    )
)
people.first()
    .also { firstPerson ->
        println("이메일 길이: ${firstPerson.email.length}")
        println("현재 나이: ${firstPerson.age}")
    }.increaseAge()
```

<br>

## 🔭 run

객체를 생성하거나 사용하는 시점에서 다양한 작업을 수행시킨 후 결과를 반환받고 싶을 때 사용하면 좋다.
(공식 문서 속 "Object configuration and computing the result" 에 해당)

```kotlin
inline fun <R> run(block: () -> R): R
inline fun <T, R> T.run(block: T.() -> R): R
```

`run` 은 단일 lambda function 을 인자로 받는 버전과 extension function 으로 이루어진 버전이 있다.
둘 모두 반환 값은 Lambda result 다. 때문에 임의로 생성한 값이나 객체를 반환할 수 있다.
인자로 Lambda function 을 받기 때문에 곧바로 Lambda function 에 해당하는 코드 블록을 작성할 수 있다.

`with` 과 유사하지만, `run` 은 extension function 버전 때문에 객체를 생성해서 할당하기 전에 사용이 가능하다는 차이가 생긴다.

첫번째 버전은 아래와 같이 사용할 수 있다.

```kotlin
val person = Person.withDefaultName()
val personName = person.name
val nameLengthDouble = personName.length * 2
```
```kotlin
val nameLengthDouble = run { 
    val person = Person.withDefaultName()
    val personName = person.name
    personName.length * 2
}
```

그러나 변수 선언이 lambda scope 내부에서 끝난다는 것을 제외하면 일반적으로 작성하는 코드에 비해 가독성이 대단히 높아보이지는 않는다.
때문에 첫번째 버전은 잘 활용되지 않는 것 같다.

extension function 형식의 두 번째 버전은 아래와 같이 활용이 가능하다.

```kotlin
val person = Person.withDefaultName()
val nameDoubleLength = person.run { name.length * 2 }
```

가장 강력한 장점은 extension function 이기 때문에 객체를 생성하는 시점에도 사용할 수 있다는 점이다.
객체를 변수로 할당할 필요 없이 원하는 값만 바로 반환받을 수 있다.

```kotlin
val nameDoubleLength = Person.withDefaultName()
    .run { name.length * 2 }
```

null 회피 용도로도 사용할 수 있다.

```kotlin
val nameDoubleLength = person?.run { name.length * 2 }
    ?: 0
```

<br>

## 🔭 let

객체를 생성하거나 사용하는 시점에서 이름을 부여하여 다양한 작업을 수행시키고 결과를 돌려받고 싶을 때 사용하면 좋다.

```kotlin
inline fun <T, R> T.let(block: (T) -> R): R
```

`let`는 extension function 이며, 반환 값이 Lambda Result 이다.
인자로 Lambda function 을 받기 때문에 곧바로 Lambda function 에 해당하는 코드 블록을 작성할 수 있다.

`run` 은 Lambda function 에 인자를 넘겨주지 않기 때문에 `this`를 이용해 참조한다.
그에 반해 `let`는 Lambda function 에 인자를 넘겨주기 때문에 인자를 `it` 이나 다른 이름을 부여해 참조가 가능하다.

먼저 `run` 을 사용한 코드이다.

```kotlin
val people = listOf(
    Person(
        email = "jinha3507@gmail.com",
        age = 28,
    ),
    Person(
        email = "another@email.com",
        age = 58,
    )
)

val firstPersonEmailDoubleLength = people.first()
    .run { email.length * 2 }
```

역시나 코드 라인이 복잡해진다면 몇 번째 `Person` 을 대상으로 하는지 식별하기 어려워진다.
이 때 `let`의 강점이 드러난다.

```kotlin
val people = listOf(
    Person(
        email = "jinha3507@gmail.com",
        age = 28,
    ),
    Person(
        email = "another@email.com",
        age = 58,
    )
)

val firstPersonEmailDoubleLength = people.first()
    .let { it.email.length * 2 }
```
```kotlin
val people = listOf(
    Person(
        email = "jinha3507@gmail.com",
        age = 28,
    ),
    Person(
        email = "another@email.com",
        age = 58,
    )
)

val firstPersonEmailDoubleLength = people.first()
    .let { firstPerson -> 
        firstPerson.email.length * 2 
    }
```

local scope 안 변수들은 local scope 내부에서만 유효하므로, 변수명이 겹치는 등의 걱정이 없다.
(공식문서의 "Introducing an expression as a variable in local scope" 참고)

```kotlin
val firstPerson = Person(
    email = "jinha3507@gmail.com",
    age = 28,
)
val secondPerson = Person(
    email = "another@email.com",
    age = 58,
)
val people = listOf(firstPerson, secondPerson)

val firstPersonEmailDoubleLength = people.first()
    .let { firstPerson -> 
        val secondPerson = Person(
            email = "wow@wow.com",
            age = 10,
        )
        firstPerson.email.length * 2
    }
```

가끔은 `apply` 를 사용하는 것보다 `let` 을 사용하는 것이 더 좋은 경우도 있다.

```kotlin
var name = "현구막"
var age = 28

hyeon9mak.apply {
    name = name
    age = age
}
```

IDE 의 도움을 받지 않으면 `name` 과 `age` 가 무엇을 의미하는지 알기 어렵다.
특히나 `this` 키워드가 결합되면...

```kotlin
var name = "현구막"
var age = 28

hyeon9mak.run {
    this.name = name
    age = this.age
}
```

이런 경우 `let` 을 이용해 `it` 이나 다른 이름을 부여해 사용하면 좋다.

```kotlin
var name = "현구막"
var age = 28

hyeon9mak.let {
    name = it.name
    age = it.age
}
```
```kotlin
var name = "현구막"
var age = 28

hyeon9mak.let { hyeon9mak ->
    name = hyeon9mak.name
    age = hyeon9mak.age
}
```

또한 null check 를 간편하기 하기 위해 사용된다. 

```kotlin
val hyeon9mak = Person(
    email = "jinha3507@gmail.com",
    age = 28,
)

val hyeon9makNameDoubleLength = if (hyeon9mak.name != null) { 
    hyeon9mak.name!!.length * 2
} else {
    0
}
```

null check 후 동작을 `let` 으로 표현 가능하다.
(공식문서 "Executing a lambda on non-null objects" 참고)

```kotlin
val hyeon9mak = Person(
    email = "jinha3507@gmail.com",
    age = 28,
)
        
val hyeon9makNameDoubleLength = hyeon9mak.name?.let { name ->
    name.length * 2
} ?: 0
```

<br>

## 🔭 null 체크 주의사항

대부분 null check 를 위해 `let` 을 사용하는 경우가 많다. 그러나 모든 상황에서 `let` 이 올바른 것은 아니다.

### ❌ 불변 변수에 대해 null check 를 하는 경우

```kotlin
fun process(string: String?) {
    string?.let { /*Do something*/   }
}
```

위 코드는 변수 `str`를 넘겨 받아 `let` 을 사용해 null check 를 진행한다.
언뜻 보기엔 문제가 없어보이나, Java 로 디컴파일해보면 아래와 같이 변경된다.

```java
public final void process(@Nullable String string) {
   if (string != null) {
      boolean var4 = false;
      /*Do something*/
   }
}
```

> [boolean 은 그다지 비용이 큰 자료형이 아니며 kotlin proguard 를 사용하는 경우 자동으로 제거된다는 의견도 있다.](https://medium.com/@luciofm/ive-found-some-inconsistencies-on-your-recommendations-c1b776c003bd)
> 때문에 `let` 의 편리함을 포기할 이유가 있냐는 이야기. 어쨌거나 추가변수는 초당 수천 번 호출되는 루프에선 문제가 될 수도 있다고 생각한다.

이런 경우 익숙한 방법으로 null check 를 진행하는 것이 낫다고 생각한다.

```kotlin
fun process(string: String?) {
    if (string != null) {
        /*Do something*/
    }
}
```

`if` 블럭 내부에서 non null 로 auto-cast 되기 때문에 추가적으로 null check 를 진행할 필요도 없다.

### ❌ null check 후 객체의 프로퍼티를 사용할 때

아래 코드는 `person` 이 null 이 아닐 경우 `name` 과 `age` 를 사용한다.

```kotlin
person?.let {
    it.name = "Hyeon9mak"
    it.age = 28
}
```

위 코드처럼 객체의 프로퍼티를 사용할 땐 Object reference 가 `this` 인 `apply` 나 `run` 을 사용해서 `it` 키워드를 걷어내는 것이 바람직하다.
예시에서는 프로퍼티의 상태를 변경하는 것이므로 `apply` 가 적합하다.

```kotlin
person?.apply {
    name = "Hyeon9mak"
    age = 28
}
```

### ❌ null check 후 객체의 변수를 사용한다음 객체를 그대로 반환해야 할 때

아래 코드는 `person` 이 null 이 아닐 경우 이름의 길이를 출력하고, 곧이어 나이를 증가시킨다.

```kotlin
person?.let { hyeon9mak ->
    println("현구막 이름의 길이는? ${hyeon9mak.name.length}")
    hyeon9mak
}?.increaseAge()
```

객체 자신을 반환하여 추가 동작을 수행할 땐 `also` 를 사용하는 것이 바람직하다.

```kotlin
person?.also { hyeon9mak ->
    println("현구막 이름의 길이는? ${hyeon9mak.name.length}")
}?.increaseAge()
```

그렇다면 어떤 상황에서 `let` 을 사용해야 할까?

### ✅ mutable 변수의 null check

mutable 하고 nullable 한 변수에 대해 if 키워드로 null check 를 진행하면 아래와 같은 문제가 발생한다.

```kotlin
private var str: String? = null

fun process() {
    if (str != null) {
        println(str?.length)
    }
}
```

if 키워드 내부에서도 `?` 를 사용해서 변수에 접근해야한다.
이런 경우 `let` 을 사용하면 아래와 같이 간결하게 표현할 수 있다.

```kotlin
private var str: String? = null

fun process() {
    str?.let { println(it.length) }
}
```

### ✅ nullable 체이닝

아래 코드는 nullable 한 변수 체이닝이 반복된다.

```kotlin
fun process(string: String?): List? {
    return string?.asIterable()?.distinct()?.sorted()
}
```

위 코드를 디컴파일하면 아래와 같이 if 문 중첩이 발생한다.

```java
@Nullable
public final List process(@Nullable String string) {
   List var2;
   if (string != null) {
      Iterable var10000 = StringsKt.asIterable(
                           (CharSequence)string);
      if (var10000 != null) {
         var2 = CollectionsKt.distinct(var10000);
         if (var2 != null) {
            var2 = CollectionsKt.sorted((Iterable)var2);
            return var2;
         }
      }
   }

   var2 = null;
   return var2;
}
```

이런 경우 `let` 을 사용해서 nullable 체이닝을 끊어낼 수 있다.

```kotlin
fun process(string: String?): List? {
    return string?.let {
        it.asIterable().distinct().sorted()
    }
}
```
```java
@Nullable
public final List process(@Nullable String string) {
   List var10000;
   if (string != null) {
      int var4 = false;
      var10000 = CollectionsKt.sorted(
                   (Iterable)CollectionsKt.distinct(
                      StringsKt.asIterable((CharSequence)string)));
   } else {
      var10000 = null;
   }

   return var10000;
}
```

<br>

## 🔭 Scope function 체이닝은 최소한으로

Scope function 체이닝이 지나치게 반복되면 가독성이 떨어져 값을 예측하기 어렵고, 디버깅이 힘들다.

```kotlin
val result = Person.withDefaultName()
    .apply { name = "현구막" }
    .run { name.length }
    .also { println("이름의 길이는? $it") }
    .let { name -> name + 1 }
```

가능하면 Scope function 체이닝을 최소화하고, 객체에 적당한 책임을 할당해서 해결하도록 하자.

```kotlin
val person = Person.withDefaultName()
person.updateName("현구막")
val result = person.getNameLength() + 1
```

<br>

## 🔭 정리

<img width="1067" alt="image" src="https://user-images.githubusercontent.com/37354145/224550037-2f502dbf-8a4d-4798-bd67-11d911c67274.png">

의사 결정을 위한 플로우 차트는 위와 같지만, 결국 scope function 의 이름 뜻을 읽고 자연스럽게 느껴지는 대로 사용하면 되겠다.

- `with`
  - 객체 할당 이후 이름 그대로 객체에게 다양한 작업들을 함께(with) 할 때
- `apply`
  - 이름 그대로 객체에게 무언가를 적용(apply) 할 때
- `also`
  - 이름 그대로 객체에게 명령을 내리기 직전에 추가적인(also) 작업을 함께 수행시키고 싶을 때
- `run`
  - 객체를 생성하거나 사용하는 시점에서 다양한 작업을 수행시킨 후 결과를 반환받고 싶을 때
- `let`
  - 객체를 생성하거나 사용하는 시점에서 다양한 작업을 수행시킨 후 결과를 반환받고 싶을 때, 명시적인 네이밍이 필요할 때
  - mutable 변수의 null check 를 진행하거나 nullable 체이닝을 끊어내고 싶을 때

마지막으로 다시 한번 강조할 내용은 아래와 같다.

- null 이라고 해서 무조건 `let`을 사용하기보다 더 잘 어울리는 Scope function 을 고민하자.
- Scope function 체이닝만 사용하기보다 각 객체에 적당한 책임을 할당해서 유지보수성을 끌어올리도록 하자.

<br>

## References

- [Scope functions - Kotlin Documentation](https://kotlinlang.org/docs/scope-functions.html)
- [Kotlin Standard functions or Scoping functions: (let, apply, run, also, with)](https://proandroiddev.com/kotlin-standard-functions-or-scoping-functions-let-apply-run-also-with-af1d93a444f1)
- [Coping with Kotlin’s Scope Functions: let, run, also, apply, with](https://kotlinexpertise.com/coping-with-kotlins-scope-functions/)
- [Kotlin: Don’t just use LET for null check](https://medium.com/mobile-app-development-publication/kotlin-dont-just-use-let-7e91f544e27f)
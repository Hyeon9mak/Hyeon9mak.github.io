---
title: "Kotlin 에서 Validation 이 동작하지 않는 경우"
date: 2023-05-21
tags:
    - kotlin
toc: true
toc_sticky: true
toc_label: "Kotlin 에서 Validation 이 동작하지 않는 경우"
---

Kotlin 사용 환경에서 `@NotBlank`, `@Size` 등과 같은 javax.Validation 어노테이션을 사용하는 경우
제대로 validation 이 동작하지 않는 경우가 있다.
예시를 통해 문제 상황을 인지하고, 문제 원인과 해결 방법을 알아보자.

## 🧾 문제 상황

```kotlin
data class BookEnrollReq(
  @NotBlank(message = "책 제목은 공백일 수 없습니다.")
  val title: String,

  @NotBlank(message = "책 저자명은 공백일 수 없습니다.")
  val author: String,
)
```

위 `BookEnrollReq` data class 는 도서 관리 시스템에서 새로운 도서를 등록할 때 사용되는 request dto 이다.
`@NotBlank` 어노테이션을 통해 `title` 또는 `author` 필드가 공백일 경우 validation 이 동작하도록 설정해주었다.
과연 실제로 validation 이 동작할까?

```kotlin
internal class BookEnrollReqTest : StringSpec({

  val validator = Validation.buildDefaultValidatorFactory().validator

  "책 제목이 공백일 경우 예외가 발생한다." {
    // given
    val bookEnrollReq = BookEnrollReq(
      title = "",
      author = "현구막",
    )

    // when
    val results = validator.validate(bookEnrollReq)

    // then
    results.map { it.message } shouldContainExactly listOf("책 제목은 공백일 수 없습니다.")
  }
})
```
```
Expecting: ["책 제목은 공백일 수 없습니다."] but was: []
Expected :["책 제목은 공백일 수 없습니다."]
Actual   :[]
```

실제로는 validation 이 동작하지 않는다.

<br>

## 🧾 문제 원인

작성된 Kotlin 코드를 Java 코드로 변환해보면 의외로 쉽게 원인을 확인할 수 있다.

> IntelliJ 기준 `Menu` > `Tools` > `Kotlin` > `Show Kotlin Bytecode` > `Decompile`

```java
public final class BookEnrollReq {
   @NotNull
   private final String title;
   @NotNull
   private final String author;

   @NotNull
   public final String getTitle() {
      return this.title;
   }

   @NotNull
   public final String getAuthor() {
      return this.author;
   }

   public BookEnrollReq(
           @NotBlank(message = "책 제목은 공백일 수 없습니다.") @NotNull String title, 
           @NotBlank(message = "책 저자명은 공백일 수 없습니다.") @NotNull String author
   ) {
      Intrinsics.checkNotNullParameter(title, "title");
      Intrinsics.checkNotNullParameter(author, "author");
      super();
      this.title = title;
      this.author = author;
   }

   // 그 외 copy, toString, equals, hashCode ...
}
```

변환된 Java 코드를 잘 살펴보면 `@NotBlank` 어노테이션 설정이 생성자의 파라미터에만 사용되는 모습을 확인할 수 있다.
즉, 현재 `title`, `author` 필드에는 `@NotBlank` 어노테이션이 제대로 적용되지 않았다.

> `@NotNull` 어노테이션의 경우 Kotlin 의 `?` 연산자 생략으로 인해 모든 필드, 게터, 파라미터에 적용되어 있다.

어째서 이런 일이 발생했을까? 바로 Kotlin 주생성자(primary constructor)의 특성 때문에 그렇다.
Kotlin 주생성자는 아래와 같은 형태로 간단하게 생략이 가능하다.

```kotlin
// 서로 같은 코드
class Book {
    val title: String
    val author: String

    constructor(title: String, author: String) {
        this.title = title
        this.author = author
    }
}

// 서로 같은 코드
class Book(
    val title: String,
    val author: String,
)
```

때문에 개발자 눈에 보여지는 Kotlin 주생성자 공간은 사실 Java 코드로 치면 생성자 파라미터이자, 필드이자, 게터인 셈이다.
그리고 Kotlin data class 는 무조건 주생성자를 가지고 있다.

```kotlin
class Book(
    // 이 공간이 사실은 생성자 파라미터이자, 필드이자, 게터
    val title: String,
    val author: String,
)

data class BookEnrollReq(
    // 이 공간이 사실은 생성자 파라미터이자, 필드이자, 게터
    val title: String,
    val author: String,
)
```

때문에 Kotlin 입장에서는 `@NotBlank` 와 같은 어노테이션이 명시되었을 때
파라미터, 필드, 게터 중 어떤 곳에 적용할지를 고민하게 된다.
Kotlin 은 기본적으로는 아래와 같은 순서로 적용을 결정한다.

1. 생성자 파라미터(parameter)
2. 필드(property)
3. getter, setter 등…

그렇기 때문에 어노테이션을 어디에 붙일 것인지(use site)를 명시해주어야 한다.
적용가능한 use site 의 종류는 아래와 같다.

- `file`: 파일
- `property`: Kotlin 의 property (이 use site 를 사용하면 Java에선 볼 수 없음)
- `field`: Java 의 필드(Kotlin 의 property)
- `get`: property getter
- `set`: property setter
- `receiver`: 확장 함수나 속성의 수신 객체 파라미터
- `param`: 생성자 파라미터
- `setparam`: property setter 파라미터
- `delegate`: delegate property 의 인스턴스를 저장하는 필드

<br>

## 🧾 해결 방법

request dto 의 `@NotBlank` 어노테이션이 동작하도록 하기 위해선 `field` use site 를 명시해주면 된다.

```kotlin
data class BookEnrollReq(
  @field:NotBlank(message = "책 제목은 공백일 수 없습니다.")
  val title: String,

  @field:NotBlank(message = "책 저자명은 공백일 수 없습니다.")
  val author: String,
)
```
```java
public final class BookEnrollReq {
    @NotBlank(message = "책 제목은 공백일 수 없습니다.")
    @NotNull
    private final String title;
    @NotBlank(message = "책 저자명은 공백일 수 없습니다.")
    @NotNull
    private final String author;

    @NotNull
    public final String getTitle() {
        return this.title;
    }

    @NotNull
    public final String getAuthor() {
        return this.author;
    }

    public BookEnrollReq(@NotNull String title, @NotNull String author) {
        Intrinsics.checkNotNullParameter(title, "title");
        Intrinsics.checkNotNullParameter(author, "author");
        super();
        this.title = title;
        this.author = author;
    }

    // 그 외 copy, toString, equals, hashCode ...
}
```
<img width="618" alt="image" src="https://github.com/Hyeon9mak/Hyeon9mak.github.io/assets/37354145/6081ef89-45e5-460d-8778-1cffff7341be">

<br>

## 🧾 번외 - `@NotNull` 은 무의미

간혹 Java 를 사용할 때 습관으로 `@NotNull` 어노테이션을 사용해서 nullable 에 대해서도 꼼꼼히 검증하는 경우가 있다.
그러나 우리는 null-safe 한 언어인 Kotlin 을 사용중임을 잊지 말자.
`?` 연산자를 제거하는 것만으로도 `@NotNull` 어노테이션이 필요없는 안전한 코드를 작성할 수 있다.

### AS-IS

```kotlin
data class BookEnrollReq(
  @NotNull(message = "책 제목은 공백일 수 없습니다.")
  val title: String?,

  @NotNull(message = "책 저자명은 공백일 수 없습니다.")
  val author: String?,
)
```

### TO-BE

```kotlin
data class BookEnrollReq(
  val title: String,
  val author: String,
)
```

<br>

## References

- [https://kotlinlang.org/docs/annotations.html#annotation-use-site-targets](https://kotlinlang.org/docs/annotations.html#annotation-use-site-targets)

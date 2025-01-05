---
title: "Kotlin value class 직렬화시 맹글링이 발생하는 이유와 해결 방법"
date: 2025-01-05
toc: true
toc_sticky: true
toc_label: "Kotlin value class 직렬화시 맹글링이 발생하는 이유와 해결 방법"
---

## 👨‍🚀 value class 직렬화시 맹글링 발생!

아래와 같은 Kotlin value class 와 data class 가 있다고 가정해보자.
학생의 이름을 나타내는 `StudentName` value class 와, 그 이름을 사용하는 `Student` data class 이다.

```kotlin
@JvmInline
value class StudentName(
  val value: String,
) {
  init {
    require(value.isBlank()) { "학생 이름은 공백이 될 수 없습니다." }
  }
}

data class Student(
  val id: Long,
  val name: StudentName,
  val age: Int,
)
```

`Student` data class 를 object mapper(spring 이라면 jackson) 를 통해 직렬화하면 어떤 결과물이 나올까?
아마도 별다른 문제가 없다면 아래와 같은 결과가 나와야 할 것이다.

```json
{
  "id": 1,
  "name": "현구막",
  "age": 30
}
```

그러나 실제로는 아래와 같이 `name` 에 맹글링이 된 상태로 직렬화 된다.

```json
{
  "id": 1,
  "name-2zMW-G4": "현구막", // <-- 맹글링 발생
  "age": 30
}
```

느닷없이 맹글링이 된 이유가 무엇일까?

<br>

## 👨‍🚀 결론과 해결 방법

결론부터 이야기하면 Kotlin value class 가 컴파일 타임에 맹글링을 수행하기 때문이다.
`jackson-module-kotlin` 라이브러리를 이용하면 문제를 간단하게 해결 할 수 있다.

```groovy
// build.gradle.kts
implementation("com.fasterxml.jackson.module:jackson-module-kotlin")

// build.gradle
implementation 'com.fasterxml.jackson.module:jackson-module-kotlin'
```

<br>

## 👨‍🚀 잠깐, 그래서 맹글링이 뭔데?

맹글링(Mangling)은 컴파일러가 프로그래밍 언어의 소스 코드에서 정의된 이름(변수명, 함수명)을 내부적으로 변환하여
고유한 식별자로 활용하기 위해 준비 과정이다. 
Java, C++ 같이 객체를 다루는 언어에서는 함수 오버로딩이나 네임스페이스 충돌을 방지하기 위해 사용되고, Python 등 다른 언어에서도 찾아볼 수 있다. 

가령 Java 에서는 아래와 같은 예시를 확인할 수 있겠다.

```java
public class Outer {
    public class Inner {
        public void innerMethod() {}
    }
}
```

위 코드에서 `Outer` 클래스의 `Inner` 클래스의 `innerMethod` 메서드는 `$` 기호를 활용해 `Outer$Inner.innerMethod` 로 맹글링 된다.

> 반대 개념으로 디맹글링(Demangling) 또한 존재한다.

<br>

## 👨‍🚀 맹글링이 진행된 원인 탐구

Kotlin value class 는 JVM 에 의해 byte code 로 compile 될 때 wrapping 한 value class 를 제거하고, 내부 property 로 대체한다.
(이 때문에 기본적인 성능 최적화 또한 챙길 수 있다.)

이 과정에서 POJO 양식에 맞춰 property 에 대한 getter 메서드를 생성하게 되는데,
사용자(개발자)가 앞서 같은 이름의 getter 를 사용할 수도 있기 때문에, value class 를 사용하는 곳에서 충돌을 회피하기 위해 
해당 getter 에 대해 맹글링을 진행하는 것이다.

```kotlin
data class Student(
  val id: Long,
  val name: StudentName, // 맹글링을 해주지 않으면 충돌하게 될 것이다.
  val age: Int,
) {
  // 맹글링을 해주지 않으면 충돌하게 될 것이다.    
  fun getName(): String = "다른이름"
}
```

실제 byte code 를 통해서 확인해보자.

IntelliJ `Tools` -> `Kotlin` -> `Show Kotlin Bytecode` 를 통해 확인할 수 있다.

<img width="519" alt="image" src="https://github.com/user-attachments/assets/0bfb097d-7267-4001-a17c-d64344a81da7" />

우선 `StudentName` value class 의 byte code 를 간소화 해보면 아래와 같다.

```java
@JvmInline
public final class StudentName {
    @NotNull
    private final String value;

    private StudentName(String value) {
        this.value = value;
    }

    @NotNull
    public final String getValue() {
        return this.value;
    }

    public String toString() {
        return toString - impl(this.value);
    }

    public static String toString_impl/* $FF was: toString-impl*/(String arg0) {
        return "StudentName(value=" + arg0 + ')';
    }
}
```

`StudentName` value class 의 getter 메서드는 `value` 프로퍼티 명대로 `getValue()` 로 생성되어 있다.

이번엔 `Student` data class 의 byte code 를 확인해보자.

```java
public final class Student {
    private final long id;
    @NotNull
    private final String name;
    private final int age;

    private Student(long id, String name, int age) {
        Intrinsics.checkNotNullParameter(name, "name");
        super();
        this.id = id;
        this.name = name;
        this.age = age;
    }

    public final long getId() {
        return this.id;
    }

    // 맹글링이 되어 있다!
    @NotNull
    public final String getName_ZNmtv2A/* $FF was: getName-ZNmtv2A*/() {
        return this.name;
    }

    public final int getAge() {
        return this.age;
    }

    @NotNull
    public String toString() {
        return "Student(id=" + this.id + ", name=" + StudentName.toString - impl(this.name) + ", age=" + this.age + ')';
    }
}
```

`Student` data class 의 `name` 에 대한 getter 메서드는 `getName_ZNmtv2A()` 로 맹글링 되어 있는 것을 확인할 수 있다.
그렇다면 실제로 `getName()` 이름의 getter 메서드를 만들어보면 어떻게 될까?

```kotlin
data class Student(
  val id: Long,
  val name: StudentName,
  val age: Int,
) {
  fun getName(): String = "다른이름"
}
```

```java
public final class Student {
    private final long id;
    @NotNull
    private final String name;
    private final int age;

    private Student(long id, String name, int age) {
        Intrinsics.checkNotNullParameter(name, "name");
        super();
        this.id = id;
        this.name = name;
        this.age = age;
    }

    public final long getId() {
        return this.id;
    }

    public final int getAge() {
        return this.age;
    }

    // 맹글링 덕분에 충돌을 회피했다.
    @NotNull
    public final String getName_ZNmtv2A/* $FF was: getName-ZNmtv2A*/() {
        return this.name;
    }

    // getName() 메서드가 잘 추가되었다.
    @NotNull
    public final String getName() {
        return "다른이름";
    }

    @NotNull
    public String toString() {
        return "Student(id=" + this.id + ", name=" + StudentName.toString - impl(this.name) + ", age=" + this.age + ')';
    }
}
```

`getName()` 메서드가 잘 추가되었고, 맹글링 덕분에 충돌을 회피하는 걸 확인할 수 있다.

<br>

## 👨‍🚀 후기

사실 직렬화/역직렬화 가능성이 있는 코드에서는 value class 를 활용하지 않고 기본 타입(Primitive Types)을 다루는 것이 속편하긴 하다.
복잡하게 헤맬 일도 없고, 동료 개발자가 실수할 여지도 줄어든다.

하지만 프로그램 전반에 걸쳐 VO(value class)를 폭넓게 사용하면서 안전성을 높이고 싶다면,
위와 같은 원인을 미리 파악하고 있는게 많은 시간을 아껴줄 것 같다.

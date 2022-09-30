---
title: "Kotlin JPA 필수 지식"
date: 2022-09-30
tags:
    - kotlin
    - jpa
toc: true
toc_sticky: true
toc_label: "Kotlin JPA 필수 지식"
---

Kotlin 은 Java 와 같은 JVM 기반 언어로, JPA 도 사용할 수 있다.
Java 와 호환을 우선시하고, Java 에서 번거로웠던 코드를 묵시적으로 제공하거나 제거하는데 초점을 맞춰져있다.
때문에 Kotlin 으로 JPA Entity 를 구성했을 때 깔끔함에 감탄하곤 한다.

그러나 보이지 않는 내부에서는 Kotlin 과 JPA 와의 궁합을 맞추기 부단히 많은 노력을 하고 있다.
특히나 Kotlin 으로 JPA Entity 를 구성할 때, 내부에서 어떤 일이 일어나는지 알지 못하면
의도치 않은 N+1 이 발생하거나, 심하면 무한순환참조를 발생시킬 수도 있다.

이 글에서는 Kotlin 에서 JPA 를 사용할 때 필수로 알아야 할 것들을 정리하고,
Kotlin 에서 Entity 를 어떻게 구성하는게 좋을지 예시를 준비해보았다.

<br>

## 🎮 Kotlin Entity No arg constructor

간단하게 구성한 선생(`teacher`)과 학생(`student`) Entity 를 살펴보자

```kotlin
@Table(name = "teacher")
@Entity
class Teacher(
    name: String
) {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "id", nullable = false)
    var id: Long = 0
        private set

    @Column(name = "name", nullable = false, length = 100)
    var name: String = name
        private set
}
```
```kotlin
@Table(name = "student")
@Entity
class Student(
    name: String,
    teacher: Teacher
) {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "id", nullable = false)
    var id: Long = 0
        private set

    @Column(name = "name", nullable = false, length = 100)
    var name: String = name
        private set

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "teacher_id")
    var teacher: Teacher = teacher
        private set
}
```

간단한 프로퍼티들을 가지고 있고, 생성자에서는 식별자를 제외한 나머지 프로퍼티들을 할당 받아 인스턴스를 생성한다.
프로퍼티를 public 하게 개방해서 얼마든지 자유롭게 접근할 수 있으며
set에 대한 접근권한만 private으로 막아두어 유의미한 행동으로만 Entity의 상태를 변경할 수 있도록 구성되어있다.

자세히 살펴보면 파라미터가 없는 생성자(no arg constructor)가 존재하지 않는다.
[Hibernate User Guide에 따르면 Entity 는 public 또는 protected no arg constructor 를 반드시 포함해야한다.](https://docs.jboss.org/hibernate/orm/5.4/userguide/html_single/Hibernate_User_Guide.html#entity) 
그럼에도 컴파일 에러가 발생하지 않고, 정상적으로 JPA를 사용할 수 있다. 어떻게 가능한 것일까?

정답은 [Kotlin에서 만든 No-arg compiler-plugin](https://kotlinlang.org/docs/no-arg-plugin.html)에 있다.
No-arg compiler-plugin 이 컴파일 단계에서 자동으로 `@Entity`, `@Embeddable`, `@MappedSuperclass` 어노테이션을 포함한
클래스에 no arg constructor를 생성해주기 때문에 Kotlin에서는 불필요한 코드를 줄여 깔끔한 Entity를 구성할 수 있다. 
[No-arg compiler-plugin 은 Kotlin Jpa Plugin 인에 의해 자동으로 추가](https://plugins.gradle.org/plugin/org.jetbrains.kotlin.plugin.jpa)된다.

얼핏보기엔 썩 괜찮은 Entity 구성이지만, 실은 문제가 더 있다.
어떤 문제인지는 JPA의 Lazy loading 과 Proxy 를 되짚으며 알아가보자.

<br>

## 🎮 JPA Lazy loading & Proxy  

우리는 JPA를 사용하면서 객체가 사용되기 전까지는 껍데기만 갖고,
해당 객체가 실제로 사용(getter 호출 등)될 때 쿼리를 전송하는 Lazy loading(지연로딩)을 사용할 수 있다.
Lazy loading 덕분에 불필요한 쿼리 전달도 막을 수 있고, 이따금 N+1 문제를 방지해주기도 한다.

그렇다면 Lazy loading 의 원리는 무엇일까?
바로 Proxy다.

Proxy 객체는 실제 클래스를 상속 받아서 만들어지며, 실제 클래스와 겉모양(public 메서드, 내부는 X)이 같다. 
Proxy 객체는 실제 객체의 참조(target)를 필드로 준비(NULL)하고 있다가, 
자신의 메서드가 호출되면 그제서야 참조 필드를 실제 Entity 객체로 채우고, 
그 Entity 객체의 동일한 메서드를 이어서 호출하여 동작한다.

![image](https://user-images.githubusercontent.com/37354145/147799346-bb0611d1-5bca-4237-b87a-5949ab7ed2b6.png)

Hibernate 는 Proxy 를 사용해서 DB에 쿼리를 전송하지 않고도 객체를 할당 받는다. 
Proxy 객체의 내부는 텅텅 비어있지만, 실제 클래스와 겉 모양이 같기 때문에 
사용자 입장에서는 진짜 객체인지 Proxy 객체인지 구분할 필요 없이 사용할 수 있다.

> 여기까진 Hibernate 의 Proxy 사용 방식이지만, 대부분의 JPA 구현체가 하이버네이트이므로 설명이 될 것이다.

<br>

## 🎮 Kotlin Inheritance

Kotlin 에서는 기본적으로 상속을 제한하고 있다.
클래스의 상속을 허용하고 싶을 경우 클래스명 앞에 `open` 키워드를 명시해야 한다.

```kotlin
open class Fruit {
    // ...
}

class Apple : Fruit {
    // ...
}
```

만일 `open` 키워드를 명시하지 않을 경우 얄짤없이 상속이 불가능하다.

<br>

## 🎮 Kotlin Entity All open

다시 `student` Entity 를 살펴보자.

```kotlin
@Table(name = "student")
@Entity
class Student(
    name: String,
    teacher: Teacher
) {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "id", nullable = false)
    var id: Long = 0
        private set

    @Column(name = "name", nullable = false, length = 100)
    var name: String = name
        private set

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "teacher_id")
    var teacher: Teacher = teacher
        private set
}
```

`teacher`에 대한 `FetchType`을 `LAZY`로 설정해두었기 때문에, 
`student`를 조회할 때 `teacher`과 관련된 정보는 조회해오지 않을 것으로 보인다. 
그러나 JPA Proxy 를 위해선 상속이 필요하고, Kotlin 상속을 위해선 `open` 키워드가 필요하다고 했다.
과연 이 코드는 어떻게 동작할까?

```kotlin
"학생을 조회한다." {
    val teacher = Teacher(name = "멋진 교사 최현구")
    val student = Student(name = "모범생 최현구", teacher = teacher)
    teacherRepository.save(teacher)
    studentRepository.save(student)

    val found = studentRepository.findByIdOrNull(student.id)
        ?: throw NoSuchElementException()

    found.name shouldBe "모범생 최현구"
}
```
```
Hibernate: 
    select
       id,
       name,
       teacher_id 
    from
        student 
    where
       id=?

Hibernate: 
    select
        id,
        name 
    from
        teacher 
    where
        id=?
```

LAZY 설정을 해두었기 때문에 `teacher` 대한 조회가 없을 걸 기대했으나, 
당당하게 `teacher`까지 조회하는 것을 확인할 수 있다. 즉, Lazy loading 이 전혀 동작하고 있지 않다.

이 상태에서 `teacher` Entity의 상속을 허용해보면 어떨까?

```kotlin
@Table(name = "teacher")
@Entity
open class Teacher(
    name: String
) {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "id", nullable = false)
    open var id: Long = 0
        protected set

    @Column(name = "name", nullable = false, length = 100)
    open var name: String = name
        protected set
}
```
```
Hibernate: 
    select
       id,
       name,
       teacher_id 
    from
        student 
    where
       id=?
```

이제서야 Lazy loading 이 동작하여 `teacher`에 대한 조회가 발생하지 않았다.

그렇다면 우리는 Kotlin 에서 JPA Entity 를 구성할 때마다 모든 클래스와 프로퍼티에 `open` 키워드를 붙여주어야 할까?
다행히도 Kotlin 쪽에서 모든 영역에 `open` 키워드를 자동으로 붙여주는 플러그인을 지원하고 있다.
바로 [All-open compiler plugin](https://kotlinlang.org/docs/all-open-plugin.html) 이다.
[All-open compiler plugin 은 Kotlin Spring Plugin 에 의해 자동으로 추가](https://plugins.gradle.org/plugin/org.jetbrains.kotlin.plugin.spring)된다.

All-open compiler plugin 에 등록된 어노테이션을 가진 클래스라면 자동으로 모든 영역에 `open` 키워드가 추가되는데,
기본적으로 `@SpringBootTest`, `@Cacheable`, `@Async`, `@Component`, `@Transactional`, `@Validated`가 포함된다.
해당 어노테이션을 사용하는 어노테이션들에도 자동 적용된다. 가령 `@Component` 을 사용하는 `@Controller`, `@Service`, `@Repository` 도 혜택을 받는다.

> **IntelliJ IDEA File > Project Structure > Project Settings > Modules > Kotlin > Compiler Plugins** 에서 확인 가능하다.

<img width="1788" alt="image" src="https://user-images.githubusercontent.com/37354145/193228076-2eb3205b-2daa-44d5-8e71-079a1dda0ac8.png">

Entity 관련된 어노테이션에도 All-open compiler plugin 을 적용하기 위해선 `build.gradle` 파일에 아래와 같은 내용을 추가해주면 된다.

```groovy
allOpen {
    annotation("javax.persistence.Entity")
    annotation("javax.persistence.MappedSuperclass")
    annotation("javax.persistence.Embeddable")
}
```

<img width="660" alt="image" src="https://user-images.githubusercontent.com/37354145/193231882-8ac5c4d3-d70a-4633-b577-726206e55217.png">

> 역시나 **IntelliJ IDEA File > Project Structure > Project Settings > Modules > Kotlin > Compiler Plugins** 를 통해서 
잘 추가되었는지 확인이 가능하다.

Entity 쪽에 All-open 이 적용되고 나면, 프로퍼티 쪽에 작성해두었던 `private set` 과 관련한 컴파일 에러가 발생한다.

```kotlin
@Table(name = "student")
@Entity
class Student(
    name: String,
    teacher: Teacher
) {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "id", nullable = false)
    var id: Long = 0
        private set

    @Column(name = "name", nullable = false, length = 100)
    var name: String = name
        private set // 컴파일 에러 !!

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "teacher_id")
    var teacher: Teacher = teacher
        private set // 컴파일 에러 !!
}
```

All-open 을 통해 모든 상속을 허용하고 있으므로, setter 또한 private 으로 숨길 수 없게 된 것이다.
private 접근제한자를 모두 protected 로 바꾸어주면 문제를 해결할 수 있다.

```kotlin
@Table(name = "student")
@Entity
class Student(
    name: String,
    teacher: Teacher
) {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "id", nullable = false)
    var id: Long = 0
        protected set

    @Column(name = "name", nullable = false, length = 100)
    var name: String = name
        protected set

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "teacher_id")
    var teacher: Teacher = teacher
        protected set
}
```

<br>

## 🎮 Kotlin Entity data class

Kotlin 의 data class 는 이름 그대로 데이터의 보관만을 목적으로 만들어졌다.
`toString()`, `equals()`, `hashcode()` 와 같은 수 많은 
[boilerplate code](https://charlezz.medium.com/%EB%B3%B4%EC%9D%BC%EB%9F%AC%ED%94%8C%EB%A0%88%EC%9D%B4%ED%8A%B8-%EC%BD%94%EB%93%9C%EB%9E%80-boilerplate-code-83009a8d3297) 를
자동으로 생성해준다.

JPA Entity 역시 데이터 관리를 위해 `toString()`, `equals()`, `hashcode()`를 오버라이딩 하는 것에 의미가 있다.
때문에 data class 를 사용하는 것이 적합해보일 수 있다.

```kotlin
// 일반 class
@Table(name = "teacher")
@Entity
class Teacher(
    name: String
) {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "id", nullable = false)
    var id: Long = 0
        protected set

    @Column(name = "name", nullable = false, length = 100)
    var name: String = name
        protected set

    override fun equals(other: Any?): Boolean {
        if (this === other) return true
        if (javaClass != other?.javaClass) return false

        other as Teacher

        if (id != other.id) return false
        if (name != other.name) return false

        return true
    }

    override fun hashCode(): Int {
        var result = id.hashCode()
        result = 31 * result + name.hashCode()
        return result
    }

    override fun toString(): String {
        return "Teacher(id=$id, name='$name')"
    }
}
```
```kotlin
@Table(name = "teacher")
@Entity
data class Teacher(
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "id", nullable = false)
    var id: Long,

    @Column(name = "name", nullable = false, length = 100)
    var name: String,
)
```

그러나 data class 로 작성된 Entity 간의 양방향 연관관계를 지정하면 `toString()`, `hashCode()` 에서 무한순환참조가 발생한다.
(Java Lombok의 `@Data` 어노테이션과 같은 이슈)

```kotlin
@Table(name = "teacher")
@Entity
data class Teacher(
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "id", nullable = false)
    var id: Long = 0,

    @Column(name = "name", nullable = false, length = 100)
    var name: String,

    @OneToMany(mappedBy = "teacher")
    var students: MutableList<Student> = mutableListOf()
)
```
```kotlin
@Table(name = "student")
@Entity
data class Student(
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "id", nullable = false)
    var id: Long = 0,

    @Column(name = "name", nullable = false, length = 100)
    var name: String,
    
    @JoinColumn(name = "teacher_id")
    var teacher: Teacher
)
```
```kotlin
"StackOverflowError 발생" {
    val teacher = Teacher(name = "멋진 교사 최현구")
    val student = Student(name = "모범생 최현구", teacher = teacher)

    teacher.students.add(student)
    println(teacher)
}
```
```
Test failed
java.lang.StackOverflowError
    ...
    ...
    ...
```

이 문제를 해결하기 위해 `toString()`, `hashCode()`를 오버라이딩 할 수도 있다.
단 `toString()`, `hashCode()`를 오버라이딩한다면 data class 사용 의의가 흐려진다는 점을 고려해야 한다.
때문에 Entity 를 구성할 때 data class 대신 일반 class 사용을 추천한다.

<br>

## 🎮 Kotlin Entity Client access

[Hibernate User Guide 설명 중에는 Entity 의 인스턴스 변수는 자기 자신만 접근할 수 있어야 하고,
외부 객체는 반드시 getter/setter 또는 기타 비즈니스 메서드를 통해서만 사용](https://docs.jboss.org/hibernate/orm/5.4/userguide/html_single/Hibernate_User_Guide.html#entity)해야 한다고 한다.

Kotlin 문법에서는 얼핏보면 getter 메서드 없이 프로퍼티에 직접 접근하는 것처럼 보이지만,
Kotlin 코드를 Java 코드로 변환해보면 getter 메서드가 자동으로 생성되는 것을 확인할 수 있다.

```kotlin
@Table(name = "teacher")
@Entity
class Teacher(
    name: String
) {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "id", nullable = false)
    var id: Long = 0
        protected set

    @Column(name = "name", nullable = false, length = 10)
    var name: String = name
        protected set
}
```
```java
@Table(name = "teacher")
@Entity
public class Teacher { 
    
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "id", nullable = false) 
    private long id;
    
    @Column(name = "name", nullable = false, length = 10) 
    @NotNull 
    private String name;

    public Teacher() {}

    public Teacher(@NotNull String name) {
        this.name = name;
    }
    
    public long getId() {
        return this.id;
    }
    
    protected void setId(long id) {
        this.id = id;
    }
    
    @NotNull 
    public String getName() {
        return this.name;
    }
    
    protected void setName(@NotNull String name) {
        this.name = name;
    }
}
```

> **Tools > Kotlin > Show Kotlin Bytecode > Decompile** 을 통해 확인 가능하다.

<br>

## 🎮 총 정리

- Entity 를 구성할 땐 public 혹은 protected no arg constructor 가 필요하다.
  - Kotlin 은 No-arg compiler-plugin 을 통해 no arg constructor 를 자동으로 추가한다.
- Entity 의 클래스와 모든 메서드는 상속이 열려있어야 한다.
  - Kotlin 은 All-open compiler-plugin 을 통해 open 키워드를 자동으로 추가한다.
- Entity 의 모든 프로퍼티는 자기 자신만 접근이 가능해야 한다.
  - Kotlin 문법 특성상 직접 접근처럼 보일뿐, 실제로는 getter/setter 메서드를 자동 생성한다.
- Entity 의 `equals()`, `hashCode()` 메서드는 양방향 연관관계 매핑시 무한순환참조를 발생시킨다.
  - data class 로 Entity 를 구성하지 말자.

결국 나는 아래와 같은 형태로 Kotlin JPA Entity 를 사용중이다.

```kotlin
@Table(name = "teacher")
@Entity
class Teacher(
    name: String
) {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "id", nullable = false)
    var id: Long = 0
        protected set

    @Column(name = "name", nullable = false, length = 10)
    var name: String = name
        protected set

    override fun equals(other: Any?): Boolean {
        if (this === other) return true
        if (javaClass != other?.javaClass) return false
        other as Teacher
        if (id != other.id) return false
        return true
    }

    override fun hashCode(): Int {
        return id.hashCode()
    }
}
```
```kotlin
@Table(name = "student")
@Entity
class Student(
    name: String,
    teacher: Teacher
) {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "id", nullable = false)
    var id: Long = 0
        protected set

    @Column(name = "name", nullable = false, length = 10)
    var name: String = name
        protected set

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "teacher_id")
    var teacher: Teacher = teacher
        protected set

    override fun equals(other: Any?): Boolean {
        if (this === other) return true
        if (javaClass != other?.javaClass) return false
        other as Student
        if (id != other.id) return false
        return true
    }

    override fun hashCode(): Int {
        return id.hashCode()
    }
}
```

<br>

## References

- [Hibernate User Guide](https://docs.jboss.org/hibernate/orm/5.4/userguide/html_single/Hibernate_User_Guide.html#entity)
- [Gradle - Plugin: Search Gradle plugins](https://plugins.gradle.org)
- [Kotlin Language Docs # Compiler Plugins](https://kotlinlang.org/)
- [TDD, 클린 코드 with Kotlin](https://edu.nextstep.camp/c/Z9QeJlCi)
- [보일러플레이트 코드란?(Boilerplate code)](https://charlezz.medium.com/%EB%B3%B4%EC%9D%BC%EB%9F%AC%ED%94%8C%EB%A0%88%EC%9D%B4%ED%8A%B8-%EC%BD%94%EB%93%9C%EB%9E%80-boilerplate-code-83009a8d3297)

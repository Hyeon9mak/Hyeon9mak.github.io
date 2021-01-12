---
title: "[Effective-Java] 아이템 25. 톱레벨 클래스는 한 파일에 하나만 담으라"
date: 2021-01-12
tags:
    - 이펙티브자바
    - effective-java
    - Java
    - 자바
toc: true
toc_sticky: true
toc_label: "아이템 25. 톱레벨 클래스는 한 파일에 하나만 담으라"
---

전체적인 스터디 내용은 [JunHyeok96/effective-java](https://github.com/JunHyeok96/effective-java)에서 확인 가능! 
{: .notice}

---

> "소스 파일 하나에 톱레벨 클래스를 여러 개 선언하더라도 자바 컴파일러는 불평하지 않는다. 
> 하지만 아무런 득이 없을 뿐더러 심각한 위험을 감수해야 하는 행위다.
> 이렇게 하면 한 클래스를 여러 가지로 정의할 수 있으며, 그중 어느 것을 사용할지는 
> 어느 소스 파일을 먼저 컴파일하냐에 따라 달리지기 때문이다."

책에 소개된 예시를 직접 사용해보면서 문제점을 확인해보자.

<br>

## 📁 한 파일에 톱 클래스가 여러 개일 때 문제점
```java
// Main.java
public class Main {
    public static void main(String[] args) {
        System.out.println(Utensil.NAME + Dessert.NAME);
    }
}
```
```java
// Desert.java
class Utensil {
    static final String NAME = "pot";
}

class Dessert {
    static final String NAME = "pie";
}
```
```
javac Main.java Utensil.java

> pancake
```
`Main` 클래스를 실행하면 **pancake**가 출력된다.  
이 상태에서 우연히 똑같은 두 클래스를 담은 `Dessert.java`가 추가되면 어떨까?

<br>

```java
// Utensil.java
class Utensil {
    static final String NAME = "pan";
}

class Dessert {
    static final String NAME = "cake";
}
```
```
javac Main.java Dessert.java

> Duplicate class found in the file '~/src/main/java/Desert.java'
```
**javac Main.java Dessert.java** 명령으로 컴파일 한다면 
컴파일 오류가 발생하고 클래스가 중복 정의됐다고 알려줄 것이다.  
  
컴파일러는 가장 먼저 `Main.java` 를 컴파일 하고, 
그 안에서 `Utensil` 참조를 먼저 만나 `Utensil.java` 파일을 살펴 
`Utensil`, `Dessert` 클래스를 모두 찾아낸다. 그 다음 두 번째로 참조되는 
`Dessert`에 따라 `Dessert.java`를 처리하려고 할 때 같은 클래스의 정의가 이미 있음을 알게 된다.  
  
한편, **javac Main.java** 나 **javac Main.java Utensil.java** 명령으로 
컴파일을 진행하게 되면 이전처럼 **pancake**가 출력된다.

```
javac Main.java

> pancake
```
```
javac Main.java Utensil.java

> pancake
```

그러나 여기서 컴파일 명령을 바꾸면 다른 결과가 출력 된다.

```
javac Dessert.java Main.java

> potpie
```

이처럼 컴파일러에 어느 소스 파일을 먼저 전달하느냐에 따라 동작이 달라진다.

<br>

## 📁 해결책
다행히 해결책은 아주 간단하다. 톱 클래스들을 서로 다른 소스 파일로 분리하면 끝이다. 
```java
// Utensil.java
class Utensil {
    static final String NAME = "pan";
}
```
```java
// Desert.java
class Dessert {
    static final String NAME = "cake";
}
```

<br>

## 📁 정적 멤버 클래스
굳이 한 파일에 담고 싶다면 정적 멤버 클래스(아이템 24)를 사용하는 방법을 고려하면 된다. 
부차적인 클래스를 정적 멤버 클래스로 만들면 가독성도 높아지고, 
`private`로 선언하여 접근 범위도 최소로 관리할 수 있다.  
   
단, 정적 멤버 클래스는 보통 하나의 클래스에 딸린 부차적인 클래스를 추가하는데 사용되므로, 
패턴을 유지하기 위해 부차적인 클래스를 추가하는 경우에만 사용하자.  

```java
// example 1
class Utensil {
    static final String NAME = "pan";

    private static class Dessert {
        static final String NAME = "cake";
    }

}
```
```java
// example 2
public class Test {
    public static void main(String[] args) {
        System.out.println(Utensil.NAME + Dessert.NAME);
    }

    private static class Utensil {
        static final String NAME = "pan";
    }

    private static class Dessert {
        static final String NAME = "cake";
    }
}
```

<br>

**핵심 정리**  
소스 파일 하나에는 **반드시 톱레벨 클래스(혹은 인터페이스)를 하나만 담자.** 
이 규칙만 따른다면 소스 파일을 어떤 순서로 컴파일하든 프로그램의 동작이 달라지는 일은 없을 것이다.
{: .notice}

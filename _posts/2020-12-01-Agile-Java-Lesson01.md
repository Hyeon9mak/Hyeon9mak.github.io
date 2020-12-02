---
title: "[Agile Java] Lesson01 시작하기"
date: 2020-12-01 14:44:38
categories:
    - Agile-Java
tags:
    - 애자일자바
    - agile java
    - 지름길로 빠르게 배울 수 있는 자바 프로그래밍
    - Jeff Langr
    - Java
    - 자바
toc: true
toc_sticky: true
toc_label: "Lesson01 시작하기"
---

실습 내용 저장소: [https://github.com/Hyeon9mak/student-information-system](https://github.com/Hyeon9mak/student-information-system)

## 테스트 클래스는 명세 클래스에 종속적이다.
**StudentTest -> Student**  
StudentTest 클래스는 Student 클래스에 영향을 받는다.  
테스트 대상이기 떄문. 그러나!!
Student 클래스는 StudentTest 클래스에 영향을 받으면 안된다.  
TDD 지만, 절대 테스트에 종속적인 명세가 만들어지면 안된다.

## 디자인: 명세의 시작 방법
디자인의 시작은 자세한 명세를 구상하는 것이 아닌, 상위 디자인을 구상하는 것부터 시작한다. 
그래야 하는 이유는 크게 2가지가 있다.

- 추후 클라이언트의 필요사항을 이해하면서 점진적으로 상세화 시키면 된다. 
- 자바 코드로 옮기는 과정에서 상세한 내용이 얼마든지 바뀔 수 있다.

객체지향 개발방법에는 변화에 따라 디자인을 얼마든지 수정할 수 있는 유연함이 존재한다. 이 유연함을 적극 활용하자.

## 테스트 코드 작성하기
- Junit은 반환 받을 내용이 없으므로 반환 타입이 void 다.
- 테스트 메서드 접근 제한자는 public 이어야 한다.
- 메소드 이름은 "test"로 시작해야 한다.
- 인수(매개변수)를 받지 않는다.

위 4가지 주의점을 확인하고 아래와 같이 테스트 메서드를 작성한다.

```java
public class StudentTest extends junit.framework.TestCase {
    public void testCreate(){
    }
}
```

Junit 프레임워크의 TestCase 클래스를 상속받아 TestCase 클래스가 가진 기능을 활용한다.

## 객체의 범위(scope)
```java
// src/main/java/Student.java
public class Student {
    Student(String name){

    }
}

// src/test/java/StduentTest.java
public class StudentTest extends junit.framework.TestCase {
    public void testCreate(){
        new Student("Hyeon Gu");
    }
}
```
testCreate 메서드에서 생성된 Student 객체는 testCreate 메서드가 수행되는 동안만 유지된 후, 소멸된다.  
이를 **Student 객체는 testCreate 메서드의 범위(scope) 내에 존재한다**고 표현한다.

## 확인하기(Assertion)
```java
public class StudentTest extends junit.framework.TestCase {
    public void testCreate(){
        Student student = new Student("Hyeon Gu");
        String studentName = student.getName();
        assertEquals("HyeonGu", studentName);
    }
}
```
assert* 메서드를 이용한다. (다만 최근에는 **assertThat을 이용하는 추세**다.)

## 재구성하기(Refactoring)
### StudentTest.java
```java
public class StudentTest extends junit.framework.TestCase {
    public void testCreate(){
        Student student = new Student("Hyeon Gu");
        String studentName = student.getName();
        assertEquals("Hyeon Gu", studentName);

        Student secondStudent = new Student("Dong Hyeon");
        String secondStudentName = secondStudent.getName();
        assertEquals("Dong Hyeon", secondStudentName);

        assertEquals("Hyeon Gu", student.getName());
    }
}
```

위 테스트 코드에서는 메서드 이해에 불필요한 요소와 문자열이 몇 가지 보인다.
이것들을 제거한 코드를 다시 작성해보자.

```java
public class StudentTest extends junit.framework.TestCase {
    public void testCreate(){
        final String firstStudentName = "Hyeon Gu";
        Student student = new Student(firstStudentName);
        assertEquals(firstStudentName, student.getName());

        final String secondStudentName = "Dong Hyeon";
        Student secondStudent = new Student(secondStudentName);
        assertEquals(secondStudentName, secondStudent.getName());
    }
}
```
불필요한 studentName, secondStudentName 변수가 사라졌으며, 상수 값을 하드코딩 하지 않고 final로 선언하여 사용하는 것으로 변경되었다.  
특히 상수 값 하드코딩의 경우 작업량의 늘리는 주 원인이 되므로, 항상 상수 변수화 시켜서 사용하는 습관을 들여야 한다.

---

### Student.java
```java
public class Student {

    String myName;

    Student(String name) {
        myName = name;
    }

    public String getName() {
        return myName;
    }
}
```
Student 객체의 필드 이름이 myName이다. 너무 아마추어스럽지 않은가?  
다른 이름을 고려해보자. studentName은 어떨까?

```java
student.getStudentName();
```
이미 student 객체명을 통해 Student의 것임을 명시하고 있기 때문에, 불필요한 이름 중복이 생성된다.  
이처럼 이름은 항상 불필요한 중복이 생성되지 않는지 고려해서 지어야 한다.  
필드 네임으로 **name**을 그대로 사용하는 방법을 고려해보지만, Student 객체 생성자의 인수 name과 겹친다.  
이 경우 인수 name이 필드 name으로 변경되어(필드 명이 우선권을 가진다.) 생성자에 인수 값을 삽입해도 실제 필드 변수에는 NULL이 유지될 뿐이다.  
이러한 경우를 해결하기 위해서 this 키워드가 존재한다.

```java
public class Student {

    String name;

    Student(String name) {
        this.name = name;
    }

    public String getName() {
        return name;
    }
}
```

객체지향의 관점에서 객체의 필드에 곧장 접근을 허용하는 방식은 옳지 못하다. 
객체지향은 **데이터가 아닌 동작에 대한 것** 이므로, 필드를 숨기고 필드의 값을 설정하는 별도의 메서드를 제공하는 편이 좋다. 
(해당 메서드에 필드 값 설정에 대한 제한 사항을 추가할 수도 있다.)  
모든 규칙이 그렇듯, 예외가 물론 존재하긴 한다. 그러나 우선은 private로 선언하여 필드를 숨기는걸 습관화 하자. 

```java
public class Student {

    private String name;

    Student(String name) {
        this.name = name;
    }

    public String getName() {
        return name;
    }
}
```
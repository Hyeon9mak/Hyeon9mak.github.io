---
title: "[Agile Java] Lesson02 자바의 기초"
date: 2020-12-05
tags:
    - reading books
    - Agile Java
    - Java
toc: true
toc_sticky: true
toc_label: "Lesson02 자바의 기초"
---

실습 내용 저장소: [https://github.com/Hyeon9mak/student-information-system](https://github.com/Hyeon9mak/student-information-system)
{: .notice}

## 클래스 필드는 추상화로부터
클래스가 가질 필드는 추상화를 통해 불필요한 특징을 배제하고 
프로그램에 필요한 핵심 특징들만 추려내는 것이 중요하다.

<br>

## 객체지향은 동작을 모델화 하는 것이다! 그러나...
객체지향은 동작을 모델화하는 것이기 때문에, 동작이 객체에 데이터를 요구하지 않고 
객체에 메세지를 보내서 수행하도록 해야한다!  

```java
// car 객체로부터 position 상태(데이터)를 끌어오는 것은 ODD스럽지 못하다!
private boolean isMaxPosition(Car car) {
    return car.getPosition() == maxDistance;
}

// car 객체에 메세지를 보내서 동작 시켜라!
car.isMaxPosition(maxDistance);
```

하지만 TDD 에서는 이것이 문제가 될 수 있다. 객체의 상태(필드, 데이터)가 어떤지 알 수 없다면 테스트가 불가능 하기 때문이다.  
때문에 TDD 에서는 우선적으로 객체에 데이터를 요구하는 메서드를 통해 테스트를 진행한 후, 
실제 구현 단계에서 데이터를 요구하는 메서드들을 지워나가야 한다. 이 과정을 리팩토링이라고 생각하면 자연스럽다.

```java
// 우선 TDD를 위해 position 상태(데이터)를 끌어오게 한다.
class Car {
    // 테스트가 확실하게 완료되면 사라질(리팩토링 될) 메서드
    public int getPosition() {
        return position;
    }
}
```

<br>

## 필드 초기화의 위치는 자유롭다.
필드를 선언 단계에서 초기화하는 것과 생성자에서 초기화하는 것이 서로 다를 것이라 생각할 수 있다. (나는 그랬다.) 내가 오해했던 내용은 아래와 같다.

- 필드에서 초기화하면 매 인스턴스가 같은 필드를 공유하게 된다.
- 생성자에서 초기화하면 매 인스턴스가 서로 다른 필드를 갖게 된다.

```java
class Car {
    private int position = 0;

    public Car() {
        this.position = 0;
    }
}
```

그러나 두 초기화 모두 모든 인스턴스가 서로 다른 필드를 갖게 된다.  
서로 같은 필드를 공유하는 것은 static 필드다. 그러므로 필드 초기화는 팀의 규칙에 따라 정하면 된다.  
(책에서는 필드 단계에서 초기화하는 것을 추천하고 있다.)

<br>

## 인스턴스 생성을 막아야한다면 private 생성자를 꼭 넣자
클래스의 생성자를 생략한다는 것은 기본 생성자를 허용한다는 것과 의미가 같다. 자바 컴파일러는 프로그래머가 생성자를 생략할 시
인수를 가지지 않는 **기본 생성자**를 자동으로 제공한다. 이 떄문에 인스턴스 생성을 허용하지 않고 static 메서드만 제공하는 클래스의 경우
private 생성자를 두어 기본 생성자가 자동으로 제공되는 일을 막아야 한다.

```java
class Car {
    // 기본 생성자를 막는 private 생성자
    private Car(){
    }
}
```

<br>

## Suites를 적극 활용하자!
JUnit 테스트는 테스트 클래스 하나당 테스트만 지원한다. 이 때문에 테스트 클래스가 여러 개로 갈릴 경우, 매번 일일히 재컴파일을 진행해야 한다.  
이러한 번거로움을 덜고자 JUnit에서는 테스트 집합(Suites) 기능을 제공한다!

```java
import junit.framework.TestSuite;

public class AllTests {

    public static TestSuite suite() {
        TestSuite suite = new TestSuite();
        // .class 단위로 추가시킬 수 있다.
        suite.addTestSuite(StudentTest.class);
        suite.addTestSuite(CourseSessionTest.class);
        return suite;
    }
}
```
또한 Suites는 다른 Suites들을 묶을 수도 있으니, 적극 활용해서 편리한 TDD 환경을 구성하자.

<br>

## 인수화된 형 선언 사용
자바의 모든 클래스는 **java.lang.Object** 클래스를 상속 받는다. 자바 시스템 클래스 라이브러리에서 정의된 모든 클래스 뿐만 아니라, 
직접 작성한 클래스들 모두가 Object 클래스를 상속한다. 이로 인해 아래와 같은 상황이 벌어질 수 있다.

```java
// Student 객체를 관리하기 위한 ArrayList
ArrayList students = new ArrayList<>();
students.add(new String("Hello"));
students.add(new Student("현구"));
students.add(new CourseSession("ENG", "101"));
```

모든 클래스는 Object 클래스를 상속 받기 때문에, 인자로 Object를 전달 받는 메서드들은 위와 같은 상황이 충분히 일어날 수 있다. 
이를 제한하기 위해서는 **인수화 된 형 선언**이 필수적이다.

```java
ArrayList<Student> students = new ArrayList<>();
students.add(new String("Hello"));              // 컴파일 에러!!
students.add(new Student("현구"));
students.add(new CourseSession("ENG", "101"));  // 컴파일 에러!!
```
인수화 된 형 선언을 이용하면 컴파일 단계에서 에러로 출력해준다.

<br>

## String 클래스는 왜 import 하지 않을까?
자바 라이브러리는 자바 프로그래밍 시 너무 기본적인 것이라서 대부분의 클래스에 모두 사용되는 클래스의 집합이다. Object 클래스와 마찬가지로 
String 클래스 또한 자바 라이브러리에 속하여, 어디에서나 사용되는 클래스의 import 추가 귀찮음을 없앴다.

<br>

## 패키지의 이름은 소문자로
패키지 이름은 관습적으로 소문자를 사용한다. 여전히 약어를 사용하는 것은 피해야하지만, 
신중한 약어 사용은 소문자로만 이루어진 패키지 이름이 복잡해질 수 있는 위험을 줄여주기도 한다.  
패키지 이름은 java 또는 javax 로 시작해서는 안된다. 이 둘은 이미 썬(sun)에서 독점적으로 사용하고 있다.

<br>

## setUp 메서드
각 테스트 클래스의 모든 테스트 메서드들은 테스트 진행을 위해 중복되는 코드들이 있을 것이다! 
다행스럽게도 JUnit은 이런 중복을 피할 수 있는 setUp 메서드를 제공한다. setUp 메서드는 JUnit이 각각의 테스트 메서드를 실행하기 전에 실행된다.

```java
import java.util.Calendar;
import java.util.Date;
import java.util.GregorianCalendar;
import junit.framework.TestCase;
import java.util.ArrayList;

public class CourseSessionTest extends TestCase {

    private CourseSession session;
    private Date startDate;

    public void setUp() {
        startDate = createDate(2003, 1, 6);
        session = new CourseSession("ENGL", "101", startDate);
    }

    public Date createDate(int year, int month, int date) {
        GregorianCalendar calendar = new GregorianCalendar();
        calendar.clear();
        calendar.set(Calendar.YEAR, year);
        calendar.set(Calendar.MONTH, month-1);
        calendar.set(Calendar.DAY_OF_MONTH, date);
        return calendar.getTime();
    }

    public void testCreate() {
        assertEquals("ENGL", session.getDepartment());
        assertEquals("101", session.getNumber());
        assertEquals(0, session.getNumberOfStudents());
        assertEquals(startDate, session.getStartDate());
    }

    public void testEnrolStudents() {
        Student student1 = new Student("Hyeon Gu");
        session.enroll(student1);
        assertEquals(1, session.getNumberOfStudents());
        assertEquals(student1, session.get(0));

        Student student2 = new Student("Dong Hyeon");
        session.enroll(student2);
        assertEquals(2, session.getNumberOfStudents());
        assertEquals(student1, session.get(0));
        assertEquals(student2, session.get(1));
    }

    public void testCourseDates(){
        Date sixteenWeeksOut = createDate(2003, 4, 25);
        assertEquals(sixteenWeeksOut, session.getEndDate());
    }
}
```

**setUp을 통해 만들어진 인스턴스는 test 메서드 별로 서로 다른 인스턴스**다.

<br>

## 필드를 최대한 숨겨라 (캡슐화)
필드(클래스 변수)를 직접적으로 반환하는 식으로 노출하게 되서는 안된다. 이는 해당 클래스가 변화를 알지 못하는 상태에서 
다른 클래스에서 해당 클래스의 필드 데이터를 조작할 수 있게 된다. 객체의 완결성이 망가질 수 있다.

필드(클래스 변수)는 별도의 메서드를 제공하여 클래스가 인지하는 범위 내에서 한정적으로 조작할 수 있도록 해야한다. 
이를 캡슐화라고 부른다!

<br>

## import * (와일드카드)
우선, 책에서는 import 에 와일드 카드를 사용하는 것을 추천하고 있다.

> 어느 쪽의 형식이 더 좋은지에 대해서 일반적인 관례는 없다. 대부분의 단체는 항상 * 형태의  import 문을 사용하거나
import 문의 수가 많아지기 시작하면 * 형태를 사용한다. 어떤 단체는 클래스가 어떤 패키지에서 사용되는지 알기 쉽도록 
모든 클래스가 import 문에서 명시적으로 나타나야 한다고 주장한다.

대세는 모든 클래스가 import 문에서 명시적으로 나타나는 것이다. 대세에 따르는 개발자가 되자.

<br>

## 팩터리 메서드
팩터리 메서드의 장점은 이미 [이펙티브 자바 아이템1](https://hyeon9mak.github.io/Effective-Java-item1/)에서 충분히 알아보았다.  
일반적인 생성자에 팩터리 메서드를 활용하여 술술 읽을 수 있는 코드를 만들자.


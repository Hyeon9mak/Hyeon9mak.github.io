---
title: "[Agile Java] Lesson05 인터페이스와 폴리모피즘"
date: 2021-01-25
tags:
    - reading books
    - Agile Java
    - Java
toc: true
toc_sticky: true
toc_label: "Lesson05 인터페이스와 폴리모피즘"
---

실습 내용 저장소: [https://github.com/Hyeon9mak/student-information-system](https://github.com/Hyeon9mak/student-information-system)
{: .notice}

## Collections & Comparable

`CourseReport` 클래스에는 아래와 같은 `sessions` 리스트가 정의되어 있다.

```java
public class CourseReport {

    private final List<CourseSession> sessions = 
        new ArrayList<CourseSession>();

    public void add(CourseSession session) {
        sessions.add(session);
    }

    ...
}
```

`sessions` 리스트는 학생들이 수강하는 과목(`CourseSession`)객체들의 모음집이다. 
리포트 생성의 편의를 위해 `sessions` 리스트에 정렬을 시켜보면 어떨까?

```java
Collections.sort(sessions);
// 컴파일 에러!
```

안타깝게도 `sessions` 리스트 정렬은 컴파일 단계에서부터 에러가 발생한다. 
그 원인은 간단하다. `Collections.sort` 메서드가 `CourseSession` 객체들의 
정렬 기준을 판단하지 못했기 때문이다. 게다가 `Collections.sort` 메서드는 `Comparable` 
형으로 지정된 객체만을 정렬 시킬 수 있다는 제한조건도 있다.  
  
해결 방법 또한 간단하다. `CourseSession` 클래스에 `Comparable` 인터페이스를 **덧입힘**으로서 
`Collections.sort`가 `CourseSession` 객체를 `Comparable`로 인식하게 만들면 된다.  

<br>
  
우선 `Comparable` 인터페이스의 구성부터 살펴보자.

```java
public interface Comparable<T> {
    public int compareTo(T o);
}
```

`compareTo()` 메서드 딱 하나만 선언되어있다. `Comparable` 인터페이스를 덧입힐 땐 
`compareTo()` 메서드 하나만 구현(정의)하면 되는 것이다. 곧바로 덧입혀보자.

```java
public class CourseSession implements Comparable<CourseSession> {
    public int compareTo(CourseSession that){
        return this.getDepartment()
            .compareTo(that.getDepartment());
    }
    ...
}
```

클래스 선언부에 `Comparable`을 덧입힐 것을 명시했고, 
`compareTo` 메서드에서 과목명을 기준으로 정렬할 것임을 지정해주었다. 
이를 통해서 `Collections.sort` 메서드가 `Comparable`로 인식을 하고, 
과목명을 기준으로 정렬을 진행해 줄 수 있게 되었다.  
  
이처럼 `Collections`가 제공하는 강력한 메서드들을 활용하기 위해선 
사용되는 객체에 `Comparable` 혹은 `Comparator` 인터페이스를 덧입히는 것이 필요하다. 
덧입히는 것이 귀찮을 수 있으나, 한 번 덧입혀 놓으면 강력하고 편리한 여러가지 API 활용이 가능해지므로 
적극적으로 시도하자.

<br>

## Floating-Point의 부정확성
자바는 **IEEE 754 32 bit single precision binary floating point format** 을 지원한다. 
그냥 소수형 자료구조를 지원한다고 생각하면 된다.  
  
`float`, `double` 형을 통해 소수 값을 이용할 수 있는데, 
`double`이 `float`의 2배 정확도를 제공하면서 숫자 값 뒤에 특별한 표시를 입력할 필요가 없기 때문에 
책에서는 `float` 보다 `double`을 이용하는 것이 선호된다.  
  
그러나 `float`과 `double` 모두 실제 값의 **근사치**일뿐, 정확한 소수 값을 제공해주는 것은 아니다.

```java
System.out.println("value = " + (3 * 0.3));
// value = 0.8999999999999999
```

우리가 기대한 값은 `0.9` 겠지만, Floating-Point 연산은 이진수이기 때문에 정확한 값 표현이 불가능하다. 
그렇다면 Java에서 정확한 소수값을 이용할 수 있는 방법은 없는 것일까? 다행히 2가지 방법이 존재한다.

---

- Floating-Point 연산 결과를 반올림 한다.
- `BigDecimal` 클래스를 사용한다.

---

즉, Java에서는 이러한 문제점을 인지하고 `BigDecimal` 이라는 클래스를 제공하고 있는 것이다. 
자세한 내용은 Lesson10 에서 배울 것이다. ~~추후 URL 태깅할 것!~~

<br>

## else 키워드는 최대한 생략하자
우아한테크코스 프리코스를 진행하면서도 배웠던 규칙이다. 
`else` 키워드를 최대한 배제함으로서 코드의 가독성을 높힐 수 있다.

```java
    public double getGpa() {
        if (grades.isEmpty()) {
            return 0.0;
        }
        double total = 0.0;
        for (String grade : grades) {
            if (grade.equals("A")) {
                total += 4;
            } else {
                if (grade.equals("B")) {
                    total += 3;
                } else {
                    if (grade.equals("C")) {
                        total += 2;
                    } else {
                        if (grade.equals("D")) {
                            total += 1;
                        }
                    }
                }
            }
        }

        return total / grades.size();
    }
```

눈 앞이 아찔해지는 코드다. `else` 키워드를 최대한 생략해보자.

```java
    public double getGpa() {
        if (grades.isEmpty()) { return 0.0; }
        double total = 0.0;
        for (String grade : grades) {
            if (grade.equals("A")) { total += 4; }
            if (grade.equals("B")) { total += 4; }
            if (grade.equals("C")) { total += 4; }
            if (grade.equals("D")) { total += 4; }
        }   
        return total / grades.size();
    }
```

숨통이 트이는 느낌이다. 모든 조건 분기는 `else` 키워드 없이도 충분히 가능하다. 
`else` 키워드를 최대한 없애기 위해 계속해서 노력해보자.

<br>

## 상수 값엔 enum 활용하기
정해진 리스트에서만 값을 선택할 수 있는 열거타입 `enum`을 적극적으로 활용하면 
잘못된 데이터가 입력되는 불상사를 컴파일 타입에 방지할 수 있다.

```java
public class Student {
    enum Grade { A, B, C, D, F };
    ...
}
```
```java
// example test
student.addGrade(Grade.A);
student.addGrade(Grade.B);
```

최근 [제리](https://github.com/JunHyeok96) 가 개인 프로젝트를 진행하면서 나에게 질문을 던졌다.  
**"사이트 URL 파라미터 값을 데이터베이스 컬럼 조회용도로 넘기기 전에, enum으로 검증하는 방식 어떤거 같아?"**  
`enum` 을 활용하면 데이터베이스 쪽에 잘못된 쿼리가 던져지지 않게 확실하게 검증이 가능하기에 언뜻 보면 좋아보였지만, 
사이트가 확장되거나 이음동의어를 사용하는 사이트에 적용될 때는 매번 개발자가 `enum` 코드를 수정해야한다는 단점 때문에 
`enum`이 애매하게 보였다. `enum`이 사용되는 명확한 기준판단을 위해 더 많은 경험이 필요할 것 같다.
{: .notice}

<br>

## 다형성(polymorphism)
앞서 `interface`를 덧씌운다는 표현을 사용했지만, 이는 기존 존재하는 클래스에 
`interface`를 추가하는 방법이고, 기본적으로 `interface`는 **다형성**을 표현하기 위해 사용된다.  
  
학생들의 총학점을 표현하기 위한 클래스로 `GradingStrategy`를 가정해보자. 
학장이 학점체계에 계속해서 변동이 있을 것이라 이야기한다면, 개발자는 새로운 학점체계가 나올 때마다 
시스템을 **수정하는 대신 확장하는 방식**으로 요구사항을 만족시킬 수 있을 것이다.

```
Student - GradingStrategy - RegularGradingStrategy
                          - HonorsGradingStrategy
                          - EliteGradingStrategy
```

학점체계라는 추상적인 개념을 표현하기 위해 `GradingStrategy`는 `interface`가 될 것이다.  
  
이것이 `interface`를 구상하고 설계하는 가장 간단한 방법이다.
---
title: "[Agile Java] Lesson05 인터페이스와 폴리모피즘"
date: 2021-01-25
tags:
    - reading books
    - Agile Java
    - Java
toc: true
toc_sticky: true
toc_label: "Lesson05 인터페이스와 폴리모피즘
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
정렬 기준을 판단하지 못했기 때문이다. `Collections.sort` 메서드는 `Comparable` 
형으로 지정된 객체만을 정렬 시킬 수 있다.  
  
해결 방법 또한 간단하다. `CourseSession` 클래스에 `Comparable` 인터페이스를 **덧입힘**으로서 
**`Collections.sort`가 `CourseSession` 객체를 `Comparable`로 인식하게 만들면 된다.**  

<br>
  
우선 `Comparable` 인터페이스의 구성부터 살펴보자.

```java
public interface Comparable<T> {
    public int compareTo(T o);
}
```

`compareTo()` 메서드 딱 하나만 선언되어있다. `Comparable` 인터페이스를 덧입힐 떈 
`compareTo()` 메서드 하나만 정의하면 되는 것이다. 곧바로 덧입혀보자.

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
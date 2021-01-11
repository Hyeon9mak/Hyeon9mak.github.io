---
title: "[Effective-Java] 아이템 23. 태그 달린 클래스보다는 클래스 계층구조를 활용하라"
date: 2021-01-09
tags:
    - 이펙티브자바
    - effective-java
    - Java
    - 자바
toc: true
toc_sticky: true
toc_label: "아이템 23. 태그 달린 클래스보다는 클래스 계층구조를 활용하라"
---

전체적인 스터디 내용은 [JunHyeok96/effective-java](https://github.com/JunHyeok96/effective-java)에서 확인 가능! 
{: .notice}

## ☃️ 태그 달린 클래스
책에서 이야기하는 태그란 **해당 클래스가 어떠한 타입인지 정보를 갖고 있는 필드(멤버 변수)** 를 의미한다. 
태그를 이용하면 하나의 클래스로 두 가지 이상의 타입을 표현(정의)할 수 있다. 
태그 달리 클래스의 예시부터 살펴보자.

<br>

## ☃️ 태그 달린 클래스 예시
```java
class Figure {
    enum Shape { RECTANGLE, CIRCLE };

    // 태그 필드 - 현재 모양을 나타낸다.
    final Shape shape;

    // 다음 필드들은 모양이 사각형(RECTANGLE)일 때만 쓰인다.
    double length;
    double width;

    // 다음 필드는 모양이 원(CIRCLE)일 때만 쓰인다.
    double radius;

    // 원용 생성자
    Figure(double radius) {
        shape = Shape.CIRCLE;
        this.radius = radius;
    }

    // 사각형용 생성자
    Figure(double length, double width) {
        shape = Shape.RECTANGLE;
        this.length = length;
        this.width = width;
    }

    double area() {
        switch(shape) {
            case RECTANGLE:
                return length * width;
            case CIRCLE:
                return Math.PI * (radius * radius);
            default:
                throw new AssertionError(shape);
        }
    }
}
```

위와 같은 형태의 클래스를 **태그 달린 클래스** 라고 명한다.  
그러나! 태그 달린 클래스에는 수 많은 단점이 존재한다. 

<br>

## ☃️ 태그 달린 클래스의 단점들
### 쓸데 없는 코드가 많다

---

- 태그에 대한 선언
- 각 태그에 따라 사용되거나 사용되지 않는 필드
- 태그에 따른 메서드의 행동분기(switch)

---

불필요한 코드가 많아지므로 가독성이 떨어진다. 게다가 필드를 `final`로 선언할 경우 
해당 태그에서 사용되지 않는 필드들도 생성자에서 초기화를 진행해야 한다.

<br>

### 오류 사항이 런타임에서나 발견된다

불변성을 지키기 위해 `final` 필드를 선언하고, 불필요한 필드까지 초기화를 진행한다고 가정하자. 
이 단계에서 컴파일러는 도움을 줄 수 없다. 엉뚱한 필드를 초기화 해도 런타임에서야 문제가 드러난다. 

<br>

### 태그를 추가하려면 코드를 수정해야 한다
새로운 태그를 추가할 때마다 모든 `switch`문을 찾아 새 태그를 처리하는 코드를 추가해야 하는데, 
하나라도 빠뜨리면 역시 런타임에서야 문제를 발견할 수 있다. 

<br>

### 인스턴스의 타입만으로 현재 태그를 유추할 수 없다
직접 메서드를 사용해보거나, 네이밍을 이용해야 타입을 유추할 수 있다.

<br>

태그 달린 클래스는 장황하고 오류내기 쉽고 비효율적이다. 
다행히 자바와 같은 객체 지향 언어는 타입 하나로 다양한 의미의 객체를 표현하는 
훨씬 좋은 수단을 제공한다. 바로 클래스 계층구조를 활용하는 **서브타이핑(subtyping)** 이다.
태그 달린 클래스는 클래스 계층구조를 어설프게 흉내낸 아류일 뿐이다.

<br>

## ☃️ 클래스 계층구조로 바꾸는 방법
1. `Root`가 될 추상 클래스를 정의하자.
2. 태그에 따라 행동이 달라지는 메서드를 추상 메서드로 구현하자.
3. 태그에 관계 없이 동작이 일정한 메서드는 `Root` 클래스의 일반 메서드로 추가하자.
4. 공통된 필드도 모두 `Root` 클래스에 추가하자.
5. 각 의미별로 `Root` 추상 클래스의 하위 구체 클래스를 정의하자.
6. 각 의미에 해당하는 데이터 필드를 구체 클래스에 정의하자.
7. 각 구체 클래스에서 추상 메서드를 의미에 맞게 구현하자.

---

위에서 살펴보았던 예시에 1~4번까지 방법을 적용하면 `Root` 클래스가 아래와 같이 변한다.

```java
abstract class Figure {
    abstract double area();
}
```

이제 각 태그(의미)들 또한 구체 클래스로 하나씩 정의 해보자.
5~7번까지 방법을 적용하면 아래와 같아 진다.

```java
class Circle extends Figure {
    final double radius;

    Circle(double radius) { this.radius = radius; }

    @Override double area() { return Math.PI * (radius * radius); }
}


class Rectangle extends Figure {
    final double length;
    final double width;

    Rectangle(double length, double width) {
        this.length = length;
        this.width  = width;
    }

    @Override double area() { return length * width; }
}
```

계층구조를 통해 간결하고 명확한 코드를 확인할 수 있으며, 앞서 이야기한 태그 달린 클래스의 모든 단점을 
해결 할 수 있게 되었다. 컴파일러가 override 메서드를 모두 구현했는지에 대한 검사를 해주고, 
각 구체 클래스의 멤버변수 또한 `final`로 선언 할 수 있다. `Root` 클래스의 코드를 건드리지 않고도 
다른 프로그래머들이 독립적으로 계층구조를 확장하고 함께 사용할 수 있다.  
  
추가적으로 `Rectangle` 클래스 예시에 계층구조를 한 번 더 추가해서 `Square` 클래스를 만들어보자. 

```java
class Square extends Rectangle {
    Square(double side) {
        super(side, side);
    }
}
```

타입(의미) 간의 자연스러운 계층 관계를 반영하여 유연성을 확보하고, 컴파일 타임 타입 검사 능력을 높여준다는 
이점도 얻을 수 있다.

<br>

**핵심 정리**  
태그 달린 클래스를 쓸 상황은 거의 없다. 만일 태그 달린 클래스를 발견한다면 계층구조로 리팩터링 하자.
{: .notice}
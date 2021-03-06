---
title: "Java 테스트와 불변, 객체"
date: 2021-02-11
tags:
    - 우아한테크코스
    - Java
toc: true
toc_sticky: true
toc_label: "ava 단위 테스트와 불변 객체"
---

## 테스트만을 위한 생성자, 메서드를 구현해도 되는가?
제이슨의 말에 따르면 생성자는 많이 만들수록 클라이언트(API 사용자) 좋은 사용성을 제공해준다고 한다. 
그러나 메서드는 다르다. 객체에 메서드가 많아지면 객체 복잡도와 중복 코드를 증가시킬 뿐이다.
게다가 메서드가 많아지면 단일책임의 원칙을 위배하기도 한다.  
  
단, 그렇다고 해서 생성자가 너무 많은 일을 해서는 안된다. 
생성자는 생성자로서 필드에 데이터를 받는 역할만 해내야 한다. 
생성자에서 할 거리가 많아진다면 팩터리 메서드를 활용하자.

<br>

## 원시 값을 객체로 감쌀수록, 테스트 코드 작성이 용이해진다.
테스트 어려운 부분과 테스트 가능한 부분을 최대한 분리해서 단위테스트를 진행하자.
객체 하나에 상수값으로 가지고 있다면 private 접근제한 때문에 테스트가 어렵지만, 
상수값을 객체로 감싸면 대부분 public 이 되기 때문에, 테스트 코드 작성이 용이해진다.  
  
테스트가 어렵다고 그냥 넘기는건 안된다. 우리는 엔지니어다. 최대한의 테스트를 진행해야한다. 
작은 단위부터 확실하게 통과하는 테스트를 짜면서 테스트 가능한 클래스를 늘리자. 
특히, 범위가 넓은 값의 테스트의 경우 경계값 테스트가 중요하다.

<br>

## 추상화를 더 빡세게
- 변수 이름에 자료형 쓰지마라
- Car의 경우 move 조건의 인자가 랜덤값인지 알 필요가 없다

---

추상화는 객체지향의 핵심이다. 항상 추상화를 고민하자.  
`equals`, `toString` 등 자주 사용되는 이름을 가진 메서드는 가장 아래쪽으로 빼는 것이 좋다.

<br>

## 대세는 불변
요즘 언어들은 불변을 기본으로 탑재하고 있다. Java는 쓰레기(?)라 개발자가 관리해줘야 한다. 
항상 불변을 기본이라고 생각하고 개발하자. 
오라클 공식 문서에 따르면 **"불변 객체는 당신이 고민하면서 만든 가변 객체보다 메모리를 더 효율적으로 적게 사용한다."** 고 한다.
GC를 믿고, 방어적 복사를 수행해라.  

```java
// 이렇게 가변 객체를 만들지 말고
public class Position { 
    private int value;

    public Position(int value) {
        this.vale = value;
    }

    public void move() {
        value += 1;
    }
}
```

```java
// 방어적 복사를 수행하는 불변 객체를 만들어라!
public class Position { 
    private final int value;

    public Position(int value) {
        this.vale = value;
    }

    public Position move() {
        return new Posotion(value + 1);
    }
}
```

`new Position(0)` 와 같이 자주 호출 될 것 같은 객체는 같은 인스턴스를 사용하도록 되도록 캐싱하자. 
캐싱을 할 수 있는 이유는 `final` 키워드를 통해 불변이 보장되기 때문이다.  
  
(`equals`, `hashCode` 오버라이딩은 불변 객체에서 필수적으로 필요하다!)  

<br>

## 객체를 객체스럽게
**객체를 끌어와서 조작하려 하지말고, 객체에 메세지를 던져라.**  
  
View 에 전달해야 할 때를 제외한다면, getter 메서드는 사용하지 않는 것이 좋다. 
만일 getter 메서드가 필요하다고 느껴지면, 그 곳은 객체에 메세지를 던질 수 있다는 것이다. 
메세지를 던지고 그 객체가 알아서 자신의 상태를 조작하도록 해라. 
항상 나도 모르게 객체를 끌어와 사용하지 않는지 되짚어보는 습관을 가지자.  
  
**일급 컬렉션**을 만들어서 활용하자. 일급 컬렉션은 짱짱한 검증을 통해 
검증에 크게 신경쓰지 않고도 비즈니스 로직을 쭉쭉 개발해나갈 수 있는 안정성을 제공한다.
  
또한, 자꾸 바퀴를 발명하려 하지말고 있는거 사용해라. (Java API를 사용해라.)  

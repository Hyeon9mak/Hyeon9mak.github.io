---
title: "[Effective-Java] 아이템 16. public 클래스에서는 public 필드가 아닌 접근자 메서드를 사용하라"
date: 2020-12-26
categories:
    - effective-java
tags:
    - 이펙티브자바
    - effective-java
    - 스터디
    - 아이템16
    - Java
    - 자바
toc: true
toc_sticky: true
toc_label: "아이템 16. public 클래스에서는 public 필드가 아닌 접근자 메서드를 사용하라"
---

전체적인 스터디 내용은 [JunHyeok96/effective-java](https://github.com/JunHyeok96/effective-java)에서 확인 가능! 
{: .notice}

## 🚫 흔하게 실수하는 클래스
> "이따금 인스턴스 필드들을 모아놓는 일 외에는 아무 목적도 없는 퇴보한 클래스를 작성하려 할 때가 있다."
> ```java
> class Point {
> 
>     public double x;
>     public double y;
> 
> }
> ```

초장부터 😮뜨끔! 하게 만드는 이야기다. 설마 누가 저런 클래스를 만들겠냐 생각했지만 
실제로 우테코 프리코스 1주차 미션에서 많은 참여자 분들이 상수값을 묶어둔 public 클래스를 
사용하는 것을 볼 수 있었다. 심지어 당시 나는 따라하려 했었다. 🤦‍♂️  

---

- **API의 필드를 수정하지 않고는 내부 표현을 바꿀 수 없다.**
    - getter/setter 메서드가 존재한다면 얼마든지 표현 변경이 가능하다.
- **불변식을 보장할 수 없다.**
    - 클라이언트가 직접 데이터를 변경할 수 있다.
- **외부에서 필드에 접근할 때 부수 작업을 수행할 수도 없다.**
    - 1차원적인 접근만 가능하고, 추가 로직을 삽입할 수 없다.

---

책에서는 해당 패턴을 가진 클래스의 문제점을 대표적으로 3가지 짚어주고 있다. 
모두 **캡슐화의 이점을 포기**한 내용들이다.

<br>

## 👍 대표적인 해결방법: 클래스 캡슐화
> "철저한 객체지향 프로그래머는 필드를 모두 private 로 바꾸고 접근자(getter) 메서드를 추가한다."
> ```java
> class Point {
> 
>     private double x;
>     private double y;
> 
>     public Point(double x, double y) {
>         this.x = x;
>         this.y = y;
>     }
> 
>     public double getX() { return x; }
>     public double getY() { return y; }
> 
>     public void setX(double x) { this.x = x; }
>     public void setY(double y) { this.y = y; }
> 
> }
> ```

---

- **getter/setter 메서드를 통해 언제든지 내부 표현을 바꿀 수 있다.**
- **불변식이 보장된다.**
    - 클라이언트는 메서드를 통해서만 필드에 접근 가능하다.
- **외부에서 필드에 접근할 때 부수 작업을 수행 시킬 수 있다.**
    - getter/setter 메서드에 얼마든지 추가 가능하다.

---

위에서 이야기한 3가지 문제점을 모두 매꿔주는 캡슐화된 클래스다. 
객체지향을 이해한다면, 객체지향의 장점을 이끌어내려면 아무리 단순한 데이터(필드)라도 
이처럼 캡슐화를 진행하는 것이 좋다.

<br>

## 👍 또 다른 해결방법: private 중첩 클래스
> "하지만 package-private 혹은 private 중첩 클래스라면 데이터 필드를 노출한다 해도 하등의 문제가 없다."

```java
public class TopPoint {

    private static class Point {
        public double x;
        public double y;
    }

    public Point getPoint() {
        Point point = new Point();  // TopPoint 외부에선
        point.x = 3.5;              // Point 클래스 내부 조작이
        point.y = 4.5;              // 불가능 하다.
        return point;
    }

}
```

위와 같이 private 클래스를 중첩시키면 TopPoint 클래스에서는 얼마든지 
Point 클래스의 필드를 조작할 수 있지만, 외부 클래스에서는 Point 클래스의 
필드에 직접 접근 할 수 없다.  
  
package-private 클래스 역시 해당 클래스가 포함되는 패키지 내에서만 조작이 가능하고 
패키지 외부에서는 접근이 불가능 하므로, 처음 제시된 3가지 문제점을 모두 매꿀 수 있다.  
  
> "클라이언트 코드가 이 클래스 내부 표현에 묶이기는 하나, 클라이언트도 어차피 이 클래스를 포함하는 패키지 안에서만 동작하는 코드일 뿐이다. 
> 따라서 패키지 바깥 코드는 전혀 손대지 않고도 데이터 표현 방식을 바꿀 수 있다."

즉, 클래스를 통해 표현하려는 추상 개념만 상세하고 올바르게 표현하면 클래스와 필드를 선언하는 입장에서나 
클라이언트 입장에서나 훨씬 깔끔한 코드가 작성 가능하다는 것이다.

<br>

## 👎 public 클래스의 필드를 직접 노출시킨 사례
자바 플랫폼 라이브러리에도 **public 클래스의 필드를 직접 노출하지 말라**는 규칙을
어기는 사례가 종종 존재한다. 대표적으로 `java.awt.package` 패키지의 
`Point`와 `Dimension` 클래스가 있다.

### java.awt.Component 클래스 내부
```java
    /**
     * getSize() 메서드를 호출 할 때마다
     * Dimension 인스턴스를 생성하고 있다.
     */

    public Dimension getSize() {
        return size();
    }

    @Deprecated
    public Dimension size() {
        return new Dimension(width, height);
    }
```
```java
public class Dimension extends ... {

    public int width;
    public int height;
```

`Dimesion` 클래스의 필드는 가변으로 설계되어 getSize를 호출하는 모든 곳에서 
**방어적 복사**를 위해 인스턴스를 새로 생성해야만 한다. 단순히 작은 객체로 몇 개 생성하는 것은 
요즘 VM, HW 사양으로 큰 문제가 없겠지만 수 만, 수 억개가 된다면 이야기가 달라진다.

<br>

### final 키워드를 추가한 예시
```java
public final class Time {

    public final int hour;
    public final int minute;
```
공개된 필드(public)에 final 키워드를 추가하여 불변을 보장하는 것은 
당장 불변식은 보장할 수 있지만 API를 변경하지 않고는 표현 방식을 바꿀 수 없고, 
필드를 읽을 때 부수 작업을 수행할 수 없다는 2가지 문제점을 여전히 매꿀 수 없다.
[(게다가 해당 필드가 배열이라면 이야기가 다르다. **배열 원소의 불변식을 보장하지 못한다.**)](https://hyeon9mak.github.io/effective-java/Effective-Java-item15/#public-배열의-문제점)

<br>

**핵심 정리**  
public 클래스는 절대 가변 필드를 직접 노출해서는 안 된다. 
불변 필드여도 노출해서 좋을게 없다. 
단, package-private 클래스나 private 중첩 클래스를 통해서 
필드를 노출하는 것이 도움이 될 때도 존재한다.
{: .notice}
---
title: "[Effective-Java] 아이템 17. 변경 가능성을 최소화하라"
date: 2020-12-27
categories:
    - effective-java
tags:
    - 이펙티브자바
    - effective-java
    - 스터디
    - 아이템17
    - Java
    - 자바
toc: true
toc_sticky: true
toc_label: "아이템 17. 변경 가능성을 최소화하라"
---

전체적인 스터디 내용은 [JunHyeok96/effective-java](https://github.com/JunHyeok96/effective-java)에서 확인 가능! 
{: .notice}

---

## ⛑️ 불변 클래스
> "불변 클래스란 간단히 말해 인스턴스의 내부 값을 수정할 수 없는 클래스다. 
> 불변 인스턴스에 간직된 정보는 고정되어 객체가 파괴되는 순간까지 절대 달라지지 않는다."  
>   
> "불변 클래스는 가변 클래스보다 설계하고 구현하고 사용하기 쉬우며, 오류가 생길 여지도 적고 훨씬 안전하다."

책에서는 불변 클래스를 거의 찬양하듯 표현하고 있다. 왜 저렇게까지 표현하는 걸까?  
  
불변 클래스는 **신뢰**를 제공해준다는 점이 가장 중요하다. 가변 클래스를 이용한다면 
인스턴스가 사용되는 모든 곳에서 데이터 검증 작업이 추가적으로 이루어져야 하지만, 
불변 클래스를 이용한다면 클래스 내부의 데이터(필드)가 안전한 데이터임을 보장 받고 
데이터 검증 작업 없이 서비스 로직을 쭉쭉 뻗어나갈 수 있다.  
  
즉, 불변 클래스를 통해 **서비스 코드가 간결해지고, 이해가 쉬워지며, 생산성이 향상**된다.

<br>

## ⛑️ 불변 클래스를 만들기 위한 5가지 규칙

---

1. **객체의 상태를 변경하는 메서드(`setter`)를 제공하지 않는다.**

2. **클래스를 확장(상속) 할 수 없도록 한다.**  
  상속을 막는 대표적인 방법은 클래스를 `final`로 선언하는 것이다.

3. **모든 필드를 `final` 로 선언한다.**  
  시스템이 강제하는 수단을 이용해 보장하는 것이자,  
  설계자의 의도를 명확히 하는 도구이다.

4. **모든 필드를 `private` 로 선언한다.**  
  필드를 `public final` 로 선언하는 것도 불변을 보장해주지만,  
  [불변 보장 외에 여러가지 문제점이 남게 된다.](https://hyeon9mak.github.io/effective-java/Effective-Java-item16/#final-키워드를-추가한-예시)

5. **자신 외에는 내부 가변 컴포넌트에 접근할 수 없도록 한다.**  
  가변 객체를 참조하는 필드가 하나라도 있다면  
  클라이언트에서 그 객체의 참조를 얻을 수 없도록 무조건 막아내야 한다.  
  생성자, 접근자, readObject 등 모든 곳에서 방어적 복사를 수행 해라.

---

장황해보이지만 간단하게 정리하면 클래스를 `final`, 필드를 `private final`로 제한하고 
메서드를 통해서만 접근이 가능하도록 하면 된다.

<br>

## ⛑ 불변 복소수 클래스
```java
// 코드 17-1 불변 복소수 클래스 (106-107쪽)
public final class Complex {    // final 선언
    private final double re;    // private final 선언
    private final double im;    // private final 선언

    public static final Complex ZERO = new Complex(0, 0);
    public static final Complex ONE  = new Complex(1, 0);
    public static final Complex I    = new Complex(0, 1);

    public Complex(double re, double im) {
        this.re = re;
        this.im = im;
    }

    public double realPart()      { return re; }
    public double imaginaryPart() { return im; }

    public Complex plus(Complex c) {
        return new Complex(re + c.re, im + c.im);
    }

    public static Complex valueOf(double re, double im) {
        return new Complex(re, im);
    }

    public Complex minus(Complex c) {
        return new Complex(re - c.re, im - c.im);
    }

    public Complex times(Complex c) {
        return new Complex(re * c.re - im * c.im,
                re * c.im + im * c.re);
    }

    public Complex dividedBy(Complex c) {
        double tmp = c.re * c.re + c.im * c.im;
        return new Complex((re * c.re + im * c.im) / tmp,
                (im * c.re - re * c.im) / tmp);
    }

    @Override public boolean equals(Object o) {
        if (o == this)
            return true;
        if (!(o instanceof Complex))
            return false;
        Complex c = (Complex) o;
        
        return Double.compare(c.re, re) == 0
                && Double.compare(c.im, im) == 0;
    }
    @Override public int hashCode() {
        return 31 * Double.hashCode(re) + Double.hashCode(im);
    }

    @Override public String toString() {
        return "(" + re + " + " + im + "i)";
    }
}
```

복소수(실수부와 허수부로 구성된 수)를 표현하는 클래스다. 사칙연산 메서드 
`plus, minus, times, dividedBy` 가 인스턴스 자신의 필드를 수정하지 않고 
새로운 `Complex` 인스턴스를 만들어 반환하는 것에 주목해보자.
 
```java
    public Complex plus(Complex c) {
        return new Complex(re + c.re, im + c.im);
    }
```

또한 값을 더하는 행위에 대해 `add` 같은 동사가 아닌 `plus` 같은 전치사를 사용한 것에도 주목할 필요가 있다. 
이는 해당 메서드가 **객체의 값(필드)를 변경하지 않는다는 사실을 강조**하려는 의도를 보여준다. 
(실제로 `BigInteger`, `BigDecimal` 클래스의 경우 해당 명명규칙을 따르지 않아 
사람들이 잘못 사용하여 오류를 발생시키는 일이 자주 있다.) 
  
이처럼 피연산자에 함수를 적용해 결과를 반환하지만, 피연산자 자체(필드 데이터)는 그대로인 
프로그래밍 패턴을 **함수형 프로그래밍**이라 한다.

<br>

## ⛑ 함수형 프로그래밍
함수형 프로그래밍은 익숙하지 않다면 조금 부자연스러워 보일 수도 있지만, 
코드에서 **불변이 되는 영역의 비율이 높아지는 장점**을 누릴 수 있다. 
함수형 프로그래밍을 통해서 불변 영역을 넓히면, 해당 클래스를 사용하는 클라이언트는 
큰 노력(데이터 불변 검증)을 들이지 않고도 믿고 사용할 수 있다. 
**불변 객체**를 믿고 사용하는 것이다.

<br>

## ⛑ 불변 객체

- 생성된 시점의 상태를 파괴될 때까지 그대로 간직한다.
- 근본적으로 스레드에 안전하여 따로 동기화를 필요로 하지 않는다.
- 스레드간 서로 영향을 줄 수 없으니, 불변 객체는 안심하고 공유할 수 있다.

---

불변 객체는 단순하고, 안전하다. 사실 불변 객체는 클래스를 
스레드간 침범으로부터 안전하게 만드는 가장 쉬운 방법이기도 하다.  
  
따라서 
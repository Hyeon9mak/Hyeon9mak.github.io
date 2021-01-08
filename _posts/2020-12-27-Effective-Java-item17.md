---
title: "[Effective-Java] 아이템 17. 변경 가능성을 최소화하라"
date: 2020-12-27
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

1. **객체의 상태를 변경하는 메서드(`setter`)를 제공하지 않는다.**

2. **클래스를 확장(상속) 할 수 없도록 한다.**  
    상속을 막는 대표적인 방법은 클래스를 `final`로 선언하는 것이다. 
    하지만 우리는 더 유연한 방법을 알고 있다. 바로 모든 생성자를 
    `private` 혹은 `package-private` 으로 바꾼 뒤 
    [정적 팩터리 메서드](https://hyeon9mak.github.io/effective-java/Effective-Java-item01/) 를 제공하는 것이다.  
    
    특히나 정적 팩터리 메서드를 이용하면 `package-private` 클래스를 자유롭게 만들어
    활용 할 수 있다는 큰 장점이 존재하고, 객체 캐싱 기능을 추가하여 성능을 끌어 올릴 수도 있다.

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

단, 3번 규칙의 경우 성능을 위해서 조금의 예외가 존재한다. 몇몇 불변 클래스는 
계산 비용이 큰 값을 생성 단계에 계산하지 않고 나중(처음 사용할 때)에 계산 후
`final`이 아닌 필드에 캐싱(Cashing) 해놓기도 한다. 
똑같은 값을 다시 요청하면 캐싱해둔 값을 반환하여 계산 비용을 절감하는 것이다. 
실제 `String` 클래스에서도 예외가 적용된 캐싱이 사용되고 있다.

```java

public final class String ... {

    // 실제 String 클래스에서 유일하게 final 이 아닌 필드들
    private int hash;           // Default to 0
    private boolean hashIsZero; // Default to false;
    
    // hash 필드가 사용되는 곳은 오직 hashCode() 메서드 뿐이다.
    public int hashCode() {
        int h = hash;
        if (h == 0 && !hashIsZero) {
            h = isLatin1() ? StringLatin1.hashCode(value)
                           : StringUTF16.hashCode(value);
            if (h == 0) {
                hashIsZero = true;
            } else {
                hash = h;
            }
        }
        return h;
    }
```

이 묘수는 객체가 불변임을 보장하기 때문에 적용될 수 있는 것이다!
  
장황해보이지만 간단하게 정리하면 클래스 상속을 잘 막고, 중요한 필드를 `private final`로 제한 한 뒤 
메서드를 통해서만 접근이 가능하도록 하면 된다.

추가로 직렬화(Serializable)를 진행한다면, 불변 클래스 내부의 가변 객체를 참조하는 필드를 
반드시 `readObject`, `readResolve` 메서드를 제공하거나 
`ObjectOutputStream.writeUnshared`, `ObjectInputStream.readUnshared` 메서드를 사용해서 
직렬화/역직렬화를 진행해야 한다. 그렇지 않을 경우 불변 클래스로부터 가변 인스턴스를 만들어낼 수 있다.
{: .notice}

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

## ⛑ 불변 클래스(객체)의 장점
불변 객체는 단순하고, 안전하다. 사실 불변 객체는 클래스를 
스레드간 침범으로부터 안전하게 만드는 가장 쉬운 방법이기도 하다. 
불변 객체에는 다양한 장점이 존재한다. 

---

1. **생성 시점의 상태를 파괴 전까지 간직한다.**  
    불변 객체의 이름이 그대로 적용되는 간단명료한 장점이다.

2. **근본적으로 스레드에 안전하다.**  
    그 자체가 불변을 보장하므로, 동기화 작업이 필요로 하지 않다.

3. **안심하고 공유할 수 있다.**
    데이터가 변하지 않기 때문에, 스레드간 함께 사용해도 문제가 발생하지 않는다.

4. **불변 클래스의 인스턴스 재활용을 권장한다.**  
    불변 클래스라면 한 번 만든 인스턴스를 최대한 재활용하기를 권장한다. 
    우리가 가장 흔하게 재활용 할 수 있는 방법은 자주 쓰이는 값들을 상수로 제공하는 것이다.
    
    ```java
    public static final Complex ZERO = new Complex(0, 0);
    public static final Complex ONE  = new Complex(1, 0);
    public static final Complex I    = new Complex(0, 1);
    ```

    또한 여기에 [정적 팩터리 메서드](https://hyeon9mak.github.io/effective-java/Effective-Java-item01/)
    를 적용하여 같은 인스턴스가 중복 생성되지 않도록 할 수도 있다. 이런 정적 팩터리를 사용하면 
    여러 클라이언트가 하나의 인스턴스를 공유하여 메모리 사용량과 가비지 컬렉션의 비용을 절감할 수 있다. 
    대표적으로 모든 `Wrapper` 클래스들과 `BigInteger` 클래스가 이것들을 적용한 사례다.  
  
    불변 객체를 통한 자유로운 공유는 **방어적 복사**가 꼭 필요하지 않다는 결론이 자연스럽게 도출된다. 
    어차피 복사해봐야 원본과 절대 다르지 않으므로, 복사 자체가 의미가 없다. 그러므로 불변 클래스는 
    `clone` 메서드나 복사 생성자를 제공하지 않는 것이 좋다. [`String` 클래스의 복사 생성자](https://hyeon9mak.github.io/effective-java/Effective-Java-item06/)
    는 이 사실을 몰랐던 자바 초창기에 만들어진 것으로, 되도록 사용을 지양해야 한다.  

5. **불변 객체끼리의 내부 데이터 공유가 가능하다.**  
    불변 객체 하나를 자유롭게 공유할 수 있음은 물론, **불변 객체끼리는 서로 내부 데이터를 공유할 수 있다.**

    ```java
    public class BigInteger extends ... {
       final int signum;
       final int[] mag;
       // ... 생략
       public BigInteger negate() {
           return new BigInteger(this.mag, -this.signum);
       }
    ```

    `BigInteger` 클래스의 내부이다. `signum`은 부호를, `mag`는 크기(절대값)를 의미한다. 
    한편 `negate` 메서드는 크기는 같지만 부호만 다른 새로운 `BigInteger`를 생성하는데, 
    이때 배열은 가변이지만 복사하지 않고 원본 인스턴스를 그대로 공유하고 있다. 
    불변임을 보장받고 있으니 안심하고 그대로 사용할 수 있는 것이다.

6. **원소로 사용될 때의 안정성이 보장된다.**  
    불변하는 구성요소들로 이뤄진 객체라면, 그 구조가 아무리 복잡하더라도 안전성 하나는 확실히 보장할 수 있다. 
    `Hash`, `Set`, `Map` 등의 자료구조의 원소로 사용하기에도 안성맞춤이다. 
    해당 자료구조들은 원소 값이 바뀌면 불변식이 허물어지는데, 불변 객체를 원소로 사용하면 그런 걱정을 할 필요가 없다.

7. **불변 객체 자체로 원자성(atomicity)을 제공한다.**  
메서드 동작 중 예외가 발생하더라도 객체의 상태가 절대 변하지 않으니 
불일치 상태에 빠질 가능성 자체가 존재하지 않는다.

<br>

## ⛑ 불변 클래스(객체)의 단점
이렇게 완벽해보이는 불변 클래스에도 단점은 존재한다. 
**값이 다르면 반드시 독립된 객체로 새로 만들어야 한다는 것**이다. 
값의 가짓수가 다양하고 많다면 이들을 모두 만드는데 큰 비용을 감당해야 한다.  
  
1,000,000 비트짜리 `BigInteger`에서 비트 하나를 바꾼다고 가정해보자.
```java
BigInteger moby = ...;
moby = moby.flipBit(0);
```
`flipBit` 메서드는 새로운 `BigInteger` 인스턴스를 생성하게 될 것이다. 
원본과 단 하나의 비트만 차이나는 1,000,000 크기의 인스턴스를 생성하는 것이다. 
시간과 공간 모든 영역에서 손해를 일으키는 동작이다.  
  
치명적인 불변 클래스의 단점을 보완할 수 있는 방법이 2가지 있다.

---
1. **가변 동반 클래스 제공**  
    흔하게 쓰일 다단계 연산(multistep-operation)을 예측하여 기본 기능으로 제공하는 것이다. 
    `BigInteger` 예시로, 지수연산 같은 다단계 연산시 발생하는 불변 클래스의 
    문제점을 보완하기 위해 다단계 연산들을 묶음으로 제공하는 클래스를 제공하자.
    
    ![image](https://user-images.githubusercontent.com/37354145/103164467-db5ebc80-484e-11eb-93ff-79032cf43fac.png)
    
    실제 `BigInteger` 클래스가 포함된 `Math` 패키지 구조를 살펴보면 위와 같이 추가적인 
    클래스들을 `package-private` 형태로 제공하고 있다. 
    이 클래스들을 **가변 동반 클래스(companion-class)** 라고 부른다.

2. **가변 동반 클래스 제공 + 불변 클래스를 `public` 으로 제공**  
    만일 클라이언트들이 원하는 복잡한 연산을 예측할 수 없다면 
    불변 클래스를 `public`으로 제공하는 것이 최선이다.  
      
    자바 플랫폼 라이브러리에서 이에 해당하는 대표적인 예가 바로 `String` 이다! 
    `String`은 가변 동반 클래스로 `StringBuilder, StringBuffer`를 제공하고 있다.

[그 외 가변 동반 클래스 사용에 대한 내용은 이슈를 참고하자.](https://github.com/JunHyeok96/effective-java/issues/15)

<br>

## 🔥 불변 규칙을 지키지 못해 생기는 문제들
`BigInteger`와 `BigDecimal`은 설계 당시엔 
불변 객체가 `final`이어야 한다는 생각이 널리 퍼지지 않아 규칙이 지켜지지 않았다. 
결국 두 클래스의 메서드들은 모두 재정의(상속 오버라이딩)가 가능해졌고 
이로 인해 두 클래스의 객체를 인자로 받을 때마다 
**진짜 `BigInteger` (혹은 `BigDecimal`)** 인지 확인해야하는 문제가 발생하고 있다.

```java
@Test
public void test_상속으로_장난치기() {
    // 원본 BigInteger는 signum 필드에 직접 접근이 불가능하고,
    // signum 필드가 final 로 선언되어 있다.
    BigInteger oBigInteger = new BigInteger("123");    
    assertThat(oBigInteger.signum()).isEqualTo(1);
    oBigInteger.signum = 5; // <-- 동작 되지 않는 코드
    assertThat(oBigInteger.signum()).isNotEqualTo(5);

    // 상속 후 오버라이드 한 ChildBigInteger 는 그런 제약이 없다.
    ChildBigInteger cBigInteger = new ChildBigInteger("123");
    assertThat(cBigInteger.signum).isEqualTo(1);
    cBigInteger.signum = 5;
    assertThat(cBigInteger.signum).isEqualTo(5);
}
```

`BigInteger`를 상속 받은 하위 클래스에서 동일한 필드 데이터를 위와 같이 바꿀시 
불변이 깨지게 된다. 이 때문에 `BigInteger`를 상속받은 하위 클래스의 인스턴스를 신뢰할 수 없다면 
모두 가변이라고 가정한 후 아래처럼 방어적으로 복사시켜서 사용해야 한다.

```java
public static BigInteger safeInstance(BigInteger val) {
    return val.getClass() == BigInteger.class ?
        val : new BigInteger(val.toByteArray());
}
```

`BigInteger`, `BigDecimal` 클래스는 현재까지도 하위 호환성이 발목을 잡아 
해당 문제를 고치지 못하고 있다.

<br>

## ✏️ 최종 정리

- **클래스는 꼭 필요한 경우가 아니라면 불변이어야 한다.**
    - 단점보다 장점이 훨씬 많다.
- setter 메서드를 무조건 제공해선 안된다.
- **단순한 값 객체를 항상 불변으로 만들자.**
    - 이를 위해선 단순한 값을 객체로 감싸(Wrapping)야 한다.
- `String`이나 `BigInteger`처럼 무거운 값 객체도 불변을 고려하자.
    - 성능 저하가 우려된다면, 가변 동반 클래스를 `public`으로 제공하자.

---

모든 클래스를 불변으로 만들 순 없을 것이다. 그렇다 해도 
변경할 수 있는 영역을 최소한으로 줄여보자. 객체가 가질 수 있는 상태의 수가 줄면 
객체를 예측하기 쉬워지고 오류가 줄어든다. 다른 합당한 이유가 없다면 모든 필드는 
`private final`이 적합하다.  
  
생성자는 불변식 설정(초기화)이 모두 완료된 완벽한 상태의 객체를 생성해야 한다. 
확실한 이유가 없다면 생성자와 정적 팩터리 외에는 그 어떤 초기화(setter) 메서드도 
`public`으로 제공해서는 안된다. 객체(인스턴스)를 재활용할 목적이더라도 안된다. 
복잡성만 커지고 성능의 이점은 거의 없다. (요즘 GC의 성능이 워낙 뛰어나기 때문)

모든 원칙이 잘 적용된 사례로 `java.util.concurrent` 패키지의 `CountDownLatch` 클래스가 있다. 
가변 클래스지만 가질 수 있는 상태의 수가 많지 않다.
{: .notice}
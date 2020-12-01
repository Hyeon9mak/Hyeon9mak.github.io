---
title: "[Effective-Java] 아이템 14. Comparable을 구현할지 고려하라"
date: 2020-11-30 16:06:38
categories:
    - effective-java
tags:
    - 이펙티브자바
    - effective-java
    - 스터디
    - 아이템6
    - Java
    - 자바
toc: true
toc_sticky: true
toc_label: "아이템 14. Comparable을 구현할지 고려하라"
---
전체적인 스터디 내용은 [JunHyeok96/effective-java](https://github.com/JunHyeok96/effective-java)에서 확인 가능! 

## Comparable.compareTo
Comparable 인터페이스는 **compareTo 단 하나의 메서드만** 가지고 있다. 
그래서 "Comparable 인터페이스를 구현한다." 는 말은, "comapreTo 메서드를 구현한다." 라는 말과 같다. 
compareTo 메서드는 Object 클래스의 equals 메서드와 비슷하게 사용할 수 있지만, 
크게 3 가지의 차이점을 가지고 있다.

1. 동치성 비교 뿐만 아니라 순서 비교가 가능하다.
    - 반환 값이 -1, 0, 1 이므로 순서 비교가 가능하다.
2. 제네릭하다.
    - 인스턴스를 생성할 때 데이터 타입을 결정한다.
3. 비교하는 두 객체의 데이터 타입이 다르면 ClassCastException이 던져진다.

실제 코드로 살펴보면 아래와 같다.

```java
// Object.equals
public class Object {
    public boolean equals(Object obj) {
            return (this == obj);
        }
}

// Comparable.compareTo
public interface Comparable<T> {
    public int compareTo(T o);
}

public static void main(String[] argc){
    Integer A = 1;

    System.out.println(A.equals(1.0));    // 타입에 관여하지 않고 일단 비교 진행 
    System.out.println(A.compareTo(1.0)); // 타입이 서로 다르면 컴파일 단계에서 ClassCastException
}
```

**x.compareTo(y)** 를 기준으로,
- x < y : -1
- x == y : 0
- x > y : 1

3 가지로 나눠서 반환한다.

## compareTo 메서드의 일반 규약
전반적으로 Object.equals 메서드와 비슷하다.  

1. 반사성 (필수)  
    (x.compareTo(y) < 0) 이라면 (y.compareTo(x) > 0) 이다.  
    x.compareTo(y)가 Exception을 발생시킨다면  
    y.compareTo(x) 또한 Exception을 발생시켜야 한다.  
    
2. 추이성 (필수)  
    x.compareTo(y) < 0 이고  
    y.compareTo(z) < 0 이라면  
    x.compareTo(z) < 0 이다.

3. 대칭성 (필수)  
    크기가 같은 객체들끼리는 항상 같아야한다.  
    x.compareTo(y) == 0 으로 인해 x, y 두 객체의 크기가 같다면,  
    x.compareTo(z) 와 y.compareTo(z) 는 같아야한다.

4. 그 외 (권고지만 꼭 지키면 좋은 것!)  
    (x.compareTo(y) == 0) == (x.equals(y))  
    위처럼 equals 메서드와 일관 되도록 작성하는 것이 좋다.  
    만약 일관되지 않게 구현을 했다면 그렇다는 것을 꼭! 명시해 주도록 하자.  
    
hashCode 규약을 지키지 못하면 해시를 사용하는 다른 클래스와 어울리지 못하듯, 
compareTo 메서드 규약을 지키지 못하면 Comparable 인터페이스를 상속 받는 다른 클래스들과 어울리지 못한다.  
  
기존 클래스를 확장한 구체 클래스에서 새로운 값 컴포넌트를 추가한다면 compareTo 규약을 지킬 수 없다.  
우회방법이 존재하긴 한다! 객체 지향적 추상화의 이점을 포기한다면 말이다.

## 객체 지향적 추상화의 이점을 포기하는 대신 우회하는 방법
```java
public class Apple implements Comparable<Apple> {
    private int price;
    private int weight;

    public Apple(int price, int weight) {
        this.price = price;
        this.weight = weight;
    }

    @Override
    public int compareTo(Apple apple) {
        int result = Integer.compare(price, apple.price);
        if (result == 0) {
            return Integer.compare(weight, apple.weight);
        }
        return result;
    }
}

// View 메서드(asApple)를 제공
class GreenApple implements Comparable<GreenApple> {
    private Apple apple;
    private int green;

    public GreenApple(Apple apple, int green) {
        this.apple = apple;
        this.green = green;
    }

    public Apple asApple() {
        return apple;
    }

    @Override
    public int compareTo(GreenApple greenApple) {
        int result = apple.compareTo(greenApple.apple);
        if (result == 0) {
            return Integer.compare(green, greenApple.apple);
        }
        return result;
    }
}
```
이와 같이 View 메서드를 제공하여 추상화의 이점을 포기하는 대신 compareTo의 일반 규약을 지킬 수 있다.

## compareTo 와 equals 결과 일관성 지키기
compareTo 의 마지막 규약은 필수는 아니지만 꼭 지키길 권하고 있다. 
간단히 말하자면 compareTo 의 결과와 equals 의 결과가 서로 같도록 하라는 것이다.  
두 메서드간의 결과가 일치하지 않더라도 제대로 동작하는데, 굳이 지켜야 하는 이유가 무엇일까?  
간단하게 이야기하면, compareTo 와 equals 를 섞어서 사용하는 클래스(Collection, Set, Map)가 존재한다.

> Collection, Set, Map 은 equals 규약을 지킨다고 명시되어 있다.  
> 그러나 실제 정렬된 컬렉션들은 동치성 비교에 compareTo 메서드를 사용하고 있다.

## compareTo 와 equals 결과 일관성을 지키지 않은 사례
```java
public static void main(String[] argc){
    Set bigDecimalHashSet = new HashSet<>();
    bigDecimalHashSet.add(new BigDecimal("1.0"));
    bigDecimalHashSet.add(new BigDecimal("1.00"));

    Set bigDecimalTreeSet = new TreeSet();
    bigDecimalTreeSet.add(new BigDecimal("1.0"));
    bigDecimalTreeSet.add(new BigDecimal("1.00"));

    System.out.println(bigDecimalHashSet.size());   // 2
    System.out.println(bigDecimalTreeSet.size());   // 1
}
```
동일한 BigDecimal 객체를 삽입했는데, 왜 결과가 서로 다를까?  
**HashSet에서는 equals 를 이용한 동치비교**를 진행하지만, **TreeSet에서는 compareTo 를 이용한 동치비교**를 진행하기 때문이다.

```java
System.out.println(new BigDecimal("1.0").equals(new BigDecimal("1.00")));    // false
System.out.println(new BigDecimal("1.0").compareTo(new BigDecimal("1.00"))); // 0
```
equals는 둘을 서로 다른 객체로 인식하고, compareTo 는 둘을 같은 객체(정수 1)로 인식한다는 것을 알 수 있다.

## compareTo 메서드 작성 요령
몇 가지 차이점에만 주의하면 equals 와 비슷하다.

1. Comparable은 타입(T)을 인수로 받는 제네릭 인터페이스다.
    - 인수의 타입이 컴파일 타임에 정해진다.
    - 입력 인수의 타입을 확인하거나 형변환(casting) 할 필요가 없다.
    - 타입이 잘못 되었다면 알아서 컴파일 에러가 발생한다.
2. null을 인수로 넣을 경우 NullPointerException을 던져야 한다.
    - null의 멤버에 접근하려는 순간 NullPointerException 이 발생할 것이다.
3. 객체 참조 필드를 비교할 경우, compareTo 를 재귀적으로 호출한다.

객체 참조 필드 비교시 compareTo 메서드를 재귀적으로 호출해야하는 경우가 생긴다. (참조의 참조의 참조의...)  
```java
// 객체 참조 필드: 클래스 내 변수로 선언된 객체
public class Fruit {
    private String name;
    private int price;
    private int weight;
    private Color color; // 객체 참조 필드
}
```
그 사이에 Comparable을 구현하지 않은 필드나 표준이 아닌 순서로 비교해야하는 객체가 섞여있는 경우 Comparator 인터페이스를 이용해야 한다. 
Comparator 인터페이스 구현은 직접 하거나, 자바가 제공하는 것 중 하나를 골라 사용하면 된다.
아래는 자바에서 제공하는 Comparator 메서드를 사용한 예시다.

```java
public final class CaseInsensitiveString
        implements Comparable<CaseInsensitiveString> {

    public int compareTo(CaseInsensitiveString cis) {
        return String.CASE_INSENSITIVE_ORDER.compare(s, cis.s);
    }
    ... // 생략
}
``` 

CaseInsensitiveString 이 Comparable<CaseInsensitiveString>을 구현한 것에도 주목해보자.  
CaseInsensitiveString의 참조는 CaseInsensitiveString 참조와만 비교할 수 있다는 뜻으로, Comparable을 구현할 때 일반적으로 따르는 패턴이다!

## compareTo 메서드 정수 기본 타입 필드 비교 주의점
Effective-Java 2판에서는 compareTo 메서드에서 정수 기본 타입 필드를 비교할 때 
관계 연산자인 <와 >를, 실수 기본 타입 필드를 비교할 때는 정적 메서드인 Double.compare와 Float.compare를 사용하라고 권했다.  
  
그런데 자바 7부터 상황이 변했다. 박싱된 기본 타입(참조 타입) 클래스들에 새로 추가된 정적 메서드인 compare를 이용하면 되는 것이다.
```java
// before Java 7
if (a < b) {
    return -1;
} else if (a > b) {
    return 1;
} else {
    return 0;
}
Float.compare(a,b);
Double.compare(a,b);

// after Java 7
Integer.compare(a,b);
Float.compare(a,b);
Double.compare(a,b);
```
보기에도 깔끔할 뿐더러, <와 > 관계 연산자는 null 관련 오류를 일으킬 수 있다.
```java
class Main {
    // <, > 관계 연산자 사용
    public static class RelationalCompareFruits implements Comparable<RelationalCompareFruits> {
        private Integer price;

        @Override
        public int compareTo(RelationalCompareFruits relationalCompareFruits) {
            if (price == relationalCompareFruits.price) {
                return 0;
            }
            else if (price > relationalCompareFruits.price) {
                return 1;
            } else {
                return -1;
            }
        }
    }
    
    // 정적 메서드 compare 사용
    public static class BasicCompareFruits implements Comparable<BasicCompareFruits> {
        private Integer price;

        @Override
        public int compareTo(BasicCompareFruits basicCompareFruits) {
            return Integer.compare(price, basicCompareFruits.price);
        }
    }


    public static void main(String[] argc){
        RelationalCompareFruits relationalApple = new RelationalCompareFruits();
        RelationalCompareFruits relationalBanana = new RelationalCompareFruits();
        System.out.println(relationalApple.compareTo(relationalBanana));
        // 0

        BasicCompareFruits basicApple = new BasicCompareFruits();
        BasicCompareFruits basicBanana = new BasicCompareFruits();
        System.out.println(basicApple.compareTo(basicBanana));
        // Exception in thread "main" java.lang.NullPointerException
    }
}
```
정적 메서드 compare에 null 값이 사용되는 경우 Exception이 던져지지만, 관계연산자 비교에선 정상적으로 컴파일이 진행되고, 서로 같다는 결과를 반환한다.

## 비교할 필드가 여러개라면 핵심적인 필드부터 비교해라
비교할 핵심 필드가 여러 개라면, 가장 중요한 핵심 필드부터 비교해라.  
핵심 필드끼리의 비교 결과가 0이 아니라면, 그 즉시 순서가 결정되면 끝이다. 이를 지키지 않을 경우 불필요한 비교 반복으로 성능 저하가 발생할 수 있다.
```java
public int compareTo (PhoneNumber pn){
    int result = Short.compare(areaCode, pn.areaCode);
    if (result == 0){   // 여기서 비교가 끝날 수도 있다.
        result = Short.compare(prefix, pn.prefix);
        if(result == 0)
            result = Short.compare(lineNum, pn.lineNum);
    }
    return result;
}
```

## Lambda 함수를 이용한 연쇄 비교자 생성
Java 8에서는 COmparator 인터페이스가 일련의 비교자 생성 메서드(comparator construction method)와 팀을 꾸려 
메서드 연쇄 방식으로 비교자를 생성할 수 있게 되었다. 이 방식은 매우 간결하다는 장점이 있지만, 약간의 성능 저하가 뒤 따른다.

```java
private static final Comparator<PhoneNumber> COMPARATOR =
        comparingInt((PhoneNumber pn) -> pn.areaCode)
            .thenComparingInt(pn -> pn.prefix)
            .thenComparingInt(pn -> pn.lineNum);

public int compareTo(PhoneNumber pn) {
    return COMPARATOR.compare(this, pn);
}
```

먼저 첫 번째 comparator 생성 메서드 comparingInt 는 객체 참조를 **int 타입 키에 매핑되는 키 추출함수(key extractor function)를 인수로 받아, 그 키를 기준으로 순서를 정하는 비교자를 반환하는 정적 메서드다.**    
위 예시에서 comparingInt의 인수로 Lambda함수가 사용 되었다. 이 Lambda는 PhoneNumber 객체에서 추출한 지역코드를 기준으로 전화번호의 순서를 정하는 Comparator<PhoneNumber>를 반환한다.  
Lambda의 입력 인수 타입 PhoneNumber pn 을 명시한 점에 주목해야하는데, 위 상황에서 자바가 타입을 추론할 수 있을 만큼 타입 추론 능력이 좋지 않기 떄문에 프로그래머가 직접 컴파일을 도와준 것이다.  
  
지역번호가 같은 경우도 있으니, 코드를 계속해서 이어나가야 한다. 이 일은 두 번째 이후의 생성 메서드인 thenComparingInt가 수행한다. 
thenComparingInt 는 Comprator의 인스턴스 메서드로, int 키 추출자 함수를 입력 받아 다시 비교자를 반환한다. 
**thenComparingInt는 원하는 만큼 연달아 호출할 수 있다!**  
thenComparingInt는 타입을 명시하지 않았는데, 자바의 타입 추론 능력이 이 정도는 알 수 있기 때문이다.  
  
---

이외에도 Comparator는 수 많은 보조 생성 메서드들로 중무장하고 있다.
```java
// 자바의 숫자용 기본 타입을 모두 커버한다.
.comparingInt(ToIntFunction keyExtractor);                       // int, short
.comparingLong(ToLongFunction keyExtractor);                     // long
.comparingDouble(ToDoubleFunction keyExtractor);                 // float, double

// 객체 참조용 비교자 생성 메서드
.comparing(Function keyExtractor);                               // 키의 자연적 순서를 이용한 비교
.comparing(Function keyExtractor, Comparator keyComparator);     // 비교자 추가
// 객체 참조용 보조 비교자 생성 메서드
.thenComparing(Function keyExtractor);                           // 키의 자연적 순서를 비용한 보조 비교
.thenComparing(Comparator keyComparator);                        // 원본 키에 보조 비교자 추가
.thenComparing(Function keyExtractor, Comparator keyComparator); // 키와 비교자 모두 추가
```
- keyExtractor: 비교자 찾기
- keyComparator: 비교 방법

keyExtractor 를 지정하지 않으면 정적 메서드인 compare를 호출한다.

---

### 정적 임포트 (import static)
Lambda 함수를 이용한 연쇄 비교자 코드에 정적 임포트 (import static) 기능을 이용하면 정적 비교자 생성 메서드들을 이름만으로 사용할 수 있어 코드가 훨씬 깔끔해진다.
```java
/* [CODE] MathRef.java */
package Item14;

public class MathRef {
    public static final float PI = 3.14f;
    public static float PI(){
        return PI;
    }
}

/* [CODE] Item14_Main.java */
package Item14;

import static Item14.MathRef.PI;

public class Item14_Main {
    public static void main(String[] args) {
        System.out.println(PI);
        System.out.println(PI());
        /*
        변수명과 메서스명이 같더라도
        import static Item14.MathRef.PI;
        한번으로 둘 모두 import 할 수 있다.
        */
    }
}

출처 : https://bearstark.tistory.com/35
```

## '값의 차'를 기준으로 하는 compareTo / compare 메서드
이따금 '값의 차'를 기준으로 하는 compareTo / compare 메서드를 마주할 수 있다.

```java
static Comparator<Object> hashCodeOrder = new Comparator<>() {
    public int compare(Object o1, Object o2) {
        return o1.hashCode() - o2.hashCode();
    }
}
```

결론부터 말하면 위 방식은 사용을 금지한다. 크게 3 가지 이유가 있다.

1. 정수 overflow 가능성이 존재한다.
2. IEEE754 부동소수점 계산 방식에 따른 오류 가능성이 존재한다.
3. 해시코드가 연산을 위해 변환되는 과정에서 겹칠 가능성이 존재한다.

아래 두 가지 방식 중 하나로 변환해서 사용하자.

```java
// 정적 compare 메서드를 활용한 비교자
static Comparator<Object> hashCodeOrder = new Comparator<>() {
    public int compare(Object o1, Object o2) {
        return Integer.compare(o1.hashCode(), o2.hashCode());
    }
}

// 비교자 생성 메서드를 활용한 비교자
static Comparator<Object> hashCodeOrder =
        Comparator.comparingInt(o -> o.hashCode());
```

## 핵심 정리
1. 순서를 고려해야 하는 값 클래스를 작성한다면 꼭 Comparable 인터페이스를 상속받아 구현하자.  
이를 통해 인스턴스들을 쉽게 정렬하고, 검색하고, 비교 기능을 제공하는 컬렉션들과 어우러지게 사용할 수 있다.  
  
2. compareTo 메서드에서 필드의 값을 비교할 때는 관계연산자를 절대 사용해선 안된다.  
대신 박싱된 기본 타입 클래스가 제공하는 정적 compare 메서드나, Comparator 인터페이스가 제공하는 비교자 생성 메서드를 사용하자.
 

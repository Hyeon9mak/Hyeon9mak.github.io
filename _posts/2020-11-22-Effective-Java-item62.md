---
title: "[Effective-Java] 아이템 62. 다른 타입이 적절하다면 문자열 사용을 피하라"
date: 2020-11-22
tags:
    - reading books
    - Effective Java
    - Java
toc: true
toc_sticky: true
toc_label: "아이템 62. 다른 타입이 적절하다면 문자열 사용을 피하라"
---
전체적인 스터디 내용은 [JunHyeok96/effective-java](https://github.com/JunHyeok96/effective-java)에서 확인 가능! 
{: .notice}

## 🙅‍♂️ 문자열은 다른 값 타입을 대신하기에 적합하지 않다.
파일, 네트워크, 키보드 입력으로부터 데이터를 받을 때 주로 문자열을 사용하지만, 
입력된 데이터가 **진짜 문자열일 때만** 문자열을 사용하는게 좋다.  
  
받은 데이터가 수치형이라면 int, float, BigInteger 등 해당하는 수치형으로, 
'예/아니오' 질문의 답이라면 적절한 열거 타입이나 boolean으로 변환해야 한다.  
기본 타입이든 참조 타입이든 적잘한 타입이 있다면 그것을 사용하고, **없다면 새로 하나 만들어라.**  
어지간하면 문자열 사용을 피하라.

## 🙅‍♂️ 문자열은 열거 타입을 대신하기에 적합하지 않다.
우선 '열거 패턴'의 문제부터 짚어보자. (아이템 34)

```java
public static final int APPLE_FUJI          = 0;
public static final int APPLE_PIPPIN        = 1;
public static final int APPLE_GRANNY_SMITH  = 2;

public static final int ORANGE_NAVEL  = 0;
public static final int ORANGE_TEMPLE = 1;
public static final int ORANGE_BLOOD  = 2;
```
이와 같은 정수 열거 패턴에는 단점이 많다.

### 단점1. 타입 안전을 보장할 방법이 없으며, 표현력도 좋지 않다.
오렌지를 건네야 할 메서드에 사과를 보내도 값이 같으면 컴파일러는 경고를 출력하지 않는다.

```java
int i = (APPLE_FUJI - ORANGE_TEMPLE) / APPLE_PIPPIN;
// 오렌지 향의 사과 소스!
```

### 단점2. 이름공간을 지원하지 않아 접두어를 써서 충돌을 방지해야 한다.
자바가 열거 패턴을 위한 별도 이름공간(namespace)을 지원하지 않기 때문에 접두어를 써서 이름 충돌을 방지해야 한다.  

```
수은(원소) -> MERCURY -> ELEMENT_MERCURY
수성(행성) -> MERCURY -> PLANET_MERCURY
```

### 단점3. 프로그램이 깨지기 쉽다.
평범한 상수를 나열한 것뿐이라 컴파일하면 그 값이 클라이언트(API가 적용된 클래스: 코드, 프로그램) 파일에 그대로 새겨진다.  
즉, API의 상수 값이 바뀌면 클라이언트도 재컴파일을 해야만 한다.

### 단점4. 정수 상수는 문자열로 출력하기 까다롭다.
해당 값을 출력하거나 디버거로 살펴보면, 정수로서의 의미가 아닌 문자열 숫자로만 보여서 쓸모가 없다. 
같은 정수 열거 그룹에 속한 모든 상수를 한 바퀴 순회하는 방법도 마땅치 않으며, 상수가 총 몇 개인지 알 방법도 없다.

### 정수 열거 패턴이 이정도, 문자열 열거 패턴은 더 나쁘다.
상수의 의미를 출력할 수 있다는 점은 좋지만, 문자열 상수의 이름 대신 문자열 값을 그대로 하드코딩하게 만들기 때문이다.  
하드코딩한 문자열에 오타가 있어도 컴파일러는 확인할 길이 없으니, 자연스럽게 런타임에 버그가 생긴다. 문자열 비교에 따른 성능 저하는 덤이다.

### 열거 패턴은 열거 타입으로 해결하자.
```java
public enum Apple { FUJI, PIPPIN, GRANNY_SMITH }
public enum Orange { NAVEL, TEMPLE, BLOOD }
```
앞선 문제들이 모두 말끔히 해결된다.

## 🙅‍♂️ 문자열은 혼합 타입을 대신하기에 적합하지 않다.
```java
String compoundKey = className + "#" + i.next();
```

*className*과 *i.next()* 요소 사이에 "#"를 추가해서 서로 다른 타입의 두 요소간 구분을 시도한 케이스다. 
혹여라도 두 요소를 구분해주는 문자 #이 둘 중 하나에라도 쓰인다면 혼란스러운 결과를 초래한다.  
  
두 곳 모두에 안쓰인다는 걸 보장하더라도, 각 요소를 분리해서 사용하려면 
문자열을 파싱해야 하므로 *느리고, 귀찮고, 오류 가능성도 커진다*.  
  
또한 적절하게 equals, toString, compareTo 같은 메서드를 사용할 수도 없으며, 
String 클래스가 제공하는 메서드에만 의존해야 한다.  
차라리 두 요소를 병합해서 관리하는 클래스를 새로 만드는 편이 낫다.  
이런 클래스는 보통 private 정적 멤버 클래스(아이템2)로 선언한다.

```java
// 아이템2 에서 배운 Builder 패턴과 동일.
public class effectiveJavaStudy {
    private String className;
    private int numberOfItem;
    
    // private 선언으로 외부의 접근을 제한한다.
    private static class compoundKey {
        private String className;
        private int numberOfItem;

        public compoundKey(String className, int numberOfItem) {
            this.className = className;
            this.numberOfItem = numberOfItem;
        }

        public effectiveJavaStudy compound(){
            return new effectiveJavaStudy(this);
        }
    }

    private effectiveJavaStudy(compoundKey compoundkey) {
        className = compoundkey.className;
        numberOfItem = compoundkey.numberOfItem;
    }

    public static void main(String[] args) {
        ArrayList<Integer> itemList = new ArrayList<Integer>();
        itemList.add(1);
        itemList.add(2);
        itemList.add(3);

        Iterator<Integer> i = itemList.iterator();

        effectiveJavaStudy JunHyeok = new effectiveJavaStudy.compoundKey("9장", i.next()).compound();
        effectiveJavaStudy JooHyun = new effectiveJavaStudy.compoundKey("9장", i.next()).compound();
        effectiveJavaStudy HyeonGu = new effectiveJavaStudy.compoundKey("9장", i.next()).compound();
        
        System.out.println("JunHyeok " + JunHyeok.className + "\t아이템" + JunHyeok.numberOfItem);
        System.out.println("JooHyun " + JooHyun.className + "\t아이템" + JooHyun.numberOfItem);
        System.out.println("HyeonGu " + HyeonGu.className + "\t아이템" + HyeonGu.numberOfItem);
    }
}
    /*
    JunHyeok 9장  아이템1
    JooHyun 9장   아이템2
    HyeonGu 9장   아이템3
    */
```

## 🙅‍♂️ 문자열은 권한(capacity)을 표현하기에 적합하지 않다.
스레드 지역변수 기능 설계를 예시로 보자. 이름처럼 각 스레드가 자신만의 변수를 갖게 해주는 기능이다.  
자바2 버전 이전에는 프로그래머가 이를 직접 구현해야 했다. 당시 이 기능을 설계하던 프로그래머들이 여러 방법을 모색하다가 
종국에는 **클라이언트가 제공한 문자열 키로 스레드별 지역변수를 식별**하는 설계에 이르렀다.

```java
public class ThreadLocal {
    private ThreadLocal() { } // 객체 생성 불가

    // 현 스레드의 값을 키로 구분해 저장한다.
    public static void set(String key, Object value);

    // (키가 가리키는) 현 스레드의 값을 반환한다.
    public static Object get(String key);
}
```
이 방식의 문제는 스레드 구분용 문자열 키가 이름공간(package) 전역에서 공유된다는 점이다.  

> 2020-11-25 추가.  
> [전역 이름공간에 대한 이야기](https://github.com/Java-Bom/ReadingRecord/issues/182)를 
> 자바 관련 스터디 "자바 봄"에 질문한 결과, **전역(Heap) 이름공간(namespace)**라는 해석을 얻을 수 있었다.  
> 전역 이름공간이라는 책의 표현이 이해가지 않아 "이름공간 전역"이라고 적었는데, Heap 메모리를 고려한다면 전역 이름공간이라는 표현이 맞는 것 같다.  

이 방식이 의도대로 동작하려면 각 클라이언트(API가 적용되는 클래스: 코드, 프로그램)가 고유한 키(값)를 제공해야 한다.  
  
그런데 만약 두 클라이언트가 서로 같은 키를 사용하게 되면, 두 클라이언트 모두 제대로 동작하지 못하게 된다.  
악의적인 클라이언트라면 의도적으로 같은 키를 사용하여 다른 클라이언트의 값을 획득할 수도 있다.  
  
위 설계 문제점은 위조할 수 없는 키를 사용하여 해결할 수 있다. 이 키를 **권한(capacity)**라고 부른다.  
위 설계시 문제가 발생하는 예시와, 문제 해결방법에 대한 예시는 [Java-Bom/ReadingRecord/issues/129](https://github.com/Java-Bom/ReadingRecord/issues/129)에 아주 잘 정리되어 있다!  
  
## 🎯 핵심 정리
문자열을 잘못 사용하는 흔한 예로는 **기본 타입, 열거 타입, 혼합 타입**이 있다.  
문자열은 잘못 사용하면 번거롭고, 덜 유연하고, 느리고, 오류 가능성도 크다.  
더 적합한 데이터 타입이 있거나 새로 작성할 수 있다면, 문자열을 쓰고 싶은 유혹을 뿌리치자.
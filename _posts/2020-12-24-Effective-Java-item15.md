---
title: "[Effective-Java] 아이템 15. 클래스와 멤버의 접근 권한을 최소화하라"
date: 2020-12-24
categories:
    - effective-java
tags:
    - 이펙티브자바
    - effective-java
    - 스터디
    - 아이템15
    - Java
    - 자바
toc: true
toc_sticky: true
toc_label: "아이템 15. 클래스와 멤버의 접근 권한을 최소화하라"
---

전체적인 스터디 내용은 [JunHyeok96/effective-java](https://github.com/JunHyeok96/effective-java)에서 확인 가능! 
{: .notice}

---
   
![image](https://user-images.githubusercontent.com/37354145/102715358-41f84d80-4318-11eb-960f-649201377fa7.png)

   
우리는 알약을 먹을 때 "감기약, 두통약, 소화제" 로만 생각하고 먹을 뿐, 
알약 내부에 어떤 약품들이 들어있는지 신경쓰지 않는다. 알약은 잘 설계된 컴포넌트다.
   
> "어설프게 설계된 컴포넌트와 잘 설계된 컴포넌트의 가장 큰 차이는 바로 
> 클래스 내부 데이터와 내부 구현 정보를 외부 컴포넌트로부터 얼마나 잘 숨겼느냐다."
   
잘 설계된 컴포넌트는 모든 내부 구현을 숨겨, 구현과 API를 깔끔히 분리한다. 
오직 API를 통해서만 다른 컴포넌트와 소통하며 서로의 내부 동작 방식에는 관여하지 않아야 한다. 
이것을 **정보 은닉**, 혹은 **캡슐화** 라고 부른다.
   
---

<br>
   
## 정보 은닉(캡슐화)의 장점
* **시스템 개발 속도를 높인다.**  
  컴포넌트 속성별 규격만 맞춘다면, 얼마든지 다양한 컴포넌트를 병렬로 개발 시킬 수 있다.

* **시스템 관리 비용을 낮춘다.**  
컴포넌트의 상세한 필드를 이해하지 않아도 컴포넌트의 역할을 이해할 수 있고, 
역할이 비슷한 다른 컴포넌트로 교체하는 부담도 적다.

* **성능 최적화에 도움을 준다.**  
캡슐화가 완벽히 되어 있는 시스템 속에서는 이미 완성된 시스템이더라도 
다른 컴포넌트에 영향을 주지 않고 최적화 대상 컴포넌트만 최적화 시킬 수 있다.

* **소프트웨어 재사용성을 높인다.**  
다른 API나 외부에 의존하지 않고 독자적으로 동작하는 컴포넌트라면, 
해당 컴포넌트가 완전히 다른 환경에서도 유용하게 쓰일 가능성이 높다.

* **대형 시스템 제작 난이도를 낮춰준다.**  
캡슐화를 통해 개별 컴포넌트의 동작을 검증할 수 있기 때문에 
전체 시스템이 구현되지 않아도 각 컴포넌트 개발에 신뢰를 더할 수 있다.
   
---

<br>
   
## 자바에서 제공하는 정보 은닉(캡슐화) 장치 - 접근 제어
기본 원칙은 매우 간단하다.

> **모든 클래스와 멤버의 접근성을 가능한 한 좁혀야 한다.**

기본 원칙을 이해하고 두 가지 부류의 접근 제한을 알아보자.

<br>

### TOP LEVEL 클래스와 인터페이스 접근 제한자
- `public`: 공개 API 가 된다.
- `package-private`:  해당 패키지 내부에서만 이용할 수 있다.

클라이언트에게 컴포넌트를 공개 API로 제공했을 경우 영원히 하위호환을 지원해주어야 한다. 
정확히 필요할 때만 `public` 선언을 이용하도록 하자.

<br>

### 멤버(필드, 메서드, 중첩 클래스, 중첩 인터페이스) 접근 제한자
- `private`: 멤버가 선언된 TOP LEVEL 클래스에서만 접근할 수 있다.
- `package-private`: 멤버가 소속된 패키지 안의 모든 클래스에서 접근할 수 있다.
- `protected`: `package-private`의 접근 범위를 포함하며,  
    이 멤버를 선언한 클래스의 하위 클래스에서도 접근이 가능하다.
- `public`: 모든 곳에서 접근할 수 있다.

---

<br>

## 접근 제한자 부여 방법
1. 클래스의 공개 API를 세심히 설계한 후, 그 외의 모든 멤버는 `private`로 만들자. 
2. 오직 같은 패캐지의 다른 클래스가 접근해야하는 멤버에 한하여 `package-private`로 풀어주자.
3. 권한을 풀어주는 일이 자주 발생한다면, 컴포넌트를 더 분해해야하는 것이다.
4. `public` 클래스에서 멤버의 접근 수준을 `package-private`에서 `protected`로 바꾸는 순간 
  해당 멤버에 접근 가능한 대상 범위가 엄청나게 넓어진다. `protected` 멤버의 수는 적을 수록 좋다.

<br>

## 접근 제한을 방해하는 제약 : 리스코프 치환원칙
> 상위 클래스의 메서드를 재정의할 때는 그 접근 수준을 상위 클래스에서보다 좁게 설정할 수 없다.

제약은 상위 클래스의 인스턴스가 하위 클래스의 인스턴스로 대체될 수 있어야 한다는 규칙을 지키기 위해 필요하다. 
이 이 제약을 어길 경우 하위 클래스를 컴파일 할 때 컴파일 에러가 발생한다.

<br>

## 테스트를 위해서 접근 제한을 풀어줄 필요는 없다.
코드를 테스트하는 목적으로 접근 범위를 넓혀줄 때가 있다. 적당한 범위는 넓혀줄 수 있지만 테스트를 위해 공개 API를 만들어선 안된다. 
사실 접근 범위를 크게 넓혀줄 필요도 없다. 테스트 코드를 테스트 대상과 같은 패키지에 두면 `package-private` 요소까지 접근할 수 있다.

<br>

## 한 클래스에서만 사용하는 `package-private` TOP LEVEL 클래스나 인터페이스는 이를 사용하는 
클래스 안에 `private static`으로 중첩 시키자. 바깥 클래스 하나에서만 접근 할 수 있음을 보장해준다. (스레드에 안전하다는 의미인듯)

<br>

## `public` 클래스의 인스턴스 필드는 되도록 `public`이 아니어야 한다.
1. 필드에 담을 수 있는 값을 제한할 힘이 아예 없게 된다. (변경에 매우 취약) 
2. `public` 가변 필드를 갖는 클래스는 일반적으로 스레드에 안전하지 않다.
  인스턴스 변수는 Heap에 할당되며 공유자원이다. 즉, 모든 스레드가 이 공유자원에 접근 할 수 있다.
3. 필드가 final이면서 불변 객체를 참조하더라도, public 필드를 없애는 방식으로 리팩터링이 불가능해진다.
  private 필드라면 내부 구현 변경 시 private 필드를 삭제할 수 있고, Getter/Setter 메서드만 수정하면 된다.
  하지만 public 필드의 경우 이 필드가 직접 사용되고 있는 모든 소스코드를 찾아가 수정해야한다.
**단, 상수값 표현은 `public static final` 필드로 공개해도 좋다.**

## `public` 배열의 문제점
final 키워드를 이용하더라도, 필드 멤버가 배열이라면 배열 내부의 값을 수정할 수 있다.

```java
public class ArrayTest {

    public static final String [] VALUES = {"ANT", "BANANA", "CAR"};

    public static void main(String[] args) {


        for (String v : VALUES){
            System.out.println(v);
        }

        ArrayTest.VALUES[1] = "TUTLE";


        for (String v : VALUES){
            System.out.println(v);
        }

    }
}
```
```
ANT
BANANA
CAR
ANT
TUTLE
CAR
```

배열 자체의 변화는 final로 막아줄 수 있지만, 배열 내부의 원소들은 막을 수 없다.
다행스럽게도, 이를 위한 해결 방법이 2가지 제시되어 있다.

### 첫 번째 방법
```java
import java.util.Arrays;
import java.util.Collections;
import java.util.List;

public class ArrayToList {
    private static final String[] VALUES = {"ANT", "BANANA", "CAR"};
    public static final List<String> LISTVALUES = Collections.unmodifiableList(Arrays.asList(VALUES));

}
```
```java
public class ArrayToListTest {

    public static void main(String[] args) {
        ArrayToList.LISTVALUES.add("SOMETHING_STRING!");
    }
}
```
```
Exception in thread "main" java.lang.UnsupportedOperationException
    at java.util.Collections$UnmodifiableCollection.add(Collections.java:1055)
    at com.github.sejoung.codetest.accessiblility.ArrayToListTest.main(ArrayToListTest.java:6)
```

애초에 수정이 불가능하다.
<br>

### 두 번째 방법
```java
import java.util.Arrays;
import java.util.Collections;
import java.util.List;

public class ArrayToClone {
    private static final String[] VALUES = {"ANT", "BANANA", "CAR"};
    public static final String[] values(){
      return VALUES.clone();
    }
}
```
```java
public class ArrayToCloneTest {
    public static void main(String[] args) {

        String[] test = ArrayToClone.values();
        for (String v : test) {
            System.out.println(v);
        }

        test[1] = "TUTLE";

        for (String v : test) {
            System.out.println(v);
        }


        for (String v : ArrayToClone.values()) {
            System.out.println(v);
        }


    }
}
```
```
ANT
BANANA
CAR
ANT
TUTLE
CAR
ANT
BANANA
CAR
```
최초 수정이 가능하나, 다시 clone을 불러오면 수정이 초기화 된다.
<br>

---

## 모듈 시스템을 이용한 접근 제한
> "JDK 외에도 모듈 개념이 널리 받아들여질지 예측하기는 아직 이른 감이 있다. 그러니 꼭 필요한 경우가 아니라면 당분강는 사용하지 않는게 좋을 것 같다."

책에 모듈 시스템을 이용한 접근 제한 방법을 소개하긴 했으나,
마지막 부분에서 사용을 권장하지 않고 있다. 우선 기본적인 접근제한자를 통해 접근제한에 익숙해지고,
추후 모듈 시스템이 널리 받아들여질 때 다시 이해하면 될 것 같다.

<br>

---

## 핵심 정리
- 프로그램 요소의 접근성은 가능한 최소한으로만 제공해라. 
- 꼭 필요한 최소한의 public API를 설계하자. 
- public 클래스(API)는 상수용 public static final 필드 외에는 어떠한 public 필드도 가져서는 안된다.
- public static final 필드가 참조하는 객체가 불변인지 확인하라.
   

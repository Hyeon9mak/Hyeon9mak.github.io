---
title: "[Effective-Java] 아이템 21. 인터페이스는 구현하는 쪽을 생각해 설계하라"
date: 2021-01-09
tags:
    - 이펙티브자바
    - effective-java
    - Java
    - 자바
toc: true
toc_sticky: true
toc_label: "아이템 21. 인터페이스는 구현하는 쪽을 생각해 설계하라"
---

전체적인 스터디 내용은 [JunHyeok96/effective-java](https://github.com/JunHyeok96/effective-java)에서 확인 가능! 
{: .notice}

## 🔌 인터페이스와 default 메서드
> "자바 8 이전에는 기존 구현체를 깨뜨리지 않고는 인터페이스에 메서드를 추가할 방법이 없었다. 
> 인터페이스에 메서드를 추가하면 보통은 컴파일 오류가 나는데, 추가된 메서드가 우연히 기존 구현체에 이미 존재할 가능성이 아주 낮기 때문이다.
> 자바 8에 들어서 기존 인터페이스에 메서드를 추가할 수 있도록 default 메서드를 소개했지만, 위험이 완전히 사라진 것은 아니다."

갑자기 `default` 메서드를 소개하고, 갑자기 `default` 메서드를 사용하지 말라는 듯 이야기 한다. 
책의 내용을 더 잘 이해하기 위해 우선 인터페이스와 `default` 메서드를 예시와 함께 간단히 알아보자.

<br>

### 인터페이스(interface)
인터페이스란 상수(static final)와 추상 메서드(abstract method)의 집합이다. 
생성자를 가질 수 없다. (따라서 객체화가 불가능 하다.) 
인터페이스에 선언된 상수와 추상 메서드는 public static final 과 public abstract 키워드를 
컴파일 타임에 자동으로 생성해주기 때문에 생략이 가능하다. 
인터페이스는 다중상속을 지원하며, 하나의 구현체에서 여러개의 인터페이스를 구현할 수 있다. 
'구현체'란 **인터페이스를 직접 구현한 클래스**를 의미한다. 다른 이름으로는 **구현 클래스**, **실체 클래스** 라고 불린다. 

### default 메서드
인터페이스는 메서드에 대한 선언만 가능하기 때문에, 실제 로직은 포함될 수 없다. 
하지만 자바8에서 이러한 룰을 깨트리는 기능이 등장하는데, 그것이 `default` 메서드다. 
메소드 선언시 `default`를 명시하게 되면 인터페이스 내부에서도 동작 코드가 포함된 메서드를 선언 할 수 있다.

```java
interface JavaStudyable {  // ~able 네이밍 규칙을 가진다.
 
    public abstarct void study();   // 일반적인 메서드 선언

    public default void rest() {    // default 메서드 선언 후 구현
        System.out.println("쉽시다!");
    }

}
```

### default 메서드 사용 예시
```java
// Test 1
interface DefaultTestable {

    public abstract void study();

    public abstract void rest();

}

class RealTest implements DefaultTestable { // 컴파일 에러!

    @Override
    public void study() {
        System.out.println("공부합시다.");
    }

}
```
`DefaultTestable` 인터페이스에  `rest()` 메서드가 구현되지 않아 컴파일 에러가 발생한다.

```java
// Test 2
interface DefaultTestable {

    public abstract void study();

    public default void rest(){
        System.out.println("쉽시다.");
    }

}

class RealTest implements DefaultTestable {

    @Override
    public void study() {
        System.out.println("공부합시다.");
    }

}
```
```
공부합시다.
쉽시다.
```
`default` 키워드를 통해 구현된 메서드가 `RealTest` 객체를 통해 정상 동작하는 것을 확인할 수 있다.

```java
// Test 3
interface DefaultTestable {

    public abstract void study();

    public default void rest(){
        System.out.println("쉽시다.");
    }

}

class RealTest implements DefaultTestable {

    @Override
    public void study() {
        System.out.println("공부합시다.");
    }

    @Override
    public void rest() {
        System.out.println("할 건 하고 쉬어야죠.");
    }
}
```
```
공부합시다.
할 건 하고 쉬어야죠.
```
당연히 오버라이딩도 가능하다.

<br>

`default` 키워드는 인터페이스에 메서드를 추가함과 동시에 하위호환성을 유지할 수 있도록 해주는 큰 편의를 제공해준다. 
그러나 책에서는 `default` 키워드 사용을 자제하라는 듯 이야기 하고 있다. 그 이유를 살펴보자.

<br>

## 🔌 구현체들은 default 메서드 추가 사실을 모른다
위에서 살펴본 에시와 같이, `default` 메서드를 추가하면 그 인터페이스를 구현한 모든 구현체들은 
해당 `default` 메서드를 사용할 수 있게 된다. (오버라이딩을 하던, 안하던) 
단, 구현체들이 `default` 메서드가 추가됐는지 알아차리지 못하는 채로 무작정 추가된다. 
자바 7까지는 모든 클래스가 "현재의 인터페이스에 새로운 메서드가 추가될 일은 영원히 없다" 라고 가정한 뒤 작성 되었기 때문이다.

<br>

## 🔌 모든 상황에서 불변식을 해치지 않기란 어렵다  
자바 8에서는 핵심 컬렉션 인터페이스들에 다수의 default 메서드를 추가했다. 주로 `Lambda`를 활용하기 위해서다. 
자바 라이브러리에 등록된 `default` 메서드들은 코드 품질이 높고 범용적이라 대부분의 상황에서 정상적으로 작동한다. 
그러나 말 그대로 대부분의 상황에서지, **모든 상황에서 불변식을 지키진 못한다**. 
(불변식의 중요성은 [아이템 17](https://hyeon9mak.github.io/effective-java/Effective-Java-item17/) 을 참고하자.)  
  
자바 8의 `Collection` 인터페이스에 추가된 `removeIf` 메서드를 예시로 보자.

```java
// Predicate -> 매개값을 사용해 조사(조건) 후 논리값(true, false)을 반환한다.
default boolean removeIf(Predicate<? super E> filter) {
	Objects.requireNonNull(filter);
	boolean removed = false;
	for (Iterator<E> it = iterator(); it.hasNext(); ) {
        if (filter.test(it.next())) {
            it.remove();
            result = true;
        }
    }
	return result;
}
```

이 메서드는 `Collection`을 구현한 클래스의 원소 묶음(`List`, `Set` 등)에서 
`iterator`를 이용해 원소 묶음을 순회하면서 `boolean` 함수가 `true`를 반환하는 모든 원소를 제거한다.  
  
`Collection`을 구현한 대부분의 클래스에서 잘 돌아가는 범용적인 메서드지만, 
모든 구현체에서 `removeIf` 메서드를 잘 소화하는 것은 아니다. 그 대표적인 예가 4.3 이하 버전의 
`org.apache.commons.collections4.collection.SynchronizedCollection` 이다. 
클라이언트가 제공한 객체에 `lock`을 거는 능력을 추가하여 스레드간 동기화를 보장하는 클래스다. 그러나 
4.3 이하 버전의 `SynchronizedCollection` 에서는 `removeIf`가 오버라이딩 되지 않아 
`default` 메서드의 형태로 곧장 사용되어 동기화가 지켜지지 않는다. 
(정확한 실험 내용은 [sejoung 님의 아이템 21 포스트](https://sejoung.github.io/2018/12/2018-12-17-Design_interfaces_for_posterity/#%EC%95%84%EC%9D%B4%ED%85%9C-21-%EC%9D%B8%ED%84%B0%ED%8E%98%EC%9D%B4%EC%8A%A4%EB%A5%BC-%EA%B5%AC%ED%98%84%ED%95%98%EB%8A%94-%EC%AA%BD%EC%9D%84-%EC%83%9D%EA%B0%81%ED%95%B4-%EC%84%A4%EA%B3%84%ED%95%98%EB%9D%BC) 를 참고하자.) 
따라서 `SynchronizedCollection` 인스턴스를 여러 스레드가 공유하는 환경에서 `removeIf` 메서드가 호출되면 
`ConcurrentModificationException`이 발생하거나, 다른 잘못된 결과를 반환할 수 있다. 자신의 본분을 지키지 못하게 되는 것이다.  
  
자바 라이브러리 플랫폼에서도 이러한 사태를 인지하고 아래와 같은 조치를 취했다.  

```java
// SynchronizedCollection in Collections

// Override default methods in Collection
@Override
public boolean removeIf(Predicate<? super E> filter) {
    synchronized (mutex) {return c.removeIf(filter);}
}
```

`default` 메서드를 호출하기 전에 사전작업(`synchronized`)을 통해 어우러지도록 하는 것이다. 
이 덕분에 `SynchronizedCollection` 은 4.4 이상 버전부터 `removeIf` 메서드를 자연스럽게 사용할 수 있게 되었다.  
  
그러나 이것은 자바 플랫폼 라이브러리에 속하는 클래스들만 누릴 수 있는 혜택이며, 
속하지 못한 제3의 기존 `Collection` 구현체들은 인터페이스 변화에 발맞춰 수정될 기회가 없었다. 
때문에 일부는 아직도 수정되지 않고 있다.

<br>

## 🔌 문제점이 런타임에서야 발견 될 수도 있다
`default` 메서드의 문제점은 컴파일 타임을 지나 런타임에 들어서야 발견 될 수도 있다. (특히나 동기화 관련된 문제에서) 
자바 8에서 `Collection` 인터페이스에 상당히 많은 `default` 메서드를 추가했고, 그 결과 기존에 짜여진 수 많은 자바코드들이 
영향을 받게 되었다. 언제 어디서 문제가 터질지 예측이 불가능하다.

<br>

## 🔌 default 메서드를 신중하게 사용해라
`default` 메서드는 새로운 인터페이스를 설계할 때 표준적인 메서드 구현을 제공하는데 아주 유용한 수단이며, 
인터페이스를 더 쉽게 구현해 활용할 수 있게끔 해준다.  
  
그러나! `default` 메서드는 인터페이스로부터 메서드를 제거하거나 기존 메서드의 시그니처를 수정하는 용도가 아님을 명심하자. 
또한 기존 인터페이스에 `default` 메서드로 새 메서드를 추가하는 일은 꼭 필요한 경우가 아니라면 피해야 한다.  

<br>

## 핵심 정리
인터페이스 설계에는 세심한 주의를 기울여야 한다. 잘못된 인터페이스 설계 및 수정으로 커다란 재앙이 생긴다. 
새로운 인터페이스를 릴리즈 할 계획이라면 철저한 테스트를 거쳐야 한다. 서로 다른 방식으로 최소 3가지는 구현해봐야 하며, 
인터페이스를 직접 활용하는 클라이언트를 여러 개 만들어봐야 한다. 인터페이스를 릴리즈 한 후에 결함을 수정하는게 가능하긴 하지만, 
**절대로 그 가능성에 기대서는 안 된다.**
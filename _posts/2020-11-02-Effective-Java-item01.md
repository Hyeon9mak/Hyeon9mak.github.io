---
title: "[Effective-Java] 아이템 1. 생성자 대신 정적 팩터리 메서드를 고려하라"
date: 2020-11-02
categories:
    - effective-java
tags:
    - 이펙티브자바
    - effective-java
    - 스터디
    - 백엔드
    - Java
    - 자바
toc: true
toc_sticky: true
toc_label: "아이템 1. 생성자 대신 정적 팩터리 메서드를 고려하라"
---
전체적인 스터디 내용은 [JunHyeok96/effective-java](https://github.com/JunHyeok96/effective-java)에서 확인 가능!  
{: .notice}

## 👍 장점 1. 이름을 가질 수 있다.
### 이름을 통해 생성자가 입력 받는 매개변수가 어떻게 사용될지 객체의 특성 묘사가 가능해진다.
**생성자**
```java
public class Fruit{
    int price;

    public Fruit(int price){
    	this.price = price;
    }
    // "정수 값을 넘기긴했는데.. 뭐하는거더라?"
    public static void main(String[] args){
        Fruit apple = new Fruit(500);
    }
}
```
일반적인 생성자의 경우, 매개변수를 넘길 때 매개변수가 어떻게 활용되는지 유추하기 어렵다.  
  

**정적 팩터리 메서드**
```java
public class Fruit{
    int price;

    public Fruit(int price){
        this.price = price;
    }
    // 정적 팩터리 메서드
    public static Fruit withPrice(int price) {
        return new Fruit(price);
    }
    // "정수 값이 가격을 의미하는군!"
    public static void main(String[] args){
        Fruit fruit2 = Fruit.withPrice(500);
    }
}
```
그러나 정적 팩터리 메서드를 통해 네이밍하면, 매개변수의 용도 파악이 용이하다.  
  

### 시그니처(메소드명 + 파라미터 타입)가 겹치는 경우에도 네이밍을 통해 구분지어 표현할 수 있게 된다.
**생성자**
```java
public class Fruit{
    String name;
    String from;

    public Fruit(String name){
        this.name = name;
    };
    // 불가능! 1개의 시그니처는 1개의 생성자만 가능하다.
    public Fruit(String from){ 
        this.from = from;
    };
}
```
책에서 표현된 시그니처란 **메소드명과 매개변수 타입**을 의미한다.  
일반적인 생성자는 동일한 시그니처가 존재하면 컴파일 자체가 불가능하다.  
  

**정적 팩터리 메서드**
```java
public class Fruit{
    String name;
    String from;

    public Fruit(){}
    // 정적 팩터리 메서드는 시그니처를 신경 쓰지 않는다!
    public static Fruit withName(String name){
        Fruit fruit = new Fruit();
        fruit.name = name;
        return fruit;
    };
    // 정적 팩터리 메서드는 시그니처를 신경 쓰지 않는다!
    public static Fruit withFrom(String from){
        Fruit fruit = new Fruit();
        fruit.from = from;
        return fruit;
    };
}
```
그러나 정적 팩터리 메서드를 사용하면 네이밍이 되기 때문에,  
시그니처를 고려할 필요 자체가 없어진다!  
  
  
## 👍 장점 2. 호출될 때마다 인스턴스를 새로 생성하지 않아도 된다.
- 인스턴스를 미리 만들어놓거나, 새로 생성한 인스턴스를 캐싱하여 재활용.
    - 플라이웨이트 패턴(Flyweight pattern)과 유사하게 객체가 이미 있으면 재활용, 없으면 생성.
- 이런 클래스를 **인스턴스 통제(instance-controlled) 클래스**라 한다.

### 인스턴스 통제 덕분에 싱글턴(singleton), 인스턴스화 불가(noninstantiable)가 보장된다.  
- 싱글턴(singleton): 1 클래스에 1 인스턴스만.
- 인스턴스화 불가(noninstantiable): 인스턴스를 추가로 생성하지 않도록.

```java
public final class Boolean implements java.io.Serializable, Comparable<Boolean>{
    public static final Boolean TRUE = new Boolean(true);
    public static final Boolean FALSE = new Boolean(false);

    // 이 때 TRUE와 FALSE는 이미 생성되어 있는 인스턴스를 리턴.
    public static Boolean valueOf(boolean b) {
        return (b ? TRUE : FALSE);
    }
    // 인스턴스 생성 비용이 클수록 성능향상 폭이 커진다.
}
```

## 👍 장점 3. 반환 타입의 하위 타입 객체를 반환할 수 있는 능력이 있다.
정적 팩터리 메서드의 네이밍을 통해 하위 클래스(상속-자식)의 타입으로 반환이 가능하다!  
또한 클라이언트는 타입을 모른다(알 필요가 없다).

```java
public interface Fruit {
    static Apple getApple(){
        return new Apple();
    }
    static Banana getBanana(){
        return new Banana();
    }
}

class Apple implements Fruit{}
class Banana implements Fruit{}
```

## 👍 장점 4. 입력 매개변수에 따라 매번 다른 클래스의 객체를 반환할 수 있다.
### 클라이언트는 정적 팩터리 메서드의 이름만 알 뿐, 어떤 객체가 반환되는지 모른다(알 필요가 없다).
```java
// 가장 대표적으로 사용되고 있는 EnumSet 예시.
public static <E extends Enum<E>> EnumSet<E> noneOf(Class<E> elementType){
    Enum<?>[] universe = getUniverse(elementType);
    if (universe == null)
        throw new ClassCastException(elementType + " not an enum");
    // 길이가 64 미만이면 RegularEnumSet, 이상이면 JumboEnumSet을 반화한다.
    if (universe.length <= 64)
        return new RegularEnumSet<>(elementType, universe);
    else
        return new JumboEnumSet<>(elementType, universe);
    // 물론 클라이언트는 Regular인지 Jumbo인지 모른다(알 필요가 없다).
}
```

### 장점 3,4를 응용하면 매개변수만으로 클래스를 자유롭게 선택 가능하다.
```java
    class Bascket {
        public static Fruit getFruit(String name) {
            if ("Apple".equals(name))
                return new Apple(name);
            else if ("Banana".equlas(name))
                return new Banana(name);
            else
                return new blablabla(name);
        }
    }
    // 매개변수로 객체의 클래스를 마음대로 선택!
    class Apple extends Fruit { }
    class Banana extends Fruit { }
    class blablabla extends Fruit { }
```


## 👍 장점 5. 정적 팩터리 메서드를 작성하는 시점에는 반환할 객체의 클래스가 없어도 된다.
나중에 만들 클래스가 기존의 인터페이스나 클래스를 상속 받는다면, 언제든지 의존성을 주입 받아서 사용 가능하다.  
... 라곤 하는데 장점 5번은 아직 잘 와닿는 부분이 없다.  
이펙티브 자바를 더 많이 읽어본 후 다시 돌아와서 이해가 필요할듯.  

## 👎 단점 1. 정적 팩토리 메서드만 제공하면 하위 클래스를 만들 수 없다.
- 상속(하위 클래스 생성)을 위해선 public 혹은 protected 생성자가 필요하다.
- 정적 팩토리 메서드만 제공하기 위해 private 생성자만 사용하면 상속이 불가능하다.

## 👎 단점 2. 정적 팩터리 메서드는 찾기 어렵다.
- 일반적인 생성자처럼 API 설명에 명확히 드러나지 않는다.
- 인스턴스를 생성해주는 메서드를 직접 찾아내야 한다.
- 그렇기 때문에 널리 알려진 규약에 따라 메서드를 명명해야 한다.

### 널리, 그리고 자주 사용되는 명명법

|메서드명|내용|예시|
|:---:|---|---|
|from|매개변수를 하나 받아서 해당 타입의 인스턴스를 반환하는 형변환 메서드|Date d = Date.from(instant);|
|of|여러 매개변수를 받아 적합한 타입의 인스턴스를 반환하는 집계 메서드|Set<Rank> faceCards - EnumSet.of(JACK, QUEEN, KING);|
|valueOf|from과 of의 더 자세한 버전|BigInteger prime = BigInteger.valueOf(Integer.MAX_VALUE);|
|instance, getInstance|(매개변수를 받는다면)명시한 인스턴스를 반환, 같은 인스턴스임을 보장하지는 않는다.|StackWalker luke = StackWalker.getInstance(options);|
|create, newInstance|instance 혹은 getInstance와 같지만, 매번 새로운 인스턴스를 생성해 반환함을 보장|Object newArray = Array.newInstance(classObject, arrayLen);|
|getType|getInstance와 같으나, 생성할 클래스가 아닌 다른 클래스에 팩터리 메서드를 정의할 때 쓴다. Type은 팩터리 메서드가 반환할 객체의 타입이다.|FileStore fs = Files.getFileStore(path);|
|newType|newInstance와 같으나, 생성할 클래스가 아닌 다른 클래스에 팩터리 메서드를 정의할 때 쓴다. Type은 팩터리 메서드가 반환할 객체의 타입이다.|BufferedReader br = Files.newBufferedReader(path);|
|type|getType과 newType 축소버전|List<Complaint> litany = Collections.list(legacyLitany);|


## 핵심 정리
> 정적 팩터리 메서드와 public 생성자는 각자의 쓰임새가 있으니, 장단점을 이해하고 활용할 것.  
> 그러나 대부분의 경우 정적 팩터리 메서드가 유리하니, 정적 팩터리 메서드를 생활화 하자.
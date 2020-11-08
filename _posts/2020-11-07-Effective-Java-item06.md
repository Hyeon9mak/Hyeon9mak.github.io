---
title: "[Effective-Java] 아이템 6. 불필요한 객체 생성을 피하라"
date: 2020-11-07 23:05:38
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
toc_label: "아이템 6. 불필요한 객체 생성을 피하라"
---
전체적인 스터디 내용은 [JunHyeok96/effective-java](https://github.com/JunHyeok96/effective-java)에서 확인 가능!  

## 💡 String 객체 생성 패턴
```java
    String s = new String("bikini"); // 문자열 new 생성자 사용 방식
```
책에선 위와 같은 String객체 생성을 저어어얼대 해선 안된다고 한다.
왜 위 같이 String객체를 생성하면 안된다고 하는 것일까? 이유는 크게 두 가지가 있다.

---

### 이유 1. 생성자 매개변수로 넘겨진 "bikini"와, 생성된 객체s의 기능이 완전히 동일하다.

![image](https://user-images.githubusercontent.com/37354145/98439869-28b88a80-2138-11eb-9af8-e02c7dbe6f74.png){: .align-center}
Java 관련 어시스트 기능을 제공하는 IDE에서 위와 같은 코드를 작성하면 부적절(불필요)하다는 알림이 뜰 정도.
  

### 이유 2. 만일 해당 코드가 루프안에 속할 경우, 루프 횟수만큼 인스턴스가 생성된다.

![image](https://user-images.githubusercontent.com/37354145/98439872-2bb37b00-2138-11eb-9c99-53d3e9a34100.png){: .align-center}
*(String 객체는 주소 출력이 어려워서, 따로 객체를 만들어서 테스트를 진행했다.)*  
루프가 반복될 때마다 인스턴스가 새로 생성된다는 것을 확인할 수 있다.  
  
---
### 불필요한 String 객체 생성을 막는 방법
```java
    String s = "bikini";  // 문자열 리터럴 생성 방식
```
저자가 권장하는 형태. 이미 생성된 객체(인스턴스)를 재활용 하라는 뜻이다.  
하나의 String 인스턴스만 사용하는 것을 보장할 수 있다.  

## 💡 정적 팩터리 메서드를 활용하지 않은 생성 패턴
[생성자 대신 정적 팩터리 매서드(아이템 1)](https://hyeon9mak.github.io/effective-java/Effective-Java-item01/)를 
제공하는 불변 클래스에서는 불필요한 객체 생성을 피할 수 있다. (즉, 어차피 new 생성자가 사용되지 않으므로 객체 재활용 보장)  
대표적인 예시로, 자바 9에서는 Boolean(String) 생성자 대신 **Boolean.valueOf(String) 팩터리 메서드를 사용하도록 권장**되고 있다.

![image](https://user-images.githubusercontent.com/37354145/98465868-58869180-220f-11eb-8488-21dc9f3697a7.png){: .align-center}

실제 테스트를 진행해보면, **"생성자를 사용하는 것은 적절치 않으며, valueOf 메서드나 static 필드 TRUE, FALSE 형태로 사용하라."** 라고 제안 되고 있다.

![image](https://user-images.githubusercontent.com/37354145/98466079-9932da80-2210-11eb-9ee9-76ac18e0e6fb.png){: .align-center}
*따라서 위와 같이 사용하는 것이 바람직하다.*

## 💡 보이지는 않지만 실제로 객체가 생성되고 비용이 큰 패턴
아래는 문자열이 로마 숫자인지 확인하는 메서드다.
```java
static boolean isRomanNumeral(String s){
    return s.matches("^(?=.)M*(C[MD]|D?C{0,3})"
                + "(X[CL]|L?X{0,3})(I[XV]|V?I{0,3})$");
}
```
정규표현식을 제외하고 **String.matches**만 살펴보면, 굉장히 쉽고 간단하게 느껴진다. 
심지어 루프를 돌려도 안전할 것 같다.  
그러나, 실제 String.matches 메서드의 내부를 살펴보면 아래와 같다.

```java
public static boolean matches(String regex, CharSequence input) {
  Pattern p = Pattern.compile(regex);
  Matcher m = p.matcher(input);
  return m.matches();
}

public static Pattern compile(String regex) {
	return new Pattern(regex, 0);   // <-- new 생성자
}
```
String.matches 내부에서 Pattern 객체로 compile 메서드를 호출하고 있으며, 
compile 메서드 내부에서는 **Pattern 객체를 new 생성자로 생성**하고 있다.  
isRomanNumeral 메서드가 루프에 포함된다면, **매 루프마다 Pattern 객체가 생성된다. 그리고 그 객체는 곧바로 버려져 GC의 대상**이 되어 오버헤드가 점점 커진다.  
  
---

```java
public class RomanNumerals{
    private static final Pattern ROMAN = pattern.compile(
        "^(?=.)M*(C[MD]|D?C{0,3})"
        + "(X[CL]|L?X{0,3})(I[XV]|V?I{0,3})$");
    
    static boolean isRomanNumeral(String s){
        return ROMAN.matcher(s).matches();
    }
}
```
mathces 메서드의 오버헤드를 줄이기 위해선 위와 같이 Pattern 인스턴스를 정적 초기화 해두고(캐싱) 활용한다. 
Pattern 객체 compile 메서드가 1회만 사용됨이 확실하기 때문에, 인스턴스 재활용 또한 보장된다.  
또한 개선 전에는 **존재조차 몰랐던 Pattern 인스턴스의 존재**를 static final 필드로 정적 초기화해서 
이름까지 지어주었으므로 코드의 의미가 훨씬 잘 드러나게 된다.  
  
---

책에선 정성껏 정적 초기화한 isRomanNumberals 메서드가 한 번도 호출되지 않는 낭비를 방지하기 위해 지연 초기화
(Lazy Initialization, 아이템 83) 방식을 이야기한다.  
  
**지연 초기화(Lazy Initialization, 아이템 83) 예시**
```java
    // 객체 필드 일반적인 초기화
    private final Field field = something();

    // 객체 필드 지연 초기화
    private Field field;

    private synchronized Field getField() {
    if (field == null) {
        field = something();
    }
    return field;
  }
```
그러나 결론적으로 지연 초기화를 추천하지 않는다.  
성능은 크게 개선되지 않고 코드만 복잡해지는 경우가 많기 때문이다.  

## 💡 어댑터(Adapter) 패턴을 이용한 객체 생성
객체가 불변이라면 재사용해도 안전함이 명백하다. 하지만 [어댑터(Adapter) 패턴](https://blog.seotory.com/post/2017/09/java-adapter-pattern)을 예로 생각해보면 
명확하지 않거나, 안전해보이지만 안전하지 않은 경우도 있다. (반대의 경우도)  
어댑터 객체는 실제 작업을 뒷단 객체에 위임하고, 자신은 뷰(view) 역할을 하는 객체다.  
  
책에 등장한 예시 Map과 keySet을 이용해 살펴보자.
```java
    Map<Integer, String> map = new HashMap<>();
    map.put(1, "hello");
    map.put(2, "my name is");
    map.put(3, "9");

    Set<Integer> keySet1 = map.keySet();
```
keySet() 메서드는 Map 객체 안의 key들을 모두 담은 객체를 반환한다.  
그렇기 때문에 Map 객체 내부의 원소를 바꾸고 keySet() 메서드를 다시 사용하면 
완전히 다른 Set 인스턴스가 생성될 것 같지만, 실제로는 같은 Set 인스턴스를 반환한다.  
```java
    Map<Integer, String> map = new HashMap<>();
    map.put(1, "hello");
    map.put(2, "my name is");
    map.put(3, "9");

    Set<Integer> keySet1 = map.keySet();

    System.out.println("map 출력 :" + map);
    System.out.println("keySet1 출력 :" + keySet1);


    map.remove(3);
    Set<Integer> keySet2 = map.keySet();
    System.out.println("map 출력 :" + map);
    System.out.println("keySet1 출력 :" + keySet1);
    System.out.println("keySet2 출력 :" + keySet2);

    keySet1.remove(2);
    Set<Integer> keySet3 = map.keySet();
    System.out.println("map 출력 :" + map);
    System.out.println("keySet1 출력 :" + keySet1);
    System.out.println("keySet2 출력 :" + keySet2);
    System.out.println("keySet3 출력 :" + keySet3);
    
    /*
    map 출력 :{1=hello, 2=my name is, 3=9}
    keySet1 출력 :[1, 2, 3]
    map 출력 :{1=hello, 2=my name is}
    keySet1 출력 :[1, 2]
    keySet2 출력 :[1, 2]
    map 출력 :{1=hello}
    keySet1 출력 :[1]
    keySet2 출력 :[1]
    keySet3 출력 :[1]
    */
```
따라서 keySet이 여러 개 만들어져도 상관은 없지만, 낭비에 불과하다.

## 💡 오토박싱(auto boxing)을 통한 객체 사용
오토박싱(auto boxing)은 기본 타입과 참조 타입을 자동으로 상호 변환해주는 기술이다.
  
**기본 타입 (Primitive Type)**
- int
- long
- short
- double
- char
- boolean

**참조 타입 (Reference Type)**
- String
- Integer
- Long
- Double
- Boolean

오토박싱은 프로그래머에게 어마어마한 편의를 가져다주었지만, 성능에서는 크리티컬한 문제를 초래하곤 한다.  
```java
private static long sum(){
	Long sum = 0L;
	for(long i = 0; i <= Integer.MAX_VALUE; i++){
		sum += i;
	}
	return sum;
}
```
위 코드는 올바르게 동작하긴 하나, sum변수에 의해 성능이 크게 저하된 상태다.  
**long 타입인 i가 더해질 때 마다 long->Long 오토박싱이 매 루프마다 발생**된다.  
따라서 **되도록 참조 타입보다는 기본 타입을 사용**하고, **의도치 않은 오토박싱에 주의**해야한다.

---

## 🤔 아이템 6을 끝내기 전에 짚고 넘어가야할 점
이번 장에서 객체 생성을 최소화 하고, 재활용을 최대화 하기 위해 잘못된 객체 생성 케이스들을 살펴봤다. 
그러나 아이템 6의 마지막 부분에서는 오히려 객체의 방어적 복사(defensive copy, 아이템 50)를 장려하고 있다.

> 이번 아이템을 "객체 생성은 비싸니 피해야한다"로 오해하면 안 된다.  
> 특히나 요즘의 JVM은 성능이 좋아 작은 객체를 생성하고 회수하는데 큰 부담이 없다.  
> 프로그램의 명확성, 간결성, 기능을 위해 객체를 추가 생성하는 것은 일반적으로 좋은 일이다.  

또한, 객체 생성을 막고 재활용하는 '임의의 패턴'에 대해 극도로 반대하고 있다.  

> 추가 생성 비용이 큰 객체가 아니라면, 어줍잖은 풀(패턴)을 만들지 마라.  
> 일반적으로 자체적으로 만든 풀(패턴)은 코드를 헷갈리게 만들고, 메모리 사용량을 늘리며 성능을 떨어뜨린다.  
> 심지어 요즘 JVM GC는 잘못된 풀(패턴)이 적용된 코드보다 훨씬 더 빠르다.  

결론적으로 방어적 복사(아이템 50)과 객체 재활용(아이템 6)의 단점, 문제점을 비교해보면  
**아이템 50은 그저 코드 형태와 성능에만 영향을 주는 수준**이고,  
**아이템 6은 언제 터질지 모르는 버그와 보안 구멍이 생기는 수준**이다.  
  
아이템 50과 6 모두 장단이 있지만, 일반적으로 아이템 50을 따르는 것이 
훨씬 안전하다는 것을 염두에 둔채로 아이템 6은 가볍게 이해하고 넘어가는 것이 좋겠다.  

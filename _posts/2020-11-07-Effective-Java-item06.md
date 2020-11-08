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

## 🤔 아이템 6을 읽기 전에 짚고 넘어가야할 점

> 이번 아이템은 방어적 복사(defensive copy)를 다루는 아이템 50과 대조적이다.

책의 저자는 아이템 6의 가장 마지막 부분에, 위와 같은 설명을 덧붙였다.
한 책에서 서로 대조되는 이야기를 굳이 다루는 이유는 무엇일까?  
우선 방어적 복사(아이템 50)과 객체 재활용(아이템 6)의 문제점을 비교해보면  
**아이템 50의 문제점은 그저 코드 형태와 성능에만 영향을 주는 수준**이고,  
**아이템 6의 문제점은 언제 터질지 모르는 버그와 보안 구멍이 생기는 수준**이다.  
  
아이템 50과 6 모두 장단이 있지만, 일반적으로 아이템 50을 따르는 것이 훨씬 안전하다는 것을 염두에 둔채로 
아이템 6은 가볍게 이해하고 넘어가는 것이 좋겠다.  

## 💡 절대 하지 말아야하는 String 객체 생성 패턴
```java
    String s = new String("bikini"); // 문자열 new 생성자 사용 방식
```
책에선 위와 같은 객체 생성을 저어어얼대 해선 안된다고 한다.
왜 위 같이 객체를 생성하면 안된다고 하는 것일까? 이유는 크게 두 가지가 있다.

---

### 이유 1. 생성자의 매개변수로 넘겨진 "bikini"와, 생성된 객체s의 기능이 완전히 동일하다.

![image](https://user-images.githubusercontent.com/37354145/98439869-28b88a80-2138-11eb-9af8-e02c7dbe6f74.png){: .align-center}
Java 관련 어시스트 기능을 제공하는 IDE에서 위와 같은 코드를 작성하면 부적절(불필요)하다는 알림이 뜰 정도.
  

### 이유 2. 만일 해당 코드가 루프안에 속할 경우, 루프 횟수만큼 인스턴스가 생성된다.

![image](https://user-images.githubusercontent.com/37354145/98439872-2bb37b00-2138-11eb-9c99-53d3e9a34100.png){: .align-center}
*(String 객체는 주소 출력이 어려워서, 따로 객체를 만들어서 테스트를 진행했다.)*  
루프가 반복될 때마다 인스턴스가 새로 생성된다는 것을 확인할 수 있다.  
  
---
### 루프 속에서도 불필요한 객체 생성을 막는 방식은?
```java
    String s = "bikini";  // 문자열 리터럴 생성 방식
```
저자가 권장하는 형태. 이미 생성된 객체(인스턴스)를 재활용 하라는 뜻이다.  
하나의 String 인스턴스만 사용하는 것을 보장할 수 있다.  

## 💡 아이템 1을 잘 활용하면 객체 생성 패턴을 고민 할 필요가 없다.
[생성자 대신 정적 팩터리 매서드(아이템 1)](https://hyeon9mak.github.io/effective-java/Effective-Java-item01/)를 
제공하는 불변 클래스에서는 불필요한 객체 생성을 피할 수 있다. (즉, 어차피 new 생성자가 사용되지 않으므로 객체 재활용 보장)  
대표적인 예시로, 자바 9에서는 Boolean(String) 생성자 대신 **Boolean.valueOf(String) 팩터리 메서드를 사용하도록 권장**되고 있다.

![image](https://user-images.githubusercontent.com/37354145/98465868-58869180-220f-11eb-8488-21dc9f3697a7.png){: .align-center}

실제 테스트를 진행해보면, **"생성자를 사용하는 것은 적절치 않으며, valueOf 메서드나 static 필드 TRUE, FALSE 형태로 사용하라."** 라고 제안 되고 있다.

![image](https://user-images.githubusercontent.com/37354145/98466079-9932da80-2210-11eb-9ee9-76ac18e0e6fb.png){: .align-center}
*따라서 위와 같이 사용하는 것이 바람직하다.*

## 💡 생성 비용이 비싼 객체에 안성맞춤이다.
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
isRomanNumeral 메서드가 루프에 포함된다면, **매 루프마다 Pattern 객체가 생성되고 곧바로 버려져 GC의 대상**이 되어 오버헤드가 점점 커진다.  
  
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

가변 클래스여도 사용 도중에 변하지 않음을 알고 있다면? 
당연히 이역시도 불필요한 객체 생성을 피할 수 있다.

> 이번 아이템을 "객체 생성은 비싸니 피해야한다"로 오해하면 안 된다. 
> 특히나 요즘의 JVM은 성능이 좋아 작은 객체를 생성하고 회수하는데 큰 부담이 없다. 
> 프로그램의 명확성, 간결성, 기능을 위해 객체를 추가 생성하는 것은 일반적으로 좋은 일이다.  
>  
> 추가 생성 비용이 큰 객체가 아니라면, 어줍잖은 풀(패턴)을 만들지 마라. 
> 일반적으로 자체적으로 만든 풀(패턴)은 코드를 헷갈리게 만들고, 메모리 사용량을 늘리며 성능을 떨어뜨린다. 
> 심지어 요즘 JVM GC는 잘못된 풀(패턴)이 적용된 코드보다 훨씬 더 빠르다.  
>  

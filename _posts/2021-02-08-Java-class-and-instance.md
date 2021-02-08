---
title: "Java class와 instance"
date: 2021-02-08
tags:
    - Java
    - 우아한테크코스
toc: true
toc_sticky: true
toc_label: "Java class와 instance"
---

제이슨의 **class와 instance** 강의를 들으면서 공부한 내용을 정리해보자.
{: .notice}

## class, intance
> 지금까지 우리가 구현한 메서드와 필드가 클래스 메서드와 필드 아닌가?   
> 지금까지 우리가 구현한 메서드와 필드는 인스턴스 메서드와 인스턴스 필드이다.

---

- 클래스: 인스턴스를 생성하기 위한 틀(template). 클래스 자체만으로는 상태가 없다.

- 인스턴스(단수 의미로 객체): 클래스를 통해 실체화되어 생성된다. 인스턴스는 상태를 가지며, 메서드를 통해 인스턴스의 상태가 변경된다.

- [객체지향 개념 (쫌 아는체 하기)를 참고하면 좋다.](https://www.slideshare.net/plusjune/ss-46109239?qid=0b8c67e2-c463-4e75-8c77-4ea675a74626)  
  (34페이지부터 클래스와 객체 차이를 설명하고 있다.)

---

생성된 인스턴스는 상태를 가지고, 메서드를 통해 행위(상태의 변화)를 일으킨다.

"나는 **2021년(속성1)** 에 **Apple사(속성2)** 에서 출시한 **16인치(속성3)** **랩탑(class)** 을 갖고 있다. 
어제까진 **미개봉된 새제품(속성4)** 이었지만, 오늘 **뜯어서(속성4의 변화, 행위)** 만지기 시작했다."  
  
`랩탑`을 class, `MacBook 2021년형 16인치`를 instance로 생각하면 이해가 쉬울 것 같다.

<br>

## class method, class field
**class method**  
instance의 상태(state)와는 관련이 없다. 
instance를 생성하지 않은 상태에서도 호출이 가능하다. 
class method는 보통 **Utility method**라고 부른다.  
  
**class field**  
여러 instance에서 공유하는 정보가 있는 경우 사용한다.

<br>

## instance method, instance field
**instance method**  
instance의 state를 변경하거나 상태 정보를 반환할 때 사용. 
instance를 생성한 후 메시지를 보낼(method를 호출) 수 있다.  
  
**instance field**  
instance의 state 정보를 가지고 있는 변수. state variable 라고도 이야기한다.

<br>

## private constructor
static으로만 이루어진 클래스(Utility class)는 대게 생성자(instance화)를 막는다.

```java
public class DateUtils {
    private DateUtils() {}
    
    public static Date createDate   // static factory method
        (int year, int month, int date) {
        Calendar calendar = Calendar.getInstance();
        calendar.clear();
        calendar.set(year, month - 1, date);
        return calendar.getTime();
    }
}
```

Java 는 자동으로 기본 생성자를 제공하기 때문에, private 접근제한자를 통해 
인스턴스화를 직접 막아주어야 한다.  
  
제이슨이 **"왜 이런 class들은 instance화를 하면 안될까? 왜 state를 가지면 안될까?"** 라고 질문을 던져주었는데... 
솔직히 질문의 의도를 이해하지 못했다. 
애당초 Utility class는 static 멤버들로만 이루어진 
class를 구현하고 싶어서 만드는 것 아닌가? 
instance화 시키지 않고 사용하고 싶어서 만든 class에 instance화를 막아야할 이유를 생각해보라니...
{: .notice}

<br>

## Constructor chaining
```java
public Car(final String name) {
    this(0, name);
}

public Car(final int number) {
    this(number, "ferrari");
}

public Car(final int number, final String name){
    this.number = number;
    this.name = name;
}
```

생성자의 파라미터 개수가 차이날 때 `this()`를 이용해서 연결시키는 방법.  
  
체이닝 생성자끼리는 시그니처를 통해 구분한다.


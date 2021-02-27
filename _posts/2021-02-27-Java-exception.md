---
title: "Java Exception"
date: 2021-02-27
tags:
- Java
- 우아한테크코스
toc: true
toc_sticky: true
toc_label: "Java Exception"
---

제이슨의 **Exception** 강의를 들으면서 공부한 내용을 정리해보자.
{: .notice}

## Exception 상속 구조
![image](https://user-images.githubusercontent.com/37354145/109377460-ea292480-790e-11eb-87bf-7e22e59ccce9.png)

자바의 `Exception`은 위와 같은 상속 구조를 가진다. 
여기서 `RuntimeException`을 제외한 `Exception`을 상속하는 모든 예외는 `Checked Exception`으로 분류된다. 
`RuntimeException`을 상속하는 예외들은 모두 `Unchecked Exception`으로 분류된다.

<br>

## Checked Exception
- Checked Exception 또는 Compile Time Exception 이라고 부름
- 컴파일 시점에 Exception을 확인한다. 컴파일 시점에 Exception에 대한 처리(try/catch)를 수행하지 않을 경우
 컴파일 에러를 발생시킨다.
- Exception이 발생하는 메서드에서 `throws` 예약어를 활용해 호출 메서드에게 Exception을 넘겨야 한다.
- 메서드 마지막에 무조건 `throws` 예외처리명을 붙여주어야 한다.

---

Checked Exception은 굉장히 빡빡하다. 안전하다고도 느낄 수 있다. 컴파일 단계에서부터 모든 에러와 예외를 
대비하고 있다. API를 사용하는 개발자에게 "예외 발생시 책임은 너에게 있다." 라고 압박을 주는 것만 같다. 
단점이라면 **방어코드가 포함되어 있음을 알려줌과 동시에 내부 구현에 대한 힌트**까지 제공된다. (Exception을 종류에 따른 유추)  

## Unchecked Exception
- Runtime Time Exception 이라고도 부른다.
- 컴파일 시점에 Exception을 catch하는지 확인하지 않는다. 
  컴파일 시점에 Exception이 발생할 것인지의 여부를 판단할 수 없다.
- Exception이 발생하는 메소드에서 `throws` 예약어를 활용해 Exception을 처리할 필요가 없다. 
  하지만 처리해도 무방하다.

---

Unchecked Exception은 굉장히 느슨하다. 이래도 되나 싶다. 컴파일 단계에선 별 관심이 없고 런타임 단계에서야 
예외를 잡아낸다. 마치 "예외 발생시 책임은 사용자에게 있다." 라고 말하는 것 같다.  

Checked Exception과 Unchecked Exception을 일상생활에 비유하자면 아래와 같다.

Checked Exception : 구급차 미리 불러둬, 사고가 날 수도 있어!  
Unchecked Exception : 설레발 치지마. 사고 난 후에 구급차 불러도 안늦어.

<br>

## 그래서, Checked랑 Unchecked 중에 뭘 쓰라고?
최대한 안전한 기능을 제공해야하는 API개발자라면 Checked Exception을 고려하는게 좋지만,
서비스를 개발하는 개발자, 특히 Spring을 사용하는 개발자라면 최상단(main)에서 모든 예외를 핸들링 할 수 있는
코드(Global Exception Hadling)이 있어 모든 예외를 다 잡아낼 수 있으므로, Unchecked Exception을 고려하는 것이 좋다.
Unchecked Excpetion을 통해 더 깔끔하고 보기 좋은 코드를 작성할 수 있기 때문이다.

최신 언어들은 "작성해야할 코드만 늘어난다.", "그냥 최상단에서 Unchecked Exception으로 다 잡으면 되는데 굳이?" 라는 이유로
Checked Exception을 제공하지 않는다고 한다.

선택은 자신의 몫이다.

<br>

## catch 파라미터에도 final
`catch` 키워드가 핸들링하는 exception 인자 앞에도 `final` 키워드를 붙일 수 있다.

```java
public class Application {
    public static void main(String[] args) {
        try {
            final LottoNumber lottoNumber = LottoNumber.from(1);
        } catch (final CustomException e) {
            ...
        }
    }
}
```

<br>

## throws 로 책임 전가시키기
`throws` 키워드를 통해 예외 책임을 전가시킬 수 있다.

```java
public class Application {
    public static void main(String[] args) throws CustomException {
        try {
            final LottoNumber lottoNumber = LottoNumber.from(1);
        } catch (final CustomException e) {
            ...
        }
    }
}
```

책임을 전가시키면 해당 메서드를 호출한 상위 메서드에게 책임이 넘어간다.  
  
최상위 메서드인 `main` 메서드가 책임을 전가시키면 누구에게 넘어갈까? 
바로 `main` 메서드 호출자인 JVM(Java Virtual Machine)에게 넘어간다.

<br>

## CustomException을 Exception으로 대체
`CustomException` 자리를 `Exception`으로 대체 할 수 있다.

```java
public class Application {
    public static void main(String[] args) throws Exception {
        try {
            final LottoNumber lottoNumber = LottoNumber.from(1);
        } catch (final Exception e) {
            ...
        }
    }
}
```

왜? `Exception`은 `CustomException`의 부모니까!  
여러개의 커스텀 예외처리를 동시에 처리하고 싶을 때 이런 방식을 사용하면 좋다.

<br>

## catch 키워드에도 OR 가능
자바 7 버전부터 `catch` 키워드 하나에 여러가지 Exception들을 명시할 수 있게 되었다.
```java
    try {
        doSomeThing();
    } catch (final RuntimeException | CustomException e) {
        e.doSomeThing();
    }
```

그러나 상속 관계에 있는 Exception 끼리는 명시가 불가능함을 주의하자.

```java
    try {
        doSomeThing();
    } catch (final Exception | CustomException e) {  // 컴파일 에러!
        e.doSomeThing();
    }
```

<br>

## Exception 은 if-else 와 구조가 같다
```java
    try {
        doSomeThing();
    } catch (final Exception e) {
        e.doSomeThing();
    } catch (final CustomException e) {
        e.doSomeThing();
    }
```

`CustomException`이 던져졌을 때, 위 코드의 순서대로라면 `Exception` 단계에서 
`CustomException`을 처리한다. 그래서 `try-catch` 키워드도 `if-else` 키워드처럼 
순서를 명확하게 지정해 줄 필요가 있다.  
  
또한 `catch` 키워드는 같은 스코프에 속한 `catch`가 `throw new` 를 통해 던진 예외를 잡아내지 못한다.

```java
    try {
        doSomeThing();
    } catch (final Exception e) {
        throw new IllegalArgumentException();
    } catch (final IllegalArgumentException e) {
        // 위에서 던진 IllegalArgumentException 예외를 못 잡아낸다.
    }
```

상위 스코프의 `catch` 키워드에서는 해당 예외를 잡아낼 수 있다.

```java
    try {
        try {
            doSomeThing();
        } catch (final Exception e) {
            throw new IllegalArgumentException();
        } catch (final IllegalArgumentException e) {
            // 위에서 던진 IllegalArgumentException 예외를 못 잡아낸다.
        }
    } catch (final IllegalArgumentException e) {
        // 여기서 잡아낸다.
    }
```

<br>

## IllegalArgumentException, IllegalStateException
`IllegalArgumentException`는  사용자가 값을 잘못 입력한 경우 발생한다. 
예를 들면 **로또번호 1~45를 입력 받는 로직에서 사용자가 0 혹은 46을 입력한 경우**가 있다. 
즉, 사용자의 잘못으로 발생하는 에러를 대표한다.

`IllegalStateException`은 사용자가 값을 제대로 입력했지만, 개발자 코드가 값을 처리할 준비가 안된 경우 발생한다. 
예를 들면 **로또 게임 진행 후 로또게임이 종료된 상태에서 사용자가 추가 진행을 위해 금액을 입력하는 경우**. 
이미 로또게임 로직은 종료되었기 때문에 사용자의 입력에 대응할 수가 없다. 이런 경우 `IllegalStateException`이 발생한다.

<br>

## CustomException을 꼭 써야하는가?
제이슨이 "Custom Exception과 Legacy Exception 중 어느쪽을 더 지향해야할까요?" 라는 질문을 던졌다.

> **샐리**  
>  굳이? 이미 존재하는 Legacy Exception 들로도 충분한 메세지 전달이 가능하지 않을까요?  
>   
> **손너잘**  
> CustomException의 네이밍을 통해서 catch 키워드 내부 쪽 가독성을 높일 수 있어서 쓰는게 더 좋은거 같아요.
>   
> **제리**  
> 많은 개발자들이 Legacy Exception에 더 익숙하니까, 그게 더 가독성을 높이는 일 아닐까요? 
> 게다가, 어차피 Unchecked Exception을 사용하면 catch 키워드 자체를 쓸 일이 많지 않을 것 같아요.

일단 제이슨이 질문을 던질 땐 **정답이 없는 질문**을 던지는 경우가 많다. 
그러므로 CustomException 사용 이슈 역시 정답이 없는 문제일 것이라는게 짐작이 가능하다.  
  
나는 포비가 알려주신 자바 API와 같이 "최대한 있는 걸(Legacy Exception) 사용하고, 
도저히 찾아봐도 없으면 그 때 (Custom Exception을) 만들자" 라는 의견을 가지고 있다.

쉬운게 없다.
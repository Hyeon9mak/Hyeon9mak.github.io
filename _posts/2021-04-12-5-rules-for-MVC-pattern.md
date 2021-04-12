---
title: "MVC 패턴이 지켜지는 5가지 규칙"
date: 2021-04-12
tags:
    - design pattern
toc: true
toc_sticky: true
toc_label: "MVC 패턴이 지켜지는 5가지 규칙"
---

![994F5D3A5E3937B014](https://user-images.githubusercontent.com/37354145/114290960-80c83400-9abe-11eb-8caa-ea7bcadd5b0b.gif)

[박재성의 의지를 이어나가고 있는 제리](https://github.com/jaeseongDev) 가 
테코톡에서 발표한 "MVC 패턴이 지켜지는 5가지 규칙"을 정리해보자!

## 🐭 MVC 패턴 맛보기
![image](https://user-images.githubusercontent.com/37354145/114352065-5ea9e100-9ba6-11eb-82eb-5491c98771d3.png)

MVC 패턴이 지켜지는 규칙을 알아보기 전에, MVC 패턴의 구조를 맛보기로 간단하게 살펴보자.

---

1. `사용자`가 `View`에게 맛집 검색을 요청한다.
2. `View`가 `Controller`에게 맛집 검색 요청을 전달한다.
3. `Controller`가 `Model`에게 맛집 검색 데이터를 요청한다.
4. `Model`이 `Controller`에게 검색 결과를 반환한다.
5. `Controller`가 `View`에게 검색 결과를 돌려준다.
6. `View`가 `사용자`에게 검색 결과를 보여준다.

---

위와 같이 MVC 패턴은 철저하게 Model, View, Controller의 역할을 나누어, 사용자에게 View만 노출시키고
핵심 로직은 Model 쪽에 숨겨놓는 구조를 가지고 있다.

도대체 이런 패턴은 왜 생겨난 것이며, 무엇에 장점이 있길레 널리 사용되고 있는걸까?
제리의 말에 따르면, 탄생 배경과 역사를 살펴보면 그 이유를 알 수 있다고 한다.

<br>

## 🐭 MVC 패턴과 탄생 배경
객체지향 프로그래밍의 큰 축을 담당하고 있는 MVC 디자인 패턴. MVC 패턴은 어떻게 탄생 했을까?

MVC 패턴이 탄생하기 전엔 코드의 유지보수가 굉장히 어려웠다고 한다. 소프트웨어 산업이 발달 할수록 
백지상태에서 새로운 코드를 작성하는 것보다 기존 레거시 코드를 보완하는 일이 더 많아지는데, 그게 어렵다!

![image](https://user-images.githubusercontent.com/37354145/114358577-0545b000-9bae-11eb-916f-ddca46cebee3.png)


이 때문에 개발자들은 끊임없이 유지보수가 용이한 코드 작성을 갈구했고, "이렇게 하다보니 유지보수가 편하더라"를 모아 
[하나의 공식처럼 만들어서 논문으로 발표한게 바로 MVC 패턴](https://folk.universitetetioslo.no/trygver/themes/mvc/mvc-index.html)
이다.

즉, MVC 패턴은 유지보수가 편해지는 코드 구성 방식이다.

이토록 좋은 MVC 패턴이지만 대부분의 MVC 패턴 관련 글에선 추상적인 이야기만 할 뿐,  '~해라, ~하지 말아라' 같은 직접적인 규칙들은
상세히 알려주지 않는다. 그래서 제리가 속 시원하게 MVC 패턴이 자동으로 지켜지는 5가지 규칙을 정리해주었다.
아직 MVC 패턴에 익숙하지 않다면 제리가 제시한 5가지 규칙을 따르면서 프로그래밍을 해보자.

<br>

## 🐭 MVC 패턴이 자동으로 지켜지는 규칙 5가지
### 1. Model은 Controller와 View에 의존하지 않아야 한다.

```java
public class Student {
	private final String name;
	private final int age;

	public Student(final String name, final int age) {
		this.name = name;
		this.age = age;
	}

	public String getName() {
		return name;
	}

	public int getAge() {
		return age;
	}
}
```

`Student`객체는 자신이 갖고 있는 `name`, `age` 정보를 알려줄 순 있지만, 
그 정보들이 View로 가는지, Controller에서 어떻게 사용되는지 절대 몰라야 한다. 
즉, **Controller, View 관련 코드가 있으면 안된다.**

---

### 2. View는 Model에만 의존해야하고, Controller에는 의존하면 안된다.

```java
public class OutputView {
	public void printProfile(final Student student) {
		System.out.println("내 이름은" + student.getName() + "입니다.");
		System.out.println("내 나이는" + student.getAge() + "입니다.");
	}
}
```

View 내부에서는 Model과 관련된 코드(객체의 메서드)가 있을 수 있지만, Controller 관련 코드가 있으면 안 된다.

---

### 3. View 가 Model 로부터 데이터를 받을 때는, 사용자마다 다르게 보여주어야하는 데이터만 받아야 한다.
![image](https://user-images.githubusercontent.com/37354145/114355423-6bc8cf00-9baa-11eb-9e22-1d699645679f.png)

위 그림에서 좌/우 사용자들에게 공통으로 보이는 부분과 다르게 보이는 부분들을 기억해보자.
공통으로 보이는 부분은 View 코드로만 처리해주는 것이 바람직하고, 서로 다르게 보이는 부분들은 Model에서 가져와서 보여주는 것이 
바람직하다.

![image](https://user-images.githubusercontent.com/37354145/114355445-71261980-9baa-11eb-9075-578bc613aeb2.png)

코드를 통해서 더 자세히 살펴보자.

```java
public class Car {
	private static final String ONE_STEP = "-";

	public Result move() {
		...
		OutputView.printResult(ONE_STEP);
		return result;
	}
}

public class OutputView {
	public static void printResult(final String step) {
		System.out.println(step);
	}
}
```

위의 코드에선 Model에 대항하는 `Car` 객체가 자동차의 이동 표현 문자인 `ONE_STEP`을 가지고 있다. 
`ONE_STEP`은 철수의 자동차, 영희의 자동차, 현구의 자동차에 상관 없이 모든 자동차가 공통으로 사용하는 출력 양식이다. 
이와 같은 구조에서 프로그램이 동작하는덴 문제가 없지만, 유지보수 측면에서 큰 에러가 발생한다. 
단순히 이동 표현 문자를 `-`에서 `@` 로 바꾸려 해도`Car` 객체가 위치하는 곳까지 찾아가야하기 때문이다. 

코드가 단순하다면 문제가 없지만 핵심 Model 구조가 복잡하거나 이동 표현 문자를 내부 로직에 사용하는 코드가 추가되어버린 경우 
`@`로 변경하는데 큰 고난을 겪게 된다.

단순한 출력 수정에 고난을 겪고 싶지 않다면 아래와 같은 구조를 지향하자.

```java
public class Car {
	public Result move() {
		...
		return result;
	}
}

public class OutputView {
	private static final String ONE_STEP = "-"; 

	public static void printResult(final Result result) {
		...
		System.out.println(ONE_STEP);
	}
}
```

철수, 영희, 현구가 공통으로 사용하는 이동 표현 문자는 View로 이동하고, 철수, 영희, 현구가 각각 다르게 반환하는 `move` 결과만 
충실하게 반환해야 한다.

즉, 공통되는 부분에 대해선 View가 처리하는게 바람직하며, Model에 View 관련 코드가 존재해서는 안된다는 의미기도 하다.

---

### 4. Controller는 Model과 View에 의존해도 된다.
당연한 말이다. Controller는 Model과 View를 잇는 연결다리 역할이므로, Controller 내부에는 Model과 View 코드가 
자연스럽게 포함될 수 있다.

```java
public class Controller {
	public static void main(String[] args) {
		Student student = new Student("기철", 25);
		OutputView.printProfile(student);
	}
}
```

---

### 5. View가 Model로부터 데이터를 받을 때, 반드시 Controller를 통해서 받아야 한다.
Model이 갑작스럽게 View를 호출해선 안 되고, View가 Controller의 도움 없이 Model을 호출해서도 안 된다. 

Model은 서비스 로직을 소화하는 자기 자신의 본분에만 충실해야 하며, View는 철저히 Controller를 통해 넘겨 받은 
인자만을 사용해서 Model 코드를 사용해야 한다.

```java
public class Car {
    private final String name;

    public Car(final String name) {
        this.name = name;
    }

    public Result move() {
		...
        return result;
    }
}

public class OutputView {
    private static final String ONE_STEP = "-";

    public static void printResult(final Result result) {
        for (int i = 0; i < result.someThing(); i++) {
            System.out.print(ONE_STEP);
        }
    }
}

public class Controller {
    public static void main(String[] args) {
        Car car = new Car("현구차");
        Result result = car.move();
        OutputView.printResult(result);
    }
}
```

그래야 Model-View 간의 의존관계가 생기지 않는다.

<br>

우아한테크코스 테코톡 일타강사 제리의 **MVC 패턴이 지켜지는 5가지 규칙**을 정리해봤다.  
DTO, DAO, 서비스레이어 개념을 배우기전에 다시 한 번 규칙을 짚고 넘어가면 헷갈리는 일이 없겠지!

끗!

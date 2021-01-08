---
title: "[Agile Java] Lesson03 문자열과 패키지"
date: 2020-12-08
tags:
    - 애자일자바
    - agile java
    - 지름길로 빠르게 배울 수 있는 자바 프로그래밍
    - Jeff Langr
    - Java
    - 자바
toc: true
toc_sticky: true
toc_label: "Lesson03 문자열과 패키지"
---

실습 내용 저장소: [https://github.com/Hyeon9mak/student-information-system](https://github.com/Hyeon9mak/student-information-system)
{: .notice}

## 문자열은 생성자를 사용하지 마라
### 이유 1. 생성자 매개변수로 넘겨진 문자열과, 생성된 객체의 기능이 완전히 동일하다.
![image](https://user-images.githubusercontent.com/37354145/98439869-28b88a80-2138-11eb-9af8-e02c7dbe6f74.png){: .align-center}
Java 관련 어시스트 기능을 제공하는 IDE에서는 생성자를 사용하면 부적절(불필요)하다는 알림이 뜰 정도다.
  

### 이유 2. 만일 해당 코드가 루프안에 속할 경우, 루프 횟수만큼 인스턴스가 생성된다.
![image](https://user-images.githubusercontent.com/37354145/98439872-2bb37b00-2138-11eb-9c99-53d3e9a34100.png){: .align-center}

### 해결 방법
```java
    String s = "bikini";  // 문자열 리터럴 생성 방식
```
그냥 간단하게 리터럴하게 사용하면 된다.  
  
자세한 내용은 [이펙티브 자바 아이템 6](https://hyeon9mak.github.io/Effective-Java-item6/)을 참고하자!

<br>

## 문자열 연결은 StringBuilder
문자열을 연결할 때 흔하게 사용하는 방식이 **+ 연산자**를 이용하는 것이다. 
그러나 자바에서 문자열을 + 연산자를 통해 연결할 경우 단순히 두 개의 문자열이 연결되는 것이 아니라 
두 문자열을 연결한 **새로운 문자열을 하나 생성**하게 된다.  
  
이 때문에 문자열 연결이 반복적(혹은 자주)으로 일어난다면 성능에 영향을 끼칠 수 있다.  
StringBuilder는 이러한 상황에서 훌륭한 도구가 되어준다.  
StringBuilder의 효능에 대해서는 함께 이펙티브 자바 스터디를 진행한 
[JunHyeon96 님의 글](https://github.com/JunHyeok96/effective-java/blob/master/9.%20%EC%9D%BC%EB%B0%98%EC%A0%81%EC%9D%B8%20%ED%94%84%EB%A1%9C%EA%B7%B8%EB%9E%98%EB%B0%8D%20%EC%9B%90%EC%B9%99/63.%20%EB%AC%B8%EC%9E%90%EC%97%B4%20%EC%97%B0%EA%B2%B0%EC%9D%80%20%EB%8A%90%EB%A6%AC%EB%8B%88%20%EC%A3%BC%EC%9D%98%ED%95%98%EB%9D%BC.md)을 통해서 확인해보자!

<br>

## 다양한 플랫폼(OS)에서 개행
개행에 단순히 `\n`을 이용할 경우 다양한 플랫폼으로 이식이 어렵다. 
유닉스에서 의미하는 `\n`은 윈도우즈에서 `\r\n`으로 해석된다. 
플랫폼간 차이를 보충하기 위해서 시스템 특성 값인 `line.separator`를 사용하자

```java
private static final String NEW_LINE =
    System.getProperty("line.separator");
```

<br>

## 단일 역할의 원칙
> 클래스를 수정하는데에는 오직 한 가지 이유만 있어야 한다.

어려운 개념인가? 그러나 단순하게 해석하면 **"메서드와 클래스를 최대한 쪼개라. 메서드와 클래스가 각각 하나씩만 잘하게 해라"** 가 된다. 우리가 알아야할 점은 메서드와 클래스를 쪼갰을 때 얻는 이득이다.

### 1. 확장성이 좋아진다.
얘를 들어 랜덤한 확률로 전진하는 🚗Car객체를 만든다 생각해보자.

- 🚗Car객체가 랜덤이 아닌 특정 기준을 가지고 전진한다면?
- 특정 기준이 시시각각 변한다면?
- 랜덤한 확률로 전진하는 로직을 🚗Car가 아닌, 💂Soldier가 사용하게 된다면?  

🚗Car객체의 메서드로 랜덤 확률 전진을 결정하는 것보다, 랜덤 확률 전진을 새로운 클래스로 나누어 관리하는 것이 좋을 것이다.

### 2. 유지보수 영역이 명확해진다.
클래스를 수정하는데에는 오직 한 가지 이유만 있어야한다는 이야기를 읽고 내 멋대로 해석한 것이긴 하지만, 틀린 말은 아닐 것이다. 랜덤 확률로 전진하는 🚗Car객체의 랜덤 확률을 변경하려는 입장에서는 **'🚗Car객체를 수정했다.' 라고 이해하게 된다.** 정작 🚗Car객체의 이동, 이름, 위치 등 정보는 변한 것이 아무것도 없는데 말이다.

<br>

---

Lesson03은 쉽게 이해하고 넘어갈 수 있는 부분이 많아서 짧게 끝났다.  
앞으로도 중요하다고 생각되는 부분만 기록할 생각이다!
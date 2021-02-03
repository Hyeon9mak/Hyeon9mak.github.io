---
title: "[JUnit 5] 간단한 개요와 Annotations"
date: 2021-02-03
tags:
    - Java
    - JUnit 5
toc: true
toc_sticky: true
toc_label: "[JUnit 5] 간단한 개요와 Annotations"
---

## main method vs JUnit
main method는 우리가 흔하게 잘 알고 있는 그 main method를 말한다. 
main method의 의 용도는 크게 2 가지가 있다.

---

- 프로그램 시작
- 구현한 프로그램 테스트

---

즉, main 메서드를 통해서도 테스트 진행이 가능하다. 
그런데 JUnit이 등장한는 이유는 무엇일까? 
아래와 같은 문제점들 때문이다.

---

- Production Code(실 서비스 코드)와 Test Code가 클래스 하나에 존재.  
    클래스 크기가 커지면 복잡도가 비례해서 증가한다.

- main method 하나에서 여러 개의 기능을 테스트 함. 복잡도 증가.
    
- Test Code가 실 서비스에 같이 배포된다.

- method 이름을 통해 어떤 부분을 테스트하는지에 대한 의도를 드러내기 힘들다.

- 테스트 결과를 사람이 수동으로 확인. 출력문을 강제해야 한다.

---

클래스 복잡도도 줄일 수 있고, method 이름을 통해 의도를 드러낼 수도 있다. 
또한 배포시 Test Code를 떼어내고 Production Code만 배포할 수도 있다. 
강력하고 편리한 여러가지 기능을 제공하는 JUnit을 적극 활용해야 한다. 

<br>

현재 JUnit 5 버전을 사용중이므로, 5 버전을 기준으로 정리를 진행했다.
{: .notice}  

[JUnit 공식문서](https://junit.org/junit5/docs/current/user-guide/#overview-what-is-junit-5)
에서 지루한 JUnit의 개요 등을 설명하는데... 그런건 필요할 때 공식 문서를 다시 참고하고, 
사용해본 것들에 대해서만 계속 추가하면서 정리하자.  

## JDK 버전별 테스트
JDK를 통해 컴파일이 완료된 코드들은 버전에 관계없이 테스트가 가능하지만, 
그렇지 않은 코드들은 Java8 이상의 버전을 요구한다.

<br>

## JUnit 4 와 달리 public이 안붙음
JUnit 5 버전에서는 test method에 `public` 키워드가 붙지 않는다. 
default class, default method 로도 테스트가 가능하게 업데이트 되었다.

<br>

## Annotations
- **@Test**  
  테스트를 만드는 모듈  
  ```java
  @Test
  void test() { ... }
  ```

- **@Disabled**  
  테스트를 건너 뛰는(비활성화) 모듈  
  사용이 추천되진 않는 듯
  ```java
  @Test
  @Disabled
  void test() { ... }

  @Test
  @Disabled("some message")
  void test() { ... }
  ```
  
- **@BeforeEach**  
  각각의 테스트 실행마다 앞서 실행되는 모듈  
  이전 버전의 @Before 를 대체
  ```java
  @BeforeEach
  void init() { ... }
  ```
  
- **@BeforeAll**  
  현재 클래스의 모든 테스트보다 먼저 실행되는 모듈  
  해당 메서드는 `static` 키워드를 포함  
  이전 버전의 @BeforeClass 를 대체  
  ```java
  @BeforeAll
  static void init() { ... }
  ```
  
- **@AfterEach**  
  각각의 테스트 실행 후 실행되는 모듈  
  이전 버전의 @After 를 대체
  ```java
  @AfterEach
  void done() { ... }
  ```
  
- **@AfterAll**  
  현재 클래스의 마지막 테스트 실행 후 실행되는 모듈
  해당 메서드는 `static` 키워드를 포함  
  이전 버전의 @AfterClass 를 대체
  ```java
  @AfterAll
  static void done() { ... }
  ```

- **@Display**  
  테스트 메서드의 이름 지정
  ```java
  @Test
  @Display("뭐 이런걸 다 테스트")
  void test() { ... }
  ```

<br>

계속 계속 추가하자!

<br>

## References
- [JUnit 5 User Guide](https://junit.org/junit5/docs/current/user-guide)
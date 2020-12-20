   ---
   title: "[Effective-Java] 아이템 15. 클래스와 멤버의 접근 권한을 최소화하라"
   date: 2020-12-21 10:02:38
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
   {: .align-center}
   
   우리는 알약을 먹을 때 "감기약, 두통약, 소화제" 로만 생각하고 먹을 뿐, 
   알약 내부에 어떤 약품들이 들어있는지 신경쓰지 않는다. 알약은 잘 설계된 컴포넌트다.
   
   > "어설프게 설계된 컴포넌트와 잘 설계된 컴포넌트의 가장 큰 차이는 바로 
   > 클래스 내부 데이터와 내부 구현 정보를 외부 컴포넌트로부터 얼마나 잘 숨겼느냐다."
   
   잘 설계된 컴포넌트는 모든 내부 구현을 숨겨, 구현과 API를 깔끔히 분리한다. 
   오직 API를 통해서만 다른 컴포넌트와 소통하며 서로의 내부 동작 방식에는 관여하지 않아야 한다. 
   이것을 **정보 은닉**, 혹은 **캡슐화** 라고 부른다.
   
   <br>
   
   ## 정보 은닉(캡슐화)의 장점
   ### 시스템 개발 속도를 높인다.
   
   ### 시스템 관리 비용을 낮춘다.
   
   ### 성능 최적화에 도움을 준다.
   
   ### 소프트웨어 재사용성을 높인다.
   
   ### 대형 시스템 제작 난이도를 낮춰준다.
   
   <br>
   
   ## 자바에서 제공하는 정보 은닉(캡슐화) 장치 - 접근 제어
   
   <br>
   
   프로그램 요소의 접근성은 가능한 최소한으로만 제공해라. 
   꼭 필요한 최소한의 public API를 설계하자. 
   public 클래스(API)는 상수용 public static final 필드 외에는 
   어떠한 public 필드도 가져서는 안된다.
   public static final 필드가 참조하는 객체가 불변인지 확인하라.
   {: .notice}
   

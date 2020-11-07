---
title: "IntelliJ Ultimate버전 학생 인증 후 무료 설치"
date: 2020-11-07 11:15:38
categories:
    - Etc
tags:
    - 개발자
    - IntelliJ
    - 인텔리제이
    - 학생인증
    - 대학생
    - 공대생
toc: true
toc_sticky: true
toc_label: "IntelliJ Ultimate버전 학생 인증 후 무료 설치"
---

**별 의미 없는 개인적인 서론**

개인적으로 통합 IDE를 그다지 선호하지 않는다.  
무거움 / 자유롭지 못한 커스터마이징 / 활용하지 않는 기능이 많음 등...  
개인적으로 VIM을 사용하던 시절부터 [Gruvbox](https://github.com/morhetz/gruvbox)테마 광팬이었기 때문에  
VSCODE에 Gruvbox테마를 적용해서 사용해왔다.  
  
그런데 Java는 VSCODE로 통합 IDE를 대체하기엔 너무 포기하는게 많았다.  
아니, 정확히 말하면 통합 IDE가 제공해주는 여러가지 기능이 너무 강력해보였다.  
특히 이번에 이펙티브자바 공부를 시작하면서, 책에 나오는 예제로 실험을 진행하는데 
통합 IDE의 편의성이 절실해져서, 설치를 고려하게 됐다.  

흔히 Java 통합 IDE의 양대산맥으로 Eclipse와 IntelliJ를 뽑는다.  
Eclipse는 학부에서 사용할 때, 똑같은 JVM 버전으로 똑같은 코드를 작성했음에도  
조교님 Labtop에선 안돌고 내 Labtop에선 제대로 돌아서  
직접 연구실까지 찾아가 증명했던 불편한 기억이 있어서, 왜인지 싫었다.  
게다가 IntelliJ의 기본 테마도 Android Studio와 굉장히 유사해서 친숙했다.  
거기다 학생 인증을 통한 Ultimate버전 무료 설치 가능! 고민할 필요가 없었다.  
  
## #1 JetBrains 학생인증
[JetBrains 학생인증 사이트](https://www.jetbrains.com/community/education/#students)에 접속한다.  

![image](https://user-images.githubusercontent.com/37354145/98428199-c6ce3580-20e3-11eb-95ec-b94ac376714b.png){: .align-center}

**For students and teachers** - **Apply now**를 클릭!  

![image](https://user-images.githubusercontent.com/37354145/98428383-8de29080-20e4-11eb-8a65-eafa44ada4ee.png){: .align-center}

Status 학생인증이니까 **I'm a student** 선택.  
Level of study는 **Undergraduate(재학생)** 선택.  
(컴퓨터과학, 컴퓨터공학이 니 주전공이냐? 는 그냥 설문조사인듯)  
  
Graduation date는 졸업 혹은 졸업예정 날짜인데,  
이걸 [길게 두면 무제한으로 이용 가능](https://okky.kr/article/661458)하다고 한다.  
되도록 정당한 방법으로 이용하자. Ultimate 버전 1년 기준 150달러다.  
  
Email address에는 **개인 메일 주소가 아닌 학교 메일 주소**를 입력해야한다.  
주의해서 입력하고, 신청을 진행하자.  

![image](https://user-images.githubusercontent.com/37354145/98428444-dbf79400-20e4-11eb-96f1-65213bfbed6f.png){: .align-center}

신청서를 모두 작성하면 학교 메일로 무언가 전송했다는 메세지가 보인다.  
학교 메일함을 확인해보자.  

![image](https://user-images.githubusercontent.com/37354145/98428475-fa5d8f80-20e4-11eb-9bc5-ee41b9c8c85d.png){: .align-center}

메일함에 JetBrains로부터 새로운 메일이 와있다.  
**follow this link**를 클릭하면, 주의사항 등 동의를 요구하는 페이지로 넘어간다.  

![image](https://user-images.githubusercontent.com/37354145/98428485-12351380-20e5-11eb-9adb-d84f55c4f81c.png){: .align-center}

스크롤을 마지막까지 내리면 **I Accept**가 활성화 된다. 클릭!  
그리고 다시 학교 메일함을 확인해보자.  

![image](https://user-images.githubusercontent.com/37354145/98428499-22e58980-20e5-11eb-9a6b-96c281e6ea79.png){: .align-center}

학생 메일 인증이 완료됐다는 메일이다.  
이제 IntelliJ 인증에 사용할 계정 가입을 진행해야 한다.  
  
## #2 JetBrains 회원가입
IntelliJ 인증에 사용할 계정 회원가입을 진행해야한다.  
**link your free licensee**를 타고 들어가자.  

![image](https://user-images.githubusercontent.com/37354145/98428524-46103900-20e5-11eb-9c1f-279c6830cbf2.png){: .align-center}

**Create JetBrains Account**에 사용할 개인 이메일을 입력하자.  
학교 이메일을 그대로 사용해도 된다.  

![image](https://user-images.githubusercontent.com/37354145/98428532-52949180-20e5-11eb-8da8-ac4b3d54c958.png){: .align-center}

입력한 메일주소의 메일함을 확인해보면 회원가입용 링크가 전달되어있다.  
**Confirm your account**를 클릭해서 회원가입 페이지로 넘어가자.  

![image](https://user-images.githubusercontent.com/37354145/98428541-5d4f2680-20e5-11eb-9686-d3aa443169aa.png){: .align-center}

회원가입을 진행하는데, 비밀번호 조건에서 반복문자에 대해 굉장히 깐깐한 편이다.  
("abc"는 가능, "abcabc", "abcabcabc"는 불가능)  
비밀번호 조건에 걸리지 않게 회원가입을 잘 진행해보자.  

![image](https://user-images.githubusercontent.com/37354145/98428664-d5b5e780-20e5-11eb-8201-a4b9f9752265.png){: .align-center}

회원가입이 완료되면 라이센스를 확인할 수 있다!  
License는 어차피 본인 계정을 사용하면 알아서 적용되므로 굳이 외울 필요는 없다.  
**IntelliJ IDEA Ultimate**를 클릭하거나, [https://www.jetbrains.com/idea/](https://www.jetbrains.com/idea/)로 이동하자.  

## #3 IntelliJ 설치 및 인증
![image](https://user-images.githubusercontent.com/37354145/98428690-f8480080-20e5-11eb-8e5d-2051c40ae103.png){: .align-center}

사이트 이동 후, Download 메뉴로 이동해서 자신의 OS에 맞게 다운로드를 진행한다.  
우리는 인증을 완료했으므로 **Ultimate Free 30-day trial** 설치를 진행하면 된다.  

![image](https://user-images.githubusercontent.com/37354145/98428772-6ab8e080-20e6-11eb-9f8f-c5a9b5259300.png){: .align-center}

본인의 입맛에 맞게 개인설정을 쭉~ 진행하고  


![image](https://user-images.githubusercontent.com/37354145/98428820-a358ba00-20e6-11eb-96c8-961520f0e871.png){: .align-center}

라이센스 인증화면에 도달하면, 방금 가입했던 계정을 입력해주자!

![image](https://user-images.githubusercontent.com/37354145/98428871-f0d52700-20e6-11eb-81cc-741cf00015c6.png){: .align-center}

설치 완료!

---

설치를 성공적으로 마쳤다면, 아마도 졸업예정일로 입력한 기간까지 무료 이용이 가능할 것이다.  
IntelliJ Ultimate 버전 1년 구독 금액이 와우 6개월 요금제를 2번 결제금액한 금액보다 더 싸다.  
편법을 쓰는 사람들을 막을 순 없지만, 그래도 정당하게 사용하는걸 장려해야하는거니까.. 🤔
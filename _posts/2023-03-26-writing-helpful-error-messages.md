---
title: "구글에서 제안하는 오류 메세지 작성법"
date: 2023-03-26
tags:
    - google
    - programming
toc: true
toc_sticky: true
toc_label: "구글에서 제안하는 오류 메세지 작성법"
---

오류 메세지는 오류가 발생하는 시점에 개발자가 사용자에게 상호작용할 수 있는 수단이다.
잘 작성된 오류 메세지는 사용자에게 해결을 위한 중요한 정보를 전달해주지만,
잘못된 오류 메세지는 오히려 사용자들에게 혼란을 야기한다. 

구글은 잘못 작성된 오류 메세지들에는 다음과 같은 특징이 있다는 걸 발견했다.

- 실행 불가능
- 애매모호, 부정확, 혼란스러움
- 불분명한 원인
- 다음으로 취해야할 행동을 알 수 없음

반대로 잘 작성된 오류 메세지는 다음과 같은 특징이 있다.

- 실행 가능
- 좋은 사용자 경험 제공
- 적은 작업량, 신속한 문제 해결
- 사용자가 스스로 다음 행동을 취할 수 있음

<br>

## ✉️ 오류 처리 규칙

오류 메세지 작성법을 알아보기에 앞서, 일반적으로 오류를 처리할 때 지켜야할 규칙들에 대해 알아보자.

### 조용히 실패하지 않을 것

실패를 묵인하면 사용자들은 "내 주문이 처리되지 않은 이유가 뭐지?" 등 이유를 궁금해하고, 
고객지원 팀에서는 문제의 원인을 알 수 없어 사용자들에게 올바른 정보를 전달할 수 없다.

조용히 실패하거나 실패가 보고되지 않는 일은 절대 발생해선 안된다.
인간이 만든 소프트웨어는 오류가 존재할 수 밖에 없다. 오류가 발생하는 것 자체는 큰 문제가 아니다.
오류를 알리지 않아 프로그램을 개선할 기회를 놓치고 사용자들에게 좋은 경험을 제공하지 못하는 것이 큰 문제다.
항상 실패를 가정하고 오류 알림을 준비해야 한다.

### 오류는 즉시 알릴 것

오류를 붙잡고 있다가 나중에 발생시키면 오류를 추적하고 디버깅하는 비용이 크게 증가한다.
오류가 발생하는 바로 그 지점에서 최대한 빠르게 알림을 진행토록 하자.

### 자세한 원인을 명시할 것

특히 `500: 서버에서 예외가 발생했습니다.` 와 같이 서버 오류를 퉁쳐서 표현할 때가 있을 것이다. 
그러나 서버 오류는 정말 다양한 이유로 발생할 수 있다.

- 서비스 실패
- 네트워크 연결 끊김
- 권한 문제
- 등등

서버 오류는 사용자가 문제를 이해하고 다음 행동을 취하는데 도움을 줄 수 없는 메세지다.
너무 자세한 내용을 사용자에게 노출하는 것은 보안상 문제가 되겠지만, 
사용자가 다음 행동을 결정할 수 있는 컨텍스트는 제공해주는 것이 좋다.

### 에러 코드를 기록할 것

에러 코드는 오류를 모니터링하고 진단하는데 큰 도움이 된다.
적절한 에러 코드를 지정해두면 엔지니어나 담당자가 쉽게 조회와 디버깅을 진행할 수 있다.
가능하면 모든 에러코드에 대해 문서화를 진행해두면 좋다.

### 프로그래밍 언어 가이드를 따를 것

마땅한 기준을 찾지 못했다면 프로그래밍 언어 가이드의 오류 처리 관련 가이드 라인을 따르는 것도 좋은 방법이다.

- [Google C++ Style Guide](https://google.github.io/styleguide/cppguide.html)
- [Google Java Style Guide](https://google.github.io/styleguide/javaguide.htmlhttps://google.github.io/styleguide/javaguide.html)
- [Google Python Style Guide](https://google.github.io/styleguide/pyguide.html) 
- [Google JavaScript Style Guide](https://google.github.io/styleguide/jsguide.html)

<br>

## ✉️ 오류 메세지 작성법

구글에서 제안하는 오류 메세지 작상법을 익히고 사용자들과 올바른 소통을 해보자.

### 오류 원인 전달

사용자를 대상으로 구체적이고 정확하게 무엇이 잘못인지를 전달하는 것이 가장 중요하다.
모호한 오류 메세지는 사용자에게 나쁜 경험을 남긴다.

```
❌ Not recommended
유효하지 않은 디렉토리 입니다.

✅ Recommended
지정된 디렉토리가 존재하지만 쓰기(Write)를 할 수 없습니다.
디렉토리에 파일을 추가하려면 디렉토리 쓰기(Write) 권한이 있어야 합니다.
[쓰기 권한을 부여하는 방법 설명]
```

### 올바르지 않은 입력 전달

사용자의 입력이 잘못되어 오류가 발생한 경우, 사용자가 인지할 수 있도록 명시해야 한다.

```
❌ Not recommended
잘못된 우편번호 입니다.

✅ Recommended
우편번호는 반드시 5자리 혹은 6자리 숫자로 이루어져야 합니다. 입력된 우편번호 (1234567) 는 7자리 입니다.
```

만약 회원가입 화면처럼 올바르지 않은 입력이 여러 개일 경우 다음 중 한 가지 방법을 제공할 수 있다.

- 사용자가 버튼을 제공하고, 버튼을 누르면 오류 목록을 보여준다.
- 올바른 입력 값만 남기고 올바르지 않은 입력 값은 모두 제거한다.

### 요구 사항, 제약 사항 명시

모든 사용자는 시스템의 제약사항에 관심이 없다.
사용자가 요구 사항과 제약 사항, 정책을 이해하고 행동을 취할 수 있도록 구체적으로 명시한다.

```
❌ Not recommended
프로필 이미지의 용량이 너무 큽니다.

✅ Recommended
프로필 이미지의 크기(14MB)가 제한(10MB)를 초과합니다. [이미지 크기를 줄일 수 있는 방법 설명]
```

### 해결 방법과 예시 제공

문제가 되는 원인을 설명 후, 사용자가 취할 수 있는 액션이 담긴 메세지를 작성하자.
또한 예시를 통해 사용자가 올바른 해결 방법을 선택하는데 도움을 주자.

```
❌ Not recommended
현재 버전의 앱은 더 이상 지원되지 않습니다.

✅ Recommended
현재 버전의 앱은 더 이상 지원되지 않습니다. "앱 업데이트" 버튼을 클릭해서 업데이트를 진행해주세요. 
```
```
❌ Not recommended
올바르지 않은 이메일 형식입니다.

✅ Recommended
입력된 이메일 주소(hyeon9mak)에 @ 기호와 도메인 명이 필요합니다. 예: hyeon9mak@cool.man
```

### 간결하고 명확하게

불필요한 내용을 제거하고 최대한 간결하게. 중요한 내용만 강조하자.
종종 수동태를 능동태로 변환하면 문장이 간결해진다.

```
❌ Not recommended
리소스를 찾거나 구별할 수 없습니다. 선택한 항목이 클러스터에 존재하지 않습니다. [리소스를 찾는 방법에 대한 설명]

✅ Recommended
<이름> 리소스가 <이름> 클러스터에 없습니다. [리소스를 찾는 방법에 대한 설명]
```
```
❌ Not recommended
파도타기 기능은 더 이상 싸이월드에서 지원되지 않습니다.

✅ Recommended
싸이월드는 더 이상 파도타기 기능을 지원하지 않습니다.
```

다만 너무 많은 단어를 제거해서 사용자가 이해하기 어려운 메세지가 되지 않도록 주의하자.

### 이중부정 금지

- "부정에 부정이니까 긍정인가?"
- "부정을 엄청나게 강조하는건가?"

이중 부정은 사용자를 혼란스럽게 만든다. 절대 쓰지 말자.

```
❌ Not recommended
경로에 대한 읽기 권한은 운영체제가 액세스를 금지하는 것을 방지합니다.

✅ Recommended
경로에 대한 읽기 권한이 있으면 누구나 액세스 가능합니다. 개별로 액세스를 제한하는 방법은 아래 설명을 참조하십시오 [...]
```

### 사용자를 위한 단어 선택

오류 메세지를 작성할 때 지식의 저주에 빠지지 않게 주의하자.
나에겐 친숙한 CS 용어가 사용자에겐 익숙하지 않을 수 있다.

```
서버의 CPU 사용량이 92%에 달해 클라이언트의 요청을 제거했습니다. 5분 후 다시 시도하십시오.
```

사용자의 배경지식에 맞게 메세지를 결정하자.

```
현재 이용고객이 많아 일시적으로 구매를 완료할 수 없습니다. 5분 후 다시 시도해주세요.
```

### 일관된 용어 사용

대상을 특정한 단어로 표현했다면, 모든 종류의 오류 메세지에서 동일한 단어로 표현하자.
각각의 오류 메세지에서 다른 단어를 사용한다면 사용자는 동일한 대상을 지칭하는지 알기 어렵다.

```
❌ Not recommended
localhost:3306 애플리케이션에 연결할 수 없습니다. MySQL 이 실행 중인지 확인이 필요합니다.

✅ Recommended
localhost:3306 애플리케이션에 연결할 수 없습니다. localhost:3306 애플리케이션이 실행 중인지 확인이 필요합니다.

✅ Recommended
localhost:3306 MySQL 에 연결할 수 없습니다. MySQL 이 실행 중인지 확인이 필요합니다.
```

<br>

## ✉️ 가독성을 높이기 위한 포맷

몇 가지 간단한 테크닉을 활용하면 텍스트와 코드 사이에서도 눈에 띄는 오류 메세지를 만들 수 있다.

### 상세 문서 링크

더 자세한 설명을 포함할 수 있는 문서 링크를 첨부하자.

```
❌ Not recommended
게시물에 안전하지 않은 정보가 포함되어 있습니다.

✅ Recommended
게시물에 안전하지 않은 정보가 포함되어 있습니다. 자세한 사항은 <docs link> 를 확인해주세요.
```

### 점진적인 메세지 전달

사용자들은 때때로 긴 오류 메세지에 겁을 먹고 오류를 무시한다. 

```
❌ Not recommended
TextField widgets require a Material widget ancestor, 
but none were located. In material design, most widgets 
are conceptually “printed” on a sheet of material. 
To introduce a Material widget, either directly include one 
or use a widget that contains a material itself.
```

한 번에 너무 긴 메세지를 전달하기 보다,
짧은 버전의 메세지를 먼저 전달한 다음 사용자가 전체 텍스트를 확인할 수 있는 클릭 옵션을 제공해주면 좋다.

```
✅  Recommended
TextField widgets require a Material widget ancestor, but none were located.

...(Click to see more.)

In material design, most widgets are conceptually "printed" on a sheet of material. 
To introduce a Material widget, either directly include one 
or use a widget that contains a material itself. 
```

### 오류와 가까운 곳에 메세지 배치

오류 메세지를 가능한 발생 지점과 가까운 곳에 배치하자.

```
❌ Not recommended
1: program figure_1;
2: Grade = integer;
3: var
4. print("Hello")
Use ':' instead of '=' when declaring a variable.
```
```
✅  Recommended
1: program figure_1;
2: Grade = integer; 
---------^ Syntax Error
Use ':' instead of '=' when declaring a variable.
3: var
4. print("Hello")
```

### 신중한 색상 배치

색맹의 비율은 생각보다 더 높다. 글꼴 색상을 통해 오류 메세지를 강조하고 싶은 경우에도
색상을 주의해서 사용해야한다. 예를 들어 다음과 같은 오류는 일부 사용자들에게 혼란을 줄 수 있다.

<img width="518" alt="FB576825-961A-416F-AB89-5368A4D53CB7" src="https://user-images.githubusercontent.com/37354145/227762307-b3f7c39a-f3dc-416d-b999-66880d87cf29.png">

다양한 색맹이 존재하고, 각자 편안한 색상이 다르기 때문에 다른 시각적 신호와 함께 사용하는 것이 좋다.

<img width="597" alt="8BDA2659-063A-4163-BB05-5575F1B5029B" src="https://user-images.githubusercontent.com/37354145/227762309-9b48941d-0532-4bfb-9a32-fb59715dc706.png">

<br>

## ✉️ 올바른 어조 사용

어조는 사용자가 메세지를 읽고 해석하는데 중요한 영향을 끼친다.

### 긍정적인 어조 사용

사용자가 무엇을 잘못했는지 이야기하기보다, 해결 방법을 이야기하는 걸 우선하자.

```
❌ Not recommended
이름을 입력하지 않았습니다.

✅  Recommended
이름을 입력하세요.
```

### 불필요한 미안함

"미안", "죄송", "부디" 와 같은 표현을 삼가하자. 대신 명확한 문제설명과 해결방법을 제시하자.

```
❌ Not recommended
불편을 끼쳐드려 대단히 죄송합니다.
서버 오류가 발생하여 일시적으로 스프레트 시트를 로드할 수 없습니다.
잠시 기다린 후 다시 시도해주세요.

✅  Recommended
Google 문서도구에서 일시적으로 스프레드 시트를 로드할 수 없습니다.
문서 목록에서 스프레드 시트를 다운로드하거나, 잠시 기다린 후 다시 시도해주세요.
```

> 단, 미안함을 표현하는 정도에 대해서는 서비스의 특성이나 국가별 문화에 따라 다를 수도 있다.

### 불필요한 유머

오류 메세지는 개발자가 사용자에게 상호작용할 수 있는 수단이지만, 대부분의 사용자는 오류로 인해 화가 난 상태이다.
불난 집에 부채질 하는 일을 삼가하자.

- 화난 사용자는 유머를 받아들이지 않는다.
- 사용자가 유머를 잘못 해석하여 더 큰 문제를 야기할 수 있다.
- 유머로 인해 오류 메세지의 목적을 훼손시킬 수 있다.

```
❌ Not recommended
스프레드 시트가 이상해요. 시트가 이상하니까 이상해씨?

✅  Recommended
일시적으로 스프레드 시트를 로드할 수 없습니다. 잠시 기다린 후 다시 시도해주세요.
```

### 비난 금지

사용자의 잘못(원인) 보다 해결법에 초점을 맞추자.

```
❌ Not recommended
오프라인 상태인 프린터를 지정했습니다. 오프라인 상태인 프린터는 이용할 수 없습니다.

✅  Recommended
지정된 프린터가 오프라인입니다. 오프라인 상태인 프린터는 이용할 수 없습니다.
```

<br>

## ✉️ 백엔드 엔지니어를 위한 추가 지침

### 에러 코드를 제공하라

가능한 경우 에러 코드를 제공하자. 개발자가 오류를 식별하고 탐색하는데 큰 도움이 된다.

```
❌ Not recommended
오류: 이 버킷을 이미 소유하고 있습니다. 목록에서 다른 이름을 선택합니다.

✅  Recommended
오류 409: 이 버킷을 이미 소유하고 있습니다. 목록에서 다른 이름을 선택합니다.
```

### 관련 에러 이슈(문서) 포함

개발자들은 오류의 원인을 찾기 위해 로그를 분석한다. 
오류를 쉽게 탐색할 수 있도록 관련 에러의 이슈(문서) 번호나 링크를 포함시켜주자.

```
❌ Not recommended
{ 
    "error" : "Bad Request - Request is missing a required parameter: 
        -collection_name. Update parameter and resubmit.
}
 
✅  Recommended
{ 
    "error" : "Bad Request - Request is missing a required parameter: 
        -collection_name. Update parameter and resubmit. 
        Issue Reference Number BR0x0071"
}  
```

<br>

## ✉️ 요약

- 오류의 원인 식별
  - 유효하지 않은 입력 값이 무엇인지 명확히 안내
  - 시스템의 요구 사항, 제약 사항 안내
- 해결방법 설명
  - 사용자가 문제를 해결하는데 도움이 될 수 있는 적절한 예시 제공
- 명확한 설명
  - 장황하지 않게, 최대한 간결하게. 지나친 간결함은 지양
  - 이중 부정 금지
  - 사용자를 위한 적절한 단어 선택
  - 일관된 용어 사용
  - 확장 문서 링크, 자세히 보기 등을 이용한 오류 메세지 포맷 통일
  - 긍정적인 어조 사용, 불필요한 미안함 금지

<br>

## References

- [Google Developers > Technical Writing > Writing Helpful Error Messages](https://developers.google.com/tech-writing/error-messages)

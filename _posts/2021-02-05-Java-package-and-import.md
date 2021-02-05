---
title: "Java package와 import"
date: 2021-02-05
tags:
    - Java
    - 우아한테크코스
toc: true
toc_sticky: true
toc_label: "Java package와 import"
---

제이슨의 **package와 import** 강의를 들으면서 공부한 내용을 정리해보자.
{: .notice}

## Java package
OS File System의 Directory 개념과 동일하다. 이름이 다를 뿐, 실제 탐색기를 통해 찾아가면 
Directory 구조로 이루어져 있다. **package는 Java에서 사용하는 네이밍이다.**  
  
Java는 실제 Directory path와 package name이 동일해야 한다. 패키지 이름이 달라질 경우, 컴파일 에러가 발생함.
```java
// 실제 경로가 src/main/java/study/PackageStudy.class 일 때
package play  // 컴파일 에러 발생!

public class PackageStudy { ... }
```
~~Kotlin은 이런 제약이 없다!~~

<br>

## package를 쪼개는 이유
- 관련된 class들을 모아서 관리하기 위해
- 수 많은 class 들 속에서 내가 원하는 class를 쉽게 찾기 위해
- 배포가 필요한 소스 코드만 묶어서(packaging) 배포하기 위해
- 빌드, 실행 시간 단축을 위해
- 같은 이름의 class 간의 충돌을 방지하기 위해  
  (같은 class 명을 package가 다르면 사용할 수 있다.)

<br>

## 왜 [src/.../java] 형태지?
```
src/main/java
src/test/java
```
별거 없다. 그냥 **Gradle, Maven** 빌드 도구에서 제공하는 표준 package구조.

<br>

## 왜 도메인 명을 거꾸로 사용하는게 표준이지?
package 이름 `java`, `javax`는 JDK에서 독점적으로 사용 중이므로, 접두사로 사용 되어선 안된다. 
흔히 회사 도메인을 거꾸로 사용하는 형태의 패키지명을 볼 수 있다. 
왜 회사 도메인명을 사용하는가? 다른 회사와 동일한 이름의 패키지, 클래스 명을 사용하기 위해서다.  

```java
// hyeon9mak.github.io
package io.github.hyeon9mak.view
// calendar.google.com
package com.google.calendar.view
```

거꾸로 사용하는 이유는 뭘까? 오래된 관례라 하나의 컨벤션이 되었다는 의견이 지배적이지만 
[stackoverflow에서 그럴듯한 해석](https://stackoverflow.com/questions/31916495/why-is-reverse-dns-notation-used-for-package-naming) 
을 볼 수 있었다.

---

- `com` : 회사에서 만든 프로젝트로군.
- `google` : 그 회사의 이름은 Google이군!
- `calendar` : 달력 기능을 만들던거야!

---

위와 같은 식으로 자연스럽게 프로젝트의 출처와 프로젝트 주제를 이해할 수 있기 때문에 
도메인 명을 거꾸로 사용한다는 해석이 있었다.

<br>

## java.lang package
`String`, `Integer`, `System` 등, 대부분의 클래스에서 
자주 사용되는 클래스들은 모두 `java.lang` 패키지에 포함되어 있다.
워낙 자주 사용되므로 별도의 import 키워드 없이도 자동으로 import 되어 있어 곧바로 사용할 수 있다.

<br>

## 좋은 packaging은 class가 10개 이하다.
제이슨이 수업 막바지가 던져준 이야기다. 왜 10개 이하여야할까... 고민을 해보게 되었다.  
  
File System의 Directory 구조로만 생각해보아도 세세하게 분류되어 있을 수록(class 개수가 적을 수록) 
class의 의도를 파악하는 것에도 용이하고, 동일한 이름의 class파일 생성이 가능하므로 당연히 좋을 것 같았다.  
  
Java의 구조적인 관점에서 왜 package당 class의 개수가 적을수록 좋은가는 
class의 필드 멤버를 최대한 줄이는 것과 같은 이유가 아닐까 생각한다. 
class의 필드 멤버가 적을수록 객체 복잡도가 줄어들고, 버그 발생 가능성이 낮아진다. 
이와 마찬가지로 package 당 class의 개수를 줄이는 과정에서 중복 혹은 불필요한 class를 없앨 수 있지 않을까 생각된다.
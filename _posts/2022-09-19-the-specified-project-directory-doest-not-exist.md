---
title: "The specified project directory doest not exist 오류 해결"
date: 2022-09-19
tags:
    - intellij
    - gradle
toc: true
toc_sticky: true
toc_label: "The specified project directory doest not exist"
---

## 💾 오류
IntelliJ를 통해 멀티 모듈 프로젝트를 관리하면서 새로운 모듈을 생성 후 제거하면,
아래와 같은 아래를 마주친다.

```
The specified project directory {디렉토리 명} doest not exist
```

<br>

## 💾 원인 및 해결
주로 디렉토리만 제거하고, Gradle에 등록된 모듈 리스트에선 제거(동기화)하지 않아서 발생하는 오류이다.

![image](https://user-images.githubusercontent.com/37354145/190956943-b7c0286b-c14f-4930-b50e-2454fa1b6f23.png)

IntelliJ 우측의 Gradle 탭을 누르고 모듈을 찾아 제거한 후 동기화를 진행하면 오류가 해결된다.

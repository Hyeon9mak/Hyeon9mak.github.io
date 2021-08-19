---
title: "macOS Big Sur JDK 설치 및 버전 변경"
date: 2021-08-19
tags:
    - jdk
toc: true
toc_sticky: true 
toc_label: "macOS Big Sur JDK 설치 및 버전 변경"
---

## 🍺 summary
신규 프로젝트를 로컬에서 동작 시켜보기 위해 **JDK 8** 버전이 필요했다. 
기존 로컬에 설치되어 있던 버전은 **JDK 14** 였기 때문에 버전 변경이 필요했는데 
버전 변경이 뜻대로 이루어지지 않아 반나절을 고생했다.

<br>

## 🍺 Homebrew를 이용한 JDK 8 설치
JDK를 직접 다운로드 받아 설치할 경우 어떤 버전을, 어디에 설치했는지 관리가 어렵기 때문에 
Homebrew를 통해 설치하길 희망했다.

```
$ brew install openjdk
```

그러나 설치에 실패했다. [brew 커뮤니티](https://discourse.brew.sh/t/how-to-install-openjdk-with-brew/712/20)를 살펴보니 아직까지 공식적으로 openjdk 설치가 불가능 하다고 한다. 댓글들 중에 **AdoptOpenJDK**를 이용하라는 이야기가 있어 [AdoptOpenJDK 저장소 README.md](https://github.com/AdoptOpenJDK/homebrew-openjdk)를 참고해 설치를 진행해보았다.

```
$ brew tap AdoptOpenJDK/openjdk
$ brew install --cask adoptopenjdk8
```

설치가 잘 진행된다!

<br>

## 🍺 JDK 버전 변경
설치는 잘 진행됐지만, 여전히 로컬에 설치되어 있던 14버전을 사용 중이었다. 
여러가지 블로그들을 참고 해보니 공통적으로 `.zshrc` 또는 `.bash_profile` 에 명령어를 추가하라데, 도통 먹힐 생각을 하지 않았다.

```
# ~/.bash_profile 또는 ~/.zshrc

export JAVA_HOME=$(/usr/libexec/java_home -v 1.8)
```

> 위 명령을 추가해주는 이유는 Homebrew를 통해 설치한 JDK보다 로컬에 직접 설치된 내장 JDK가 우선시되기 때문이다.

그렇게 한참을 헤매다가, [2020년 11월에 올라온 Big Sur 운영체제 JDK 버전 변경에 대한 stackoverflow 질문 글](https://stackoverflow.com/questions/64968851/could-not-find-tools-jar-please-check-that-library-internet-plug-ins-javaapple)을 발견했다. 거기서 250개가 넘는 추천을 받은 답변에서 해답을 얻을 수 있었다.

우선 `/usr/libexec/java_home -V | grep jdk` 명령을 통해 설치된 JDK의 버전과 경로를 확인한다.

```
$ /usr/libexec/java_home -V | grep jdk

Matching Java Virtual Machines (2):
    1.14.0.1 (x86_64) "Oracle Corporation" - "Java" /Library/Internet Plug-Ins/JavaAppletPlugin.plugin/Contents/Home
    1.8.0_292 (x86_64) "AdoptOpenJDK" - "AdoptOpenJDK 8" /Library/Java/JavaVirtualMachines/adoptopenjdk-8.jdk/Contents/Home
```

`"AdoptOenJDK 8"`에 해당되는 경로 `/Library/Java/JavaVirtualMachines/adoptopenjdk-8.jdk/Contents/Home`를 `.zshrc` 또는 `.bash_profile`에 넣어주면 된다!

```
# ~/.bash_profile 또는 ~/.zshrc

export JAVA_HOME=/Library/Java/JavaVirtualMachines/adoptopenjdk-8.jdk/Contents/Home
export PATH=$JAVA_HOME/bin:$PATH
```

핵심은 JDK 경로가 조금 다르다는 것!

<br>

## Refences
- [How to install openjdk with brew - Homebrew](https://discourse.brew.sh/t/how-to-install-openjdk-with-brew/712/20)
- [AdoptOpenJDK/homebrew-openjdk - github.com](https://github.com/AdoptOpenJDK/homebrew-openjdk)
- [Could not find tools.jar. Please check that /Library/Internet Plug-Ins/JavaAppletPlugin.plugin/Contents/Home contains a valid JDK installation - stackoverflow](https://stackoverflow.com/questions/64968851/could-not-find-tools-jar-please-check-that-library-internet-plug-ins-javaapple)

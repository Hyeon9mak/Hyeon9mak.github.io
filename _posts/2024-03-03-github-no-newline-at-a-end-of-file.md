---
title: "GitHub 파일 끝에 개행이 필요한 이유 (no newline at a end of file)"
date: 2024-03-02
tags:
    - git
toc: true
toc_sticky: true
toc_label: "GitHub 파일 끝에 개행이 필요한 이유"
---

GitHub 에 Pull Request 를 올리면 가끔 아래와 같은 금지 마크를 발견할 때가 있다.

![](https://i.imgur.com/vgxK7R2.png)

> no newline at a end of file

line number 를 보면 알 수 있듯, 파일 가장 끝에 개행이 포함되지 않았을 때 발생하는 오류 표기다. 
실제로 프로그램을 실행시킬 땐 아무런 문제가 되지 않는데, 왜 GitHub 에서는 이런 오류 표기를 항상 해주는 걸까?

![](https://i.imgur.com/bDuYvnN.png)
*개행없이 22line 에서 끝나도 사실 문제는 없다.*

결론부터 말하면 `파일의 마지막에는 개행이 포함되어야 한다.` 라는 [POSIX(IEEE 에서 책정한 UNIX 인터페이스)](https://ko.wikipedia.org/wiki/POSIX)을 만족 시키기 위함이다. 
현재 프로그램이 동작하는 것에는 아무런 문제가 없으나, 잠재적으로 문제가 될 수 있기 때문에 GitHub 에서 미리 경고를 하는 것.

<br>

## 파일 끝에 개행이 필요한 이유

[POSIX](https://ko.wikipedia.org/wiki/POSIX) 에서 정의하는  "불완전한 행(끝나지 않은 행)" 의 기준은 아래와 같다.

> [3.195 Incomplete Line](https://pubs.opengroup.org/onlinepubs/9699919799/basedefs/V1_chap03.html#tag_03_195)  
> A sequence of one or more non-`<newline>` characters at the end of the file.

> 불완전한 행  
> 파일의 끝에 `<newline>` 이 아닌 문자가 포함되는 것.

그렇다면 온전히 마무리 지어진, 하나의 행으로 인정 받는 기준은 무엇일까?

> [3.206 Line](https://pubs.opengroup.org/onlinepubs/9699919799/basedefs/V1_chap03.html#tag_03_206)  
> A sequence of zero or more non-`<newline>` characters plus a terminating `<newline>` character.

> 행  
> 아무것도 적혀있지 않거나, `<newline>` 이 아닌 문자 이후 마지막에 `<newline>` 문자가 포함되는 것.

즉 행의 가장 마지막에 개행문제(`<newline>`)가 하나 포함되어야 온전히 하나의 행으로 인정된다. 
그렇지 않을 경우 여전히 행에 입력이 진행중인 것으로 판별하며, 자연스럽게 현재 지점이 EOF(End Of File)인지 판별할 수 없게 된다. 
(POSIX 에 근거하여 동작하는 컴파일러 등에서 EOF 를 인지하지 못해 비정상적인 동작 결과를 만들어낼 수 있다.)

GitHub 에서는 이러한 잠재적인 오류를 예방하고자 파일 끝에 개행이 없을 시 경고를 띄우는 것이다.

파일 마지막에 개행을 넣는 건 매우 중요한 일이지만, 매번 파일 끝에 개행을 신경써야 하는 것은 여간 귀찮다.
사람이 코드를 작성하는 이상 실수를 하기도 쉽다.
다행히 IntelliJ 를 포함한 여러 IDE 에서는 파일 끝에 개행을 자동으로 추가해주는 설정을 제공한다.

<br>

## IntelliJ 사용 환경에서 마지막 개행 자동 추가하기

`Editor` > `General` > `Ensure every saved file ends with a line break` 를 체크하면, 파일을 생성하거나 저장 단축키(`CMD` + `S`)를 누를 때마다 파일 마지막에 개행이 자동으로 적용된다.
![image](https://github.com/mission-study-to-finish-in-15-days/kotlin-racingcar/assets/37354145/31ea7e1c-648f-4441-bac0-2a8ce86e3573)

이를 통해서 파일 끝에 개행을 신경쓰지 않고도 안심하고 코드를 작성할 수 있고, 
GitHub 의 "no newline at a end of file" 경고딱지로부터 해방될 수 있다.

<br>

## References

- [https://pubs.opengroup.org/onlinepubs/9699919799/basedefs/V1_chap03.html](https://pubs.opengroup.org/onlinepubs/9699919799/basedefs/V1_chap03.html)
- [POSIX - 위키백과, 우리 모두의 백과사전](https://ko.wikipedia.org/wiki/POSIX)

---
title: "IntelliJ 내가 자주 사용하는 단축키 정리"
date: 2021-03-14
tags:
    - IDE
toc: true
toc_sticky: true
toc_label: "IntelliJ 내가 자주 사용하는 단축키 정리"
---

![ccd2860b506692b249f81cf5e1da2920b701a53b](https://user-images.githubusercontent.com/37354145/111065135-881a1300-84fb-11eb-9206-44274ee578b6.gif)

"도도도독" 키보드 소리를 내며 직접 타이핑하는게 프로그래밍의 재미이자 미덕이라고 생각하던 때, 
포비와 제이슨이 "텅, 텅" 엔터키 누르는 소리를 내면서 단축키로 엄청난 양의 코드를 쏟아내는 걸 보았다.  
  
**'미덕은 개뿔이...'**  
  
당장 단축키를 공부하기 시작했고, 어느샌가 나도 "텅 텅" 소리를 내면서 코드를 작성하고 있다. 
혹시나 나중에 까먹을라... 미리 기록 좀 해둬야지.

<br>

## ⌨️ Action 검색
- Mac: `Shift` + `Cmd`  + `A`
- Windows: `Shift` + `Ctrl`  + `A`

---

'이게 있을까?' 하고 궁금할 때 검색해서 사용할 수 있는 단축키.  
자주 사용하는 단축키에 익숙해질수록 Action 기능에서 멀어지는 것 같다.

<br>

## ⌨️ 현재 컨텍스트를 수정
- Mac: `Opt` + `Enter`
- Windows : `Alt` + `Enter`

---

현재 컨텍스트에 대한 액션을 표시하여 뭐든지 추가하거나 수정하는데 사용할 수 있다.

코드의 오류(빨간줄)가 발견되거나시 경고, 제안(노란줄)이 표시된 곳에서 `Option + Enter` 를 누르면 
제안 목록이 표시된다.

오류, 제안이 없는 상태에서도 사용이 가능한데, 개인적으로 지역 변수명을 자동 추가 할 때 자주 사용한다.

<br>

## ⌨️ 현재 라인 자동완성
- Mac: `Shift` + `Cmd` + `Enter`
- Windows: `Shift` + `Ctrl` + `Enter`

---

현재 작성중이던 라인을 자동 완성시켜준다. 닫을 괄호가 잔뜩 남거나 했을 때 편리하게 사용한다.
빠르게 손에 익힐수록 이득인 단축키 중 하나.

<br>

## ⌨️ 호출중인 메서드의 파라미터 확인
- Mac: `Cmd` + `p`
- Windows : `Ctrl` + `p`

---

현재 호출중인 메서드의 파라미터 타입을 곧장 확인할 수 있다.

<br>

## ⌨️ 단어, 문장 교체
- Mac: `Cmd` + `r`
- Windows : `Ctrl` + `r`

---

`Cmd` + `f` 와 자주 혼용되는 그것.

<br>

## ⌨️ 자동완성(추천) 목록 확인
- Mac: `Ctrl` + `Space`
- Windows: `Ctrl` + `Space`

---

가끔 자동완성 추천 목록이 보이지 않을 때 사용하게 되는 단축키

<br>

## ⌨️ 자동완성 (Generate)
- Mac: `Cmd` + `n`
- Windows: `Alt` + `Insert`

---

getter, setter, constructor, test 등... 자동으로 만들고 싶은 것을을 모두 만들 수 있는 만능 단축키

<br>

## ⌨️ Override 메서드 자동완성 (Implement Methods)
- Mac: `Ctrl` + `i` 또는 `Ctrl` + `o`
- Windows: `Ctrl` + `i` 또는 `Ctrl` + `o`

---

개인적으로 `Ctrl` + `o`를 더 자주 사용하게 되는 듯.

<br>

## ⌨️ 소스코드 서식 정렬
- Mac: `Option` + `Cmd` + `L`
- Windows : `Alt` + `Ctrl` + `L`

---

현재 선택한 소스코드 파일의 서식을 자동으로 정렬한다.

<br>

## ⌨️ 모든 영역에서 검색
- Mac: `Shift`, `shift`
- Windows: `Shift`, `shift`

---

현재 프로젝트에서 검색할게 있을 때.  
보통 소스파일간 이동은 `Tab`을 1회 입력 후 사용하거나, `Cmd` + `E` 단축키로 대체하게 된다.

<br>

## ⌨️ 최근 실행했던 파일 목록 확인
- Mac: `Cmd` + `E`
- Windows: `Ctrl` + `E`

---

최근 실행했던 파일 목록을 확인하고 선택해서 포커스를 이동 할 수 있다.

<br>

## ⌨️ 메서드가 정의된/사용중인 곳으로 포커스 이동
- Mac: `Cmd` + `B`
- Windows: `Ctrl` + `B`

---

메서드가 정의되거나 사용중인 곳으로 포커스를 이동한다.
사용중인 곳이 많다면, 리스트를 먼저 보여준다.

<br>

## ⌨️ 현재 메서드가 사용중인 곳 검색
- Mac: `Opt` + `F7`
- Windows: `Alt` + `F7`

---

`Cmd` + `3` 단축키로 만날 수 있는 그 화면에 메서드가 사용중인 곳을 보여준다.

<br>

## ⌨️ 파일 목록으로 포커스 이동
- Mac: `Cmd` + `1`
- Windows: `Ctrl` + `1`

---

한 번 누르면 포커스 이동. 잘쓰면 폼남. 다시 누르면 사라진다.

<br>

## ⌨️ 메서드가 사용중인 곳 확인
- Mac: `Cmd` + `3`
- Windows: `Ctrl` + `3`

---

현재 메서드가 사용중인 곳을 확인할 수 있다. 다시 누르면 사라진다.

<br>

## ⌨️ 실행(빌드) 내역 확인
- Mac: `Cmd` + `4`
- Windows: `Ctrl` + `4`

---

실행(빌드) 되었던(중인) 모습을 확인할 수 있는 창을 띄워준다. 다시 누르면 사라진다.

<br>

## ⌨️ 깃 커밋 로그 확인
- Mac: `Cmd` + `9`
- Windows: `Ctrl` + `9`

---

모든 커밋 내역을 시각적으로 확인할 수 있는 창을 띄워준다. 다시 누르면 사라진다.

<br>

## ⌨️ 가장 최근 커밋 대비 변경된 파일이 변경된 영역 확인
- Mac: `Cmd` + `0`
- Windows: `Ctrl` + `0`

---

커밋한지 오래되었고, 파일을 얼마나 수정했는지 헷갈릴 때 사용하면 좋은 단축키. 
가장 최근 커밋 대비 파일이 얼마나 수정되었나 보여준다. 다시 누르면 사라진다.

<br>

## References
- [가장 많이 사용되는 IntelliJ IDEA 단축키 15개](https://gmlwjd9405.github.io/2019/05/21/intellij-shortkey.html)
- [[IntelliJ] intellij 유용한 단축키 정리](https://blog.jetbrains.com/ko/2020/03/11/top-15-intellij-idea-shortcuts_ko/)
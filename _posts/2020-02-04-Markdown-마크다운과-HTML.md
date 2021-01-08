---
title: "마크다운과 HTML"
date: 2020-02-04
tags:
    - Markdown
    - 마크다운
    - HTML
    - HyperTextMarkupLanguage
    - Markup
toc: true
toc_sticky: true
toc_label: "마크다운과 HTML"
---

*마크다운(MarkDown)*이라는 이름이 *HTML(Hyper Text Markup Language)*과 같은 마크업 언어의 종류인데 
말장난스럽게 지은 이름이라는 것까지는 알고 있었다. 이러한 특성 때문에 마크다운 문법으로 문서를 작성하면 
HTML로 자동 변환되어 글이 적힌다는 것 까지.
  
그런데 실제 HTML로 어떻게 변환되는지 까지는 아무런 관심이 없었다. 그럴만도 했던 것이, 워낙 아무런 문제 없이 
자동으로 이쁘게 변환되는 모습을 보고 있으니 소스코드를 확인해 볼 필요도 없었고, *페이지 소스보기* 버튼을 쳐다볼 일도 없었다.  
더 솔직하게 말하자면, 이 단순한 문법까지 내가 공부를 해야하나 싶은 자만이었지 :D...
  
그러다 이번에 [[Python 재무제표 크롤링 #3]](https://hyeon9mak.github.io/Python-%EC%9E%AC%EB%AC%B4%EC%A0%9C%ED%91%9C-%EC%9B%B9-%ED%81%AC%EB%A1%A4%EB%A7%81-3/) 포스트의 이미지를 수정하면서 이미지와 텍스트의 정렬 때문에 꽤 오랜 시간 애를 먹으며 HTML 소스까지 둘러보게 되었다.

```html
// 마크다운으로 작성
![sample]](https://user-images.githubusercontent.com/37354145/73710413-3a9f7400-4747-11ea-8e69-f06feedf6fdb.PNG){: .align-center}

// html로 변환
<p><img src="https://user-images.githubusercontent.com/37354145/73710413-3a9f7400-4747-11ea-8e69-f06feedf6fdb.PNG" alt="sample" class="align-center" /></p>
```

일단 첫 번째 주목할 부분은, 마크다운 문법으로 글을 작성할 시 '<p>' 태그가 무조건 포함된다는 것.  

```html
// 마크다운으로 작성
동해물과 백두산이(공백)(공백)마르고 닳도록.

동해물과 백두산이
(공백)(공백)
마르고 닳도록.

// html로 변환
<p>동해물과 백두산이<br />
마르고 닳도록.</p>

<p>동해물과 백두산이</p>

<p>마르고 닳도록.</p>
```
이를 통해 마크다운 문단 개행의 비밀이 풀렸다.
  
두 번째 주목할 수 있는 부분은 {: .align-center} 와 같은 문법을 통해 태그의 class 속성을 컨트롤 할 수 있다는 것.  
다만 class의 경우 기존 자신의 css파일의 설정에서 class에 대한 설정을 미리 해주어야 하는 것 같았다.
  
고작 저 두 가지로 2~3시간 가량을 앓았지만, 덕분에 다음 포스팅은 더 깔끔하게 잘 쓸 수 있겠지.  
끝!  
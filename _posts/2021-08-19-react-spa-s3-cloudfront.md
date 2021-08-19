---
title: "React S3, CloudFront에 배포하기"
date: 2021-08-19
tags:
    - react
    - s3
    - cloudfront
toc: true
toc_sticky: true 
toc_label: "React S3, CloudFront에 배포하기"
---

## 💎 summary
babble 팀 서비스를 배포한 후로 새로고침을 할 때나 초기 페이지를 거치지 않고 URL로 직접 페이지를 이동하는 경우
계속해서 **403 FORBIDDEN** 에러를 마주쳤다. 왜 그런지 이유를 찾던 중, 얼핏 들었던 "React는 
HTML 파일을 하나로만 구성해서 개발한다."가 떠올라서 React SPA에 대해 알아봤다.

> React는 SPA(Single Page Application)를 지원한다. SPA는 하나의 HTML 페이지와 애플리케이션 실행에 필요한 JavaScript와 CSS 같은 모든 자산을 로드하는 애플리케이션이다. 
페이지 또는 후속 페이지의 상호작용은 서버로부터 새로운 페이지를 불러오지 않으므로 페이지가 다시 로드되지 않는다.
>
> 대게 react-router-dom을 이용해 SPA를 구현한다.
> react-router-dom은 입력된 URL에 따라 원하는 컴포넌트를 로드해주는 라이브러리다.

프론트 쪽 지식이 많지않아 명확한 정리는 어렵지만... React SPA를 이용하면 HTML 파일은 `index.html` 하나 뿐이고, 나머지 페이지들은 JavaScript와 CSS를 통해 컴포넌트화 되어 관리된다는 것 같았다.

AWS S3, CloudFront 에서는 별도의 **403 FORBIDDEN**, **404 NOT_FOUND** 에러 페이지용 HTML 파일을 요구하는데 React로 개발된 프론트에는 해당 페이지들이 존재하지 않으니, 당연히 에러가 발생할 수 밖에 없었다.

다행스럽게도 해결 방법은 간단했다!

<br>

## 💎 S3 - 정적 웹 사이트 호스팅 설정
![image](https://user-images.githubusercontent.com/37354145/129546614-2fa24a60-6702-4ab8-b287-42f377408223.png)

우선 S3 Bucket 화면으로 이동한다. (아니나 다를까 `index.html` 파일 하나만 존재하는게 보인다.)

![image](https://user-images.githubusercontent.com/37354145/129546624-e8fe1d1f-0e6e-4b88-b09d-8240a064a2ee.png)

`속성` - `정적 웹 사이트 호스팅` 메뉴의 편집 버튼을 클릭해서 편집 화면으로 이동한다.

![image](https://user-images.githubusercontent.com/37354145/129546632-75dcb8c0-c6ee-40e1-98d3-61e35304a378.png)

`정적 웹 사이트 호스팅 편집` 메뉴에서 `인덱스 문서`와 `오류 문서`에 모두 `index.html`을 기입해준다. 
인덱스 문서로 `index.html` 파일을 사용할 것이며, 오류가 발생해도 `index.html` 파일을 통해 트래픽이 
routing 되어 react-router-dom의 routing을 탈 수 있다고 한다.

<br>

## 💎 CloudFront - Error pages 설정
![image](https://user-images.githubusercontent.com/37354145/129546646-e0eb43a1-78e2-4d77-8861-739d26c22351.png)

CloudFront Distribution의 `Error pages` 메뉴로 이동 후 `Create custom error response` 버튼을 클릭한다.

![image](https://user-images.githubusercontent.com/37354145/129546658-fbcef56d-f87d-4782-a099-b211e7084554.png)

### 1. HTTP error code
어떤 에러를 핸들링 할 것인지 선택한다.

### 2.  Error caching minimum TTL
에러 트래픽을 핸들링 하기 까지 최대 시간을 지정한다. 나는 5로 지정했다.

### 3. Customize error response
에러 핸들링 방법을 설정한다. React SPA를 이용할 것이므로 `Yes`를 선택해야 한다.

### 4. Response page path
React SPA의 답은 정해져있다. 루트 경로를 포함한 index.html 파일의 위치(`/index.html`)를 기입한다.

### 5. HTTP Resonse code
반환할 상태코드를 지정한다. 에러 트래픽에 대한 상태코드보다, index.html 파일의 상태코드로 생각하고 **200 OK**를 지정하면 된다.

![image](https://user-images.githubusercontent.com/37354145/129546674-22220c3c-a093-4de8-a5ed-1f0fbce8f590.png)

babble 팀에서는 **403 FORBIDDEN**과 **404 NOT_FOUND** 2개에 대해 지정해줬다.

<br>

## References
- [CloudFront로 React앱 배포하기 - 2 - _junukim.log](https://velog.io/@_junukim/CloudFront%EB%A1%9C-React%EC%95%B1-%EB%B0%B0%ED%8F%AC%ED%95%98%EA%B8%B0-2)
- [[TIL] AWS S3/CloudFront에 배포된 React 앱의 Routing 설정법 - Leon Chaewon Kong's dev blog](https://chaewonkong.github.io/posts/til-react-router-s3-cloudfront.html)
- [React 기술 용어 모음 - React](https://ko.reactjs.org/docs/glossary.html)

---
title: "400 BAD REQUEST vs 404 NOT FOUND"
date: 2021-06-05
tags:
    - Http상태코드
toc: false
toc_sticky: true
toc_label: "400 BAD REQUEST vs 404 NOT FOUND"
---

레벨2 기간 미션을 진행하던 중 [크로플](https://github.com/perenok)이 도저히 이유를 알 수 없는 테스트 에러를 마주쳐서, 도와줄 사람을 찾고 있다며 찾아왔다.  
이 때 크로플이 대략 아래와 같은 테스트 코드를 보여줬다.

```java
@DisplayName("Bearer Auth 유효하지 않은 토큰")
@Test
void myInfoWithWrongBearerAuth() {
    TokenResponse tokenResponse = new TokenResponse("accesstoken");

    RestAssured
        .given().log().all()
        .auth().oauth2(tokenResponse.getAccessToken())
        .accept(MediaType.APPLICATION_JSON_VALUE)
        .when().get("/api/members/me")
        .then().log().all()
        .statusCode(HttpStatus.UNAUTHORIZED.value());
}
```
```
Expect: <401> UNAUTHORIZED
Actual: <404> NOT_FOUND
```

척 봤을 때 별 문제 없어보이는 테스트 코드였지만, 결과 값이 계속해서 `404 NOT_FOUND`로 나오고 있었다.

> "404는 URI를 못 찾겠다는거 아니야? 크로플이 컨트롤러 쪽 URI를 실수한거 아녀?"  
> 
> "그치, 나도 당연히 그렇게 생각하고 다시 확인해봤는데 역시 문제가 없어."

테스트 코드와 컨트롤러 계층 코드를 계속해서 살펴봤지만, 역시나 문제점을 찾지 못 하고 계속 헤맸다.  
결국 별 다른 소득 없이 자리로 되돌아간 크로플... 몇 시간 후에야 승전보를 울리며 되돌아왔다.

> "찾았어! 로그인을 시도할 때 유효한 Email(ID)를 찾지 못하면 404 NOT_FOUND를 던지게 해놨어."

크로플의 승전보를 듣자마자 머릿 속에 '아하!' 가 떠올랐다.

![image](https://user-images.githubusercontent.com/37354145/120882255-5f447e00-c611-11eb-8fb2-86b043cd7942.png)

<br>

협업 미션을 진행하는 동안 백/프론트엔드 크루들과 상태코드를 합의할 일이 있었는데,  
'DB 쪽을 조회했을 때 원하는 자원을 찾지 못하면 404 NOT_FOUND가 어떨까요?'  
라는 나의 의견에 [마갸](https://github.com/MyaGya)가 곧바로 반대했다.

> "`404 NOT_FOUND`는 API URI를 조회하지 못했다는 의미가 더 강해서, `400 BAD_REQUEST`가 적절할거 같아요."

마갸의 설명에 곧장 수긍했지만, 조회 실패 이외에도 대부분의 예외상태가 `400 BAD_REQUEST` 로 도배되는 것이 마음 한 켠에 계속 걸렸다. 그런데 그런 내가 크로플의 `404 NOT_FOUND`를 보면서 마갸의 설명처럼 해석하고 있었다.

> **404 Not Found**  
> HTTP 404 Not Found 클라이언트 오류 응답 코드는 서버가 요청받은 리소스를 찾을 수 없다는 것을 의미합니다. 404 페이지를 > 띄우는 링크는 대체로 브로큰 링크(broken link) 또는 데드 링크(dead link)라고 부르며, link rot 대상일 수도 있습니다.
> 
> 404 상태 코드는 리소스가 일시적, 또는 영구적으로 사라졌다는 것을 의미하지는 않습니다. 리소스가 영구적히 삭제되었다면 
> 404 상태 코드 대신 410 (en-US) (Gone) 상태 코드가 쓰여야 합니다.

MDN Web Docs의 설명에는 `404 NOT_FOUND`는 서버가 요청받은 리소스를 찾을 수 없다는 것을 의미한다고 적혀있다.  
여기서 '리소스'는 내가 생각했던 DB 자원을 의미하는게 아니라, API URI 요청 경로를 의미하는 바가 더 큰 것 같다.

<br>

결국 수 많은 예외 상황들이 `400 BAD_REQUEST`로 도배되는 게 꼭 나쁜게 아니었다.   
**딱히 적절한 상태 코드가 없으니** `400 BAD_REQUEST`로 도배될 수 밖에 없었다. 

별도로 디테일한 메세지를 제공해서 정확한 진단을 내릴 수 있도록 도와주는게 더 중요하다고 생각된다.

<br>

## References
- [404 Not Found - MDN Web Docs](https://developer.mozilla.org/ko/docs/Web/HTTP/Status/404)
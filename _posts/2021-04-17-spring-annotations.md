---
title: "스프링 어노테이션 정리"
date: 2021-04-17
tags:
    - Spring
toc: true
toc_sticky: true 
toc_label: "스프링 어노테이션 정리"
---

스프링을 학습하면서 배운 어노테이션들에 대해 하나씩 정리해볼 생각이다.
꾸준하게 업데이트 할 글!

## @RequestMapping
주로 컨트롤러가 관리할 상위 경로를 매핑하는데 사용한다. 각 메서드 별로 붙여서 사용 할 수도 있다. 
이때는 `method` 옵션을 통해 어떤 형식인지를 지정해주어야 한다.

```java
@RestController
@RequestMapping("/chess-game-path")
public class ChessController {
    
    // /chess-game-path/move
    @RequestMapping(path = "/move", method = RequestMathod.POST)
    private @ResponseBody StatusDTO movePiece(@RequestBody final MoveDTO moveDTO) {
        return new StatusDTO(...);
    }
}
```

<br>

## @GetMapping, @PostMapping
**@GetMapping()** :  `@RequestMapping(method = RequestMethod.GET)` 를 줄인 것.  
**@PostMapping()** : `@RequestMapping(method = RequestMethod.POST)` 를 줄인 것.

method 옵션을 단축한 것.  
한 눈에 메서드 종류가 분간되어서 더 자주 쓰게 된다.

---

### path
URL 요청 경로를 지정한다.

```java
@GetMapping(path = "/message")
@PostMapping(path = "/message")
```

---

### consumes
요청 받는 타입의 종류를 헤더에 미리 지정한다.

```java
@GetMapping(path = "/message", consumes = "application/json")
```

---

### produces
반환 타입의 종류를 헤더에 미리 지정한다.

```java
@PostMapping(path = "/message", produces = "application/json")
```

---

### params
URL 파라미터로 넘어오는 값을 받아내는데 사용한다.
```
###### HTTP Request ######
GET /message?name=hello HTTP/1.1
```
```java
@GetMapping(path = "/message", params = "name=air")
public ResponseEntity<String> messageForParam() {
    return ResponseEntity.ok().body("air");
}
```

---

### headers
header 로 넘어오는 값을 받아내는데 사용한다.
```
###### HTTP Request ######
GET /message HTTP/1.1
header: air is my pair
```
```java
@GetMapping(path = "/message", headers = "HEADER=hi")
public ResponseEntity<String> messageForHeader() {
    return ResponseEntity.ok().body("air is my pair");
}
```

---

### String 반환에 대해
```java
@GetMapping(path = "/homepage")
public String messageForHeader() {
//    return "index.html"
    return "/index.html"
}
```

- `index.html` 의 경우 상대경로로 추가되어 `localhost:8080/homepage/index` 이 요청 된다.
  
- `/index.html` 의 경우 절대경로로 변환되어 `localhost:8080/index` 이 요청된다.  
    - 단, 이 때 `/` 주소엔 `/resources/static` 이 함축되어 있다. 그래서 실제 페이지가 호출되는 경로는 
      `localhost:8080/(resources/static/)index` 가 된다.

<br>

## @RequestBody
http 요청 메세지의 body 영역을 객체로 변환. 주로 post 메서드와 함께 사용된다. 
body 가 존재하지 않는 get 메서드로는 당연히 사용 할 수 없다.
`json`이나 `xml` 형태의 데이터를 message converter를 통해 객체(DTO)로 바인딩한다.

```
###### HTTP Request ######
POST /users/body HTTP/1.1
Body:
{
    "id": null,
    "name": "이름",
    "email": "email@email.com"
}
```
```java
@PostMapping("/users/body")
public ResponseEntity requestBody(@RequestBody UserDto userDto) {
    User newUser = new User(1L, userDto.getName(), userDto.getEmail());
    return ...
}
```

> 확실하지 않음. get 메서드에도 body를 추가해서 보낸다면 동작이 가능한지 테스트 해봐야 한다.
> get 메서드도 충분히 body를 가질 수 있다.
> @RequestParam 에 preemtive 타입이 넘어올 경우 알아서 처리해준다는 이야기도 있다 - 제이슨 출처.
> 이 부분에 대해서도 테스트햅고 정리해야할 듯.

<br>

## 컨트롤러 메서드 private 접근 제한자
어노테이션을 붇여서 사용하는 메서드들은 모두 reflaction 기법을 통해 재해석 되므로, 접근제한자가 무시된다. 
때문에 `private` 접근제한자를 사용해도 정상적으로 웹 요청이 수행된다.

`public` 접근제한자를 통해 공개되고 있음을 명시해 주는 것이 컨벤션이므로, `public`을 사용하도록 하자.

<br>

---
title: "스프링 어노테이션 정리"
date: 2021-04-17
tags:
    - Spring
toc: true
toc_sticky: true 
toc_label: "스프링 어노테이션 정리"
---

2021년 4월 ~ 5월 기간 동안 배운 스프링 어노테이션들에 대해 정리했다.

## @Configuration
`@Configuration` 어노테이션은 해당 클래스를 스프링 설정 클래스로 지정하는데 사용된다.

```java
import org.springframework.context.annotation.Configuration;

@Configuration
public class AppContext {
    ...
}
```

<br>

## @Bean
```java
public class Greeter {

    private String format;

    public String greet(String guest) {
        return String.format(format, guest);
    }

    public void setFormat(String format) {
        this.format = format;
    }
}
```
```java
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

@Configuration
public class AppContext {

    @Bean
    public Greeter greeter() {
        Greeter g = new Greeter();
        g.setFormat("%s, 안녕하세요!");
        return g;
    }
}
```

`@Bean` 어노테이션을 메서드 위에 붙이면, 해당 메서드가 생성한 객체를 스프링이 관리하는 Bean 객체로 등록하게 된다.

<br>

## @Autowired
```java
@Configuration
public class AppCtx {
  @Bean
  public MemberDao memberDao() {
    return new MemberDao();
  }
  
  @Bean
  public ChangePasswordService changePwdSvc() {
    ChangePasswordService pwdSvc = new ChangePasswordService();
    pwdSvc.setMemberDao(memberDao());		// 의존성 직접 주입
    return pwdSvc;
  }
}
```

요즘은 스프링 부트와 함께 의존 자동 주입(@Autowired)를 기본으로 사용하는 추세다.  
의존성 자동 주입은 매우 간단하다. 의존을 주입할 대상에 `@Autowired` 어노테이션을 붙이면 끝난다.

```java
@Configuration
public class AppCtx {
  @Bean
  public MemberDao memberDao() {
    return new MemberDao();
  }
  
  @Bean
  public ChangePasswordService changePwdSvc() {
    ChangePasswordService pwdSvc = new ChangePasswordService();
    // 의존성 주입 코드가 사라졌다.
    return pwdSvc;
  }
}
```
```java
public class ChangePasswordService {
  
  @Autowired
  private MemberDao memberDao;
  
  ...
    
  public void setMemberDao(MemberDao memberDao) {	// 쓸모가 없어졌다.
    this.memberDao = memberDao;
  }
}
```

필드에 `@Autowired` 어노테이션이 붙으면 설정 클래스에서 의존을 주입하지 않아도 스프링이 알아서 데이터타입이 일치하는 Bean 객체를 찾아 할당한다. 
필드에 `@Autowired` 어노테이션이 붙은 경우 `MemberDao` 주입에 대한 setter 메서드도 필요가 없어진다.

`@Autowired` 어노테이션은 필드 뿐만 아니라 생성자, 메서드 위에도 붙일 수 있다.

```java
public class ChangePasswordService {
  
  private MemberDao memberDao;
  
  ...
    
  @Autowired
  public void setMemberDao(MemberDao memberDao) {
    this.memberDao = memberDao;
  }
}
```
```java
public class ChangePasswordService {
  
  private MemberDao memberDao;
  
  @Autowired
  public ChangePasswordService(MemberDao memberDao) {
    this.memberDao = memberDao;
  }
  
  ...
}
```

생성자의 경우 조금 더 특별하게, 생성자가 1개일 경우에 한해서 `@Autowired`를 생략할 수 있다.
```java
public class ChangePasswordService {
  
  private MemberDao memberDao;
  
  public ChangePasswordService(MemberDao memberDao) {
    this.memberDao = memberDao;	// 어노테이션이 없지만, 있는 것과 같은 효과
  }
  
  ...
}
```

<br>

## @Qualifier
데이터 타입이 일치하는 Bean이 2개 이상이어도 `@Qualifier` 어노테이션을 통해 의존 주입이 가능하다.

```java
@Configuration
public class AppCtx {

  @Bean
  @Qualifier("ExampleNameMemberDao")		// "이 별명으로 호출할거야!" 라고 @Qualifier 선언
  public MemberDao memberDao1() {
    return new MemberDao();
  }
  
  @Bean
  public MemberDao memberDao2() {
    return new MemberDao();
  }
}
```
```java
public class ChangePasswordService {
  
  private MemberDao memberDao;
  
  @Autowired
  @Qualifier("ExampleNameMemberDao")
  public ChangePasswordService(MemberDao memberDao) {
    this.memberDao = memberDao;
  }
  
  ...
}
```

`@Qualifier` 어노테이션을 통해 설정한 이름과 일치하는 Bean 객체를 찾아 주입을 진행한다.

<br>

## 컨트롤러 메서드 private 접근 제한자
어노테이션을 붇여서 사용하는 메서드들은 모두 reflaction 기법을 통해 재해석 되므로, 접근제한자가 무시된다. 
때문에 `private` 접근제한자를 사용해도 정상적으로 웹 요청이 수행된다.

`public` 접근제한자를 통해 공개되고 있음을 명시해 주는 것이 컨벤션이므로, `public`을 사용하도록 하자.

<br>

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
- http 요청 메세지의 body 영역을 객체로 변환. 주로 post 메서드와 함께 사용된다. 
- body 가 존재하지 않는 get 메서드로는 당연히 사용 할 수 없다.
- `json`이나 `xml` 형태의 데이터를 message converter를 통해 객체(DTO)로 바인딩한다.
- default constructor가 필요하다. 리플렉션이 default constructor를 통해 매핑하기 때문.

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

> GET Method에서도 @RequestBody 어노테이션으로 데이터를 받아낼 수 있다. (즉, GET Method도 body를 가질 수 있다.)
> 다만 POST와 GET은 각각 서로 @RequestBody로 넘어오는 데이터를 처리하는 방식이 다르다.
>
> POST Method는 JSON으로 넘어오는 데이터에 대해서 Jackson - ObjectMapper - reflection 을 통해 데이터를 처리하기 때문에 default constructor가 필요하며, setter는 필요가 없다.
> 
> GET Method는 JSON이 아닌 Query Parameter로 데이터가 넘어온다. 그리고 이에 따라 WebDataBinder를 사용한다. 
> WebDataBinder는 reflection이 아닌 Java Bean 데이터 할당 방법을 사용하며, 이는 constructor가/Getter/Setter 를 가지는 객체를 의미한다. 
> 즉, setter를 필요로 한다.

<br>

## @ModelAttribute
- jsp, hbs, html 등의 파일에서 `<form>` 태그를 통해 전송되는 text 형태의 데이터들을 DTO에 매핑시켜주는 어노테이션.
- @RequestBody와 달리 default constructor가 없어도 된다. 
- 다른 블로그에선 setter 메서드가 필요하다고 하는데, 실제 테스트해보니 setter 메서드 없이도 매핑 성공함
    - 스프링 버전 별로 차이가 있는거 같다.
    
```java
// Controller Method
  @PostMapping("/test/{name}")
  public ResponseEntity<Void> test(@ModelAttribute TestRequestDto testRequestDto) {
      System.out.println(testRequestDto.getName());
      return ResponseEntity.ok().build();
  }
```
```java
// DTO
public class TestRequestDto {

    private String name;

    public TestRequestDto(String name) {
        this.name = name;
    }

    public String getName() {
        return name;
    }
}
```
```java
// 테스트 코드
    @Test
  void 테스트() {
      RestAssured
          .given().log().all()
          .contentType(MediaType.TEXT_PLAIN_VALUE)
          .when().post("/test/현구막")
          .then().log().all()
          .extract();

  }
```
```
// 결과
현구막
```

<br>

## References
- [@Request Body에서는 Setter가 필요없다?](https://jojoldu.tistory.com/407)
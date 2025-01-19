---
title: "servlet filter 를 활용해 불필요한 요청 원천 차단하기"
date: 2025-01-19
toc: true
toc_sticky: true
toc_label: "servlet filter 를 활용해 불필요한 요청 원천 차단하기"
---

서버를 운영하다보면 서버가 핸들링 불가능한, 혹은 불필요한 요청이 끊임없이 들어온다.
크롤링 봇, 스팸 봇, 무분별한 요청을 보내는 클라이언트 등...
이런 요청들은 서버의 컴퓨팅 자원을 낭비 시키고, 개발자에게는 불필요한 로그 알림 등 피로를 준다.

다행스럽게도 이러한 요청들은 대부분 패턴을 가지고 있기 때문에, 해당 패턴을 기준으로 
애플리케이션 서버(스프링 등)로 요청이 전달 되기 전 웹 서버(Nginx, AWS GW 등)에서 미리 차단을 할 수 있다.

이번에 들어온 스팸 요청도 `OPTION /`(HTTP OPTION method + root path) 라는 패턴을 갖고 있었다.
앞서 말했듯 웹 서버에서 미연에 차단하는게 베스트겠지만, 이번에는 스프링 애플리케이션을 통해 차단해보고자 아래와 같은 고민들을 해보았다.

<br>

## 👮‍♂️ 1. 어디서 차단을 해야할까?

우선 간단하게 client 로부터 요청이 전달되는 과정에 대해 생각해보자.  
**client <-> filter <-> dispatcher servlet <-> interceptor <-> handler(controller)**

<img width="1827" alt="Image" src="https://github.com/user-attachments/assets/7d97b2a0-9983-4155-94ae-c2b87afbad63" />

이미 잘 알려져 있듯, client 로부터 spring application 까지 HTTP 요청이 전달되는 과정은 위 그림과 같다.

> 이 관계에서 dispatcher servlet 부터가 spring mvc 영역에 포함되고, filter 는 servlet container(e.g. tomcat) 의 영역이다.
> 
> 요즘은 spring boot 를 많이 활용하다보니 tomcat 이 spring boot 내부에 내장(embedded tomcat)되어 있어서 filter 가 spring mvc 영역에 포함되어 있는 것 처럼 느껴질 수 있다.

각각 요소들은 아래와 같은 컨셉(역할)을 갖고 있다.

- filter: 요청이 dispatcher servlet 에 도달하기 전, 후에 추가적인 작업을 수행한다.
- dispatcher servlet: 요청 경로(path) 에 따라 적절한 handler(controller) 를 찾아주는 역할을 수행한다.
- interceptor: dispatcher servlet 에서 찾아진 handler 를 실행하기 전, 후에 추가적인 작업을 수행한다.

즉 `OPTION /` 요청을 차단할 수 있는 위치는 filter, interceptor 중 하나가 된다.
만약 interceptor 에서 `OPTION /` 요청을 확인하고 차단을 하게 된다면, filter 와 dispatcher servlet 을 모두 거쳐야 하므로 불필요한 자원 낭비가 커진다.
때문에 filter 영역에서 custom filter 를 만들어 차단을 진행하는 것이 이상적으로 보인다.
아래와 같이 `OptionsMethosRootPathRequestFilter` 라는 이름의 custom filter 를 만들어 요청을 차단하면 될 것 같다.

<img width="801" alt="Image" src="https://github.com/user-attachments/assets/89411854-ee32-4f22-a7a0-510595e2d1eb" />

`OptionsMethosRootPathRequestFilter` 는 `OPTION /` 요청이 전달되면 `METHOD_NOT_ALLOWED` 상태 값을 곧바로 응답하고,
그 외에는 다음 filter 에게 동작을 일임하도록 구성했다.

그렇다면 `OptionsMethosRootPathRequestFilter` 는 정확하게 어떤 포인트에서 위치 시키는 것이 좋을까?
이를 결정하기 위해선 filter 의 구조를 이해해야겠다.

<br>

## 👮‍♂️ 2. filter 는 어떻게 구성되어 있을까?

servlet 과 spring mvc 영역을 조금 더 확대해서 살펴보자.

<img width="1932" alt="Image" src="https://github.com/user-attachments/assets/8ed29f4b-ecf4-40d8-b8b8-e6804fb6692a" />

client 로부터 전달된 요청은 servlet container 의 filter chain 들을 거쳐 spring mvc 의 dispatcher servlet 까지 도달한다.
filter chain 은 여러개의 filter 들이 연결된 구조로, 각 filter 들은 순차적으로 요청을 처리하고, 다음 filter 로 요청을 전달한다.
아마도 spring security 를 한번이라도 사용해봤다면, filter chain 의 구조를 어느정도 알고 있을 것이다.

<img width="1402" alt="Image" src="https://github.com/user-attachments/assets/240f73dc-0aa3-49d1-8a11-2d90f3e1a698" />

실제로 `org.apache.tomcat.embed:tomcat-embed-core` 라이브러리를 탐색하면 filter 가 chain 구조로 연결되어 있다는 걸 유추할 수 있다.
core 패키지 내부 `ApplicationFilterChain` 클래스 `internalDoFilter` 메서드를 확인해보면
요청이 전달될 때 어떤 필터들을 거치는지 확인해볼 수 있다.

자세히 살펴보면 4번째 인덱스에 `SpringSecurityFilterChain` 의 ` DelegatingFilterProxy` 필터가 눈에 들어온다.
spring security 역시도 filter chain 사이에 껴서 chain 중 하나로 연결되었다는 것을 알 수 있다.

<img width="2117" alt="Image" src="https://github.com/user-attachments/assets/23a8f49c-61bf-4ac2-a579-892262eb188e" />

spring security 부분까지 조금 더 해상도를 올려서 표현해보면 위 그림과 같아진다.
물론 spring security filter 도 마찬가지로 한가지가 아닌 여러가지 보안과 관련된 정책을 나누어 관리하므로,
해상도를 한 단계만 더 높이면 아래 그림과 같이 표현할 수 있다.

<img width="2060" alt="Image" src="https://github.com/user-attachments/assets/8437ff43-62b5-437e-a3f5-dedffef25f1f" />

실제로 `org.springframework.security:spring-security-web` 라이브러리를 탐색해보면 `DelegatingFilterProxy`, `FilterChainProxy` 클래스를 확인할 수 있다.
그리고 `FilterChainProxy` 클래스 `getFilters()` 메서드를 확인해보면 어떤 보안 관련 filter 들을 기본적으로 활용하는지 확인할 수 있다.

<img width="1293" alt="Image" src="https://github.com/user-attachments/assets/2f489333-7f5b-4145-affb-70a17aa48b30" />

`spring-security-web:6.6.14` 기준으로는 `DisableEncodeUrlFilter` 를 필두로 filter 들이 chaining 되어 있는 걸 볼 수 있다.

<br>

## 👮‍♂️ 3. 그럼 spring security filter chain 에 연결하면 될까?

spring security 에서 가장 먼저 동작하는 filter 가 뭔지(`DisableEncodeUrlFilter`)도 파악했겠다, 
편의를 위해 `addFilterBefore`, `addFilterAfter` 와 같은 메서드도 제공해주니 곧바로 `DisableEncodeUrlFilter` 앞에
`OptionsMethosRootPathRequestFilter` 를 위치 시키는 것도 좋아보인다.

그러나 앞서 아래와 같은 이야기를 했다.

> 만약 interceptor 에서 `OPTION /` 요청을 확인하고 차단을 하게 된다면, 
> filter 와 dispatcher servlet 을 모두 거쳐야 하므로 불필요한 자원 낭비가 커진다.
> 때문에 filter 영역에서 차단을 진행하는 것이 이상적으로 보인다.

spring security 는 앞선 4개의 filter(`characterEncodingFilter`, `webMvcObservationFilter`, `formContentFilter`, `requestContextFilter`)를
거치고 나서야 동작하게 되는 filter 다. `DisableEncodeUrlFilter` 앞에 `OptionsMethosRootPathRequestFilter` 를 추가할 경우 매번 4개의 filter 를 거쳐서야
"엇, `OPTION /` 요청이네? 거절해야지." 라는 동작을 수행할 수 있게 된다. (`DelegatingFilterProxy`, `FilterChainProxy` 를 거친다는 것까지 계산한다면...)

<img width="1969" alt="Image" src="https://github.com/user-attachments/assets/017a8fa9-f8f6-4dea-84f3-4c5ffb0eee0d" />

게다가 spring security filter chain 은 이름 그대로 보안과 관련된 동작을 수행하는 filter 들의 집합체다.
보안과 크게 관련없는 `OptionsMethosRootPathRequestFilter` 를 spring security filter chain 에 위치시킬 경우
추후 유지보수를 진행할 다른 개발자가 filter 의 의미를 잘못 해석("`OPTION /` 요청 관련해서 보안 이슈가 있었나?")할 위험이 존재한다. 

<br>

## 👮‍♂️ 4. 그래서, 어디에 연결할까?

<img width="2029" alt="Image" src="https://github.com/user-attachments/assets/2f530a21-1a18-4f9c-8ecc-3c80d73d0376" />

사실 이 단계까지 왔다면 `OptionsMethosRootPathRequestFilter` 의 목적지는 명확해진다.
servlet filter chain 전체에서 가장 첫 번째로 수행되는 filter 를 찾아내고, 그 filter 보다 먼저 수행되도록 하면 된다.
즉, 첫 번째 filter 를 찾아내면 된다.

그리고 이 글에서는 앞선 디버깅 과정에서 어떤 filter 들이 chain 을 구성하고 있는지 눈으로 확인했다.
바로 `CharacterEncodingFilter` 다.

<img width="1483" alt="Image" src="https://github.com/user-attachments/assets/fc8d0254-a7f3-477c-b142-cd80aa5c7a54" />

`CharacterEncodingFilter` 를 순서를 결정해 주입하는 클래스는 `OrderedCharacterEncodingFilter` 다.
`OrderedCharacterEncodingFilter` 를 확인해보면 최우선 순위를 갖기 위해 `Integer.MIN_VALUE` 를 사용하는 걸 볼 수 있다. 

<img width="784" alt="Image" src="https://github.com/user-attachments/assets/5f739694-48be-4e02-b2de-2440c93a8de0" />

이미 spring boot 에서 기본 filter 에 최우선 순위를 할당해두었는데, 어떻게 `CharacterEncodingFilter` 앞에 `OrderedCharacterEncodingFilter` 를 위치시킬 수 있을까?

<br>

## 👮‍♂️ 5. filter chain 맨 앞에 새로운 filter 추가하기 

의외로 해법은 간단하다. `CharacterEncodingFilter` 와 동일한 최우선 순위 `Integer.MIN_VALUE` 를 할당해주면 된다.

<img width="521" alt="Image" src="https://github.com/user-attachments/assets/d48a8d3c-4cf8-46a6-9a15-44f2affa1393" />

(`org.springframework.core.Ordered.HIGHEST_PRECEDENCE` 의 값은 `Integer.MIN_VALUE` 다.)
어떻게 동일한 최우선 순위를 주어도 `CharacterEncodingFilter` 보다 앞에 `OrderedCharacterEncodingFilter` 를 위치시킬 수 있을까?

spring 은 사용자가 명시한 custom bean 에 대해 먼저 등록을 진행하고, 이후 auto configuration 등을 통해 선언된 bean 을 등록한다.
spring context 초기화 과정에서 `OrderedCharacterEncodingFilter` 가 먼저 등록되고, 이후 `CharacterEncodingFilter` 가 등록된다.
그 후 `order` 를 기반으로 우선 순위 정렬을 진행하지만, `OrderedCharacterEncodingFilter` 와 `CharacterEncodingFilter` 는 서로 값이 같기 때문에 순서 변경이 일어나지 않는다.

<img width="1400" alt="Image" src="https://github.com/user-attachments/assets/9b67c978-8e93-429d-9d52-1b5f599a8018" />

실제로 `OrderedCharacterEncodingFilter` 의 우선 순위를 `Integer.MIN_VALUE` 로 주느냐, `Integer.MIN_VALUE + 1` 로 주느냐에 따라
`OrderedCharacterEncodingFilter` 와 `CharacterEncodingFilter` 간 순서가 달라진다.

<br>

## 👮‍♂️ 6. 결과

`OrderedCharacterEncodingFilter` 등록을 마친 후 `OPTION /` 요청을 보내면 
`ApplicationFilterChain#internalDoFilter` 에서 `OrderedCharacterEncodingFilter` 가 먼저 동작하는 걸 확인할 수 있게 된다.

<img width="1316" alt="Image" src="https://github.com/user-attachments/assets/2608dd8c-772b-4019-b55b-9857e05a8d5d" />

그리고 `OrderedCharacterEncodingFilter` 에 설정해두었 듯, `405 Method Not Allowed` 상태 코드를 응답이 돌아오는 걸 확인할 수 있다.

<img width="608" alt="Image" src="https://github.com/user-attachments/assets/2760b411-683f-44b5-8d08-a2a723f76b22" />

덕분에 가장 최진입점부터 `OPTION /` 요청을 차단하고 알림지옥으로부터 탈출 할 수 있었다!

<br>

## 👮‍♂️ 번외. filter 중복 호출 방지

여기까지 오고 나면 `OrderedCharacterEncodingFilter` 와 같은 filter 들도 모두 spring bean 으로 이루어진 것을 알 수 있다.
간편하게 `@Component` 어노테이션을 통해 bean 으로 등록해도 될 것 같은데, 굳이 번거롭게 `OncePerRequestFilter()` 를 상속하는 이유는 무엇일까?

크게 2가지 이유가 있다.

1. redirect 가 진행될 때 filter 중복 호출 방지
2. 개발자의 실수 방지

첫 번째 이유의 경우 예외 발생 등의 이유로 http redirect 가 발생할 경우, 첫 filter 부터 다시 호출이 시작되어 중복 filter 호출이 발생할 수 있다.

두 번째 이유의 경우, 개발자가 filter 를 `@Component` 로 등록하고, `addFilterBefore`, `addFilterAfter` 메서드를 통해 filter 를 추가할 경우
동일한 filter 가 2회씩 spring bean 으로 등록되어 중복 호출이 발생할 수 있다.
[`@Component` 어노테이션 등으로 spring bean 등록된 `Servlet`, `Filter`, `Listener` 인스턴스들은 servlet container 에 자동 등록되기 때문이다.](https://docs.spring.io/spring-boot/reference/web/servlet.html#web.servlet.embedded-container.servlets-filters-listeners.beans)

때문에 `OncePerRequestFilter()` 를 상속받아 filter 를 구현하여 명시적으로 '한 번만 호출되어야 한다' 라는 의미를 부여하고,
중복 호출을 방지해주는 것이 좋겠다.

<br>

## References

- [https://docs.spring.io/spring-boot/api/java/org/springframework/boot/web/servlet/FilterRegistrationBean.html?utm_source=chatgpt.com](https://docs.spring.io/spring-boot/api/java/org/springframework/boot/web/servlet/FilterRegistrationBean.html?utm_source=chatgpt.com)
- [https://docs.spring.io/spring-boot/reference/web/servlet.html#web.servlet.embedded-container.servlets-filters-listeners.beans](https://docs.spring.io/spring-boot/reference/web/servlet.html#web.servlet.embedded-container.servlets-filters-listeners.beans)
- [https://www.baeldung.com/spring-onceperrequestfilter](https://www.baeldung.com/spring-onceperrequestfilter)

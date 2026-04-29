---
title: "Metric URI 미관리로 인한 Netty 메모리 누수 해결"
date: 2026-04-29
toc: true
toc_sticky: true
toc_label: "Metric URI 미관리로 인한 Netty 메모리 누수 해결"
---

## 🚰 메모리 누수 발생

지난 수 개월간 알 수 없는 이유로 동작중인 Netty application 의 메모리 사용량이 선형적으로 증가하는 문제가 있었다.
다행스럽게도 정기적으로 기능 추가 및 수정으로 배포를 반복하고 있었기 때문에, application 이 다시 배포 되면서
메모리가 초기화 된 덕분에 OOM(OutOfMemory) 문제를 회피할 수 있었지만, 조금이라도 서비스 운영 시간이 늘어난다면 
무조건 OOM 을 마주할 수 밖에 없는 상황이었다.

<img width="1420" height="312" alt="Image" src="https://github.com/user-attachments/assets/a74ac634-b5a1-4cae-a01b-2f30f3c79a36" />

여러 분석 및 해결 시도를 반복하다가, 동작중인 application 의 힙 덤프를 시간차를 두어 뽑아낸 후 비교하는 과정에서 실마리를 잡아냈는데,
Micrometer `StatsdMeterRegistry` 클래스가 그 핵심이었다.

- `preFilterIdToMeterMap`: 799,129개 엔트리 (~40MB)
- `meterMap`: 2M capacity 테이블 (64MB)
- `MicrometerHttpClientMetricsRecorder` 캐시: 84,884개 엔트리 (~37MB)

<br>

## 🚰 원인 - URI Cardinality 관리

Reactor Netty 의 메트릭 수집을 위해 
외부 Client 에서 Reactor Netty 쪽으로 향하는 트래픽을 관리하는 `HttpServer` 와,
Server 에서 외부 Client 로 향하는 트래픽을 관리하는 `HttpClient` 2개의 구현체를 다루고 있었다.

이 구현체들 각각에서 공통으로 `metrics(true, uriTagValueFunction)` 메서드를 호출하고 있는데,
다음과 같은 방식으로 전달되는 URI 를 그대로 메트릭 태그로 수집하고 있었다.

```kotlin
httpServer.metrics(true) { uri -> uri } // URI 정규화 없음
httpClient.metrics(true) { uri -> uri } // URI 정규화 없음
```

보통은 문제가 없겠지만, 아래와 같이 API path 에 UUID 와 같은 가변 변수가 포함될 경우
각기 요청마다 새로운 메트릭 태그로 수집되게 된다.

```
/threads/550e8400-e29b-41d4-a716-446655440000/runs/stream
/threads/6ba7b810-9dad-11d1-80b4-00c04fd430c8/runs/stream
/threads/f47ac10b-58cc-4372-a567-0e02b2c3d479/runs/stream
...
```

즉, application 구동 시간이 늘어날수록, 유저 요청이 누적될수록 Meter 수가 무한히 증가하고,
각 Meter 마다 새로운 instance 를 생성해서 관리하기 때문에 힙 메모리 사용량이 선형적으로 증가했던 것이다.

<br>

## 🚰 해결 - UUID 정규화

`HttpClient.metrics(true, uriTagValueFunction)`과 `HttpServer.metrics(true, uriTagValueFunction)`의 두 번째 파라미터는 
Reactor Netty 가 공식 제공하는 URI 태그 정규화 확장 포인트다. 이 함수는 확장된 URI path 를 받아서 릭 태그로 사용할 문자열을 반환한다.
즉, UUID 가 전달될 경우 이를 정규화하여 공통 문자로 변경하면 요청 별로 태그가 무한히 생성되는 문제를 방어할 수 있게 된다.

UUID 를 `{id}`로 치환하는 정규화 함수를 아래와 같이 적용해볼 수 있다.

```kotlin
// UUID 정규식
private val UUID_PATTERN = Regex("[0-9a-fA-F]{8}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{12}")

httpServer.metrics(true) { uri -> uri.replace(UUID_PATTERN, "{id}") }
httpClient.metrics(true) { uri -> uri.replace(UUID_PATTERN, "{id}") }
```

정규화 결과:

```
// AS-IS
/threads/550e8400-e29b-41d4-a716-446655440000/runs/stream
/threads/550e8400-.../runs/f47ac10b-.../cancel

// TO-BE
/threads/{id}/runs/stream
/threads/{id}/runs/{id}/cancel
```

새로운 path 를 가진 API 가 추가되더라도 UUID 형식이면 자동으로 정규화되므로 Config 수정이 필요 없다.
반대로 다른 형식이라면, 그에 걸맞는 정규 표현식을 더 추가해주어야한다.
이 부분에서는 주의가 필요하겠다.

<br>

## 🚰 결과

<img width="461" height="201" alt="Image" src="https://github.com/user-attachments/assets/d6c24bbc-6d93-42b6-8095-1a67eaacd252" />

여전히 누수 지점이 남아 메모리 사용량이 점진적으로 늘고 있지만, 급격하게 치솓던 양상은 사라진 모습.

<img width="1872" height="301" alt="Image" src="https://github.com/user-attachments/assets/d8b6c932-7a93-4fda-97f8-5072a2c41c7a" />

중복해서 수집되던 메트릭들이 한 순간에 제거되어 사라지는 모습.

<br>

## 🚰 새롭게 알게된 것들

### 1. Spring Boot WebFlux 와 Reactor Netty 메트릭은 별개 레이어다.

Spring Boot WebFlux 자동설정은 `http.server.requests` 메트릭을 `@RequestMapping` 패턴 기반으로 자동 정규화한다. 
`ServerConfig`에서 `httpServer.metrics(true)`를 호출하면 이와 별개로 `reactor.netty.http.server.*` 메트릭이 추가된다. 

즉, 이 두 레이어는 독립적으로 동작하며, 각각 별도로 카디널리티를 관리해야 한다.

| 레이어                | 메트릭 접두사                                                       | URI 정규화 방식                                      |
|--------------------|---------------------------------------------------------------|-------------------------------------------------|
| Spring Observation | `http.server.requests` / `http.client.requests`               | `@RequestMapping` 패턴 / `URI_TEMPLATE_ATTRIBUTE` |
| Reactor Netty      | `reactor.netty.http.server.*` / `reactor.netty.http.client.*` | `uriTagValueFunction` 파라미터                      |

### 2. WebClient `.uri(template, vars)` 방식은 Reactor Netty 메트릭을 해결하지 못한다

Spring WebClient 의 URI 템플릿 방식(`.uri("/threads/{threadId}/runs/stream", threadId)`)을 사용하면, Spring 이 `URI_TEMPLATE_ATTRIBUTE`에 템플릿을 저장한다. 
그러나 이 값은 **Spring Observation 레이어(`http.client.requests` 메트릭)에서만 사용**되며, Reactor Netty 에는 확장된 URI 만 전달된다.

```
WebClient.uri("/threads/{threadId}/runs/stream", threadId)
  1. URI_TEMPLATE_ATTRIBUTE = "/threads/{threadId}/runs/stream"  (Spring Observation용)
  2. 변수를 확장해서 concrete URI 생성
  3. ReactorClientHttpConnector 가 Reactor Netty 에 다시 확장된 URI 전달
  4. Reactor Netty metrics: uriTagValue.apply("/threads/abc-123/runs/stream")  (결국 다시 확장된 URI)
```

따라서 `reactor.netty.http.client.*` 메트릭의 카디널리티를 제어하려면 반드시 `uriTagValueFunction`을 사용해야 한다.

### 3. `max-uri-tags`는 Reactor Netty 레벨 메트릭에 적용되지 않는다

`management.metrics.web.server.max-uri-tags` 속성은 Spring Observation 기반 `http.server.requests` 메트릭에만 적용된다.
`reactor.netty.http.client.*`이나 `reactor.netty.http.server.*` 메트릭에는 효과가 없다.


### 4. 새로운 WebClient 빈을 추가할 때

새로운 `HttpClient.create().metrics(true, ...)` 설정을 만들 때 `Function.identity()`를 사용하지 말 것. 
반드시 URI 정규화 함수를 적용해야 한다. 
동적 path variable(UUID, 숫자 ID 등)이 포함된 URL 을 호출하면 동일한 메모리 릭이 재발한다.

<br>

## References

- [DefaultWebClient ignores baseUrl when setting URI_TEMPLATE_ATTRIBUTE #30027](https://github.com/spring-projects/spring-framework/issues/30027)
- [Client request observation contributes full URI template to uri meter tag values #29885](https://github.com/spring-projects/spring-framework/issues/29885)

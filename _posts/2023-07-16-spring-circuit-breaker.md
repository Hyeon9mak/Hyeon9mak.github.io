---
title: "spring circuit breaker 이해 및 예제 정리"
date: 2023-07-16
tags:
    - spring
toc: true
toc_sticky: true
toc_label: "spring circuit breaker 이해 및 예제 정리"
---

circuit breaker 를 처음 접하게 되었을 때 retry 와 비슷한 기능을 하는 것 같아서 자주 헷갈렸다.
특히 `@Retryable` 과 `@Recover` 를 조합하다보면 circuit breaker 와 정말 유사한 결과물을 만들 수 있다.
그러나 기술의 컨셉을 이해하고 여러가지 테스트를 해보니 차이가 느껴진다.

우선 circuit breaker 와 retry 는 모두 fault-tolerance(장애허용)을 위한 기술이다.
그러나 실질적으로 추구하는 목표와 해결하는 방식이 서로 다르다.

- circuit breaker: 요청들의 추이를 지켜보다가 지속적으로 실패하는 경우, 잠시 요청을 **차단**해서 장애를 전파하지 않도록 한다.
- retry: 하나의 요청에 대해, 요청이 실패했을 경우 해당 요청을 다시 시도한다. 계속 실패할 경우 다른 응답을 반환한다.

차이가 느껴지는가? circuit breaker 는 요청 자체를 차단하는 것에, 
retry 는 요청을 다시 시도하는 것에 중점을 두고 있다.
이번 글에서는 circuit breaker 에 대해 중점적으로 다뤄보겠다.

<br>

## 🏁 circuit breaker example

circuit breaker 를 사용하기 적합한 예시 상황을 가정해보자.

![](https://i.imgur.com/JwIVrsP.png)

사용자 입장에서 동물 사진을 요청하면, 각 동물 사진을 저장 서버로부터 가져와 응답해주는 서비스가 있다.
이 서비스는 `요청처리 서버`와 `고양이 사진 저장 서버`로 구성되어 있다.
`요청처리 서버`는 `고양이 사진 저장 서버` 에게 요청을 보낼 때 circuit breaker 를 사용한다.
때문에 요청 중 예외가 발생하거나 circuit breaker 가 OPEN 되었을 때 응답을 내릴 수 있는 기본 이미지가 준비되어있다.

![](https://i.imgur.com/PrrdeeR.png)

갑작스럽게 `고양이 사진 저장 서버`에서 지연이 발생한다.

![](https://i.imgur.com/EYX1yh7.png)

사용자는 고양이 사진을 요청하지만, `고양이 사진 저장 서버`의 지연으로 인해 원하는 응답을 받지 못한다.

![](https://i.imgur.com/7eh5W1J.png)

`고양이 사진 저장 서버`의 응답이 지연되면서, 덩달아 앞단 `요청처리 서버` 또한 지연이 시작된다.
`고양이 사진 저장 서버`는 점차 밀려오는 요청을 처리하느라 계속해서 지연 상태에 빠지게 된다.
앞단 `요청처리 서버`도 지연량이 점차 많아짐에 따라 강아지 사진을 원하는 요청을 처리할 때도 영향을 받게 될 것이다.

![](https://i.imgur.com/qgJsDh2.png)

이럴 때 circuit breaker 를 통해 `고양이 사진 저장 서버`로 요청을 차단하고 미리 지정해둔 fall back 응답을 사용하면,
사용자에게 장애 상황임을 노출하지 않을 수 있고, `요청처리 서버`의 응답지연도 방지할 수 있다.

<br>

## 🏁 circuit breaker basic concept

![](https://i.imgur.com/D68Iwqg.png)

circuit breaker 는 3가지 상태에 대한 FSM(Final State Machine)을 기반으로 동작한다.

- CLOSED: circuit breaker 로 감싼 내부 프로세스가 요청과 응답을 정상적으로 주고 받을 수 있는 상태
- OPEN: circuit breaker 로 감싼 내부 프로세스가 요청과 응답을 정상적으로 주고 받을 수 없는 상태
    - circuit breaker 는 미리 지정해준 fall back 응답을 수행할 수 있다.
    - 또는 event publisher 를 이용해서 이벤트를 발생시킬 수도 있다.
- HALF_OPEN: fall back 응답을 수행하고 있지만 실패율을 측정해서 CLOSE 또는 OPEN 으로 변경될 수 있는 상태

요청의 성공과 실패에 대한 metric 을 수집하고, 미리 지정해둔 조건에 따라 상태가 변화한다.
그 외에도 metric 을 수집하지 않는 2가지 특수 상태가 존재한다.

- DISABLED: circuit breaker 를 강제로 CLOSED 한 상태. metric 을 수집하지 않고 상태 변화도 없다.
- FORCED_OPEN: circuit breaker 를 강제로 OPEN 한 상태. metric 을 수집하지 않고 상태 변화도 없다.

<br>

## 🏁 circuit breaker state transit
circuit breaker 는 metric 을 수집하고 분석한다. 수집한 결과는 원형 배열 형태의 sliding window 에 담긴다.

### Count-based sliding window
- n 개의 원형 배열로 구현된다.
- 각 원소들은 FIFO 방식으로 갱신된다.

### Time-based sliding window
- n 개의 원형 배열로 구현된다.
- 단위는 epoch second 를 사용한다.
    - 10 으로 설정할시, 1초씩 10개의 원소가 생겨난다.
- 각 원소들은 시간의 흐름에 따라 FIFO 방식으로 갱신된다.

두 타입 모두 요청이 실패했음을 판단하는 기준이 동일하다. 요청 실패의 기준은 2가지다.

1. exception 발생
2. slow call (정상적으로 수행되었지만 지나치게 느린 경우)

circuit breaker 의 OPEN state transit 은 exception 과 slow call 의 관계없이, 지정한 실패율이 달성되면 바로 진행된다. 
sliding window size 10, failure rate 50% 상태에서의 예시 상황을 살펴보자.

1. 10개 요청 중 4개 요청에서 exception 발생 
   - state transit ❌
2. 10개 요청 중 4개 요청에서 slow call 발생 
   - state transit ❌
3. 10개 요청 중 2개 요청에서 exception, 2개 요청에서 slow call 발생 
   - state transit ❌
4. 10개 요청 중 5개 요청에서 exception 발생 
   - CLOSED state transit to OPEN ✅
5. 10개 요청 중 2개 요청에서 exception, 3개 요청에서 slow call 발생 
    - CLOSED state transit to OPEN ✅

또한 circuit breaker 의 state transit 은 sliding window 크기만큼 호출이 기록된 경우에만 계산이 진행된다. 
가령 sliding window size 10, failure rate 50% 상태에서 9개 요청 중 9개 요청 모두가 exception 이 발생하더라도 
OPEN 으로 변환은 진행되지 않는다.

<br>

## 🏁 circuit breaker test

> 테스트에 사용된 코드는 
> [https://github.com/Hyeon9mak/spring-boot-circuit-breaker-playground](https://github.com/Hyeon9mak/spring-boot-circuit-breaker-playground) 
> 에서 확인할 수 있다.

```groovy

dependencies {
    implementation("org.springframework.boot:spring-boot-starter-web")
    implementation("org.springframework.boot:spring-boot-starter-actuator")
    // ...
    implementation("org.springframework.cloud:spring-cloud-starter-circuitbreaker-resilience4j")
    implementation("org.springframework.boot:spring-boot-starter-aop")
}
```

aop 라이브러리 의존이 추가되지 않으면 정상적으로 동작하지 않는다.

```yaml
# application.yml

resilience4j:
  circuitbreaker:
    configs:
      default:
        slidingWindowType: COUNT_BASED
        slidingWindowSize: 10
        failureRateThreshold: 50
        permittedNumberOfCallsInHalfOpenState: 5
        registerHealthIndicator: true

management:
  endpoints:
    web:
      exposure:
        include:
          - "*" # 테스트를 위해 actuator 전체 노출

  health:
    circuitbreakers:
      enabled: true # circuitbreakers 정보 노출
```

최근 10회 요청 중 50% (5회) 이상 요청 실패시 OPEN 상태로 전환된다.

```kotlin
@RestController
class CircuitBreakerTestController(
    private val circuitBreakerTestService: CircuitBreakerTestService,
) {
    @GetMapping("/cats/{id}/image")
    fun catImage(@PathVariable id: Long): String = circuitBreakerTestService.catImage(id = id)
}
```
```kotlin
@Service
class CircuitBreakerTestService {

    @CircuitBreaker(name = "cat-image-circuit-breaker", fallbackMethod = "fallbackCatImage")
    fun catImage(id: Long): String {
        if (id < 10L) {
            return "$id cat's image.png"
        }
        throw RuntimeException("there is no cat's image for $id")
    }

    private fun fallbackCatImage(id: Long, t: Throwable): String {
        return "fallback cat image.png"
    }
}
```

위 설정으로 의도적으로 RuntimeException 이 발생하는 요청 9번을 보내본다.

```json
curl -X GET http://localhost:8080/cats/99/image

fallback cat image.png
```
```json
curl -X GET http://localhost:8080/actuator/circuitbreakers | jq

{
  "circuitBreakers": {
    "cat-image-circuit-breaker": {
      "failureRate": "-1.0%",
      "slowCallRate": "-1.0%",
      "failureRateThreshold": "50.0%",
      "slowCallRateThreshold": "100.0%",
      "bufferedCalls": 9,
      "failedCalls": 9,
      "slowCalls": 0,
      "slowFailedCalls": 0,
      "notPermittedCalls": 0,
      "state": "CLOSED"
    }
  }
}
```

9회차까지 매번 실패하는 요청을 보내다가, 마지막 10회차에 정상 요청을 보냈다. 
circuit breaker 는 어떤 상태를 갖게 될까?

```json
curl -X GET http://localhost:8080/actuator/circuitbreakers | jq
        
{
  "circuitBreakers": {
    "cat-image-circuit-breaker": {
      "failureRate": "90.0%",
      "slowCallRate": "0.0%",
      "failureRateThreshold": "50.0%",
      "slowCallRateThreshold": "100.0%",
      "bufferedCalls": 10,
      "failedCalls": 9,
      "slowCalls": 0,
      "slowFailedCalls": 0,
      "notPermittedCalls": 0,
      "state": "OPEN"
    }
  }
}
```

전체 10회 요청중 마지막 1회를 제외한 나머지 9회 요청이 모두 실패했기 때문에 실패율이 90% 에 달한다.
이 때문에 circuit breaker 가 OPEN 상태로 전환되었다.
여기서 정상 요청을 보내면 어떻게 될까?

```json
curl -X GET http://localhost:8080/cats/1/image

fallback cat image.png
```

정상적인 요청을 보냈음에도 circuit breaker 는 해당 메서드가 정상적으로 요청을 처리할 수 없다고 판단하고, 
무조건 fallback 메서드로 응답을 처리한다.

<br>

## 🏁 when to use the circuit breaker

- 예제를 살펴보면 알겠지만 circuit breaker 는 무조건적인 성공을 위해 사용된다.
  - OPEN 이 아닌 상태에도 예외가 발생하면 무조건 fallback 메서드를 호출한다.
  - 때문에 데이터 정확도가 중요한 서비스에서는 circuit breaker 사용이 적절하지 않다.
- 데이터 정확도보다 서비스 안정성이나 응답속도가 더 중요한 경우에 사용한다.
  - 의존 서비스의 장애가 현재 서비스에 영향을 주는 경우에는 circuit breaker 를 사용하는 것이 적절하다.
  - 의존 서비스의 지연이 현재 서비스의 지연이 되는 경우에도 circuit breaker 를 사용하는 것이 적절하다.

<br>

## 🏁 부록. state transit safty on multi-thread
circuit breaker 는 자신의 상태를 `AtomicReference` 에 저장해서 원자 연산을 진행하기 때문에 멀티 스레드로부터 안전하다.

그러나 주의할 점은 sliding window size 와 동시에 수행할 수 있는 스레드의 개수는 절대 무관하다는 것이다.
가령 sliding window size 10 은 10개 스레드만 동시에 작업이 가능하다는 뜻이 아니다. 
[circuit breaker 에 영향을 받는 동시 스레드 개수를 제한하려면 bulkhead 를 추가로 활용하자.](https://resilience4j.readme.io/docs/bulkhead)

<br>

## References

- [https://resilience4j.readme.io/docs/circuitbreaker](https://resilience4j.readme.io/docs/circuitbreaker)
- [https://www.baeldung.com/spring-retry](https://www.baeldung.com/spring-retry)

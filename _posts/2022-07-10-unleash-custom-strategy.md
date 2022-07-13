---
title: "Unleash custom strategy를 이용한 feature toggle 변수 필터 지정"
date: 2022-07-10
tags:
    - unleash
    - feature-toggle
toc: true
toc_sticky: true
toc_label: "Unleash custom strategy를 이용한 feature toggle 변수 필터 지정"
---

## feature toggle & Unleash
feature toggle 이란 특정 지점에 분기를 형성하여 각 조건에 해당되는 대상에게 각기 다른 기능을 제공해줄 수 있다.
가령 "2022년 7월 1일부터 3일까지는 A기능을, 7월 4일부터는 B기능을 제공하고 싶다." 라는 니즈가 있으면
7월 1일부터 3일까지는 feature toggle을 ON 해두고, 4일부터는 OFF 하는 방식으로 서버 재배포 없이 간단히 상태 컨트롤이 가능하다.
(feature toggle은 특정한 기능이 아닌 개념으로, 실제 코드로 구성할 땐 if 키워드로 간단히 구성 가능하다.)

[Unleash는 이러한 feature toggle 기능을 모아 중앙통제, 관리가 가능하게 해주는 서비스](https://github.com/Unleash/unleash)다. 

![image](https://github.com/Unleash/unleash/raw/main/.github/github_header_opaque_landscape.svg)

> - 피쳐 플래그 & 토글을 중앙관리 할 수 있게 해주는 서버
> - Java, Node.js, Go, Ruby, Python, .Net 클라이언트 제공
> - 관리자 UI 제공해서 "기능 활성화 전략"을 가능하게 함
>   - 특정 사용자에 대해서 활성화
>   - 사용자중 X-퍼센트에 대해서 점진적 롤아웃
>   - 베타 사용자들에 대해서만 활성화
>   - 특정 호스트 인스턴스에서 실행되는 어플리케이션에 대해서만 활성화
> - Boolean 플래그 대신 여러개의 변수 값 지정 가능
> - Node.js + PostgreSQL, 직접 실행 또는 Docker 이미지 제공. SaaS(유료 서비스) 별도

맘시터에서는 Unleash를 이용해서 시범용 기능 배포나 특정기간 활성화에 대해 적극적으로 feature toggle을 적용 중이다.

<br>

## Unleash strategy
이번 신규 사업에 "지역별로 나누어 차차 서비스를 공개하고 싶다." 라는 니즈가 있었는데,
'지역별 필터링' 이라는 니즈에서 Unleash 가 제공중인 constraints(집합된 키워드를 베이스로 필터링) 기능이 떠올랐다.
예를 들어 `지역` 이라는 집합에 `아프리카`, `유럽`을 포함시키면
아프리카와 유럽 대륙은 true, 나머지 지역은 false로 필터링이 가능한 것이다.

<img width="1928" alt="image" src="https://user-images.githubusercontent.com/37354145/178127724-54e62fd0-327b-48fa-af92-c39df8de8978.png">

문제가 있다면 Unleash constraints 기능은 unleash pro 혹은 unleash enterprise 정책을 사용하는 경우에만
활성화가 되는 기능이었다. 맘시터에서는 default 정책을 사용하기 때문에 해당 기능 활용이 불가능했다.

해결방법을 강구하던 중 Unleash가 기본적으로 제공하는 Activation Strategies 기능을 발견했다.

> It is powerful to be able to turn a feature on and off instantaneously, without redeploying the application. The next level of control comes when you are able to enable a feature for specific users or enable it for a small subset of users. We achieve this level of control with the help of activation strategies. The most straightforward strategy is the standard strategy, which basically means that the feature should be enabled to everyone.
> 
> Unleash comes with a number of built-in strategies (described below) and also lets you add your own custom activation strategies if you need more control. However, while activation strategies are defined on the server, the server does not implement the strategies. Instead, activation strategy implementation is done client-side. This means that it is the client that decides whether a feature should be enabled or not.

- Activation Strategies 기능을 활용하면 하위 집합에 대해서 활성화/비활성화가 가능하다.
- Unleash가 기본적으로 제공하는 `Standard`, `UserIDs`, `Gradual Rollout`, `IPs`, `Hostnames` 외 커스텀 전략 지정이 가능하다.

('전략' 이라는 대단해보이는 표현을 사용하지만 결국 필터링 키워드를 의미한다.)
기본적으로 제공되는 전략들을 사용해서도 충분히 쓸만한 지역별 필터링 feature toggle 구성이 가능했지만,
조금 더 비즈니스에 핏한 이름을 가지는 전략을 구성하고 싶었다.
때문에 커스텀 전략을 지정해서 유저 지역별 필터링을 구성하자는 결심을 했다.

<br>

## 1. Unleash GUI 에 커스텀 전략 추가
![image](https://user-images.githubusercontent.com/37354145/178128221-44272bf6-3686-418b-8d31-bb02ebae2301.png)

*Configure → Strategies → Add new strategy*

![image](https://user-images.githubusercontent.com/37354145/178128231-1fe191fb-ff33-4444-872b-e62899809bd0.png)
![image](https://user-images.githubusercontent.com/37354145/178128233-4ab902bd-0bba-4083-8ec3-78040f75cfb1.png)

활성화 지역을 dynamic 하게 추가/제거하기 위해 list 데이터 타입을 선택한다.

![image](https://user-images.githubusercontent.com/37354145/178128234-9e552246-affd-4bab-aee2-985743ed3f7a.png)

`Strategy name`, `Parameter name` 을 신중하게 지정 후 전략을 생성한다.
두 값은 이후 SDK 쪽에 직접 전략을 구현할 때 사용된다.

크게 구성을 살펴보자면 1개의 전략(strategy)이 여러개의 필터(parameter)를 가질 수 있다.
즉 필터를 여러개로 구성하면 and, or 조건등을 통해서 더욱 세세한 필터링이 가능할 것이다.

<br>

## 2. feature toggle 추가 및 strategy 선택
![image](https://user-images.githubusercontent.com/37354145/178128265-931c21ac-b569-4aa3-b008-f10ea854f2f9.png)

신규 feature toggle을 추가하거나 기존 feature toggle을 선택한다.

![image](https://user-images.githubusercontent.com/37354145/178128268-0566c242-54e1-4b56-9821-9e7cdb3eb8af.png)

Strategies → Add new strategy 를 선택한다.

![image](https://user-images.githubusercontent.com/37354145/178128269-3cd6f8b1-b28c-4078-b83f-a43500e278c7.png)

앞서 생성한 Custom strategy를 드래그 드랍한다.

![image](https://user-images.githubusercontent.com/37354145/178128271-6774b0f2-77de-4aef-b1a4-abdb84dc43ce.png)

Custom strategy에 활용하고 싶은 데이터를 입력 한 후 저장한다.

![image](https://user-images.githubusercontent.com/37354145/178128273-8138fba7-4457-4d92-9115-4f61163e8de5.png)

strategy 설정이 완료되었다면 toggle을 활성화시킨다.

feature toggle 하나가 여러 개의 strategy를 가질 수 있음을 알 수 있다.
각 전략별로도 활성화/비활성화 지정이 가능하므로, 입맛에 맞게 strategy를 준비한 다음 
더욱 세밀한 feature toggle을 구성할 수 있다.

<br>

## 3. SDK(서버) Custom Strategy 구현
### 3-1. custom strategy 구현
Unleash가 제공하는 Strategy 인터페이스를 구현해주면 된다.

```java
public interface Strategy {
    String getName();

    boolean isEnabled(Map<String, String> parameters);

    default boolean isEnabled(Map<String, String> parameters, UnleashContext unleashContext) {
        return isEnabled(parameters);
    }

    default boolean isEnabled(
            Map<String, String> parameters,
            UnleashContext unleashContext,
            List<Constraint> constraints) {
        return ConstraintUtil.validate(constraints, unleashContext)
                && isEnabled(parameters, unleashContext);
    }
}
```

```kotlin
class UserLocationStrategy : Strategy {

    // 전략 이름이 "UserLocation" 임을 명시
    override fun getName(): String = STRATEGY_NAME

    override fun isEnabled(parameters: MutableMap<String, String>): Boolean {
        return false
    }

    override fun isEnabled(
        parameters: MutableMap<String, String>,
        unleashContext: UnleashContext,
    ): Boolean {
        // "userLocation" 을 통해 UnleashContext 에서 유저가 넘긴 위치 정보를 추출
        val userLocation = unleashContext.properties[USER_LOCATION] ?: return false

        // Custom Strategy의 파라미터 "locations" 에 입력되어 있는 리스트 값 추출
        val activationLocations = parameters[TOGGLE_STRATEGY_PARAMETER]!!.split(REST_AND_BLANK_REGEX)
        return activationLocations.contains(userLocation)
    }

    companion object {
        const val USER_LOCATION = "userLocation"
        private const val STRATEGY_NAME = "UserLocation"
        private const val TOGGLE_STRATEGY_PARAMETER = "locations"
        private val REST_AND_BLANK_REGEX = ",\\s?".toRegex()
    }
}
```

- isEnabled 메서드의 파라미터 `unleashContext` 로부터 서버가 유저에게 받아낸 지역 정보를 뽑아낼 수 있다.
- isEnabled 메서드의 파라미터 `parameters` 로부터 Unleash GUI에서 입력해둔 지역 필터 데이터를 뽑아낼 수 있다.

### 3-2. Unleash Configuration에 Custom strategy 등록
```kotlin
@Configuration
class UnleashClientConfiguration(
    @Value("\${custom.unleash.url}") private val url: String,
    @Value("\${custom.unleash.auth-token}") private val authToken: String,
) {
    ... (생략) ...

    @Bean
    fun unleash(): Unleash {
        val unleashConfig = UnleashConfig.builder()
        
        ... (생략) ...

        return DefaultUnleash(unleashConfig, {커스텀한_전략_배열})
    }
}
```

`커스텀한_전략_배열` 쪽에 배열 형태로 strategy 인스턴스를 생성하여 주입하면 된다.
설정이 완료되었다면 비즈니스 로직에 피쳐토글을 사용하면 된다.

## 4. 사용 방법(예시)
```kotlin
fun isAvailableLocation(location: String): Boolean = isEnabled(
    featureName = "b2c-home-url-by-user-location",
    unleashContext = UnleashContext.builder()
        .addProperty(UserLocationStrategy.USER_LOCATION, location)
        .build()
)
```

feature toggle 이름을 명시하고, UnleashContext Builder의 addProperty 체이닝 메서드에 값을 주입하여 사용할 수 있다.

<br>

## 정리
간단히 정리하면 아래와 같은 3가지 절차를 거친다.

1. GUI 상에서 Custom Strategy를 생성하고, Feature toggle에 strategy를 연결한다.
2. SDK 서버 상에서 Custom Strategy 구현체를 만들고, 설정 파일에 등록한다.
3. UnleashContext Builder를 통해 필터링할 값을 넘겨서 사용한다.

'지역별 필터링' 이라는 비즈니스가 명확한 필터링을 진행하고 싶어서 커스텀 전략을 별도로 지정했지만,
꼭 그럴 필요가 없다면 Unleash에서 기본적으로 제공되는 5가지의 전략만 활용해도
충분히 잘 동작하는 변수 필터 feature toggle을 만들 수 있다.
(SDK Custom Strategy 구현을 완전히 생략할 수 있다.)

만약 비즈니스에 핏한 필터링(혹은 그런 전략 이름)을 원한다면 custom strategy를 적극 활용해보자.

---
title: "Spring Boot 3 마이그레이션 팁 모음"
date: 2024-09-16
tags:
    - spring
toc: true
toc_sticky: true
toc_label: "Spring Boot 3 마이그레이션 팁 모음"
---

Spring Boot 2 -> Spring Boot 3 마이그레이션은 메이저 버전 변경임에도 불구하고 비교적 쉽게 진행할 수 있다.
하지만 말 그대로 Spring Boot 마이그레이션이 쉬울 뿐, 부수적으로 생기는 문제들까지 모두 해결하는 건 쉽지 않다.  

이번 글에서는 내가 Spring Boot 2 에서 Spring Boot 3 마이그레이션을 진행하면서, 
그리고 마이그레이션 이후 운영 중에 겪었던 문제들과 해결 방법을 정리해보았다.

기본적인 마이그레이션은 [Spring Boot 3.0 Migration Guide](https://github.com/spring-projects/spring-boot/wiki/Spring-Boot-3.0-Migration-Guide) 
문서를 따라가면서, '이게 뭐지?' 싶은 상황에 봉착했을 때 이 글을 한번씩 참고하자.
이 글을 통해 많은 시간을 절약할 수 있기를 기대한다.

<br>

## 🌱 진행 배경 및 순서

내가 마이그레이션을 진행하게 된 배경과 순서는 아래와 같다.

1. 사내 보안 시스템에서 특정 버전의 라이브러리에 대한 취약점을 발견했다.
2. 취약점을 해결하기 위해선 해당 라이브러리의 버전을 업그레이드해야 했다.
3. 해당 라이브러리는 Spring Boot 버전에 대한 의존을 갖고 있어 Spring Boot 버전도 업그레이드해야 했다.
4. `Spring Boot 2.6.x` 에서 `Spring Boot 3.3.1` 로 올리고자 했다.
5. [Spring Boot 3.0 Migration Guide](https://github.com/spring-projects/spring-boot/wiki/Spring-Boot-3.0-Migration-Guide) 를 참고해서 `Spring Boot 2.7.x` 까지 업그레이드 후 `3.x` 마이그레이션을 시도했다.
6. [Maven Repository](https://mvnrepository.com/artifact/org.springframework.boot/spring-boot) 를 참고했을 때 `2.7.18` 버전이 최신이라, `2.7.18` 버전으로 업그레이드를 선행했다.
7. Java 버전을 `11` 에서 `17` 로 업그레이드했다. 
8. `2.7.18` 버전 업그레이드 후 1차적으로 발생하는 라이브러리 버전 충돌에 대해 해결했다.
9. 버전 충돌 문제 해결 이후 당시 기준 최신 버전이었던 `3.3.1` 버전으로 마이그레이션을 진행했다.
10. `3.3.1` 마이그레이션 이후 2차적으로 발생하는 문제들을 해결하며 안정화를 시켰다.

아래부터는 실제로 겪었던 문제 상황과 내가 채택한 해결 방법들이다.

<br>

## 🌱 java to jakarta

Java 의 표준 사양을 관리하는 주체가 Java Community Process(JCP)에서 Eclipse Foundation 으로 바뀌면서, 
Oracle 과의 라이선스 이슈 때문에 javax 패키지가 jakarta 패키지로 변경됐다. 기업간 기싸움에 개발자들 등이 터지는 사례.

`javax.sql.*`, `javax.crypto.*` 등 JDK에 포함돼 있는 일부 패키지를 제외한 대부분의 패키지를 jakarta 패키지로 변경해야 한다.

```kotlin
// AS-IS
import javax.persistence.Entity
  
// TO-BE
import jakarta.persistence.Entity
```

컴파일 타임에 에러를 확인하면서 변경할 수 있기 때문에 크게 어렵지 않다.
IntelliJ IDE 를 사용하는 환경이라면 `Cmd + Shift + R` 단축키를 통해 빠르고 편하게 패키지 변경을 진행할 수 있다.

[엔티티 사용 편의를 위해 `allOpen` 설정](https://hyeon9mak.github.io/kotlin-jpa-essentials/#-kotlin-entity-all-open)을 해둔 Kotlin 프로젝트라면
`allOpen` 설정도 놓치지 말고 변경해주어야 한다.

```kotlin
allOpen {
    // AS-IS
    annotation("javax.persistence.Entity")
    annotation("javax.persistence.Embeddable")
    annotation("javax.persistence.MappedSuperclass")
 
    // TO-BE
    annotation("jakarta.persistence.Entity")
    annotation("jakarta.persistence.Embeddable")
    annotation("jakarta.persistence.MappedSuperclass")
}
```

<br>

## 🌱 openfeign 설정 방법 변경

Spring Boot 3.0 이상 버전부터 openfeign 옵션을 설정하는 문법이 변경되었다.
만약 아래와 같은 형상으로 feign client 설정을 사용중이었다면 기입해둔 설정들이 제대로 동작하지 않을 것이다.

```yaml
# AS-IS
feign:
  client:
    config:
      ${FeignClient의 name 혹은 value}:
        connectTimeout: 시간
        readTimeout: 시간
```

`org.springframework.cloud.openfeign.FeignClientProperties` 클래스의
`setConnectTimeout`, `setReadTimeout` 등 매핑 메서드에 break point 를 걸어 부팅 시점에 제대로 값이 매핑되는지 확인해볼 수 있다. 

![image](https://github.com/user-attachments/assets/a88ce31c-0a5a-4986-b902-538ac6772b9c)

만약 부팅 시점에 각 메서드 호출되지 않는다면 매핑이 진행되지 않는 것이다.

[Common application properties 문서](https://docs.spring.io/spring-cloud-openfeign/docs/current/reference/html/appendix.html) 에 
변경된 내용을 참고하여 설정 값을 변경하여 기입해주자.

```yaml
# TO-BE
spring:
  cloud:
    openfeign:
      client:
        config:
          ${FeignClient의 name 혹은 value}:
            connect-timeout: 시간
            read-timeout: 시간
```

마찬가지로 `org.springframework.cloud.openfeign.FeignClientProperties` 클래스의 매핑 메서드에 break point 를 걸어
부팅 시점에 제대로 값이 매핑되는지 확인해볼 수 있다.

<br>

## 🌱 swagger 1.8 버전 사용 불가

> `springdoc-openapi v1.8.0` is the latest Open Source release supporting Spring Boot 2.x and 1.x.
> An extended support for springdoc-openapi v1 project is now available for organizations that need support beyond 2023.   
> For more details, feel free to reach out: sales@springdoc.org

[OpenAPI 3 Library for spring-boot (springdoc.org)](https://springdoc.org/#google_vignette) 문서 서문에 적혀있듯 
`spring boot 3.x` 버전부터는 `swagger 1.8` 버전 사용이 불가능하다. `springdoc-openapi` 버전을 `2.6.0` 까지 올려서 사용하자.

<br>

## 🌱 ClassGraph 로 인한 WebSecurityConfiguration Bean 생성 실패

```
UnsatisfiedDependencyException: Error creating bean with name
  'org.springframework.security.config.annotation.web.configuration.WebSecurityConfiguration'
  (...)
  'io.github.classgraph.ClassGraph io.github.classgraph
     .ClassGraph.acceptPaths(java.lang.String[])'
```

`WebSecurityConfiguration` 과 `org.springdoc:springdoc-openapi-ui` 에서 동시에 `io.github.classgraph.ClassGraph` 를 의존한다.
이 때 `org.springdoc:springdoc-openapi-ui` 가 의존하는 `CLassGraph` 의 버전이 너무 낮아서 충돌 발생했다.

`org.springdoc:springdoc-openapi-ui` 버전을 `1.5.7` 에서 `1.8.0` 으로 올리면 쉽게 해결할 수 있다.

더 나아가 `spring boot 3.x` 이상으로 올릴 시 `org.springdoc:springdoc-openapi-ui` 버전을 `2.x` 이상 더 올릴 수 있다.
가능하면 이 방향으로 해결하길 추천한다.

<br>

## 🌱 WebSecurityConfigurerAdapter 지원 중단
`spring security 5.7.x` 이상부터 `WebSecurityConfigurerAdapter` 를 상속한 인가 방식 사용이 불가능하다.
대신 보다 더 직관적이고 모던한 방식으로 인가 절차를 구현할 수 있다.

[Spring Security without the WebSecurityConfigurerAdapter](https://spring.io/blog/2022/02/21/spring-security-without-the-websecurityconfigureradapter)
문서를 참고하여 인가 절차 코드를 수정하자. 예시 코드가 굉장히 잘 정리되어 있어서 쉽게 변경할 수 있다.

<br>

## 🌱 `@ConstructorBinding` 제거

`@ConfigurationProperties` 어노테이션과 주로 함께 사용되던 `@ConstructorBinding` 어노테이션은
Spring Boot 3 버전을 기점으로 더 이상 필요하지 않다. 오히려 제거해야할 대상이다.

프로젝트 내에 `@ConstructorBinding` 어노테이션이 보인다면 빠르게 제거해주자.

```kotlin
@ConstructorBinding // <-- 제거
@ConfigurationProperties(prefix = "example")
data class ExampleProperties(
    val name: String,
    val age: Int
)
```

<br>

## 🌱 could not find mysql:mysql-connector-java

```
 Failed to load driver class com.mysql.cj.jdbc.Driver in either of HikariConfig class loader or Thread context classloader
```

`spring boot 3.1.x` 이상 버전에서 `mysql:mysql-connector-java` 의존을 제대로 찾지 못했다.
말 그대로 최신 버전의 Spring Boot 에 매칭되는 `mysql-connector-java` 라이브러리가 없다는 것인데,
Spring Boot 에서 MySQL 관련 의존을 지원해주지 않을 리는 없다.
실제로 [mysql-connector-java maven repository](https://mvnrepository.com/artifact/mysql/mysql-connector-java) 를 살펴보면
`8.0.33` 버전까지 지원이 계속 되고 있었다.

문제가 되었던 `build.gradle.kts` 파일을 살펴보자.

```kotlin
dependencies {
    implementation("org.springframework.boot:spring-boot-starter-data-jpa")
    implementation("org.springframework.boot:spring-boot-starter-web")
    implementation("org.springframework.boot:spring-boot-starter-security")
 
    // 생략 ...
    
    // 이 부분에 주목
    runtimeOnly("mysql:mysql-connector-java")
}
```

최신 버전의 [Managed Dependency Coordinates](https://docs.spring.io/spring-boot/appendix/dependency-versions/coordinates.html) 문서에서
`mysql` 을 검색해보았다.

<img width="1040" alt="image" src="https://github.com/user-attachments/assets/05521af0-3bf7-4938-a65b-74535a3ca74d">

`mysql-connector-java` 대신 `mysql-connector-j` 가 덩그러니 존재한다.

maven repository 에 `mysql-connector-java` 를 검색해보면 아래와 같이 `mysql-connector-j` 가 더 높은 우선 순위로 노출된다.

<img width="1248" alt="image" src="https://github.com/user-attachments/assets/6bcc145f-4a84-40e8-93aa-bfab2d92aba0">

`MySQL Connector/J 8.0.33` 릴리즈 노트를 살펴보니 `MySQL Connector/J 8.0.31` 버전부터 `mysql-connector-java` 가 `mysql-connector-j` 로 변경되었다고 한다.

<img width="1191" alt="image" src="https://github.com/user-attachments/assets/fae849ae-d99e-4759-919d-19bd0c2b5d50">

즉 상황을 정리해보면 MySQL 은 `8.0.31` 버전부터 `mysql-connector-j` 로 변경을 진행중이었고, 
`8.0.33` 버전까지 `mysql-connector-j` 와 `mysql-connector-java` 의 버전을 동시에 관리 및 지원 해주고 있었다.

Spring Boot 에서 `mysql-connector-java` 를 얄짤없이 제거하고 `mysql-connector-j` 만 사용하도록 강제한 것.
상남자가 따로 없다.

당황스럽지만 해결 방법은 명확하다. `mysql-connector-java` 를 `mysql-connector-j` 로 대체하면 된다.

```kotlin
dependencies {
    
    // 생략 ...
    
    runtimeOnly("mysql:mysql-connector-j")
}
```

<br>

## 🌱 hibernate-types 대신 hypersistence-utils 사용

![image](https://github.com/user-attachments/assets/87662338-31ec-4710-9555-84d6c48dcb45)

`org/hibernate/dialect/PostgreSQL82Dialect` 에러는 `hibernate-types` 라이브러리와 관련이 있다.

`@Entity` 어노테이션을 사용하는 클래스에 Postgresql Jsonb 속성을 활용하고자 할 때 `hibernate-types` 라이브러리가 활용된다.
`Spring Boot 2.x` 버전에서는 대게 Hibernate 5.x 버전을 사용하기 때문에 `hibernate-types-55` 라이브러리를 선택한다.

그러나 [`Spring Boot 3.1` 이상 버전에서는 기본적으로 `Hibernate 6.2` 이상을 사용](https://github.com/spring-projects/spring-boot/wiki/Spring-Boot-3.1-Release-Notes#hibernate-62)한다.
때문에 `hibernate-types-60` 으로 변경이 필요한 것 같은데, 막상 `hibernate-types-60` 라이브러리를 선택하면 아래와 같은 에러가 발생한다.

```
Expecting BasicPluralJavaType for array class [Ljava.lang.String;,
but got com.vladmihalcea.hibernate.type.array.internal.StringArrayTypeDescriptor
```

기대한 타입은 `BasicPluralJavaType` 인데, `StringArrayTypeDescriptor` 가 제공되었다는 에러.
데이터 타입이 안맞아버리는데 이걸 어떻게 해결해야할까?

고민하던 찰나 `hibernate-types` 라이브러리 창시자인 [Vlad Mihalcea 의 블로그](https://vladmihalcea.com/hibernate-types-hypersistence-utils/)를 살펴보니
2022년에 `hibernate-types` 라이브러리 대신 `hypersistence-utils` 사용을 권장하는 글을 작성해두었다.
실제로 [`hibernate-types` 였던 GitHub Repository 의 이름이 `hypersistence-utils` 로 변경](https://github.com/vladmihalcea/hypersistence-utils)되어 있었다.

그에 따라 나도 `hibernate-type-60` 라이브러리를 `io.hypersistence:hypersistence-utils-hibernate-63` 으로 변경하는 것으로 문제를 해결했다.
`hibernate-types` 에 대한 지원을 종료하면서 자연스럽게 `hypersistence-utils` 로 이관을 유도하는 것 같다.


<br>

## 🌱 relation "revinfo_seq" does not exist

hibernate-envers 사용하는 환경에서 `Spring Boot 3.0` 이상 버전을 채택하면 `relation "revinfo_seq" does not exist` 에러를 마주칠 수 있다.
정확히는 Hibernate 6 이상을 채택하는 환경에서 문제가 발생한다.

Hibernate 6 이전 버전에서는 엔티티의 시퀀스 생성기를 따로 명세하지 않을 경우 `hibernate_sequence` 를 사용했다.
그러나 Hibernate 6 이후 버전에서는 `{엔티티 명칭}_seq` 가 기본 전략으로 채택되었다.
때문에 기존 `hibernate_sequence` 를 사용하는 환경에서 새로이 `revinfo_seq` 라는 시퀀스를 찾으려고 하니 없다고 하는 것.

해결 방법은 application property 파일에 다음과 같은 설정을 추가해주면 된다.

```yaml
spring:
  jpa:
    properties:
      hibernate:
        id:
          db_structure_naming_strategy: legacy
```

<br>

## 🌱 IllegalStateException: No target Validator set

```
java.lang.IllegalStateException: No target Validator set
    at org.springframework.util.Assert.state(Assert.java:76)
    ...
```

`SpringBoot 3.2` 버전 이상부터 spring mvc 영역에서 검증을 진행할 경우 `spring-boot-starter-validation` 라이브러리 의존이 필수가 되었다.

```kotlin
import jakarta.validation.Valid

@PostMapping
fun create(@RequestBody @Valid request: Request): Response {
    return service.create(request = request)
}
```

`spring-boot-starter-validation` 라이브러리를 생략할 경우
`jakarta.validation.Valid`, `jakarta.validation.constraints.NotNull` 과 같이 `jakarta.validation.*` 관련 어노테이션이 달린 매개변수를 가진 controller method 가 예외를 발생시킨다.
이 예외는 Spring 에 의해 발생하고, 아예 요청이 method 까지 전달되지 않는다.

아래와 같이 의존을 추가해주자.

```kotlin
dependencies {
    implementation("org.springframework.boot:spring-boot-starter-validation")
}
```

<br>

## 🌱 IllegalArgumentException: You have entered a password with no PasswordEncoder.

```
IllegalArgumentException: You have entered a password with no PasswordEncoder.
    If that is your intent, it should be prefixed with {noop}.
```

`spring security 5.0` 이상 버전부터 password encoder 를 다루는 방식이 변경되었다.

[spring-security#authentication-password-storage-dpe](https://docs.spring.io/spring-security/reference/features/authentication/password-storage.html#authentication-password-storage-dpe) 
문서를 참고해서 password encoder 를 delegating 패턴을 통해 선택할 수 있도록 해주면 된다.

```kotlin
@Bean
fun passwordEncoder(): PasswordEncoder {
    return PasswordEncoderFactories.createDelegatingPasswordEncoder()
}
```

권장되는 방식은 아니지만, `StandardPasswordEncoder` 를 사용하고 싶다면 아래와 같이 설정할 수 있다.

```kotlin
@Bean
fun passwordEncoder(): PasswordEncoder {
    val delegatingPasswordEncoder = PasswordEncoderFactories.createDelegatingPasswordEncoder() as DelegatingPasswordEncoder
    delegatingPasswordEncoder.setDefaultPasswordEncoderForMatches(StandardPasswordEncoder())
    return delegatingPasswordEncoder
}
```

<br>

## 🌱Redis property depth 변화

`spring boot 3.0` 이상 버전부터 `spring.redis` property 의 depth 가 변경 되었다.
[https://github.com/spring-projects/spring-boot/wiki/Spring-Boot-3.0-Migration-Guide#redis-properties](https://github.com/spring-projects/spring-boot/wiki/Spring-Boot-3.0-Migration-Guide#redis-properties)


```yaml
# AS-IS
spring:
  redis:
    port: 6379

# TO-BE
spring:
  data:
    redis:
      port: 6379
```

<br>

## 🌱 HHH015007: Illegal argument on static metamodel field injection

```
o.h.metamodel.internal.MetadataContext   : HHH015007: Illegal argument on static metamodel field injection : org.hibernate.envers.DefaultRevisionEntity_#class_;
    expected type :  org.hibernate.metamodel.model.domain.internal.EntityTypeImpl;
        encountered type : jakarta.persistence.metamodel.MappedSuperclassType
```

[2024년 초 이슈라이징 되었으나 아직까지 해결되지 않은 하이버네이트 공식 이슈](https://hibernate.atlassian.net/browse/HHH-17612).
이슈 링크를 타고 이동해보면 "이거 아직도 해결 안됨?" 라는 댓글이 지금까지도 달리고 있다.

재밌는 건 ERROR 레벨의 로그만 찍힐 뿐, 실제 애플리케이션 동작에 영향을 주진 않는다는 것.
해당 에러의 출처인 [hibernate/hibernate-orm 코드](https://github.com/hibernate/hibernate-orm/blob/main/hibernate-core/src/main/java/org/hibernate/metamodel/internal/MetadataContext.java)를 
까보면 예외 발생 직후 ERROR 수준의 로그만 찍을 뿐, 그 외 별다른 동작은 하지 않는 걸 확인할 수 있다.

<img width="1039" alt="image" src="https://github.com/user-attachments/assets/32557b8a-ec8f-4426-a9bb-f92f742894f8">
<img width="937" alt="image" src="https://github.com/user-attachments/assets/b55edcf6-cf8f-4220-9222-523e388b5691">

지금까지 확인된 문제가 없기 때문에 로그를 무시하고 넘어가도 괜찮은데, 로그가 ERROR 레벨이기 때문에
대부분의 모니터링 시스템에 계속해서 알림을 울리게 만든다.

잠재적인 이슈가 언제 어떤 문제를 일으킬지 예상할 수 없기 때문에 계속해서 ERROR 로그를 살려두고
주기적으로 이슈를 확인하는 것이 올바르겠으나... 애플리케이션이 새로 부팅될 때마다 울리는 ERROR 알림이 은근 스트레스다.

때문에 우리 팀에서는 아래와 같이 로그백 필터에 키워드를 추가하여 특정 에러를 무시하도록 설정했다.

```kotlin
class LogbackFilter : Filter<ILoggingEvent>() {
  override fun decide(event: ILoggingEvent): FilterReply {
    // https://hibernate.atlassian.net/browse/HHH-17612 참고
    if (event.message.contains("HHH015007")) {
      return FilterReply.DENY
    }
    return FilterReply.ACCEPT
  }
}
```

이런 방법은 이슈가 정말로 문제를 일으켰을 때 즉각 인지하기가 어렵다. 최대한 지양하자.
필터를 걸었다면 주기적으로 하이버네이트 이슈 링크를 확인해서 팔로업하도록 하자.

<br>

## 🌱 마치며

개인적으로 아쉬웠 던 점은 Java 버전을 소극적으로 채택한 것.
가능하면 트러블슈팅을 적게 경험하고 싶어 17 버전을 채택했는데, Java 버전의 높낮음과 관계없이 마주친 문제들이 많았다.

또한 [Spring Boot 3.0 Migration Guide](https://github.com/spring-projects/spring-boot/wiki/Spring-Boot-3.0-Migration-Guide) 에 따라서
`Spring Boot 2.7.x` 버전까지 업그레이드 선행 후 `3.x` 마이그레이션을 진행했는데,
너무 낮은 버전의 Spring Boot 를 사용중인게 아니었다면 꼭 `2.7.x` 까지 업그레이드할 필요는 없을 것 같다.
`Spring Boot 2.6` 이상 버전을 사용중이라면 한 방에 `3.x` 마이그레이션을 시도해도 괜찮겠다. 많은 시간을 아낄 수 있다.

그러나 [Spring Boot 3.0 Migration Guide](https://github.com/spring-projects/spring-boot/wiki/Spring-Boot-3.0-Migration-Guide) 를 포함한
버전 릴리즈 문서들을 소홀히 해도 된다는 건 절대 아니다.
이 글을 처음부터 끝까지 읽어보았다면 잘 알겠지만, 대부분의 문제 원인을 버전 릴리즈 문서를 통해 인지 할 수 있었다.

평상시 버전 릴리즈 문서들을 크게 눈 여겨 보지 않았는데, 이에 대한 경각심과 더불어 여러가지 고민을 해볼 수 있었던 재밌는 경험이었다.

<br>

## References

- [Spring Boot 3.0 Migration Guide](https://github.com/spring-projects/spring-boot/wiki/Spring-Boot-3.0-Migration-Guide)
- [Common application properties 문서](https://docs.spring.io/spring-cloud-openfeign/docs/current/reference/html/appendix.html)
- [OpenAPI 3 Library for spring-boot (springdoc.org)](https://springdoc.org/#google_vignette)
- [Spring Security without the WebSecurityConfigurerAdapter](https://spring.io/blog/2022/02/21/spring-security-without-the-websecurityconfigureradapter)
- [Spring Boot 3 에서 MYSQL 의존성 못찾는 경우](https://shanepark.tistory.com/466)
- [Managed Dependency Coordinates](https://docs.spring.io/spring-boot/appendix/dependency-versions/coordinates.html)
- [mysql-connector-java maven repository](https://mvnrepository.com/artifact/mysql/mysql-connector-java)
- [Class DelegatingPasswordEncoder](https://docs.spring.io/spring-security/site/docs/current/api/org/springframework/security/crypto/password/DelegatingPasswordEncoder.html)
- [Vlad Mihalcea 의 블로그](https://vladmihalcea.com/hibernate-types-hypersistence-utils/)
- [https://github.com/vladmihalcea/hypersistence-utils](https://github.com/vladmihalcea/hypersistence-utils)
- [spring-security#authentication-password-storage-dpe](https://docs.spring.io/spring-security/reference/features/authentication/password-storage.html#authentication-password-storage-dpe)
- [DefaultRevisionEntity: Illegal argument on static metamodel field injection](https://hibernate.atlassian.net/browse/HHH-17612)
- [https://github.com/hibernate/hibernate-orm](https://github.com/hibernate/hibernate-orm/blob/main/hibernate-core/src/main/java/org/hibernate/metamodel/internal/MetadataContext.java)

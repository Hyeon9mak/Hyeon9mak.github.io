---
title: "@NotNull vs @Column(nullable = false)"
date: 2021-08-24
tags:
    - jpa
    - exception
    - validation
toc: true
toc_sticky: true 
toc_label: "@NotNull vs @Column(nullable = false)"
---

> 앞서 읽으면 좋은 글 - [@NotNull 어노테이션 예외처리 핸들링](https://hyeon9mak.github.io/not-null-annotation-exception-handling)

## 📓 summary
lombok에서 지원하는 `@NonNull` 어노테이션을 통해 엔티티의 필드를 검증하던 중, `javax.validation.constraints`의 `@NotNull` 어노테이션도 엔티티에 붙여 사용할 수 있음을 알게 되었다.

<br>

## 📓 @NotNull과 @Column(nullable = false)의 차이
엔티티 필드의 `null`을 검증하기 위해서 대표적으로 사용되는 어노테이션이 `@Column(nullable = false)`이다.
`@NotNull`과 어떤 차이가 있을까? 어떤걸 사용해야할까?

우선 `@Column(nullable = false)`을 사용할 때와 마찬가지로 `@NotNull` 역시 테이블 생성시 `NOT NULL` DDL이 입력된다. 이는 Hibernate가 `@NotNull` 어노테이션 역시 해석할 수 있기 때문이다.
만일 Hibernate가 해석하길 원하지 않는 경우 application.properties에 아래 옵션을 지정해주면 된다.

```
# application.properties
spring.jpa.properties.hibernate.validator.apply_to_ddl=false
```

본격적인 차이로, `@Column(nullable = false)`는 JPA가 만든 엔티티의 필드 값이 `null`로 채워진 상태에서도 
정상적으로 수행되다가 데이터베이스 쪽으로 SQL 쿼리가 도착한 순간에 테이블 컬럼의 `NOT NULL` 옵션에 의해 예외가 발생된다.

그러나 `@NotNull` 어노테이션은 데이터베이스 쪽으로 SQL 쿼리가 보내지기 전에, 정확히는 JPA가 만든 엔티티의 필드 값이 `null`로 채워지는 순간에 예외가 던져진다.

즉 `@NotNull` 어노테이션이 보다 더 빠른 단계에서 같은 예외를 검출하므로, 더 안전하다고 볼 수 있겠다.

> 단, JPA(Hibernate)를 이용한 Entity화 시킨게 아닌 객체라면 `@NotNull` 어노테이션을 해석하지 못한다.
이는 어노테이션 자체는 주석일뿐, 해석하는 주체에 따라 기능이 달라지는 어노테이션의 특성을 생각해보면 곧장 이해하기 수월하다.


<br>

## 📓 그렇다면 @NotEmpty와 @NotBlank는?
[Hibernate 공식 문서](https://docs.jboss.org/hibernate/stable/validator/reference/en-US/html_single/#preface)에 따르면 아쉽게도 Hibernate가 별도의 DDL을 지원해주지 않는다. 

> `@NotBlank`  
> Checks that the annotated ... (생략)
> 
> Hibernate metadata impact  
> **None**
> 
> ---
> 
> `@NotEmpty`  
> Checks whether the annotated element is not null nor empty
>
> Hibernate metadata impact  
> **None**
> 
> ---
>
> `@NotNull`  
> Checks that the annotated value is not null
>
> Hibernate metadata impact  
> **Column(s) are not nullable**

고로 `@NotBlank`와 `@NotEmpty`가 어울리는 상황에도 다른 방법을 이용해야 할 것 같다.

<br>

## References
- [Hibernate @NotNull vs @Column(nullable = false)](https://www.baeldung.com/hibernate-notnull-vs-nullable)
- [[JPA] nullable=false와 @NotNull 비교, Hibernate Validation - 긴 이별을 위한 짧은 편지](https://kafcamus.tistory.com/15)
- [Hibernate Validator 7.0.1.Final - Jakarta Bean Validation Reference Implementation: Reference Guide](https://docs.jboss.org/hibernate/stable/validator/reference/en-US/html_single/#preface)

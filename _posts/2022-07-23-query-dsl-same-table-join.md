---
title: "QueryDSL 하나의 테이블에 2번 조인을 걸고 싶을 땐 어떻게 하는가?"
date: 2022-07-23
tags:
    - sql
    - query-dsl
---

QueryDSL에서 하나의 테이블에 각각 나눠서 2번 조인을 걸고 싶을 때가 있다.
예를 들면 부모(Parent), 시터(Sitter)의 정보를 각각 필요로 하는데 
이들이 사용자(User) 테이블 하나로 구성되어 있는 경우다. 

<img width="707" alt="image" src="https://user-images.githubusercontent.com/37354145/180634473-5417092c-9873-45a9-b588-140ea7f506dc.png">

이런 경우 Q객체를 2가지 변수로 나누어 할당한 후, 조인을 걸면 된다!

![image](https://user-images.githubusercontent.com/37354145/179342748-22067972-25c9-4e35-839e-edb301039755.png)

<br>

## References

- [동일 entity , table 다중 leftJoin시 방법 - 인프런 | 질문 & 답변](https://www.inflearn.com/questions/56400)

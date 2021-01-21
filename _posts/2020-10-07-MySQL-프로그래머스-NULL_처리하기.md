---
title: "[SQL : 프로그래머스] NULL 처리하기"
date: 2020-10-07
tags:
    - problem solving
    - MySQL
    - 프로그래머스
toc: true
toc_sticky: true
toc_label: "[SQL : 프로그래머스] NULL 처리하기"
---
## 문제
[https://programmers.co.kr/learn/courses/30/lessons/59410](https://programmers.co.kr/learn/courses/30/lessons/59410)
## 풀이
```sql
SELECT ANIMAL_TYPE, IF(NAME IS NULL, 'No name', NAME) AS NAME, SEX_UPON_INTAKE
FROM ANIMAL_INS
```
IF문을 이용해서 NAME IS NULL이 참이라면 **No name**,  
아니라면 기존 이름을 부여한다.  
---
title: "[SQL : 프로그래머스] DATETIME에서 DATE로 형 변환"
date: 2020-10-08
tags:
    - MySQL
    - SQL
    - 프로그래머스
    - 코테
    - 코딩테스트
    - 데이터베이스
    - DB
toc: true
toc_sticky: true
toc_label: "[SQL : 프로그래머스] DATETIME에서 DATE로 형 변환"
---
## 문제
[https://programmers.co.kr/learn/courses/30/lessons/59414](https://programmers.co.kr/learn/courses/30/lessons/59414)
## 풀이
```sql
SELECT
    ANIMAL_ID,
    NAME,
    date_format(DATETIME, '%Y-%m-%d') AS '날짜'
FROM
    ANIMAL_INS
ORDER BY
    ANIMAL_ID
```
  

쉬운 문제의 경우 되도록 포스팅을 자제하려고 하는데  
date_format 함수의 포맷에 관해 깨달은 점이 있어서 ㅡㅡ;;  

- %a : Abbreviated weekday name (Sun..Sat)
- %b : Abbreviated month name (Jan..Dec)
- %c : Month, numeric (0..12)
- %D : Day of the month with English suffix (0th, 1st, 2nd, 3rd, …)
- %d : Day of the month, numeric (00..31)
- %e : Day of the month, numeric (0..31)
- %f : Microseconds (000000..999999)
- %H : Hour (00..23)
- %h : Hour (01..12)
- %I : Hour (01..12)
- %i : Minutes, numeric (00..59)
- %j : Day of year (001..366)
- %k : Hour (0..23)
- %l : Hour (1..12)
- %M : Month name (January..December)
- %m : Month, numeric (00..12)
- %p : AM or PM
- %r : Time, 12-hour (hh:mm:ss followed by AM or PM)
- %S : Seconds (00..59)
- %s : Seconds (00..59)
- %T : Time, 24-hour (hh:mm:ss)
- %U : Week (00..53), where Sunday is the first day of the week; WEEK() mode 0
- %u : Week (00..53), where Monday is the first day of the week; WEEK() mode 1
- %V : Week (01..53), where Sunday is the first day of the week; WEEK() mode 2; used with %X
- %v : Week (01..53), where Monday is the first day of the week; WEEK() mode 3; used with %x
- %W : Weekday name (Sunday..Saturday)
- %w : Day of the week (0=Sunday..6=Saturday)
- %X : Year for the week where Sunday is the first day of the week, numeric, four digits; used with %V
- %x : ear for the week, where Monday is the first day of the week, numeric, four digits; used with %v
- %Y : Year, numeric, four digits
- %y : Year, numeric (two digits)
- %% : A literal % character
- %x : x, for any “x” not listed above

**%Y-%D-%M**로 입력했다가 한참 헤맸다.  
항상 생각하고 타이핑 하자.  
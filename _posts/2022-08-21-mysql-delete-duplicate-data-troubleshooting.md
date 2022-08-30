---
title: "MySQL 중복 데이터 제거 트러블 슈팅"
date: 2022-08-21
tags:
    - mysql
    - troubleshooting
toc: true
toc_sticky: true
toc_label: "MySQL 중복 데이터 제거 트러블 슈팅"
---

<img width="1209" alt="image" src="https://user-images.githubusercontent.com/37354145/182018319-feade63c-efb3-4a6e-b107-c2e668eeab38.png">

레거시 테이블 쪽에 불필요하게 쌓여있는 데이터를 새로 준비한 테이블 쪽으로 이관한 후 서버에서 500 에러 알림이 오고 있었다.
에러 로그를 살펴보니 1개의 데이터를 조회하는 쿼리가 날아갔는데, 실제 조회되는 데이터가 2개 이상이라 핸들링이 불가능 하다는 것이었다.
현재 로직 상 중복되는 데이터가 만들어질리는 없으니, 레거시 데이터를 이관하는 과정에서 중복되는 데이터가 쌓인 것으로 판단했다.

<br>

## 💽 중복이 맞는지 검사

```sql
SELECT 이름,
       전화번호,
       COUNT(*) as 중복개수
FROM 신청 정보 테이블
GROUP BY
    이름,
    전화번호
HAVING
    COUNT (*) > 1
```

<img width="992" alt="image" src="https://user-images.githubusercontent.com/37354145/185736085-4b97ec2e-229b-4608-aae3-273054a477f7.png">

`GROUP BY`, `HAVING` 키워드를 이용해 중복을 체크해보니 생각보다 많은 데이터들이 중복으로 선별되었다.
중복되는 데이터들을 모두 날려버리면 편하겠지만, 가장 최신의 데이터 1개는 남겨야 한다는 점 때문에
쿼리 작성이 생각보다 까다로웠다.

<img width="1186" alt="image" src="https://user-images.githubusercontent.com/37354145/185736388-5a3d75aa-4f44-49d7-ad48-87e81d58f354.png">

<br>

## 💽 최신 데이터만 남기고 지우는 방법

어떤 방법이 있을까 한참을 고민하다가 결국 방법을 알아냈다!
신청정보 테이블을 A와 B로 나누고, A.row의 생성일자가 B.row보다 빠른 모든 조합(Combination)을 구하면 된다.

<img width="1341" alt="image" src="https://user-images.githubusercontent.com/37354145/185736709-6e21d613-c11c-4452-99ff-8c4d3b039d21.png">

`2022-07-01` 과 비교했을 땐 빠른 row 가 없다.

<img width="1360" alt="image" src="https://user-images.githubusercontent.com/37354145/185736716-e325fd02-8e6e-48f4-b9a3-187879898a21.png">

하지만 `2022-07-09` 과 비교하면 2개의 row 가 빠른 대상이 된다.

<img width="1353" alt="image" src="https://user-images.githubusercontent.com/37354145/185736719-d346e045-1931-4c54-8d34-9128d911da0c.png">

그렇게 마지막으로 `2022-07-02`와 비교를 하고 나면 지울 대상이 정해진다.

<img width="1354" alt="image" src="https://user-images.githubusercontent.com/37354145/185736724-d36c4e23-5006-4ba0-879f-729240f83e67.png">


지우고 나면 가장 최신의 데이터 1개만 살아남게 될 것이다!
그렇게 최신 데이터를 제외한 중복되는 데이터를 선별하는 쿼리는 아래와 같다.

```sql
SELECT A.id
FROM 신청 정보 테이블 as A
INNER JOIN 신청 정보 테이블 as B
ON A.created_at < B.created_at AND
    A.이름 = B.이름 AND
    A.전화번호 = B.전화번호
```
```
2,763 rows retrieved starting from 1 in 4 s 702 ms (execution: 4 s 667 ms, fetching: 35 ms)
```

<br>

## 💽 데이터 제거

준비된 SELECT 쿼리를 서브 쿼리로 사용하고, DELETE 쿼리로 감싸서 중복된 데이터를 지우고자 했다.
정상적으로 동작한다면 앞서 확인한 2,763개의 데이터가 제거될 것이다.

```sql
DELETE
FROM 신청 정보 테이블
WHERE id IN (SELECT DUPLICATE.id
    FROM (SELECT A.id
    FROM 신청 정보 테이블 as A
    INNER JOIN
    신청 정보 테이블 as B
    ON A.created_at
    < B.created_at
  AND
    A.이름 = B.이름
  AND
    A.전화번호 =
    B.전화번호) DUPLICATE)
```
```
1,686 rows affected in 4 s 596 ms
```

그러나 모든게 순탄히 넘어가지는 않는 법, 2,763개의 중복 데이터를 지울거라 기대했던 쿼리가 1,686개의 중복 데이터만 지웠다.
더 지운 것보단 덜 지운게 낫지만... 기대한 것과 쿼리 실행 결과가 다르니 당황스럽고 찝찝했다.
결국 쿼리 실행을 원복하고 왜 실행결과가 기대와 다른지 테스트 했다.

<br>

## 💽 조합(Combination) 구하기 방식

결론부터 말하자면 조합을 구하는 방식에서 중복조합이 탄생하기 때문이다.

<img width="1095" alt="image" src="https://user-images.githubusercontent.com/37354145/185768557-a8be348a-d701-49e0-9a07-6d6e33ab0dbd.png">

앞서 확인했던 테이블 조합 결과에서 얻어낸 row 개수는 2개 같았지만 실제로는 3개다.
3개가 되는 과정은 아래와 같다.

<img width="1372" alt="image" src="https://user-images.githubusercontent.com/37354145/185768703-6044f181-ce56-4d59-9616-eac6a8861cb9.png">

<img width="1376" alt="image" src="https://user-images.githubusercontent.com/37354145/185768757-68860cc1-c13d-4fdd-8c1c-189eababd1ce.png">

<img width="1367" alt="image" src="https://user-images.githubusercontent.com/37354145/185768716-17815900-d845-4796-8142-990d4eaf9a93.png">

위와 같은 과정으로 3개의 row를 얻어내기 때문에 실제 중복 데이터는 1,686개 밖에 되지 않았지만 
2,763개로 뻥튀기 된 개수를 확인하게 되었고, 실제 지워진 중복 데이터 1,686개에 놀라게 된 것이다.

그렇다면 실제 지워질 데이터와 확인되는 데이터의 개수를 맞추려면 어떻게 해야할까?
`DISTINCT` 키워드를 이용해 중복 row를 선별하면 쉽게 문제를 해결할 수 있다.

```sql
SELECT DISTINCT A.id
FROM 신청 정보 테이블 as A
INNER JOIN 신청 정보 테이블 as B
ON A.created_at < B.created_at AND
    A.이름 = B.이름 AND
    A.전화번호 = B.전화번호
```

`DISTINCT`를 이용해 중복 row를 선별시키고 나니, 정확하게 제거될 row 1,686개만 확인할 수 있었다.
결국 다시 안심하고 1,686개의 중복 데이터를 제거했다.

<br>

## 💽 후기
그림! 블로그에 그림 설명을 열심히 넣었듯이 
테이블 내부에 어떤 동작이 일어날지 열심히 그림을 그려가면서 쿼리를 준비했다.
덕분에 최초 데이터 삭제 쿼리도 쉽게 준비할 수 있었고,
선별 쿼리 row 수와 삭제 쿼리 row 수가 달랐을 때도 그림을 통해 금방 원인을 파악할 수 있었다.

- 쿼리를 던지기 전에 꼭 그림을 그려보자. 한층 더 잘 이해되고 헷갈릴 일이 적어진다.
- 테이블에 추가, 변경, 삭제를 가하는 쿼리를 던질 땐 꼭 테이블을 백업하자.
  - 확신을 갖고 작업했으나 결국 이번에도 원복할 일이 생겼다.
  - '나는 멍청하니 원복을 1회 이상 할 것이다.' 라는 마인드를 가져야겠다... ㅋㅋㅋ

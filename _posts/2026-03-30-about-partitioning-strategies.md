---
title: "파티셔닝 전략 이해하기"
date: 2026-04-01
toc: true
toc_sticky: true
toc_label: "파티셔닝 전략 이해하기"
---

## 🗂 용어에 대한 이해

### 파티셔닝(Partitioning)
대용량 테이블이나 인덱스를 더 작고 관리하기 쉬운 단위로 분할하는 프로세스.
그 단위를 **파티션(Partition)** 이라고 하며, 파티션을 만드는 행위를 **파티셔닝(Partitioning)** 이라고 부른다.
데이터를 조회하는 쿼리가 전체 테이블 혹은 인덱스를 스캔하는 대신 특정 파티션만 대상으로 처리할 수 있다.

### 파티션 프루닝(Partition Pruning)
파티셔닝의 핵심은 결국 "불필요한 파티션은 생략, 필요한 파티션만" 다루는 것이다.
이를 **파티션 프루닝(Partition Pruning)** 이라고 부르며, 파티션 전략을 선택하는 기준점이 바로 파티션 프루닝이다.
데이터를 얼마나 예쁘게 보관 하는지가 중심이 아니다. 데이터를 삽입하거나 조회할 때, 즉 사용할 때가 중심이 되어야 한다.

<br>

## 🗂전략에 대한 이해

파티셔닝 전략은 크게 3가지 축으로 나누어 생각해볼 수 있다.

<img width="922" height="678" alt="Image" src="https://github.com/user-attachments/assets/90021e81-7521-4f0c-ab32-b6c297b95097" />

### 수평 파티셔닝 (Horizontal Partitioning)

모든 파티션이 동일한 스키마를 갖도록 유지한 체, 행(row)을 기준으로 데이터를 나눈다.
규모의 단위를 테이블에서 데이터베이스로 키우면 샤딩(Sharding)으로 볼 수도 있다.

> 샤딩은 여러 DB(혹은 서버)에 분산된 데이터를 관리하므로 트랜잭션 관리나 JOIN 이 특히나 복잡하다.
> 가능하면 테이블 파티셔닝을 우선적으로 채택 후 샤딩을 고려하는 것이 좋다.

### 수평 파티셔닝 - 범위(Range)

범위 파티셔닝은 날짜나 숫자처럼 구간을 특정지을 수 있는 컬럼 값의 범위를 기준으로 데이터를 분할한다.
연도별, 월별, 일별 같은 시계열 데이터가 가장 적합하다.

```sql
CREATE TABLE orders (
    order_id BIGINT,
    order_date TIMESTAMP NOT NULL,
    ...
) PARTITION BY RANGE (order_date);

CREATE TABLE orders_2025_01 PARTITION OF orders
    FOR VALUES FROM ('2025-01-01') TO ('2025-02-01');
CREATE TABLE orders_2025_02 PARTITION OF orders
    FOR VALUES FROM ('2025-02-01') TO ('2025-03-01');
```

쿼리의 `WHERE` 절을 기반으로 데이터베이스 쿼리 플래너가 자동으로 어떤 파티션을 스캔할지 결정(파티션 프루닝)한다.
이 기능 없이는 데이터베이스가 모든 파티션을 스캔하게 되어 파티셔닝의 의미가 사라진다.

### 수평 파티셔닝 - 해시(Hash)

파티션 키에 해시 함수를 적용해 파티션 전체에 균일하게 데이터를 분산시킨다.
시계열 데이터가 없거나, 파티션마다 데이터가 균등하게 분배(핫 파티션 문제 방지) 되는 것이 가장 중요한 경우 선택하기 좋다.

```sql
CREATE TABLE users (
    user_id BIGINT,
    username VARCHAR(100),
    ...
) PARTITION BY HASH (user_id);

CREATE TABLE users_p0 PARTITION OF users
    FOR VALUES WITH (MODULUS 4, REMAINDER 0);
CREATE TABLE users_p1 PARTITION OF users
    FOR VALUES WITH (MODULUS 4, REMAINDER 1);
```

### 수평 파티셔닝 - 리스트(List)

미리 정의된 값 리스트를 기반으로 데이터를 그룹화한다.
지역이나 부서 등으로 제한적이고 명확한, 잘 변화되지 않는 진리 같은 값을 이용하는 것이 좋다.

```sql
CREATE TABLE events (
    id BIGINT,
    region TEXT,
    ...
) PARTITION BY LIST (region);

CREATE TABLE events_us PARTITION OF events
    FOR VALUES IN ('us-east', 'us-west');
CREATE TABLE events_eu PARTITION OF events
    FOR VALUES IN ('eu-west', 'eu-central');
```

### 수평 파티셔닝 - 복합(Composite)

파티셔닝 구조에 추가적인 세분화 단계를 더한다. 
예를 들어, 날짜로 범위 파티셔닝 후 각 파티션 내부를 지역으로 다시 리스트 파티셔닝하는 방식이다.
초대형/이력 데이터 등에 활용하게 된다.
당연히 `리스트/리스트`, `리스트/범위`, `범위/해시` 등등 다양한 조합이 가능하다.

가장 널리 사용되는 3가지만 예시를 살펴보자.

```sql
-- 루트: 날짜 기준 Range
CREATE TABLE event_logs (
    log_id     BIGSERIAL    NOT NULL,
    event_date DATE         NOT NULL,
    region     VARCHAR(10)  NOT NULL,   -- 'KR', 'US', 'EU'
    severity   VARCHAR(10)  NOT NULL,
    message    TEXT
) PARTITION BY RANGE (event_date);

-- 2024년 파티션 → 내부를 region(List)으로 재분할
CREATE TABLE event_logs_2024
    PARTITION OF event_logs
    FOR VALUES FROM ('2024-01-01') TO ('2025-01-01')
    PARTITION BY LIST (region);

-- 2024년 안의 List 서브파티션
CREATE TABLE event_logs_2024_kr
    PARTITION OF event_logs_2024
    FOR VALUES IN ('KR');

CREATE TABLE event_logs_2024_us
    PARTITION OF event_logs_2024
    FOR VALUES IN ('US');

CREATE TABLE event_logs_2024_eu
    PARTITION OF event_logs_2024
    FOR VALUES IN ('EU');

-- 기타 지역을 위한 default 파티션
CREATE TABLE event_logs_2024_etc
    PARTITION OF event_logs_2024
    DEFAULT;
```

프루닝은 날짜 범위로 먼저 탐색 후, region 기준으로 서브 파티션을 찾아내어 해당 서브 파티션 하나만 스캔을 진행하게 된다.

2개의 시간 축을 사용하는 경우 범위/범위 조합으로도 파티션을 나눠볼 수 있다.

```sql
-- 루트: 주문일 기준 Range
CREATE TABLE orders (
    order_id    BIGINT    NOT NULL,
    order_date  DATE      NOT NULL,
    ship_date   DATE,
    customer_id BIGINT    NOT NULL,
    amount      NUMERIC(12,2)
) PARTITION BY RANGE (order_date);

-- 2024년 주문 파티션 → 내부를 ship_date(Range)로 재분할
CREATE TABLE orders_2024
    PARTITION OF orders
    FOR VALUES FROM ('2024-01-01') TO ('2025-01-01')
    PARTITION BY RANGE (ship_date);

-- 분기별 배송 서브파티션
CREATE TABLE orders_2024_ship_q1
    PARTITION OF orders_2024
    FOR VALUES FROM ('2024-01-01') TO ('2024-04-01');

CREATE TABLE orders_2024_ship_q2
    PARTITION OF orders_2024
    FOR VALUES FROM ('2024-04-01') TO ('2024-07-01');

CREATE TABLE orders_2024_ship_q3
    PARTITION OF orders_2024
    FOR VALUES FROM ('2024-07-01') TO ('2024-10-01');

CREATE TABLE orders_2024_ship_q4
    PARTITION OF orders_2024
    FOR VALUES FROM ('2024-10-01') TO ('2025-01-01');
```

범위/해시 조합으로 대형 거래나 대규모 이력 테이블에도 적합한 파티션을 구성할 수 있다.

```sql
-- 루트: RANGE 기준
CREATE TABLE transactions (
    tx_id       BIGINT       NOT NULL,
    tx_date     DATE         NOT NULL,
    user_id     BIGINT       NOT NULL,
    amount      NUMERIC(12,2),
    status      VARCHAR(20)
) PARTITION BY RANGE (tx_date);

-- 연도별 Range 파티션 생성 + 각각 HASH 서브파티션 선언
CREATE TABLE transactions_2024
    PARTITION OF transactions
    FOR VALUES FROM ('2024-01-01') TO ('2025-01-01')
    PARTITION BY HASH (user_id);

CREATE TABLE transactions_2025
    PARTITION OF transactions
    FOR VALUES FROM ('2025-01-01') TO ('2026-01-01')
    PARTITION BY HASH (user_id);

-- 각 Range 파티션 안에 Hash 서브파티션 생성 (4개 버킷)
CREATE TABLE transactions_2024_h0
    PARTITION OF transactions_2024
    FOR VALUES WITH (MODULUS 4, REMAINDER 0);

CREATE TABLE transactions_2024_h1
    PARTITION OF transactions_2024
    FOR VALUES WITH (MODULUS 4, REMAINDER 1);

CREATE TABLE transactions_2024_h2
    PARTITION OF transactions_2024
    FOR VALUES WITH (MODULUS 4, REMAINDER 2);

CREATE TABLE transactions_2024_h3
    PARTITION OF transactions_2024
    FOR VALUES WITH (MODULUS 4, REMAINDER 3);

-- 2025년 반복...

-- 인덱스는 서브파티션 단위로 생성
CREATE INDEX ON transactions_2024_h0 (user_id, tx_date);
```

### 수직 파티셔닝 (Vertical Partitioning)

수직 파티셔닝은 단일 테이블을 컬럼 기준으로 여러 개의 작은 테이블로 분할하는 개념이다.
각기 원본 테이블 일부의 컬럼을 가지며, 동일한 PK 를 공유한다. 동일한 PK 는 필요시 JOIN 에 활용된다.

<img width="1295" height="321" alt="Image" src="https://github.com/user-attachments/assets/ad8f2b0f-6cad-4d37-a8e2-a93bd8f35f91" />

자주 사용되는 hot 컬럼과 드물게 사용되는 cold 컬럼을 나누어 별도로 관리함으로서, Disk I/O 오버헤드와 메모리 공간 효율성을 높이기 위해 사용된다.
잘 생각해보면 수직 파티셔닝은 사실 테이블(스키마)을 완전히 재설계하는 것과 동일하다.

```sql
CREATE TABLE users (
    user_id      BIGINT PRIMARY KEY,
    email        VARCHAR(255) NOT NULL,  -- 로그인 시
    password     VARCHAR(255) NOT NULL,  -- 로그인 시
    name         VARCHAR(100),           -- 프로필 조회 시
    image_url   VARCHAR(512),            -- 프로필 조회 시
    bio          TEXT,                   -- 마이페이지 진입 시
    preferences  JSONB,                  -- 마이페이지 진입 시
    last_login   TIMESTAMP,              -- 로그인 시
    created_at   TIMESTAMP               -- 로그인 시
);
```

하나의 테이블에 지나치게 많은 컬럼이 존재하는 경우, 유스케이스별로 hot/cold 컬럼이 나뉘게 된다.
이 때 cold 컬럼이 많아지면 많아질수록 비용 비효율이 발생하기 마련이다.

```sql
-- 로그인 시
CREATE TABLE users_auth (
    user_id       BIGINT       PRIMARY KEY,
    email         VARCHAR(255) NOT NULL UNIQUE,
    password VARCHAR(255) NOT NULL,
    last_login    TIMESTAMP,
    created_at    TIMESTAMP
);

-- 프로필 조회 시
CREATE TABLE users_profile (
    user_id    BIGINT       PRIMARY KEY REFERENCES users_auth(user_id),
    name       VARCHAR(100),
    image_url VARCHAR(512)
);

-- 마이페이지 진입 시
CREATE TABLE users_detail (
    user_id     BIGINT  PRIMARY KEY REFERENCES users_auth(user_id),
    bio         TEXT,
    preferences JSONB
);
```

조회 쿼리 역시도 훨씬 간결하고 깔끔하게 관리가 가능하다.

```sql
-- 로그인 시
SELECT user_id, password
FROM users_auth
WHERE email = 'alice@example.com';

-- 프로필 조회 시
SELECT a.user_id, a.email, p.name, p.image_url
FROM users_auth a
JOIN users_profile p USING (user_id)
WHERE a.user_id = 1;

-- 마이페이지 진입 시
SELECT a.email, p.name, d.bio, d.preferences
FROM users_auth a
JOIN users_profile p USING (user_id)
JOIN users_detail  d USING (user_id)
WHERE a.user_id = 1;
```

사실 유스케이스별 도메인 로직, 추상화 계층 관리에 대해 익숙한 개발자라면 이미 이와 같은 분리 경험이 많을 것이다. 

<br>

## 🗂정리하며

파티셔닝 전략에 정답은 없다. Range 가 맞는 테이블에 Hash 를 쓰면 프루닝이 사라지고, 수직 분리가 필요한 곳에 수평 파티셔닝만 고집하면 캐시 효율은 여전히 나쁘다. 
결국은 경험 차이다. 대규모 데이터를 자주, 많이 다뤄볼수록 쿼리 패턴을 보는 눈이 생기고, 적합한 전략을 선택하는 속도도 빨라진다.
더 나아가 아키텍처(테이블 분리를 넘어 서비스 분리) 수준의 고민까지 할 수 있게 된다.

각각의 전략들은 '이런 것들이 있구나' 하고 개안하는 정도로 넣어두고, 천천히 내 것으로 만들어 가면 될 것 같다.
아는 만큼 보이고, 해본 만큼 빨라진다.

<br>

## References

- [MariaDB와 함께하는 데이터 이야기 - 06. 파티셔닝 전략과 구현](https://wikidocs.net/306571)

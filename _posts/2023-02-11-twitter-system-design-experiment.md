---
title: "트위터 시스템 디자인 실험기"
date: 2023-02-11
tags:
    - 실험
    - 시스템디자인
toc: true
toc_sticky: true
toc_label: "트위터 시스템 디자인 실험기"
---

> 본문 속 테스트 코드 및 데이터는 [https://github.com/Hyeon9mak/twitter-system-design/](https://github.com/Hyeon9mak/twitter-system-design/)
> 에서 확인할 수 있습니다.

## 🐦 우연히 접한 트위터 시스템 디자인

출근 시간에 기술 관련 유튜브 영상을 틀어놓았다가 우연히 
코맹탈출 채널의 [트위터 시스템 디자인 완전정복 | 1억 유저 처리의 비밀](https://www.youtube.com/watch?v=6QwqtdBx0oE) 영상을 접하게 되었다.
1억명이 넘는 유저들이 쏟아내는 수 많은 트래픽을 처리하기 위해 트위터에서는 어떤 시스템 디자인을 채택했는지에 대한 내용.
영상을 다 보고 나니 '도대체 fan-out 문제가 얼마나 심각하길래 조회 성능을 포기하면서까지 시스템을 구성하는거지?' 라는 의문이 생겼다.
그래서 이번 기회에 트위터 시스템 디자인을 직접 실험해보았다.

<br>

## 🐦 트위터 트래픽 특성

트위터가 왜 특별한 시스템 구조를 갖게 되었는지를 이해하기 위해선 트위터 트래픽 특성을 살펴볼 필요가 있다.

- 트윗 포스트 하기
    - Write Operation
    - 초당 12,000건 요청
- 피드 보기 (내가 팔로우 하는 사람들의 트윗 보기)
    - Read operation
    - 초당 300,000건 요청

트위터 애플리케이션은 조회 요청이 쓰기 요청 대비 25배 정도 많다는 특성을 가지고 있다.
또한 사용자를 누군가가 팔로우하고 사용자가 누군가를 팔로우하는 것으로 
사용자의 모든 액션이 전파(fan-out)된다는 재밌는 특성도 가지고 있다.

트위터는 이러한 특성을 가진 트래픽들을 감당하기 위해 점진적으로 시스템을 발전시켜왔다고 한다.
각 방법에 대해 차근차근 알아보자.

<br>

## 🐦 트윗 포스트를 간단하게

트위터 초창기 시스템의 트윗 요청은 매우 간결하다.
대신 피드 조회 요청을 처리할 때 복잡한 과정을 거친다.

### 트윗 포스트
![image](https://github.com/Hyeon9mak/twitter-system-design/raw/simple-tweet/docs/tweet.png)

1. `leo` 가 트윗을 포스트하면 
2. Tweet 테이블에 `leo`의 트윗 기록이 추가된다.

### 피드 요청
![image](https://github.com/Hyeon9mak/twitter-system-design/raw/simple-tweet/docs/feed.png)

1. `jack`이 피드를 요청하면 
2. `jack`의 팔로워를 체크하고, 
3. `jack`이 팔로우한 모든 사람들의 트윗 내용을 가져온다.

처음에는 이 방법을 채택했다고 한다. 피드 요청을 간단히 만들기 위해선 캐시를 사용해야하는데,
캐시 자체를 관리해준다는 것이 시스템 복잡도를 상승시키기 때문에 고려 대상이 아니었다고 한다.
그러나 트위터 애플리케이션 특성상 트윗 포스트 요청보다 피드 요청이 25배 많다.
유저가 많아지면 많아질수록 피드 요청에 대한 부하가 점점 더 커지기 마련이다.

<br>

## 🐦 피드 요청을 간단하게

이번에는 트윗 포스트가 복잡성을 희생하고 피드 요청의 성능을 끌어올렸다.

### 트윗 포스트
![image](https://github.com/Hyeon9mak/twitter-system-design/raw/simple-feed/docs/tweet.png)

1. `leo`가 트윗을 포스트하면
2. Tweet 테이블에 `leo`의 트윗 기록을 추가하고
3. `leo`를 팔로우하는 모든 유저들을 확인 후
4. 해당 유저들의 피드 캐시 테이블에 트윗 내용을 캐싱한다.

이렇게 복잡한 절차를 거쳐서 트윗을 포스트 해두면, 피드 요청이 굉장히 간결해진다.

### 피드 요청
![image](https://github.com/Hyeon9mak/twitter-system-design/raw/simple-feed/docs/feed.png)

1. `jack`이 피드를 요청하면 `jack`의 피드 캐시 테이블 내용을 그대로 반환한다.

트윗 포스트를 희생하고, 캐시 서버를 관리해야한다는 부담은 늘어났지만
트윗 포스트 대비 25배 차이가 나는 피드 요청에 대한 성능을 극한으로 끌어올릴 수 있다.
애플리케이션 특성에 따라 살을 내주고 뼈를 취한 형태의 시스템 디자인으로 보인다.

그러나 앞서 말했듯, 트위터는 팔로우-팔로워 관계로 인한 fan-out 특성을 가지고 있다.
트위터 유저들의 평균 팔로워인 75명 수준에서는 fan-out 으로 인한 문제가 발생하지 않았다.
그런데 오바마(팔로워 130,000,000명)와 같은 인플루언서들이 등장하면서 fan-out 문제가 발생하기 시작했다.

현재 시스템에서 오바마가 트윗을 포스트하는 경우 130,000,000개의 피드 캐시를 업데이트해야하는데,
이 작업이 5분 이상 걸리는 경우도 허다했다고... 
최악의 경우엔 오바마의 트윗이 다른 사람에게는 보이는데 나에게는 안보이고, 
다른 사람이 오바마의 트윗에 답장한 내용이 먼저 보이는 경우도 있었다고 한다.

트위터는 이 fan-out 문제를 어떻게 해결했을까?

<br>

## 🐦 피드 요청을 간단하게 + 인플루언서 처리

해결방법은 간단하다. 인플루언서를 뜻하는 별개의 컬럼을 추가하고,
인플루언서라면 트윗을 간단하게 처리하고, 인플루언서가 아니라면 트윗 포스트시 복잡성을 처리한다.

### 일반 유저의 트윗 포스트
![image](https://github.com/Hyeon9mak/twitter-system-design/raw/simple-feed-and-influencer/docs/tweet-normal.png)

1. 일반 유저 `leo`가 트윗을 포스트하면
2. Tweet 테이블에 `leo`의 트윗 기록을 추가하고
3. `leo`를 팔로우하는 모든 유저들을 확인 후
4. 해당 유저들의 피드 캐시 테이블에 트윗 내용을 캐싱한다.

### 인플루언서의 트윗 포스트
![image](https://github.com/Hyeon9mak/twitter-system-design/raw/simple-feed-and-influencer/docs/tweet-influencer.png)

1. 인플루언서 `Obama` 가 트윗을 포스트하면 
2. Tweet 테이블에 `Obama`의 트윗 기록이 추가된다.

### 피드 요청
![image](https://github.com/Hyeon9mak/twitter-system-design/raw/simple-feed-and-influencer/docs/feed.png)

1. `jack` 이 피드를 요청하면 우선 피드 캐시를 요청하고
2. `jack` 이 팔로우 하는 인플루언서를 확인 후
3. 인플루언서들의 트윗을 합쳐서 반환한다.

즉 인플루언서의 피드는 첫 번째 시스템 디자인으로, 일반 유저의 피드는 두 번째 시스템 디자인으로 처리한 것이다.
이 디자인을 통해 인플루언서가 발생시키는 fan-out 이슈를 대부분 해결할 수 있었다고 한다.

<br>

## 🐦 fan-out 이 얼마나 심하길래? 테스트해보자.

기가 막힌 시스템 디자인 속에서 나는 'fan-out 문제가 얼마나 심각한거지?' 라는 의문이 생겨났다.
피드 조회의 성능을 끌어올리기 위해서 피드를 캐싱 해두는 디자인은 납득이 되지만, 
fan-out 문제 때문에 변경된 시스템 디자인에 대해서는 납득이 어려웠다.
또 변경된 시스템 디자인으로 fan-out 문제가 얼마나 크게 개선되는지가 궁금했다.

완벽하게 트위터가 구성하고 있는 시스템과 동일할 순 없겠지만, 
로컬 환경 내에서 따라할 수 있는 형태로 따라해보고, 순서대로 테스트를 진행하면서
그 결과를 두 눈으로 확인해보고자 했다.

### 실험을 위한 시스템 구성 및 데이터 셋

실험을 위해 사용한 프로젝트 설정은 아래와 같다.

- 프로젝트
  - SpringBoot 2.7.8
  - Kotlin 1.7
  - JAVA 17
  - mariadb 10.5.18
  - redis 6.2.6
- 테스트 환경
  - CPU Apple M1 Pro / Memory 32GB / OS Ventura 13.1
- 테스트 툴
  - K6 v0.42.0

실험을 위해 준비한 팔로워 관계는 아래와 같다.

![image](https://github.com/Hyeon9mak/twitter-system-design/raw/simple-tweet/docs/dataset.png)

- `User A` 는 `User 1` ~ `User 10,000` 까지의 모든 유저와 `Obama`를 팔로우하는 하드 팔로워다.
- `User B` 는 `User 1`과 `Obama`를 팔로우한다.
- `User 1` ~ `User 10,000` 의 모든 유저들은 `Obama`를 팔로우한다.

이제 트위터가 사용했었던 3가지 시스템 디자인에 대해 공통적으로 아래 2가지 테스트를 진행할 것이다.

### 피드 조회 성능 테스트

60초간 `User A` 와 `User B` 가 피드 조회를 지속적으로 요청한다.

```
VUser 1, 60 sec
GET /api/v1/feeds?user-id=10002 (User A)
GET /api/v1/feeds?user-id=10003 (User B)
```

### 인플루언서의 트윗 fan-out 테스트

60초간 `User 1` 과 `User 10,000` 이 피드를 조회하던 중 10초 언저리쯤 `Obama`가 트윗을 했을 때
`User 1` 과 `User 10,000` 가 동일한 피드를 보고 있을 확률을 테스트한다.

```
VUser 1, 60 sec
GET /api/v1/feeds?user-id=1 (User 1)
GET /api/v1/feeds?user-id=10000 (User 10,000)
POST /api/v1/tweets (Obama tweet after 10 sec)
```

<br>

## 🐦 트윗 포스트를 간단하게 - 테스트

### 시스템 구조
![image](https://github.com/Hyeon9mak/twitter-system-design/raw/simple-tweet/docs/infra.png)

### 피드 조회 성능 테스트

![image](https://github.com/Hyeon9mak/twitter-system-design/raw/simple-tweet/docs/look_up_1.png)
![image](https://github.com/Hyeon9mak/twitter-system-design/raw/simple-tweet/docs/look_up_2.png)
![image](https://github.com/Hyeon9mak/twitter-system-design/raw/simple-tweet/docs/look_up_3.png)

HTTP 요청 평균 소요시간(`http_req_duration`)이 58.43ms 으로 나왔다.

### 인플루언서의 트윗 fan-out 테스트

![image](https://github.com/Hyeon9mak/twitter-system-design/raw/simple-tweet/docs/fan_out_1.png)
![image](https://github.com/Hyeon9mak/twitter-system-design/raw/simple-tweet/docs/fan_out_2.png)
![image](https://github.com/Hyeon9mak/twitter-system-design/raw/simple-tweet/docs/fan_out_3.png)

`User 1`과 `User 10,000`이 동일한 피드를 보고 있을 확률이 100% 로 나왔다.
트윗 포스트를 간단하게 작성하는 형태에서는 fan-out 문제가 발생하지 않았다.

<br>

## 🐦 피드 요청을 간단하게 - 테스트

### 시스템 구조
![image](https://github.com/Hyeon9mak/twitter-system-design/raw/simple-feed/docs/infra.png)

### 피드 조회 성능 테스트

![image](https://github.com/Hyeon9mak/twitter-system-design/raw/simple-feed/docs/look_up_1.png)
![image](https://github.com/Hyeon9mak/twitter-system-design/raw/simple-feed/docs/look_up_2.png)
![image](https://github.com/Hyeon9mak/twitter-system-design/raw/simple-feed/docs/look_up_3.png)

HTTP 요청 평균 소요시간(`http_req_duration`)이 152.53ms 으로 나왔다.

### 인플루언서의 트윗 fan-out 테스트

![image](https://github.com/Hyeon9mak/twitter-system-design/raw/simple-feed/docs/fan_out_1.png)
![image](https://github.com/Hyeon9mak/twitter-system-design/raw/simple-feed/docs/fan_out_2.png)
![image](https://github.com/Hyeon9mak/twitter-system-design/raw/simple-feed/docs/fan_out_3.png)

`User 1`과 `User 10,000`이 동일한 피드를 보고 있을 확률이 71.67% 로,
28.33% 의 시간동안 두 사람 중 한 명은 `Obama`의 트윗을 확인하지 못하고 있었다!

<br>

## 🐦 피드 요청을 간단하게 + 인플루언서 처리 - 테스트

### 시스템 구조
![image](https://github.com/Hyeon9mak/twitter-system-design/raw/simple-feed-and-influencer/docs/infra.png)

### 피드 조회 성능 테스트

![image](https://github.com/Hyeon9mak/twitter-system-design/raw/simple-feed-and-influencer/docs/look_up_1.png)
![image](https://github.com/Hyeon9mak/twitter-system-design/raw/simple-feed-and-influencer/docs/look_up_2.png)
![image](https://github.com/Hyeon9mak/twitter-system-design/raw/simple-feed-and-influencer/docs/look_up_3.png)

HTTP 요청 평균 소요시간(`http_req_duration`)이 176.01ms 으로 나왔다.

### 인플루언서의 트윗 fan-out 테스트

![image](https://github.com/Hyeon9mak/twitter-system-design/raw/simple-feed-and-influencer/docs/fan_out_1.png)
![image](https://github.com/Hyeon9mak/twitter-system-design/raw/simple-feed-and-influencer/docs/fan_out_2.png)
![image](https://github.com/Hyeon9mak/twitter-system-design/raw/simple-feed-and-influencer/docs/fan_out_3.png)

`User 1`과 `User 10,000`이 동일한 피드를 보고 있을 확률이 100% 로 나왔다.
트윗 포스트를 간단하게 작성하던 첫 번째 디자인과 마찬가지로 fan-out 문제가 말끔히 사라졌다!

<br>

## 🐦 redis 조회 성능 문제점

피드 요청을 간단히 처리하기 위해서 redis 를 사용한 두 번째, 세 번째 시스템에서
피드 조회 성능을 테스트 했을 때 첫 번째 시스템보다 한참 느린 결과가 나왔다.

1. 첫 번째 시스템 HTTP 요청 평균 소요시간 58.43ms
2. 두 번째 시스템 HTTP 요청 평균 소요시간 152.53ms
3. 세 번째 시스템 HTTP 요청 평균 소요시간 176.01ms

redis 는 인메모리에서 동작하기 때문에 RDB에 비해 압도적으로 빠를 것이라고 알고 있었는데,
로컬 컨테이너 환경에서는 RDB 보다 redis 를 조회하는게 더 느렸다.
redis 가 제공하는 LIST 자료구조를 사용해서 저장하고 `lrange` 명령어를 통해 조회하도록 했는데,
`lrange` 명령어가 가지는 시간복잡도(`O(S+N)`)에 의해 이런 결과가 나온 것 같았다.

때문에 LIST 에서 ZSET(시간복잡도 `O(lg(N)+M)`) 으로 자료구조를 변경한 후 다시 테스트를 시도해보았다. 

![image](https://github.com/Hyeon9mak/twitter-system-design/raw/simple-feed/docs/look_up_4.png)

그러나 여전히 첫 번째 시스템에 비해 한참 느린 결과를 보여주었다.

원인이 무엇일까 한참을 고민해보았는데, 아무래도 싱글 스레드로 동작하는 redis 의 특성과 
스프링 부트 HikariCP 의 기본 커넥션 풀 10 개의 차이로 인해 성능 차이가 생기는 것이 아닐까...

![image](https://github.com/Hyeon9mak/twitter-system-design/raw/simple-feed/docs/hikari_pool.png)

게다가 통상적으로 RDB 는 애플리케이션 서버와 다른 환경에, redis 는 같은 환경에 두고 사용하는데
이번 테스트에서는 둘을 애플리케이션 서버와 같은 환경에 두고 진행했기 때문에
이런 결과가 나오지 않았나 추측 중이다. 🤔

<br>

## 🐦 후기

인플루언서의 fan-out 문제로 유저간에 생기는 정보의 차이가 이렇게 클줄도 몰랐고,
인플루언서의 트윗 처리방식을 바꿨다고 해서 바로 말끔히 해결될 정도로 효과가 뛰어날줄도 몰랐다.
시스템, 아키텍처, 디자인 패턴이 가지는 효용성, 강력함이 정말 어마어마하다는 걸 작게나마 체험한거 같다.

업무중 난해한 고민 포인트를 만나게 되면 "어느 한쪽도 완벽한 해결책이 되지 못해..."
라고 괴로워하면서 어떻게든 '정답'을 찾아내기 위해 많은 시간을 허비하곤 했는데,
애플리케이션과 유저의 특성에 맞춰서 최적의 시스템을 선택하고 이를 혼용한 것이 인상 깊다.
단점이 없는 완벽한 솔루션(이라는게 존재하긴 할까?)을 찾으려고 많은 시간을 소비하기보다, 
문제상황을 최대한 작은 단위로 나누어 바라볼 수 있는 시야와,
각각에 알맞는 시스템을 디자인하고 구현할 수 있는 능력을 길러야 할 것 같다.

“특성에 맞춰 시스템을 구성한다.” 라는 관점에서 다시 한번 DDD의 바운디드 컨텍스트가 떠오른다. 
(특히나 현대 서비스에선) 모든 상황에 완벽한 솔루션을 찾을 수 없으므로, 컨텍스트 경계를 잘 나누는게 중요하구나 싶다.
왜 DDD 가 한참 각광 받는지 이해가 된다.

<br>

## References

- [트위터 시스템 디자인 실험 저장소](https://github.com/Hyeon9mak/twitter-system-design/)
- [트위터 시스템 디자인 완전정복 | 1억 유저 처리의 비밀](https://www.youtube.com/watch?v=6QwqtdBx0oE)
- [redis.io lrange command](https://redis.io/commands/lrange/)

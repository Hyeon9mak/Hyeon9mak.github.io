---
title: "Period.between 트러블 슈팅"
date: 2022-07-29
tags:
  - java
  - period
toc: true
toc_sticky: true
toc_label: "Period.between 트러블 슈팅"
---

## 🍼 문제 상황

매칭 프로세스를 개선한지 얼마 되지 않아 운영팀에서 비상연락이 왔다.

<img width="761" alt="image" src="https://user-images.githubusercontent.com/37354145/180634938-b3fac31e-e302-48be-93ce-964338a0f349.png">

(어찌나 당황하셨었는지 지금 읽어봐도 뭐가 문젠지 모르겠다 😂)

<img width="742" alt="image" src="https://user-images.githubusercontent.com/37354145/180635071-6d200238-fe7d-4ee2-a671-638da971d8a0.png">

정리해보자면 '돌봄상세'라는 페이지에서 보이는 아이의 나이는 정상이지만,
시터에게 전달되는 '돌봄제안' 페이지 속 아이의 나이가 이상하다는 내용이었다.
의심되는 상황은 크게 2가지 뿐...

1. 서버에서 값을 이상하게 전달
2. 프론트에서 전달 받은 값을 잘못 변환

1번의 가능성이 높은 것 같아 서버 코드를 샅샅히 뒤져보기 시작했다.

> 36개월 이상의 아이는 보통 '살'(4살, 5살)로 나타내고, 미만의 아이는 '개월'(18개월, 22개월)로 나타낸다.

<br>

## 🍼 Period.between

실제 데이터베이스엔 아이의 나이 관련 정보가 "생년월일"로 저장되어 있었다.
즉 2020년 1월 1일 출생이라면 테이블엔 `2022-01-01`로 저장되어 있고,
이를 `Period.between` 메서드를 사용하여 오늘 날짜와 비교 후 나이로 환산하는 것이다.

```kotlin
private fun getAge(birthDate: LocalDate): String {
    val months = Period.between(birthDate, LocalDate.now()).months
    return "${months}개월"
}
```

로직상에는 아무런 문제가 없어보였고 테스트도 여러차례 했을 터였다.
그래도 '혹시 모르니까...' 라는 생각으로 1살(12개월) 아동을 테스트 데이터로 만들어 테스트를 진행해보았다.

```
생년월일: 2021-07-14
오늘날짜: 2022-07-14
--------------------------
아이의 나이: 0개월
```

아이의 나이가 0개월로 출력되었다.
그제서야 문제가 무엇인지 파악이 되었다.

`Period.between` 메서드는 날짜 비교 결과를 **n년 n개월 n일**로 나타내어준다.
2021년 7월 14일과 2022년 7월 14일을 비교하면 1년 0개월 0일이 되는 것이다.
이 결과값에서 `months`를 요청하면 1년이 12개월로 변환되는게 아닌, 0개월 그대로의 값을 반환하는 것이었다.

1년이 12개월로 변환되어 합산되는 결과를 얻기 위해선 `months`가 아닌 `toTotalMonths` 메서드를 사용해야했다.

<br>

## 🍼 해결

결국 `toTotalMonths` 메서드를 사용하도록 변경하여 문제를 해결했고, 테스트 코드를 추가하여 안정감을 더해주었다.

```kotlin
"Period.between으로 개월 수를 구할 때" - {
    val birthDate = LocalDate.of(2021, 7, 1)
    val conditionDate = LocalDate.of(2022, 7, 1)
    val between = Period.between(birthDate, conditionDate)
    "months 프로퍼티를 호출하면 년/월/일로 나눠진 월이 나온다. (0개월)" {
        between.months shouldBe 0
        between.years shouldBe 1
    }
    "toTotalMonths 함수를 호출하면 총 개월수가 나온다. (12개월)" {
        between.toTotalMonths() shouldBe 12
    }
}
```

테스트 코드를 작성할 때 흔히 "경계 값을 테스트하자."고 많이들 이야기하는데,
그 경계 값을 소홀히 테스트하여 문제가 발생했다.
경계 값 테스트를 소홀히 하지 않았더라면 개발단계에서 문제를 발견했을 것이다...

경계 값 테스트를 소홀히 하여 운영에 불편을 드렸다...  
더욱 책임감을 갖고 프로그래밍을 하자... 😭

<img width="739" alt="image" src="https://user-images.githubusercontent.com/37354145/180636258-b45382f2-a6a5-4bc2-a31f-a82bdba1f722.png">

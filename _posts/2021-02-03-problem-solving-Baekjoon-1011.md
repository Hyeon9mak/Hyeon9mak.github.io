---
title: "[Baekjoon-1011] Fly me to the Alpha Centauri"
date: 2021-02-03
tags:
    - problem solving
    - 백준
toc: true
toc_sticky: true
toc_label: "[Baekjoon-1011] Fly me to the Alpha Centauri"
---
## 📝 문제
[https://www.acmicpc.net/problem/1011](https://www.acmicpc.net/problem/1011)

<br>

## 🎯 풀이
**점진적으로** 워프 속도가 증가하고, 감소한다는 것에 주목해야 한다.

```
1 2 3 3 2 1  -- 이건 가능하지만,
1 4 2 1      -- 이건 불가능 하다.
```

이 때문에 첫 번째 시도로 점진적으로 증가하는 워프 속도 횟수의 절반까지만 구한 후, 
이를 2배 곱하여 총 워프 횟수를 반환하는 것으로 코드를 작성했다. 코드를 작성하면서도 
'택도 없이 느릴 것 같은데...' 라고 생각했고, 역시나 시간 초과가 발생했다.  
  
두 번째 시도로 제시된 이동거리(끝지점 - 시작지점)를 기준으로 최소 워프 횟수를 
구하는 규칙을 찾아보려고 했다. 

![프레젠테이션1](https://user-images.githubusercontent.com/37354145/106682154-3d0c0680-6605-11eb-9bac-198f37213aed.png)
{: .align-center}

이동거리와 워프 횟수 간의 규칙은 찾아내지 못했으나, 
노가다식으로 워프 과정을 적어보는 과정에서 **최대 속력**에 대한 규칙을 발견했다. 
최대 속력이 최초로 등장하는 이동거리가 **최대 속력의 제곱** 이었다.  
  
최대 속력을 `M`으로 두고 규칙을 정리해보자.  

---

- `M^2 - M + 1` ~ `M^2` 사이 이동거리의 경우  
    최소 워프 횟수는 `2M - 1` 이다.
    
- `M^2 + 1` ~ `M^2 + M` 사이 이동거리의 경우  
    최소 워프 횟수는 `2M` 이다.

---

와우! 이제 코드로 작성만 하면 끝이라는 생각에 
곧장 반복문으로 최대 속력 1부터 점차 증가시키는 무한 루프를 돌려 
규칙에 포함되는 이동거리를 찾아 최소 워프 횟수를 반환하는 코드를 작성했다. 
그러나 결과는 또 다시 시간초과. 이유는 간단했다. **이동거리가 클수록 루프가 비례해서 늘어진다**.  
  
결국 루프를 돌아선 안됐다. 사실 루프를 돌릴 필요도 없었다. 
규칙에 포함되는 이동거리 값은 최대 속력의 제곱이었으므로, 이동거리 값의 제곱근의 근사 값을 
소수점으로 구한 뒤 반올림 하여 최대 속력을 구하면 됐다.  
  
한 가지 더, `int` 최대 표현 범위를 넘어가는 값이 입력 되는 경우도 포함되어 있으므로, 
`long` 으로 대체하여 연산을 진행시켰다.

<br>

## 💻 코드
```java
import java.io.BufferedReader;
import java.io.InputStreamReader;
import java.util.StringTokenizer;

public class Fly_me_to_the_Alpha_Centauri {

    public static void main(String[] args) throws Exception {
        BufferedReader in = 
            new BufferedReader(new InputStreamReader(System.in));

        int testCaseCount = Integer.parseInt(in.readLine());
        long[] answerArray = new long[testCaseCount];

        for (int i = 0; i < testCaseCount; i++) {
            StringTokenizer st = new StringTokenizer(in.readLine());
            long startPoint = Integer.parseInt(st.nextToken());
            long endPoint = Integer.parseInt(st.nextToken());

            answerArray[i] = getWarpCount(startPoint, endPoint);
        }

        for (int i = 0; i < testCaseCount; i++) {
            System.out.println(answerArray[i]);
        }
    }

    private static long getWarpCount(long startPoint, long endPoint) {
        long distance = endPoint - startPoint;
        long maxWarpPower = Math.round(Math.sqrt(distance));
        long conditionDistance = maxWarpPower * maxWarpPower;
        long minDistance = conditionDistance - maxWarpPower + 1;
        long maxDistance = conditionDistance + maxWarpPower;
        long warpCount = 0;

        if (minDistance <= distance && distance <= conditionDistance) {
            warpCount = maxWarpPower * 2 - 1;
        }
        if (conditionDistance + 1 <= distance && distance <= maxDistance) {
            warpCount = maxWarpPower * 2;
        }

        return warpCount;
    }

}
```

최근 프로그래머스 문제들에 저작권이 있다는 걸 뒤늦게 깨닫고 문제 풀이 후 
블로그 포스팅하는 것을 중단하고 깃허브에만 업로드 하고 있었는데,
간만에 골머리 앓으면서 고통도 받고 규칙을 찾고 난 뒤 
"아~" 하고 행복한 깨달음도 얻은 재밌는 문제여서 포스팅 했다. 😆
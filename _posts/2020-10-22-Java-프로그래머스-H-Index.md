---
title: "[Java : 프로그래머스] H-Index"
date: 2020-10-22
categories:
    - Java
tags:
    - Java
    - 자바
    - 프로그래머스
    - 코테
    - 코딩테스트
    - 알고리즘
    - 자료구조
toc: true
toc_sticky: true
toc_label: "[Java : 프로그래머스] H-Index"
---
## 📝 문제
[https://programmers.co.kr/learn/courses/30/lessons/42747?language=java](https://programmers.co.kr/learn/courses/30/lessons/42747?language=java)

## 🎯 풀이

원리는 "인용된 횟수가 N을 넘어가는 N개의 논문"을 찾는 것이다.  
즉, **인용 횟수**가 많은 논문부터 **개수를 1개씩 카운트**하면서,  
**인용 횟수**와 **논문개수 카운트**가 교차하는 지점이 정답이 된다.  
  
이를 코드로 구현하려면 아래와 같아진다.  

1. 인용횟수를 내림차순으로 정렬한다.
2. 인덱스 1부터 인용횟수와 비교를 시작한다.
3. 인덱스와 인용횟수 중 더 작은 수를 저장한다.
4. 인덱스를 1 증가시킨다.
5. 저장된 작은 수 들의 집합에서 가장 큰 수를 반환한다.

```java
import java.util.*;
class Solution {
    public int solution(int[] citations) {
        Integer[] nc = new Integer[citations.length];
        Integer[] h_index = new Integer[citations.length];
        // 내림차순 정렬을 위한 int -> Integer 변환.
        for(int i = 0; i < citations.length; i++)
            nc[i] = citations[i];
        // 내림차순 정렬
        Arrays.sort(nc, Collections.reverseOrder());
        // Index와 인용횟수 중 더 작은 값 저장.
        for(int i = 0; i < nc.length; i++){
            if(i+1 < nc[i]) h_index[i] = i+1;
            else h_index[i] = nc[i];
        }
        // 최소값 배열 내림차순 정렬.
        Arrays.sort(h_index, Collections.reverseOrder());
        return h_index[0];  // 최대 값 반환.
    }
}
```
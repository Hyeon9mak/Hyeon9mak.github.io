---
title: "[Python : 프로그래머스] H-Index"
date: 2020-09-17 19:05:20
categories:
    - Python
tags:
    - Python
    - 파이썬
    - 프로그래머스
    - 코테
    - 코딩테스트
    - 알고리즘
    - 자료구조
toc: true
toc_sticky: true
toc_label: "[Python : 프로그래머스] H-Index"
---

## 문제
[https://programmers.co.kr/learn/courses/30/lessons/42747](https://programmers.co.kr/learn/courses/30/lessons/42747)

## 풀이
```python
def solution(citations):
    citations = sorted(citations)
    answer = 0
    
    for i in range(len(citations)) :
        if i+1 >= citations[i] :
            answer = citations[i]
            
    return answer
```
우선 덤볐던 답안. 입출력 예제만 보고 바로 덤빈 덕분에 입출력 예제에는 적합했지만,  
나머지 테스트케이스에 모두 나가리.  
성급하게 덤비지 말고 천천히 문제 읽고 좀 풀자!!  
  
항상 작은 범위의 제한사항은 힌트를 제공한다.  
- 과학자가 발표한 논문의 수는 1편 이상 1,000편 이하입니다.
- 논문별 인용 횟수는 0회 이상 10,000회 이하입니다.
논문의 수(Index)를 1~1,000 으로,  
인용 횟수(Value)를 0~10000로 제한했다.  
  
음, 아무리 봐도 Index로 장난치는 문제다.  
> 어떤 과학자가 발표한 논문 n편 중, h번 이상 인용된 논문이 h편 이상이고 나머지 논문이 h번 이하 인용되었다면 h의 최댓값이 이 과학자의 H-Index입니다.
이 지문을 거꾸로 해석해봤다.  
> H-Index는 여러 h 중 최대값이고, 여러 h 는 h 번 이상
오호라, **h 번 이상**은 아무리 봐도 최소값이다.  
[Index로 장난 + 최대값, 최소값] 로 예시를 다시 정리해보자.  
  
```
Input : [3, 0, 6, 1, 5]
------------------------
1 : 0 --> min : 0
2 : 1 --> min : 1
3 : 3 --> min : 3
4 : 5 --> min : 4
5 : 6 --> min : 5
------------------------
max : 5
```
'잘못 접근했나?' 싶었지만 혹시 몰라 내림차순정렬로 재시도 해봤다.  
```
Input : [3, 0, 6, 1, 5]
------------------------
1 : 6 --> min : 1
2 : 5 --> min : 2
3 : 3 --> min : 3
4 : 1 --> min : 1
5 : 0 --> min : 0
------------------------
max : 3
```
빙고!
---
제출한 코드
```python
def solution(citations):
    c = sorted(citations, reverse = True)
    lst = []

    for idx, val in enumerate(c):
        lst.append(min(idx+1, val))

    return max(lst)
```
  
## 더 나은 풀이
```python
def solution(citations):
    citations = sorted(citations)
    l = len(citations)
    for i in range(l):
        if citations[i] >= l-i:
            return l-i
    return 0
```
루프를 가장 적게 도는걸로 생각되는 코드.  
내가 봐도 이렇게 접근하는게 가장 이상적이지 않았나 싶다.  

```python
def solution(citations):
    citations.sort(reverse=True)
    answer = max(map(min, enumerate(citations, start=1)))
    return answer
```
가장 파이썬스러웠던 코드.  
.sort로 정렬한것도 나보다 나앗고,  
enumerate를 map으로 묶어버린 것과,  
enumerate를 1부터 시작시키는 옵션값을 넣은 것도 너무 대단했다.  
  
봐도봐도 놀랍다.    

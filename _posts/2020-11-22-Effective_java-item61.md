---
title: "[Effective-Java] 아이템 61. 박싱된 기본 타입보다는 기본 타입을 사용하라"
date: 2020-11-22 19:29:38
categories:
    - effective-java
tags:
    - 이펙티브자바
    - effective-java
    - 스터디
    - 아이템6
    - Java
    - 자바
toc: true
toc_sticky: true
toc_label: "아이템 61. 박싱된 기본 타입보다는 기본 타입을 사용하라"
---
전체적인 스터디 내용은 [JunHyeok96/effective-java](https://github.com/JunHyeok96/effective-java)에서 확인 가능! 

## 크게 2 가지로 나뉘는 자바의 데이터 타입
**기본 타입 (Primitive Type)**  
int, long, short, double, char, boolean  
  
**참조 타입 (Reference Type)**
String, Integer, Long, Double, Boolean  
  
**박싱된 기본 타입: 기본 타입에 대응 되는 참조 타입**  
int -> Integer, double -> Double 등...  

아이템 6에서 이야기했듯, 기본 타입과 참조 타입을 **오토박싱과 오토언박싱** 덕분에 
크게 구분하지 않고 사용할 수는 있지만, 그렇다고 두 타입의 차이가 없는 것은 아니다!  

> <참고>  
> 오토박싱(auto boxing)은 기본 타입과 참조 타입을 자동으로 상호 변환해주는 기술이다.


## 기본 타입과 박싱된 기본 타입의 차이 3가지
### 1. 식별성(identity) 유무
박싱된 기본 타입은 값 이외에 식별성 또한 갖게 된다.

- 기본 타입: 값
- 박싱된 기본 타입: 값 + 식별성

서로 다른 두 기본 타입 인스턴스들은 값이 같다면 서로를 같다고 판별하지만, 
서로 다른 두 박싱된 기본 타입 인스턴스들은 값이 같아도 **식별성에 따라 서로를 다르게 판별**하기도 한다.  

```java
public static void main(String[] args) {
        int numberOfPrimtive1 = 100;
        int numberOfPrimtive2 = 100;

        if (numberOfPrimtive1 == numberOfPrimtive2) {
            System.out.println("기본 타입은 서로 같아요!");
        } else {
            System.out.println("기본 타입은 서로 달라요...");
        }

        Integer boxedPrimtive1 = new Integer(numberOfPrimtive1);
        Integer boxedPrimtive2 = new Integer(numberOfPrimtive2);

        if (boxedPrimtive1 == boxedPrimtive2) {
            System.out.println("박싱된 기본 타입은 서로 같아요!");
        } else {
            System.out.println("박싱된 기본 타입은 서로 달라요...");
        }
    }
    /*
    기본 타입은 서로 같아요!
    박싱된 기본 타입은 서로 달라요...
    */
```

서로 다른 인스턴스간 '==' 연산자의 오류는 워낙 유명한 문제로, 
해결 방법 **.equals()** 가 익히 잘 알려져있다.

```java
public static void main(String[] args) {
        int numberOfPrimtive1 = 100;
        int numberOfPrimtive2 = 100;

        if (numberOfPrimtive1 == numberOfPrimtive2) {
            System.out.println("기본 타입은 서로 같아요!");
        } else {
            System.out.println("기본 타입은 서로 달라요...");
        }

        Integer boxedPrimtive1 = new Integer(numberOfPrimtive1);
        Integer boxedPrimtive2 = new Integer(numberOfPrimtive2);

        if (boxedPrimtive1.equals(boxedPrimtive2)) {
            System.out.println("박싱된 기본 타입은 서로 같아요!");
        } else {
            System.out.println("박싱된 기본 타입은 서로 달라요...");
        }
    }
    /*
    기본 타입은 서로 같아요!
    박싱된 기본 타입은 서로 같아요!
    */
```

그러나 책에서는 equals() 메서드 외에 굳이 식별성 문제를 거론하고 있었다. 

> 다음은 Integer 값을 오름차순으로 정렬하는 비교자(Comparator)다.  
> 기본적으로 비교자의 compare() 메서드는 첫 번째 원소가 두 번째 원소보다 작으면 음수, 같으면 0, 크면 양수를 반환한다.  
> Integer는 그 자체로 순서가 있으니 이 비교자가 실질적인 의미는 없지만, 아주 흥미로운 점을 하나 보여준다.

**'Integer는 그 자체로 순서가 있다.'** 라는 무슨 말일지 한참 고민해 보았는데, 처음에는 인스턴스의 식별성(identity)에 따른 순서를 말하는 것 같았다.  
그러나 Comparator, Comparable 인터페이스의 차이를 말하는게 아닐까 생각한다. Integer가 Comparable 인터페이스의 기준을 통해 순서가 구현된 클래스이므로 '그 자체로 순서가 있다.' 라는 표현을 사용한 것 같다.  
Comparator, Comparable 의 차이는 [[Java] Comparable와 Comparator의 차이와 사용법](https://gmlwjd9405.github.io/2018/09/06/java-comparable-and-comparator.html) 에서 살펴보자.  
요약하자면 **기본적인 오름차순 규칙을 적용하고 싶으면 Comparable, 새로운 규칙을 적용하고 싶으면 Comparator** 다.
  
두 인터페이스의 차이를 이해했다면, 다시 책으로 돌아와 compare 메서드를 사용한 비교자(Comparator) 예시부터 살펴보자.
```java
import java.util.*;
    public static void main(String[] args) {

        // 잘못 구현된 비교자 - 문제를 찾아보자!
       Comparator<Integer> naturalOrder =
               (i, j) -> (i < j) ? -1 : (i == j ? 0 : 1);

        int result = naturalOrder.compare(new Integer(42), new Integer(42));
        System.out.println(result);
    }

    /*
    결과는 '1'
    */
```
*'compare() 메서드에 인스턴스가 2개 생성되어 들어갔으니 당연히 식별성이 비교되어 1이 출력된거 아니야?'*  
라고 생각했다면, 절반은 맞춘 것이다. 중요한 것은 (i < j) 부분이다.  
  
(i < j) 비교연산자에서, i와 j가 참조하는 오토박싱된 Integer 인스턴스는 기본 타입 값으로 오토언박싱 된다. 
즉 인스턴스의 식별성이 아닌 실제 정수값 끼리의 대소 비교를 정상적으로 진행한다!  
정상적으로 정수값 대소비교를 마친 후 (i == j) 비교연산을 진행하는데, 안타깝게도 이번엔 오토언박싱 되지 않고 
Integer 인스턴스의 식별성끼리 비교가 진행된다. 이 때문에 비교 결과는 false가 되고, 비교자는 1을 반환한다.  
  
즉 박싱된 기본 타입끼리 '< , >'  연산자는 오토언박싱이 진행되지만, '==' 연산자는 식별성 비교가 진행되어 값 비교가 불가능하다!


### 2. NULL 소유 가능 유무
### 3. 시간/메모리 사용 효율성

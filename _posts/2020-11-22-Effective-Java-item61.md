---
title: "[Effective-Java] 아이템 61. 박싱된 기본 타입보다는 기본 타입을 사용하라"
date: 2020-11-22
tags:
    - 이펙티브자바
    - effective-java
    - 스터디
    - 아이템61
    - Java
    - 자바
toc: true
toc_sticky: true
toc_label: "아이템 61. 박싱된 기본 타입보다는 기본 타입을 사용하라"
---
전체적인 스터디 내용은 [JunHyeok96/effective-java](https://github.com/JunHyeok96/effective-java)에서 확인 가능! 
{: .notice}

## 🤔 박싱된 기본 타입?
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

## 👉 차이점 1. 식별성(identity) 유무
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
해결 방법으로 **.equals()** 가 익히 잘 알려져있다.

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
책에서는 equals() 메서드 외에 프로그래머가 헷갈릴 수 있는 상황을 고려하기 위해 식별성 문제를 거론하고 있었다.  
equals() 메서드는 잠시 잊어두자.

---

### Integer 값을 오름차순으로 정렬하는 비교자
> 다음은 Integer 값을 오름차순으로 정렬하는 비교자(Comparator)다.  
> 기본적으로 비교자의 compare() 메서드는 첫 번째 원소가 두 번째 원소보다 작으면 음수, 같으면 0, 크면 양수를 반환한다.  
> Integer는 그 자체로 순서가 있으니 이 비교자가 실질적인 의미는 없지만, 아주 흥미로운 점을 하나 보여준다.

**'Integer는 그 자체로 순서가 있다.'** 라는 무슨 말일지 한참 고민해 보았는데, 처음에는 인스턴스의 식별성(identity)에 따른 순서를 말하는 것 같았다.  
그러나 조사해보니 Integer 클래스가 Comparator 인터페이스를 상속 받는 점을 말하는 것으로 보였다.  
Comparator 인터페이스를 공부하다보니 Comparable 인터페이스도 자연스럽게 접하게 되었는데, 둘의 차이는 
[[Java] Comparable와 Comparator의 차이와 사용법](https://gmlwjd9405.github.io/2018/09/06/java-comparable-and-comparator.html) 에서 자세히 살펴보자. 요약하자면 아래와 같다.

- 기본적인 정렬 규칙이 자연스럽게 적용되면 Comparable
    - compareTo() 메서드를 오버라이드 하여 구현한다.
- 새로운 정렬 규칙이 필요하면 Comparator
    - compare() 메서드를 오버라이드 하여 구현한다.

그렇다면 Integer 클래스는 Comparable 인터페이스를 상속 받는게 아닌데, 어떠한 이유로 순서를 가진다는 말일까?  
정확한 이해를 위해서 IDE를 이용해 Integer 클래스를 뜯어보았다.

```java
public final class Integer extends Number
        implements Comparable<Integer>, Constable, ConstantDesc {
    /**
     * A constant holding the minimum value an {@code int} can
     * have, -2<sup>31</sup>.
     *
     *  중략
     */
     
    /**
     * Compares two {@code Integer} objects numerically.
     *
     * @param   anotherInteger   the {@code Integer} to be compared.
     * @return  the value {@code 0} if this {@code Integer} is
     *          equal to the argument {@code Integer}; a value less than
     *          {@code 0} if this {@code Integer} is numerically less
     *          than the argument {@code Integer}; and a value greater
     *          than {@code 0} if this {@code Integer} is numerically
     *           greater than the argument {@code Integer} (signed
     *           comparison).
     * @since   1.2
     */
    public int compareTo(Integer anotherInteger) {
        return compare(this.value, anotherInteger.value);
    }

    /**
     * Compares two {@code int} values numerically.
     * The value returned is identical to what would be returned by:
     * <pre>
     *    Integer.valueOf(x).compareTo(Integer.valueOf(y))
     * </pre>
     *
     * @param  x the first {@code int} to compare
     * @param  y the second {@code int} to compare
     * @return the value {@code 0} if {@code x == y};
     *         a value less than {@code 0} if {@code x < y}; and
     *         a value greater than {@code 0} if {@code x > y}
     * @since 1.7
     */
    public static int compare(int x, int y) {
        return (x < y) ? -1 : ((x == y) ? 0 : 1);
    }
```
Integer 클래스는 기본 타입이 아닌 참조 타입이기 때문에 기본 정렬 규칙이 적용되지 않아 Comparable 인터페이스를 상속 받지만, 
Comparator의 compare 메서드를 오버라이드 하여 객체(인스턴스)의 값(value) 끼리 비교가 가능해졌기 때문에 
'Integer는 그 자체로 순서가 있다.' 라는 표현이 사용된 것으로 보인다.  
즉, **Integer 클래스는 이미 compare 메서드가 구현되어 있기 때문에 그 자체로 순서를 가진다.**  
(추가적으로 Comparable의 compareTo 메서드와 동일한 이름의 메서드를 구현한 덕분에 기본 타입(int)과 자연스럽게 섞어쓸 수 있게 되는 것 또한 눈여겨 볼만 하다.)
  
---

다시 책으로 돌아와 compare 메서드를 사용한 비교자(Comparator) 예시부터 살펴보자.
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
*'compare() 메서드에 인스턴스가 2개 생성되어 들어갔으니 당연히 식별성이 비교되어 오답이 출력된거 아니야?'*  
라고 생각했다면, 절반은 맞춘 것이다. 자세히 알아보면 반전이 존재한다.  
  
(i < j) 비교연산자에서, i와 j가 참조하는 오토박싱된 Integer 인스턴스는 기본 타입 값으로 오토언박싱 된다. 
즉 인스턴스의 식별성이 아닌 실제 정수값 끼리의 대소 비교를 정상적으로 진행한다!  
정상적으로 정수값 대소비교를 마친 후 (i == j) 비교연산을 진행하는데, 안타깝게도 이번엔 오토언박싱 되지 않고 
Integer 인스턴스의 식별성끼리 비교가 진행된다. 이 때문에 비교 결과는 false가 되고, 비교자는 1을 반환한다.  
  
즉 **박싱된 기본 타입끼리 '< , >'  연산자는 오토언박싱이 진행되지만, '==' 연산자는 식별성 비교가 진행되어 값 비교가 불가능**하다!
  
이후에 책에선 실무에서 이처럼 기본 타입을 다루는 비교자(Comparator)가 필요하다면 Comparator.naturalOder()를 사용하라고 권한다. 
```java
/**
     * A comparator that implements the natural ordering of a group of
     * mutually comparable elements. May be used when a supplied
     * comparator is null. To simplify code-sharing within underlying
     * implementations, the compare method only declares type Object
     * for its second argument.
     *
     * Arrays class implementor's note: It is an empirical matter
     * whether ComparableTimSort offers any performance benefit over
     * TimSort used with this comparator.  If not, you are better off
     * deleting or bypassing ComparableTimSort.  There is currently no
     * empirical case for separating them for parallel sorting, so all
     * public Object parallelSort methods use the same comparator
     * based implementation.
     */
    static final class NaturalOrder implements Comparator<Object> {
        @SuppressWarnings("unchecked")
        public int compare(Object first, Object second) {
            return ((Comparable<Object>)first).compareTo(second);
        }
        static final NaturalOrder INSTANCE = new NaturalOrder();
    }
```
그러나 실제 위 메서드가 어떻게 활용 될지 예제를 확보하지 못해서...  
나중에 다시 살펴보아야 할 것 같다.  

---

naturalOder() 메서드를 뒤로하고, 오답을 출력했던 예제를 정상적으로 동작시키기 위해선 어떡해야할까? 
```java
import java.util.*;
    public static void main(String[] args) {
        Comparator<Integer> naturalOrder = (iBoxed, jBoxed) -> {
            int i = iBoxed, j = jBoxed; // 오토언박싱
            return i < j ? -1 : (i == j ? 0 : 1);
        };

        int result = naturalOrder.compare(new Integer(42), new Integer(42));
        System.out.println(result);
    }
    /*
    결과는 '0'
    */
```
위 코드와 같이 지역변수 2개를 두어 각각 기본 타입 int로 언박싱하고, 
언박싱한 기본 타입 지역변수를 이용해서 비교를 진행하면 된다. 
이렇게 하면 기본 타입에는 식별성이 없기 때문에, 오류가 발생하지 않는다.

## 👉 차이점 2. NULL 소유 가능 유무
```java
public class Unbelievable {
    static Integer i;

    public static void main(String[] args) {
        if (i == 42)
            System.out.println("믿을 수 없군!");
    }
}
/*
    Exception in thread "main" java.lang.NullPointerException
*/
```
위 코드에서 "믿을 수 없군!" 이라는 문장은 당연히 출력되지 않겠지만, NullPointerException이 던져진다.  
이유는 간단하다. **거의 모든 경우에 기본 타입과 박싱된 기본 타입간의 혼용 연산에서는 박싱된 기본 타입이 자동으로 언박싱 되어 기본 타입이 된다.**  
박싱된 기본 타입(참조 타입)은 NULL을 가질 수 있지만, 기본 타입은 NULL을 가질 수 없으므로 자연스럽게 벌어진 현상이다.  
  
해결 방법 또한 간단하다. 코드의 *static Integer i* 를 *static int i* 로 변경해주면 끝이다.

## 👉 차이점 3. 시간/메모리 사용 효율성
아이템6에서 살펴보았던 코드를 다시 살펴보자.

```java
private static long sum(){
	Long sum = 0L;
	for(long i = 0; i <= Integer.MAX_VALUE; i++){
		sum += i;
	}
	return sum;
}
```

위 코드는 올바르게 동작하긴 하나, sum변수에 의해 성능이 크게 저하된 상태다.  
**long 타입인 i가 더해질 때 마다 long->Long 오토박싱이 매 루프마다 발생**된다.  


## 🤔 박싱된 기본 타입(참조 타입)은 언제 쓰는가?
위 3가지 차이점을 살펴보면 거의 무조건 기본 타입을 이용해야할 것 같다. 
다행히 박싱된 기본 타입이 적절히 사용되는 사례가 크게 2 가지 있다.  
  
### 1. 컬렉션(Collection)의 원소, 키, 값으로 사용
컬렉션은 매개변수화 타입이나 매개변수화 메서드를 사용하는데, 자바에서 기본 타입을 이용한 매개변수화를 지원하지 않기 때문에 
박싱된 기본 타입이 사용된다.

```java
List<int> listA = new ArrayList<int>();         // 컴파일 에러.
List<Integer> listB = new ArrayList<Integer>(); // 잘 됨.
```

### 2. 리플렉션(relection)을 통해 메서드를 호출할 때도 박싱된 기본 타입을 사용해야 한다.
컬렉션과 같은 이치다.

## 🎯 핵심 정리
가능하면 기본 타입을 사용하자. 기본 타입은 간단하고 빠르다.  
박싱된 기본 타입을 써야한다면 주의해서 사용하자.  
**오토박싱/언박싱은 편의를 줄 뿐, 위험요소까지 제거해주지 않는다.**  
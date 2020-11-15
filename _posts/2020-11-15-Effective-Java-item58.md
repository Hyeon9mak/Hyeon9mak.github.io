---
title: "[Effective-Java] 아이템 58. 전통적인 for 문보다는 for-each 문을 사용하라"
date: 2020-11-15 19:29:38
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
toc_label: "아이템 58. 전통적인 for 문보다는 for-each 문을 사용하라"
---
전체적인 스터디 내용은 [JunHyeok96/effective-java](https://github.com/JunHyeok96/effective-java)에서 확인 가능! 

## while 문보다는 낫지만, 조금은 아쉬운 for 문
```java
// 컬렉션 순회하기 1 - iterator(반복자) 사용
for(Iterator<element> i = c.iterator(); i.hasNext();){
    Element e = i.next();
    ... // e로 무언가를 한다.
}

// 컬렉션 순회하기 2 - int i(인덱스 변수) 사용
for(int i = 0; i < a.length; i++){
    ... // a[i]로 무언가를 한다.
}
```
두 코드 모두 while 문보다는 낫지만 단점이 여럿 존재한다. 책에서 소개된 단점은 총 3가지다. 

- 반복자와 인덱스 변수 모두 코드를 지저분하게 만든다.
    - 사실 우리에게 필요한 건 원소 뿐이다.
- 쓰이는 메서드와 변수가 늘어나면, 오류 발생 확률이 높아진다.
    - 타이핑 실수 등. 컴파일러가 에러를 잡아준다는 보장도 없다.
- 컬렉션이냐 배열이냐에 따라 코드 형태가 상당히 달리진다.
    - 원소마다 반복만 해주면 되는데, 코드를 한 번씩 재해석 해야한다.

다행인것은, 3가지 단점 모두 for-each문을 사용하면 말끔하게 해결된다!

## 향상된 for 문 (enhanced for statement)
```java
for(Element e : elements){
    ...// e로 무언가를 한다.
}

// ":"는 "안의(in)"이라고 읽으면 된다.
// "elements 안의(in) 각 원소 e에 대해"
```
반복자와 인덱스 변수를 사용하지 않으니 코드가 깔끔해지고, 오류 발생 확률도 낮아진다. 
컬렉션과 배열 모두 같은 관용구를 사용하기 때문에, 코드를 재해석 할 필요도 없다. 
for-each 문은 사람이 손으로 최적화한 것과 사실상 같기 때문에, 속도도 그대로다.  
  
## for vs for-each
책에서는 중첩 반복문을 만든다면 for-each의 장점이 더욱 커진다고 하는데, 
사실 for-each의 장점이 커진다기보다 **'기존 for 문의 단점이 부각되어 보인다'**는 표현이 맞을 것 같다.  
아래 for 문을 이용해 작성된 중첩 반복문 예시를 살펴보자.
```java
enum Suit {CLUB, DIAMOND, HEART, SPADE}
enum Rank {ACE, DEUCE, THREE, FOUR, FIVE, SIX, SEVEN, EIGHT,
            NINE, TEN, JACK, QUEEN, KING }
...
static Collection<Suit> suits = Arrays.asList(Suit.values());
static Collection<Rank> ranks = Arrays.asList(Rank.values());

List<Card> deck = new ArrayList<>();
for (Iterator<Suit> i = suits.iterator(); i.hasNext(); )
    for (Iterator<Rank> j = ranks.iterator(); j.hasNext(); )
        deck.add(new Card(i.next(), j.next()));
```
하나의 카드 덱을 생성하는 정상적인 중첩 반복문처럼 보이지만 실제로는 원하는 대로 동작하지 않는다. 
책에서 버그를 찾아보라길레 도전했는데, 솔직히 실패했다. 

> 버그를 찾지 못하겠더라도 슬퍼하지 말자. 숙련된 프로그래머조차 찾기가 쉽지 않을 것이다.

나만 못 찾는게 아니었나보다. 마음에 위안을 얻었다.  
위 코드에서 문제지점은 가장 마지막 라인의 **i.next()**가 된다. i는 suits 컬렉션의 반복자로 
suit의 for문 반복마다 호출되어야 하는데, ranks의 for문 반복에 속해서 함께 다음 원소로 넘어가고 있다. 
그래서 코드를 실행시키면 원소가 다 떨어진 suits for문이 **NoSuchElementException**을 던진다.  
  
위 예시의 경우 그나마 Exception이 던져지지만, 만일 suits의 원소 개수가 ranks 원소 개수의 배수였다면 
이 반복문은 Exception을 던지지 않고 정상적으로 수행된다. 물론, 우리가 원하는 결과를 내지 않은 채로.  
해당 예시를 바로 아래 주사위 조합 생성 코드를 통해 살펴보자.
```java
enum Face { ONE, TWO, THREE, FOUR, FIVE, SIX }
...
Collection<Face> faces = EnumSet.allOf(Face.class);

for (Iterator<Face> i = faces.iterator(); i.hasNext(); )
    for (Iterator<face> j = faces.iterator(); j.hasNext(); )
        System.out.println(i.next() + " " + j.next());
```
이 프로그램은 Exception을 던지지는 않지만, 우리가 원하는 36쌍 조합을 출력하지 않고

```
"ONE ONE"  
"TWO TWO"  
"THREE THREE"  
"FOUR FOUR"  
"FIVE FIVE"  
"SIX SIX"  
```

6쌍 조합만 출력하고 반복문을 끝낸다. 카드 덱 구성 코드와 주사위 조합 생성 코드의 문제를 for 문으로 해결하기 위해선 아래와 같이 상위 반복자를 관리해주어야 한다.

```java
for (Iterator <Suit> i = suits.iterator(); i.hasNext(); ){
    Suit suit = i.next();
    for (Iterator<Rank> j = ranks.iterator(); j.hasNext(); )
        deck.add(new Card(suit, j.next()));
}
```
하지만 for-each 문을 사용한다면?
```java
for (Suit suit : suits)
    for (Rank rank : ranks)
        deck.add(new Card(suit, rank));
```
문제가 해결됨은 물론 코드가 놀라울 만큼 간결해진다.

## for-each 문을 사용할 수 없는 상황
이토록 완벽한 for-each 문이 등장했음에도, for 문이 사라지지 않은 것에는 이유가 있다.  
for-each 문을 사용할 수 없는 3가지 상황이 존재한다.

### 1. 파괴적인 필터링(destructive filtering)
컬렉션을 순회(탐색)하면서 선택된 원소를 제거해야 한다면, 반복자(iterator)의 remove 메서드를 사용해야한다.  
```java
public static void main(String[] args) {
        List<Fruit> fruits = new ArrayList<>();

        fruits.add(new Fruit(1000));
        fruits.add(new Fruit(2000));
        fruits.add(new Fruit(3000));
        fruits.add(new Fruit(4000));
        fruits.add(new Fruit(5000));

        for (Fruit fruit : fruits){
            if (fruit.price == 3000){
                fruits.remove(fruit);
            }
        }
    }
    // Exception in thread "main" java.util.ConcurrentModificationException
```
for-each 문을 통해서 파괴적인 필터링을 할 경우, **ConcurrentModificationException**이 던져진다. 
다행스럽게도 Collection의 removIf 메서드를 활용해 컬렉션을 명시적으로 순회할 필요는 없으며, 
Java 8버전 이상을 사용하는 IDE에서도 Collection.removIf 메서드로 교체할 것을 권장하고 있다.  
Collection의 removIf 메서드를 사용하는 코드는 아래와 같다.
```java
public static void main(String[] args) {
        List<Fruit> fruits = new ArrayList<>();

        fruits.add(new Fruit(1000));
        fruits.add(new Fruit(2000));
        fruits.add(new Fruit(3000));
        fruits.add(new Fruit(4000));
        fruits.add(new Fruit(5000));

        fruits.removeIf(fruit -> fruit.price == 3000);
    }
```
그리고 이런 편리함을 제공해주는 removeIf 메서드의 내부에서는 반복자(iterator)를 이용해서 순회를 진행하고 있다. 
```java
default boolean removeIf(Predicate<? super E> filter){
    Object.requireNonNull(filter);
    boolean removed = false;
    final Iterator<E> each = iterator();
    while (each.hasNext()) {
        if (filter.test(each.next())) {
            each.remove();
            removed = true;
        }
    }
    return removed;
}
```

### 2. 변형(transforming)
리스트나 배열을 순회하면서 그 원소 일부/전체를 교체해야 한다면 리스트의 반복자나 배열의 인덱스를 사용해야 한다.
```java
public static void main(String[] args) {
        List<Fruit> fruits = new ArrayList<>();

        fruits.add(new Fruit(1000));
        fruits.add(new Fruit(2000));
        fruits.add(new Fruit(3000));
        fruits.add(new Fruit(4000));
        fruits.add(new Fruit(5000));

        System.out.println("init fruits");
        printFruits(fruits);

        for (Fruit fruit : fruits){
            if (fruit.price == 3000){
                fruit = new Fruit(9000);
            }
        }

        System.out.println("\n\nfor-each fruits");
        printFruits(fruits);

        for (int i = 0; i < fruits.size(); i++){
            if(fruits.get(i).price == 3000){
                fruits.set(i, new Fruit(9000));
            }
        }

        System.out.println("\n\nfor fruits");
        printFruits(fruits);
    }
    /*
    init fruits
    1000 2000 3000 4000 5000 

    for-each fruits
    1000 2000 3000 4000 5000 

    for fruits
    1000 2000 9000 4000 5000 
    */
```
출력 결과를 보면 for-each 문을 통한 원소 교체가 이루어지지 않음을 확인할 수 있다.

### 3. 병렬 반복(parallel iteration)
> 여러 컬렉션을 병렬로 순회해야 한다면 각각의 반복자와 인덱스 변수를 사용해 엄격하고 명시적으로 제어해야 한다.

라고 책에 나와있었는데, 번역이 이상하게 된건지 도저히 무슨 뜻인지 이해하는데 시간이 조금 걸렸다.  
결국 **하나의 인덱스로 2개 이상의 컬렉션(혹은 리스트)을 순회할 때**를 의미하는 것 같다.

```java
    public static void main(String[] args) {
        List<Fruit> fruits = new ArrayList<>();
        List<Bread> breads = new ArrayList<>();
        fruits.add(new Fruit(1000));
        fruits.add(new Fruit(2000));

        breads.add(new Bread(1111));
        breads.add(new Bread(2222));

        System.out.println("for-each");
        for(Fruit fruit : fruits){
            for(Bread bread : breads){
                System.out.println("fruit: " + fruit.price + " bread: " + bread.price);
            }
        }

        System.out.println("\nfor #1");
        for(int i = 0; i < fruits.size(); i++){
            System.out.println("fruit: " + fruits.get(i).price + " bread: " + breads.get(i).price);
        }

        System.out.println("\nfor #2");
        for(Iterator f = fruits.iterator(), b = breads.iterator(); f.hasNext() && b.hasNext();){
            Fruit fruit = (Fruit) f.next();
            Bread bread = (Bread) b.next();
            System.out.println("fruit: " + fruit.price + " bread: " + bread.price);
        }
    }

    /*
    for-each
    fruit: 1000 bread: 1111
    fruit: 1000 bread: 2222
    fruit: 2000 bread: 1111
    fruit: 2000 bread: 2222

    for #1
    fruit: 1000 bread: 1111
    fruit: 2000 bread: 2222

    for #2
    fruit: 1000 bread: 1111
    fruit: 2000 bread: 2222
    */
```
for-each 문을 사용하면 병렬 반복이 어려워진다.

## for-each 문은 컬렉션과 배열에서만?
for-each 문은 상단의 3가지 사례를 제외하면 모든 경우에 적용이 가능하다. 
컬렉션과 배열은 물론, **Iterable 인터페이스를 구현한 객체**라면 모두 순회가 가능하다.  
  
Iterable 인터페이스는 아래와 같이 **iterator()** 메서드만 갖고 있다.
```java
public interface Iterable<E>{
    // 이 객체의 원소들을 순회하는 반복자를 반환한다.
    Iterator<E> iterator();
}
```
Iterable 인터페이스를 활용해서 원소들의 묶음을 표현한다면 for-each 문의 사용이 가능해질 것이고, 
놀랍도록 간단해지는 코드 덕분에 본인은 물론 같이 일하는 팀원 모두가 Iterable를 구현했던 사람에게 감사해 할 것이다.

## 결론
전통적인 for 문과 비교했을 때 for-each 문은 명료하고, 유연하고, 버그를 예방해준다. 
성능 저하도 없다. 가능한 모든 곳에서 for-each 문을 사용하자.
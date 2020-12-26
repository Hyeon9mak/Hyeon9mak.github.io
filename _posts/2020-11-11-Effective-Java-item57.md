---
title: "[Effective-Java] 아이템 57. 지역변수의 범위를 최소화하라"
date: 2020-11-12
categories:
    - effective-java
tags:
    - 이펙티브자바
    - effective-java
    - 스터디
    - 아이템57
    - Java
    - 자바
toc: true
toc_sticky: true
toc_label: "아이템 57. 지역변수의 범위를 최소화하라"
---
전체적인 스터디 내용은 [JunHyeok96/effective-java](https://github.com/JunHyeok96/effective-java)에서 확인 가능!  
{: .notice}

## 💡 지역변수의 유효 범위를 최소로 줄이면 코드 가독성과 유지보수성이 높아지고 오류 가능성은 낮아진다.
흔히 지역변수라 하면 함수 내부에 속한 변수만을 떠올리겠지만, 
함수 뿐만 아니라 for, while, if 등 키워드에 속하는 변수들도 모두 같읕 의미의 지역변수다.  
  
지역변수의 유효 범위를 줄인다는 것은 최대한 늦게, 자주 선언하는 것을 의미한다.  
  
**유효 범위가 넓은 지역변수 예시**
```c++
void **syscall_table;
void *real_ftrace;

__SYSCALL_DEFINEx(1, ftrace, pid_t, trace_task){
    int find_flag = 0;
    int child_count = 0;
    int brother_count = 0;
    struct task_struct *find_task = &init_task;
    struct task_struct *find_tgid = &init_task;
    struct task_struct *parent_task;
    struct task_struct *brother_task;
    struct task_struct *child_task;
    struct list_head *list;

    do {
        if(find_task->pid == trace_task) {
            find_flag = 1;
            break;
        }
        find_task = next_task(find_task);
    } while( (find_task->pid != init_task.pid) );

    if(find_flag == 0)
        return -1;

    printk("#### TASK INFORMATION of ''[%d] %s'' ####\n",
            trace_task, find_task->comm);
    if(find_task->state == 0) printk(" - task state : Running or ready\n");
    else if(find_task->state == 1) printk(" - task state : Wait with ignoring all signals\n");
    else if(find_task->state == 2) printk(" - task state : Wait\n");
    else if(find_task->state == 4) printk(" - task state : Stopped\n");
    else if(find_task->state == 16) printk(" - task state : Zombie process\n");
    else if(find_task->state == 32) printk(" - task state : Dead\n");
    else printk(" - task state : etc\n");

    find_flag = 0;
    do{
        if(find_tgid->pid == find_task->tgid){
            find_flag = 1;
            break;
        }
        find_tgid = next_task(find_tgid);
    } while( (find_tgid->pid != init_task.pid) );

    printk(" - Process Group Leader : [%d] %s\n", find_task->tgid, find_tgid->comm);
    
    printk(" - Number of context switches : %ld\n", find_task->nvcsw + find_task->nivcsw);
    
    printk(" - Number of calling fork() : %d\n", 0);
    
    parent_task = find_task->parent;
    printk(" - it's parent process : [%d] %s\n", parent_task->pid, parent_task->comm);  
    
    printk(" - it's sibling process(es) :\n");
    list_for_each(list, &parent_task->children){
        brother_task = list_entry(list, struct task_struct, sibling);
        if(brother_task->pid != find_task->pid) {
            printk("    > [%d] %s\n", brother_task->pid, brother_task->comm);
            brother_count++;
        }
    }
    if(brother_count == 0) printk("    > It has no sibling.\n");
    else                   printk("    > This process has %d sibling process(es)\n", brother_count);
    
    printk(" - it's child process(es) :\n");
    list_for_each(list, &find_task->children){
        child_task = list_entry(list, struct task_struct, sibling);
        printk("    > [%d] %s\n", child_task->pid, child_task->comm);
        child_count++;
    }
    if(child_count == 0) printk("    > It has no child.\n");
    else                 printk("    > This process has %d child process(es)\n", child_count);
    
    printk("##### END OF INFORMATION #####\n");
    return 0;
}
```
'코드블럭 최상단에 변수를 몰아서 선언하는 적절한 예시가 있을까...' 고민해보다가 문뜩 
작년 운영체제 과목을 수강하면서 만든 모듈이 떠올라서 그 코드를 가져와봤다. Java코드는 아니지만 적절한 예시지 싶다.  
  
스크롤을 위로 올리지 말고 떠올려보자. 'list'변수의 타입이 기억나는가?  
'list'변수가 **선언된 곳은 13번 라인**이지만, 최초로 사용된 곳은 그보다 **42 라인이 더 떨어진 55번 라인**이다. 
심지어 변수가 더 많아지고 코드가 더 길어지면 선언한 변수를 사용하지 않은 일도 생기기 마련이다. ~~실제로 그랬었다.~~  
이처럼 코드가 길어질 수록(길어지지 않게 함수의 역할을 쪼개는 것이 더 좋겠지만) 가독성과 유지보수성이 급격히 떨어진다.  
  
이런 불행한 코드가 짜이는 이유는 대부분 **컴파일러의 한계** 때문이다. 
해당 코드는 옛버전 C컴파일러의 한계로 코드블럭의 최상단에 변수들을 미리 선언하지 않으면 
컴파일 에러가 발생했기 때문에 어쩔 수 없이 짜인 코드다.  
다행스럽게도 최근에는 대부분의 언어에서 **'가장 처음 사용될 때 선언하기'** 가 권장되고 있다.  
  
  
**유효 범위가 좁은 지역변수 예시**
```java
    int i;
    for(i = 0; i < 5; i++){
        doSomeThing();
    }
    System.out.println(i); // 5 출력

    for(int j = 0; j < 5; j++){
        doSomeThing();
    }
    System.out.println(j); // 에러!
```

'i'변수는 for 코드블럭 이전에 선언이 되었다.  
이 때문에 for 코드블럭 이후에 'i'변수를 사용해도 정상 컴파일이 되어 오류를 찾아내기 어렵다.  

그와 반대로 'j'변수는 for 키워드 내부에서 선언과 초기화가 이루어 졌다. 
이를 통해 'j'변수를 잘못 사용하는 오류를 줄일 수 있고, 다른 for 키워드에서 'j'변수명을 그대로 재활용 할 수도 있다!  
  
이러한 이유들로 책에서는 지역변수에 관해 두 가지 규칙을 추천하고 있다.

- 가장 처음 사용될 때 선언하기
- 선언과 동시에 초기화 하기

초기화에 필요한 정보가 충분하지 않다면, 충분해질 때까지 선언을 미뤄야 한다.  

**예외적으로 지역변수 유효 범위를 늘리는 예시**
```java
    Class<? extends Set<String>> cl = null;
    try{
        cl = (Class<? extends Set<String>>) Class.forName(args[0]);
    }catch(ClassNotFoundException e){
        fatalError("클래스를 찾을 수 없습니다.");
    }
```
try-catch문은 앞서 말한 두 가지 규칙에서 예외다.  
변수를 초기화하는 표현식에서 검사 예외를 던질 가능성이 있다면, 
변수의 초기화를 try 블록 안에서 진행해야만 하기 떄문이다.  
또한, 변수 값을 try 블록 이후에도 사용해야 한다면 당연하게 try 블록 이전에 선언을 해야한다.  
  
## 💡 for vs while
for 형태든 for-each 형태든, for키워드는 반복 변수의 범위를 for 키워드와 몸체 사이의 괄호 안으로 제한된다. 
따라서 **반복 변수의 값을 반복문 이후에도 사용할 것**이 아니라면, for문은 반복 변수 지정이 가능하므로 while문보다 for문을 사용하는 편이 낫다.  

---

### 🤔 왜 for문인가? 1. 오류 찾기 용이함
**while문 예시**
```java
Iterator<Element> i = c.iterator();
while(i.hasNext()){
    doSomething(i.next());
}
...

Iterator<Element> i2 = c2.iterator();
while(i.hasNext()){
    doSomethingElse(i2.next());
}
```
위 while문 예시 코드에는 오류가 하나 섞여있다. 2번째 while키워드 내부 반복변수로 
'i2'가 아닌 'i'가 사용되고 있기 때문이다. 불행히도 'i'의 유효범위는 끝나지 않으므로, 
컴파일도 잘 되고 실행 중에도 문제를 찾아낼 수 없다. 프로그램 오류가 겉으로 검출되지 않기 때문에 
찾아내는데 오랜 기간이 걸릴 수 있는 문제다.  
  
동일한 의미의 코드를 for문으로 작성하면 컴파일 단계에서 에러가 발생한다.  
  
**for문 예시**
```java
// i 반복변수를 사용하여 정상 컴파일
for (Iterator<Element> i = c.iterator(); i.hasNext(); ){
    Element e = i.next();
    ... // e 와 i로 무언가 동작
}
// i 반복변수가 선언되지 않았으므로 에러 발생!
for (Iterator<Element> i2 = c.iterator(); i.hasNext(); ){
    Element e = i2.next();
    ... // e2 와 i2로 무언가 동작
}
```

---

### 🤔 왜 for문인가? 2. 세련됨
for문이 추천되는 이유는 또 있다. 반복 변수의 범위가 for문 내부로 제한되기 때문에, 
똑같은 이름의 변수를 여러 반복문에서 사용해도 서로 아무런 영향을 주지 않는다.  

---

### 🤔 왜 for문인가? 3. 더 짧음
```java
for(int i = 0, n = expensiveComputation(); i < n; i++){
    ... // i로 뭔가 하겠지
}
```
반복 여부를 결정짓는 변수 'i'의 한계값을 변수 n에 저장하여, 
반복 때마다 다시 계산해야하는 비용을 없앴다. 같은 값을 반환하는 메서드를 매번 호출한다면, 이 관용구를 사용하길 추천한다.  

---

### 🤔 for vs for-each
```java
// for-each문
for(Element e : c){
    ... // e로 무언가를 초기화
}
// for문
for (Iterator<Element> i = c.iterator(); i.hasNext(); ){
    Element e = i.next();
    ... // e 와 i로 무언가 동작
}
```
위 코드에서 for 키워드 내부에서 반복 변수 지정을 모두 끝내는 걸 확인 할 수 있다. 
이 때문에 반복 변수를 따로 사용하지 않을 경우 while문보다 for문이 더 낫다고 볼 수 있다.  
  
또한 위 코드에서 for-each문과 for문은 **반복자(Iterator)를 사용하는 것**에 차이를 보이는데, 
반복자를 사용하지 않을 경우 for-each문이 훨씬 가독성이 뛰어나지만, 반복자를 사용할 경우(반복자의 remove메서드를 쓴다던가) 
for문을 사용하는 것이 더 낫다는 걸 알 수 있다.

## 💡 지역변수 유효 범위를 줄이는데 가장 중요한 것
바로 **메서드를 작게 유지하고 한 가지 기능에 집중하는 것**이다.  
한 메서드에서 여러 가지 기능을 처리한다면 그 중 한 기능과만 관련된 지역변수라도 
다른 기능을 수행하는 코드에서 접근할 수 있게 된다.  
해결책은 간단하다. 매 기능별로 메서드를 모두 쪼개면 된다.  
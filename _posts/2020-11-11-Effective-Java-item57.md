---
title: "[Effective-Java] 아이템 57. 지역변수의 범위를 최소화하라"
date: 2020-11-12 18:55:38
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
toc_label: "아이템 57. 지역변수의 범위를 최소화하라"
---
전체적인 스터디 내용은 [JunHyeok96/effective-java](https://github.com/JunHyeok96/effective-java)에서 확인 가능!  

## 지역변수의 유효 범위를 최소로 줄이면 코드 가독성과 유지보수성이 높아지고 오류 가능성은 낮아진다.
흔히 지역변수라 하면 함수 내부에 속한 변수만을 떠올리겠지만, 
함수 뿐만 아니라 for, while, if 등 키워드에 속하는 변수들도 모두 같읕 의미의 지역변수다.  
  
지역변수의 유효 범위를 줄인다는 것은 최대한 늦게, 자주 선언하는 것을 의미한다.  
  
### 유효 범위가 넓은 지역변수 예시
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
  

### 유효 범위가 좁은 지역변수 예시
![image](https://user-images.githubusercontent.com/37354145/98924036-bbca3980-2517-11eb-8cc0-12fb76c0f0de.png){: .align-center}

'i'변수는 for 코드블럭 이전에 선언이 되었다.  
이 때문에 for 코드블럭 이후에 'i'변수를 사용해도 정상 컴파일이 되어 오류를 찾아내기 어렵다.  

그와 반대로 'j'변수는 for 키워드 내부에서 선언과 초기화가 이루어 졌다. 
이를 통해 'j'변수를 잘못 사용하는 오류를 줄일 수 있고, 다른 for 키워드에서 'j'변수명을 그대로 재활용 할 수도 있다!  
  
이러한 이유들로 책에서는 지역변수에 관해 두 가지 규칙을 추천하고 있다.

- 가장 처음 사용될 때 선언하기
- 선언과 동시에 초기화 하기

초기화에 필요한 정보가 충분하지 않다면, 충분해질 때까지 선언을 미뤄야 한다.  

## 지역변수 유효 범위를 쪼금 늘리는 예외 상황
try-catch문은 앞서 말한 두 가지 규칙에서 예외다.  
변수를 초기화하는 표현식에서 검사 예외를 던질 가능성이 있다면, 
변수의 초기화를 try 블록 안에서 진행해야만 하기 떄문이다.  
또한, 변수 값을 try 블록 이후에도 사용해야 한다면 당연하게 try 블록 이전에 선언을 해야한다.
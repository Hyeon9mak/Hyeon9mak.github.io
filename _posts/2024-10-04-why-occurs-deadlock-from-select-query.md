---
title: "왜 조회 쿼리에서 데드락이 발생했을까?"
date: 2024-10-04
tags:
    - spring
    - jpa
toc: true
toc_sticky: true
toc_label: "왜 조회 쿼리에서 데드락이 발생했을까?"
---

"아니, 도대체 왜 조회 쿼리 메서드에서 데드락이 생기는거야?"

사내 시스템을 운영하던 중 처음보는 유형의 데드락이 발생하여 원인을 탐색하고,
이모저모 실험을 해본 후 남기는 트러블 슈팅 글. 실험은 항상 배우는게 많고 즐겁다.

<br>

## 🔒 콘텐츠 동기화 중 데드락 발생!

사내에는 수시로 비디오 콘텐츠를 동기화하는 로직이 존재한다.
대량의 콘텐츠들이 불특정 시점에 동기화를 시도하는데, 이따금씩 데드락이 발생하고 있었다.

<img width="1787" alt="image" src="https://github.com/user-attachments/assets/b4bf4674-3acd-4399-97d3-b63b4a8b5343">

데드락이 발생하는 직접적인 쿼리는 아래와 같다. 단순한 업데이트 쿼리다.

```sql
UPDATE
    content
SET 
    ...
WHERE 
    content_id = ?
;
```

자세한 원인 파악을 위해 log 를 뜯어보니, 서로 다른 트랜잭션이
동시에 같은 콘텐츠 정보를 업데이트하려고 건드리다가 데드락이 발생했다.

<img width="1787" alt="image" src="https://github.com/user-attachments/assets/7b4d6bf8-9f10-4f61-9444-41b0ccd1250c">

'서로 다른 트랜잭션이 하나의 콘텐츠를 건드리는 상황이 뭐가 있을까...'  
최초의 추측은 "하나의 메세지(요청) 내부에서 콘텐츠에 여러 update query 를 날리다가 데드락이 발생한다." 였다.

<img width="1367" alt="image" src="https://github.com/user-attachments/assets/fb87b5d2-8a34-40b0-ad68-39c6d759a02f">

IntelliJ IDE 를 사용하는 로컬환경에서 직접 실험을 통해 위 현상을 재현해서 테스트를 진행해보았다.

<img width="1170" alt="image" src="https://github.com/user-attachments/assets/702345ca-bb47-41f8-ab86-504e64a962c2">

하나의 DB 에 두 개의 세션을 연결한 다음, 트랜잭션을 자동(Auto)에서 수동(Manual)로 변경한다.
그 후 번호 순서에 따라 두 세션을 오고가며 쿼리를 수행하면 아래와 같은 데드락 감지 로그를 마주할 수 있다.

<img width="702" alt="image" src="https://github.com/user-attachments/assets/7c2ce5ad-163e-4adc-b641-5b4d14aaf33e">

추측에 살을 더해보면, "하나의 콘텐츠에 대해 여러 트랜잭션에서 update query 를 날리다가 데드락이 발생한 것이고,
하나의 메세지(요청)에서 여러 트랜잭션을 생성하였기 때문에 트랜잭션간 경쟁이 일어났다." 가 되는 것이다!

충분히 데드락이 발생할 수 있는 시나리오였고, 실제로도 그럴 것이라고 어림짐작하여 결론을 지었다.
팀원들에게 추측되는 데드락 발생 원인을 설명했고, "그럼 결국 또 다른 트랜잭션이 개방되는 지점이 어딜까?" 를 주제로
모두가 달라 붙어 고민을 한참 이어나갔다.

모두가 골머리를 앓던 그 때, 조용히 상황을 지켜보시던 경수님께서 지적을 날리셨다.

> "엥? 현구님 지금 시나리오 쓰고 있는거 같은데? ㅋㅋㅋ"

![image](https://github.com/user-attachments/assets/0f5aca10-8521-4ec9-967a-cbddf1b86fe4)

경수님께서는 '애플리케이션에 동시에 서로다른 2개의 메세지(요청)가 전달되지 않는가' 부터 접근하셨고,
얼마 지나지않아 동기간에 하나의 콘텐츠에 변경을 시도하는 서로 다른 메세지가 여러건 도착했던 기록을 발견하셨다. 
그렇게 하나의 콘텐츠에 대해 서로 다른 update query 가 날아가니 데드락이 발생할 수 밖에...
너무나 쉽고 빠르게 명확한 데드락 발생 원인을 찾아내셨다.

<img width="1374" alt="image" src="https://github.com/user-attachments/assets/cd21781b-3c35-4e2e-bce9-0b48b7234ade">

게다가 동기화 로직을 자세히 살펴보니, 메세지(요청) 하나에서 여러개 콘텐츠에 update query 를 날리는 것은 맞으나,
철저하게 중복 콘텐츠는 제외시키고 콘텐츠 하나에 한번의 update query 만 깔끔하게 날리고 있었다.
(애초에 요청 전체가 하나의 트랜잭션으로 묶여 있어서 추가 트랜잭션 개방이 없었던 것은 덤)
정말 데드락 발생 조건에 끼워맞춘 시나리오를 쓰고 있던 것이다. 😂

원인이 명확해지니 문제 해결 방법도 덩달아 명확해진다. 

애플리케이션 레벨에서 서로 다른 메세지(요청) 사이의 중복 update query 를 통제하는 건 불가능하므로, 
가능하면 하나의 메세지(요청) 당 트랜잭션 길이를 최대한 짧게 가져갈 수 있도록 리팩터링을 하는게 좋다.

그러나 당장 전체 로직을 파악하고 리팩터링 하는 것은 부담스러운 일이므로, 
차선책으로 update query 를 수행하기 전 DB 에게 
"내가 지금 이런 상태로 update query 를 던지려고 하는데, 혹시 이미 이렇게 되어있어서 변경할 필요가 없니?" 
라고 묻는 질의 쿼리를 추가하여, 중복되는 update query 가 전달되는 빈도를 줄여 deadlock 이 발생 가능성을 낮춰두었다.

어디까지나 일시적인 해결책일 뿐, 데드락 발생 가능성은 여전히 존재하는 방법이다. 
최종적으로는 트랜잭션 분리를 위한 리팩터링을 진행해야겠다. 

<br>

## 🔒 근데 조회 쿼리에서 데드락이?

그렇게 데드락 발생 원인은 명확하게 찾아냈는데, 에러 로그 사이에서 이상한 메서드가 눈에 띄었다.

<img width="1788" alt="image" src="https://github.com/user-attachments/assets/47102518-cf66-4a76-8f9c-c63eec46f94f">

`findContentByContentId` ?

JPA 로 만들어내는 `findBy...` 는 대게 `SELECT` 절로 시작되는 조회 쿼리를 생성한다.
보통 데드락은 `INSERT`, `UPDATE`, `DELETE` 쿼리가 수행될 때 발생할텐데,
조회 쿼리가 만들어지는 시점에 데드락이 발생하는게 영 이해 되지 않았다.

우리가 JpaRepository interface 를 통해 만드는 `findByName(...)` 과 같은 Query Method 는
[JPA 가 제공하는 Query Creation 기능](https://docs.spring.io/spring-data/jpa/reference/jpa/query-methods.html#jpa.query-methods.query-creation)을 통해
자동으로 JPQL 을 생성한다.

그리고 JPQL 은 영속성 컨텍스트를 거치지 않고 곧바로 DB 에 조회를 시도하기 때문에,
JPA 는 JPQL 이 영속성 컨텍스트에 남아있는 정보를 확인하지 못하는 불상사를 방지하기 위해
먼저 flush 를 호출하고 이후에 JPQL Query를 DB 로 던진다고 한다.

<img width="1358" alt="image" src="https://github.com/user-attachments/assets/637855df-9ae4-4f53-9e27-608fa950aa3e">

> `findContentByContentId` 는 `findById` 처럼 기본 제공되는 메서드가 아니라
> 직접 JpaRepository interface 에 명세하여 만든 메서드이므로 JPQL 을 생성하고 있다.

이론을 정리하고 나니 왜 `findContentByContentId` 가 수행되는 시점에 데드락이 발생했는지 머리로는 이해가 되었다.
그런데 정말로 그럴까? 라는 괜한 찝찝함(...)에 직접 눈으로 확인을 해보고 싶었다. 

JPA 는 JPQL 을 DB 로 던지기 전 정말로 flush 를 먼저 호출할까?  
**결론은 그렇다.**

<br>

## 🔒 Query Creation by JpaQueryExecution

`org.springframework.data.jpa.repository.query.JpaQueryExecution` 은
Method 이름을 기반으로 JPQL 을 생성하고 DB 에 던지는 역할을 담당한다.

`findById` 같이 `SimpleJpaRepository` 가 제공해주는 기본 Method 는 별도로 `JpaQueryExecution` 을 이용하지 않는다.

`findByName` 과 같이 커스텀하게 만든 Query Method 는 `JpaQueryExecution` 을 이용해 JPQL 을 생성하여 던지려는 모습을 볼 수 있다.

![image](https://github.com/user-attachments/assets/102f5ba9-4003-4cb3-a0f6-c3844231754b)

JPQL 생성 이후에는 실제로 Query 를 DB 에게 던지기 위해 `HikariDbConnection` 얻는걸 볼 수 있다.

![image](https://github.com/user-attachments/assets/88749190-a46f-4cf2-a215-509b8c1f1a47)


<br>

## 🔒 JPQL 로 인한 Pre-Flush

그럼 실제로 트랜잭션이 진행되는 동안 JPQL 을 위해 Flush 가 호출되는지 확인해보자.

테스트를 위해 준비한 코드는 아래와 같다.

```kotlin
@Entity
class Student(
    @Column(nullable = false, length = 10)
    val name: String,

    @ManyToOne(fetch = FetchType.LAZY)
    val classroom: Classroom,
) {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    val id: Long = INITIAL_ID
}
```
```kotlin
@Entity
class Classroom(
    @Column(nullable = false, length = 50)
    val name: String,
) {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    val id: Long = INITIAL_ID

    @OneToMany(
        mappedBy = "classroom",
        fetch = FetchType.LAZY,
        cascade = [CascadeType.PERSIST, CascadeType.REMOVE],
        orphanRemoval = true,
    )
    val students: MutableList<Student> = mutableListOf()

    fun enrollStudent(student: Student) {
        students.add(student)
    }
}
```
```kotlin
@Transactional
@Component
class StudentEnroller(
    private val classroomRepository: ClassroomRepository,
) {
    fun enrollStudent(studentName: String, classroomId: Long): ClassInfo {
        val classroom = classroomRepository.findByIdOrNull(classroomId)
            ?: throw IllegalArgumentException("Classroom not found with id $classroomId")
        
        val student = Student(name = studentName, classroom = classroom)
        classroom.enrollStudent(student = student)

        return ClassInfo.fromClassroom(classroom = classroom)
    }
}
```

학생을 나타내는 `Student` 와 강의실을 나타내는 `Classroom` Entity 는 서로 N:1 관계에 있다.
`StudentEnroller` 코드는 한 트랜잭션 내에서 `Classroom` 을 조회하고, `Student` 를 생성하여 `Classroom` 에 등록한다.

여기에 `SimpleJpaRepository` 를 이용하는 `classroomRepository.findById` method 와 Query Creation 을 이용하는
`classroomRepository.findByName` method 를 호출하는 코드를 추가해보자.

```kotlin
@Transactional
@Component
class StudentEnroller(
    private val classroomRepository: ClassroomRepository,
) {
    fun enrollStudent(studentName: String, classroomId: Long): ClassInfo {
        val classroom = classroomRepository.findByIdOrNull(classroomId)
            ?: throw IllegalArgumentException("Classroom not found with id $classroomId")
        
        val student = Student(name = studentName, classroom = classroom)
        classroom.enrollStudent(student = student)

        // 추가된 코드
        val foundClassroomById = classroomRepository.findByIdOrNull(id = classroom.id)
        val foundClassroomByName = classroomRepository.findByName(classroom.name)

        return ClassInfo.fromClassroom(classroom = classroom)
    }
}
```

그리고 강의실에 학생을 등록하는 일련의 과정을 디버깅 해보면?

기본으로 제공된 `classroomRepository.findByIdOrNull` 가 호출된 시점에는 별도로 `HikariDbConnection` 을 얻지도, Flush 를 호출하지도 않는다.

반대로 커스텀하게 만들어진 `classroomRepository.findByName` 가 호출된 시점에는 `HikariDbConnection` 을 얻고, 황급하게 Flush 를 호출하는 것을 확인할 수 있다.

![image](https://github.com/user-attachments/assets/88749190-a46f-4cf2-a215-509b8c1f1a47)

![image](https://github.com/user-attachments/assets/56d21e88-24ea-44d8-b45c-507a0258f875)

hibernate 가 구현한 `package org.hibernate.internal.SessionImpl.autoPreFlush` 가 호출되는 걸 볼 수 있다.

![image](https://github.com/user-attachments/assets/eea13d3c-99c7-416e-9422-af7568643ba4)

아직 트랜잭션이 종료되지 않았음에도 INSERT Query를 던지고, findByName 에 의한 조회까지 다시 하는 걸 확인할 수 있다.

그리고 트랜잭션이 종료된 후에는 최종적으로 `persistOnFlush` 가 호출된다.

<img width="752" alt="image" src="https://github.com/user-attachments/assets/f6c08464-5f6d-4fa6-b498-8a9349b0f34f">

<br>

## 🔒 DB 내부에선 어떤 일이 일어나고 있을까?

사내에서는 Postgres 를 주로 사용해서 Postgres 내부 Flush 동작을 확인해보고 싶었는데,
[안타깝게도 Postgres 같은 DB 는 READ UNCOMMITTED 를 지원하지 않는다.](https://www.postgresql.org/docs/current/sql-set-transaction.html)

> The SQL standard defines one additional level, READ UNCOMMITTED. In PostgreSQL READ UNCOMMITTED is treated as READ COMMITTED.

때문에 직접 눈으로 확인해보고 싶다면 READ UNCOMMITTED 를 지원하는 MySQL 등의 DB 를 이용해야한다.

```sql
SET TRANSACTION ISOLATION LEVEL READ UNCOMMITTED;
```

위 명령어로 MySQL 의 Transaction Isolation Level 을 READ UNCOMMITTED 로 변경하고 테스트를 진행해보니,
실제로 `classroomRepository.findByName` 가 호출된 직후 DB 에 아직 Commit 되지 않은 학생 정보가 삽입된 것을 확인할 수 있었다.

![image](https://github.com/user-attachments/assets/107fd18d-4ce5-4f5e-b07c-e26a0bb19c9c)

<br>

## 🔒 정리 및 후기

트랜잭션끼리의 경쟁은 하나의 요청 내에서만 발생하는게 아니라 여러 요청 사이에서도 발생할 수 있다.
결국 'DB 에 동시 접근중인 트랜잭션이 몇 개냐' 관점으로 바라봐야하는 것 같다.

JPA query creation 은 JPQL 이 영속성 컨텍스트에 남아있는 정보를 확인하지 못하는 불상사를 방지하기 위해
먼저 flush 를 호출하고 이후에 JPQL Query를 DB 로 던진다. 
이 시점에 영속성 컨텍스트에만 머물러 있던 `INSERT`, `UPDATE`, `DELETE` 쿼리들이 DB 로 전달되면서 데드락이 발생할 수 있다.

대략의 정보만 가지고 어렴풋하게 원인을 추측할게 아니라, 
보다 정확한 근거를 식별해내고 그를 통해 명확한 원인을 찾아내야 문제를 더 쉽고 명확하게 해결할 수 있다.
발생지 근처를 뒤적거렸는데도 명확한 원인을 밝히지 못했을 땐 넓고 크게 전체 시스템을 돌아보는 습관을 만들면 좋겠다.
평소 전체 시스템(인프라)에 대한 이해를 갖기 위해선 당연히 사업과 운영에 대해서도 관심을 갖고 있어야겠다.
개발을 더 잘하기 위해선 개발 외 영역에도 관심을 갖고 계속해서 시야를 넓여야함을 다시 한번 느낀 경험.

솔직하게 고백하면 Flush 와 Commit 개념이 두루뭉술 했는데, JPQL 실험을 진행하는 과정에서 명확하게 구분할 수 있게 되어 기뻤다.
뻔한 이론에 대해서도 직접 손으로 실험을 하다보면 부수적으로 배우는 것들이 많은거 같다.
그리고 이런 배움은 뼈에 새겨진다. 항상 도움이 되더라. 사소한 것도 짬 날 때마다 뜯어보고 실험하자.

<br>

## References

- [https://docs.spring.io/spring-data/jpa/reference/jpa/query-methods.html#jpa.query-methods.query-creation](https://docs.spring.io/spring-data/jpa/reference/jpa/query-methods.html#jpa.query-methods.query-creation)
- [https://www.postgresql.org/docs/current/sql-set-transaction.html](https://www.postgresql.org/docs/current/sql-set-transaction.html)

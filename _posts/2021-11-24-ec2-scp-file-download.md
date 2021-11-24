---
title: "EC2 내부 파일 SCP로 다운로드 받기"
date: 2021-11-24
tags:
    - aws
    - ec2
    - scp
toc: true
toc_sticky: true
toc_label: "EC2 내부 파일 SCP로 다운로드 받기"
---

## 🗄️ summary
우아한테크코스 활동기간이 끝나가니 babble 프로젝트 서버에도 비상이 걸렸다.
CU께서 수료일을 기점으로 모든 EC2 인스턴스를 삭제할 것이라 공지하셨기 때문이다.
'언젠간 해야지'를 반복하며 차일피일 미루다가, 정말 일정이 얼마 남지 않아 황급하게 백업할 파일 목록을 뽑아냈다.

> ### DB
> - db
>   - SQL 덤프 파일 백업
> - db-slave1
> - db-slave2
>   - 별도로 옮길 파일 없음
> 
> ### Web-Server
> - web-server
>   - `Dockerfile`
>   - `awslogs-agent-setup.py`
>   - `docker-compose.yml`
>   - `nginx.conf`
> - test-web-server
>   - `Dockerfile`
>   - `docker-compose.yml`
>   - `nginx.conf`
> 
> ### WAS
> - was-worker
> - was-worker
> - was-manager
>   - 별도로 백업할 내용 없음
> - was-logs
>   - nfs를 이용한 로깅 설정 파일 `config.json`만 백업  
> 
> (... 생략 ...)

'언제 다 다운로드 받으려나' 걱정이 앞섰지만, 막상 뽑아내니 크게 백업할 파일이 많지 않았다.
대부분의 프로덕션 코드는 이미 깃허브에 저장되어 있었고, 네이티브하게 설치한 서버 프로그램들도 
모두 설정 방법을 문서화 해두었기 때문에 '추후에도 깃허브를 통해 버전관리를 위해 저장해두면 좋겠다!' 싶은 파일들만 간단하게 추려냈다.

<br>

## 🗄️ EC2 내부 파일은 어떻게 다운로드 받지? - SCP
> **SCP(Secure CoPy)**  
> 로컬-리모트 서버간 파일을 업로드 하거나 다운로드 하는데 사용하는 유닉스 계열 유틸리티 프로그램

이미 이전에 데이터베이스 리플리케이션을 진행하면서 Master-Slave 서버간 SQL 덤프 파일을 주고 받느라 
SCP를 사용했었기 때문에, 로컬에 파일을 다운로드 하는 것에도 SCP를 쉽게 떠올릴 수 있었다.

문제는 Master-Slave 서버간에는 같은 VPC, 서브넷에 속하므로 별도의 인증절차 없이 SCP 사용이 가능했지만 
로컬-리모트 서버끼리는 별도로 인증을 필요로 한다. 다행히 SSH와 같은 22번 포트를 사용하기 때문에, 이 역시도 EC2를 생성하면서 등록한 키 파일(`.pem` 또는 `.cer`)을 통해서 인증을 할 수 있었다.

```
$ sudo scp -i {KEY파일 위치} {EC2 Ubuntu 계정명}@{Public IP}:{다운로드할 리모트 파일 절대경로} {다운로드 받을 로컬 경로}
```

위 명령을 통해 단일 파일을 다운로드 받을 수 있었다.
디렉토리 단위로 파일을 다운로드 하고 싶다면 `-r` 옵션을 추가해주면 된다.

```
$ sudo scp -r -i {KEY파일 위치} {EC2 Ubuntu 계정명}@{Public IP}:{다운로드할 리모트 디렉토리 절대경로} {다운로드 받을 로컬 경로}
```

<br>

## References
- [서비스 이전을 위한 프로젝트 백업 진행 - 2021-babble](https://github.com/woowacourse-teams/2021-babble/issues/744)

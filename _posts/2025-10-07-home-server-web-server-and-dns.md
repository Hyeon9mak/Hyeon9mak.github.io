---
title: "홈 서버 구축기 - 웹서버 추가와 DNS 설정"
date: 2025-10-07
toc: true
toc_sticky: true
toc_label: "홈 서버 구축기 - 웹서버 추가와 DNS 설정"
---

## 💾 홈 서버 구축 목표

- 서비스보다는 서버환경 구축 자체에 집중한다.
- 만들고 싶은 서비스가 있으면 바로 파이프라인 구성 후 배포해서 확인해볼 수 있는 환경을 만든다.
- 첫 스텝은 단일 애플리케이션 CI-CD 파이프라이닝
- 두 번째 스탭은 컨테이너화(도커라이징)
- 세 번째 스탭은 데스크탑 리소스 모니터링 환경 구축
- 마지막 스탭으로 컨테이너 오케스트레이션(k8s, argo 등) 도입

지난 시간에는 단일 애플리케이션 CI/CD 파이프라인 구축 및 도커라이징까지 진행했다.  
이번 시간에는 리소스 모니터링 환경 구축에 앞서, 웹서버(Nginx) 추가와 DNS 설정을 진행해보려고 한다.

<br>

## 💾 웹 서버를 추가하는 이유

최근에 음악 스트리밍 링크를 공유하면 타 플랫폼의 공유 링크를 제공하는 슬랙봇을 제작했다.

<img width="1534" height="944" alt="Image" src="https://github.com/user-attachments/assets/296772a8-5227-4aea-8917-0ff1908add65" />

구조는 슬랙 내부에서 플랫폼별 공유 링크를 감지하면 홈 서버로 훅을 보내고,
훅을 전달 받은 홈 서버 내부 애플리케이션이 각 플랫폼 별 공유 링크를 탐색하여 슬랙에 메세지를 작성하는 형태다.

이 때 슬랙에 홈 서버 URL 을 등록해야하는데, 홈 서버 public IP 를 등록하는 것도 바람직하지 않고,
대부분의 서비스에서 port 번호까지 등록하는 것은 지원하지 않기 때문에 
별도 서브 도메인을 이용하여 홈 서버에 접근할 수 있도록 구성하는 과정이 필요했다.

이에 따라 가비아에서 도메인을 구매했는데, 홈 서버 내부에도 웹 서버를 추가하여 
각 서브 도메인 별로 내부 애플리케이션으로 포워딩하는 작업이 필요하다.

<br>

## 💾 왜 Nginx 를 채택했지?

웹 서버는 Apache, Nginx, Caddy 등 여러가지가 있는데, 근래 가장 널리 사용되는 Nginx 를 채택했다.

Nginx 는 Apache 에 비해 가볍고 빠르며, 설정이 간단하다는 장점이 있다.  
더 자세한 내용은 아래 링크를 참고하면 된다.

[https://hyeon9mak.github.io/nginx-vs-apache/](https://hyeon9mak.github.io/nginx-vs-apache/)

<br>

## 💾 웹 서버를 컨테이너화 할 것인가

웹 서버를 컨테이너화 할지 말지는 고민이 되는 포인트였다.
각 방식의 장단점을 직접적으로 비교해보면 아래와 같다.

### Host 설치 방식

- 장점
  - Docker 업데이트나 재시작 시에도 서비스 중단 없음
  - SSL 인증서 설정이 더 간단함 
  - Docker 네트워크 설정 불필요
  - 단일 진입점으로 모든 컨테이너 관리
- 단점 
  - 호스트 시스템에 의존성 추가
  - 컨테이너로 완전히 격리되지 않음
  - 서버 이전 시 nginx 재설정 필요

### Container 설치 방식

- 장점 
  - 모든 구성요소를 컨테이너로 관리 가능
  - 버전 관리 용이
- 단점
  - **Docker 중단 시 전체 서비스 다운**

사실 Docker 중단 시 전체 서비스 다운 이라는 단점이 가장 크리티컬 하기 때문에 선택의 여지가 없다.
단일 홈 서버 환경에, 컨테이너로 실행 중인 애플리케이션이 이미 여러개 운영중이다.
각 서브 도메인 별로 직관적인 라우팅이 가능한 웹 서버를 운영하는 것이 목표이기 때문에, 
Host 에 직접 Nginx 를 설치하는 것으로 결정했다.

<br>

## 💾 Nginx 설치 및 스크립트 설정

> - DNS 사이트에서 서브 도메인 설정까지 마쳤다는 가정하에 진행된다.
> - 또한 공유기에 전달되는 HTTP, HTTPS 요청을 홈 서버로 전달하기 위해 80, 443 포트 포워딩 설정이 완료되었다는 가정하에 진행된다.

### nginx 설치

```bash
$ sudo apt update
$ sudo apt install nginx

# 서비스 상태 확인
$ sudo systemctl status nginx
```

### nginx.conf 설정

공식적으로 nginx 에서는 conf 설정 파일을 각 애플리케이션 별로 `/etc/nginx/conf.d/` 디렉토리 하위 경로에 작성하고,
`/etc/nginx/nginx.conf` 를 통해 include 하는 방식을 권장하고 있다.

기본적으로 설치시 `/etc/nginx/nginx.conf` 에서 `/etc/nginx/conf.d/` 디렉토리를 include 하고 있기 때문에
각 애플리케이션 별로 원하는 nginx 설정 conf 파일을 작성하면 된다.

```
server {
    listen 80;
    listen [::]:80;
    
    server_name app.domain.com;
    
    # 로그 파일
    access_log /var/log/nginx/app.access.log;
    error_log /var/log/nginx/app.error.log;
    
    location / {
        # 백엔드 프록시 설정
        proxy_pass http://127.0.0.1:8080;
        
        # 프록시 헤더
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }
}
```

### SSL 인증서 자동 발급용 certbot 설치

```shell
sudo apt install certbot python3-certbot-nginx

# 인증서 발급 및 자동 설정
sudo certbot --nginx -d app.domain.com
```

인증서 발급 및 자동 설정이 진행되면 아래와 같이 conf 파일이 자동으로 변경된다.


```
server {
    server_name app.domain.com;

    # 로그 파일
    access_log /var/log/nginx/app.access.log;
    error_log /var/log/nginx/app.error.log;

    location / {
        # 백엔드 프록시 설정
        proxy_pass http://127.0.0.1:8080;

        # 프록시 헤더
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }

    listen [::]:443 ssl ipv6only=on; # managed by Certbot
    listen 443 ssl; # managed by Certbot
    ssl_certificate /etc/letsencrypt/live/app.domain.com/fullchain.pem; # managed by Certbot
    ssl_certificate_key /etc/letsencrypt/live/app.domain.com/privkey.pem; # managed by Certbot
    include /etc/letsencrypt/options-ssl-nginx.conf; # managed by Certbot
    ssl_dhparam /etc/letsencrypt/ssl-dhparams.pem; # managed by Certbot

}

server {
    if ($host = app.domain.com) {
        return 301 https://$host$request_uri;
    } # managed by Certbot


    listen 80;
    listen [::]:80;

    server_name app.domain.com;
    return 404; # managed by Certbot
}
```

여기서 `return 301 https://$host$request_uri;` 설정은 HTTP 요청을 HTTPS 요청으로 리다이렉트 하는 설정이다.
다만 이 설정은 모든 요청을 GET 요청으로 변경하기 때문에, 301 리다이렉트가 아닌 308 리다이렉트를 사용하도록 변경해주어야 한다.

```
    if ($host = app.domain.com) {
        return 308 https://$host$request_uri;
    } # managed by Certbot
```

### 최종 확인

```bash
# 설정 테스트
sudo nginx -t

# Nginx 재시작
sudo systemctl reload nginx

# HTTPS 접속 확인
curl -I https://app.domain.com
```

<br>

## 💾 마치며

이번 시간에는 웹 서버(Nginx) 추가와 DNS 설정을 진행해보았다.
본격적으로 만들고 싶은 애플리케이션을 만들고 배포하면서 나만의 도메인으로 접속 및 공유를 할 수 있게 되었다.

단일 컴퓨팅 홈 서버에는 필연적으로 성능상 한계가 존재하기 때문에,
앞으로는 리소스 모니터링의 중요성이 더 커질 것이다.
서둘러 모니터링 환경 구축에 돌입해보도록 하자.

3화 끝.

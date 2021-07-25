---
title: "ReverseProxy-WAS-DB 서버 구성하기"
date: 2021-06-20
tags:
    - ReverseProxy
    - WAS
    - MySQL
    - AWS
    - EC2
toc: true
toc_sticky: true
toc_label: "ReverseProxy-WAS-DB 서버 구성하기"
---

![image](https://user-images.githubusercontent.com/37354145/121661015-bc8f7200-cade-11eb-81ba-23068ff4ec73.png)

AWS-EC2 인스턴스 3개를 이용해서 위 그림과 같은 서버를 구성할 수 있다.

우선 AWS-EC2를 3개 생성한 후 진행된다.

<br>

## Reverse Proxy - docker + nginx
Reverse Proxy로 사용하기 위한 EC2 인스턴스에 접속 후 
아래 명령어를 통해 도커를 설치한다.

```
$ sudo apt-get update && \
sudo apt-get install -y apt-transport-https ca-certificates curl software-properties-common && \
curl -fsSL https://download.docker.com/linux/ubuntu/gpg | sudo apt-key add - && \
sudo apt-key fingerprint 0EBFCD88 && \
sudo add-apt-repository "deb [arch=amd64] https://download.docker.com/linux/ubuntu $(lsb_release -cs) stable" && \
sudo apt-get update && \
sudo apt-get install -y docker-ce && \
sudo usermod -aG docker ubuntu && \
sudo curl -L "https://github.com/docker/compose/releases/download/1.23.2/docker-compose-$(uname -s)-$(uname -m)" -o /usr/local/bin/docker-compose && \
sudo chmod +x /usr/local/bin/docker-compose && \
sudo ln -s /usr/local/bin/docker-compose /usr/bin/docker-compose
```

도커 설치가 완료되면 자신이 개설한 서버의 도메인명과 함께 아래 SPF 생성 작업을 거친다.

> **SPF(Sender Policy Framework)**  
> SPF는 DNS(Domain Name Service) 레코드의 한 유형으로, 스팸 발송자가 전자 메일 주소를 "스푸핑 (spoof)"하거나 도용하여 수백, 수천 또는 수백만 개의 전자 메일을 불법으로 보낼 수 있는 전자 메일 시스템의 허점을 방지하기 위해 2003년에 만들어졌다.  
> 
> SPF는 메일서버 정보를 사전에 DNS에 공개 등록함으로써 수신자로 하여금 이메일에 표시된 발송자 정보가 실제 메일서버의 정보와 일치하는지를 확인할 수 있도록 하는 메일 검증기술로 메일서버등록제 라고도 불리우며 국제표준인 RFC 7208에 정의되어 있다.
>
> 즉 내 도메인으로 스팸메일이 발송되지 않도록 방어한다.  


```
$ sudo docker run -it --rm --name certbot \
  -v '/etc/letsencrypt:/etc/letsencrypt' \
  -v '/var/lib/letsencrypt:/var/lib/letsencrypt' \
  certbot/certbot certonly -d '[도메인명]' --manual --preferred-challenges dns --server https://acme-v02.api.letsencrypt.org/directory
```

`[도메인명]` 부분에 본인 서버의 도메인 이름을 기입한다. 명령이 실행되면서 동의를 몇 가지 구하고, 

![img](https://techcourse-storage.s3.ap-northeast-2.amazonaws.com/ad712ce0a1b943b18cef2cb255c2baf5)

제공된 레코드 값을 DNS 사이트에서 지원하는 TXT(SPF) 레코드로 추가한다.

그 후 현재 경로로 인증서를 복제해온다. 복제된 인증서는 추후 도커 빌드에 사용되는데, 
원본 인증서가 잘못될 가능성을 염두에 두고 복제된 인증서를 이용하기 위함이다.

```
$ sudo cp /etc/letsencrypt/live/[도메인주소]/fullchain.pem ./
$ sudo cp /etc/letsencrypt/live/[도메인주소]/privkey.pem ./
```

`Dockerfile` 파일을 아래와 같이 작성한다. 이 때도 `[도메인주소]`에는 본인 서버의 도메인 이름을 기입한다.

```Dockerfile
# Dockerfile

FROM nginx

COPY nginx.conf /etc/nginx/nginx.conf 
COPY fullchain.pem /etc/letsencrypt/live/[도메인주소]/fullchain.pem
COPY privkey.pem /etc/letsencrypt/live/[도메인주소]/privkey.pem
```

`nginx.conf` 파일을 아래와 같이 작성한다. 
`[WAS 인스턴스 public IP]`에는 WAS로 사용할 EC2 인스턴스의 public IP를 기입한다. 
`[서버프로그램 포트번호]`에는 서버로 구동시킬 프로그램의 포트번호를 기입한다.

(같은 계정의 인스턴스로 생성한 것이라면 private IP를 입력해도 무방하다.)

```conf
# nginx.conf

events {}

http {       
  upstream app {
    server [WAS 인스턴스 public IP]:[서버프로그램 포트번호];
  }
  
  # Redirect all traffic to HTTPS
  server {
    listen 80;
    return 308 https://$host$request_uri;
  }

  server {
    listen 443 ssl;  
    ssl_certificate /etc/letsencrypt/live/[도메인주소]/fullchain.pem;
    ssl_certificate_key /etc/letsencrypt/live/[도메인주소]/privkey.pem;

    # Disable SSL
    ssl_protocols TLSv1 TLSv1.1 TLSv1.2;

    # 통신과정에서 사용할 암호화 알고리즘
    ssl_prefer_server_ciphers on;
    ssl_ciphers ECDH+AESGCM:ECDH+AES256:ECDH+AES128:DH+3DES:!ADH:!AECDH:!MD5;

    # Enable HSTS
    # client의 browser에게 http로 어떠한 것도 load 하지 말라고 규제합니다.
    # 이를 통해 http에서 https로 redirect 되는 request를 minimize 할 수 있습니다.
    add_header Strict-Transport-Security "max-age=31536000" always;

    # SSL sessions
    ssl_session_cache shared:SSL:10m;
    ssl_session_timeout 10m;      

    location / {
      proxy_pass http://app;    
    }
  }
}
```

> `return 301 https://$host$request_uri;`에서 `return 308 https://$host$request_uri;`로 반환 코드가 변경되었는데, 
> 301,302,303 Redirect HTTP Code는 POST, PUT 같은 요청 GET으로 바꿔서 Redirect 시킬 가능성이 있어서 `302->307`, `301->308`로 사용하는 것이 좋다고 한다.

도커 이미지와 컨테이너를 다시 만들고 실행시킨다. `[생성할 이미지 이름]`, `[태그]`, `[컨테이너 이름]`은 입맛대로 입력한다.

```
$ docker build -t [생성할 이미지 이름]:[태그] .
$ docker run -d -p 80:80 -p 443:443 --name [컨테이너 이름] [생성할 이미지 이름]:[태그]
```

(첫 번째 라인의 `.`가 앞서 복제했던 인증서를 사용하는 것이다.)

이렇게 하면 도커상에서 ngix가 수행되면서 리버스 프록시 역할을 수행하게 된다. 
기본적으로 `도메인주소:80`로 들어오는 요청을 WAS 서버 쪽으로 redirect 시킨다.

<br>

## DB - MySQL
데이터베이스로 사용하기 위한 EC2 인스턴스 접속 후 아래와 같은 과정을 거친다.

**apt 업데이트, mysql-server 설치**
```
$ sudo apt update
$ sudo apt install mysql-server
```

**MySQL 최고 권한으로 접속 (기본설정 비밀번호 없음)**
```
$ sudo mysql -u root -p
```

**외부 접속용 계정 생성**
```
# create user [사용 계정명]@'[WAS 서버 public IP]' identified by '[비밀번호]';  
```

**schema(database) 생성**
```
# create database [DB 이름];
```

**외부 접속용 계정에 권한 부여**
```
# grant all privileges on [DB 이름].* to [사용 계정명]@'[WAS 서버 public IP]';
```

외부 접속용 계정에 IP 등록 및 권한까지 부여했다면, MySQL 프로그램에서 빠져나와 
아래 경로의 mysql 설정 파일을 관리자 권한으로 편집한다.
```
$ sudo vim /etc/mysql/mysql.conf.d/mysqld.cnf
```

포트번호와 바인딩 주소 설정해준다.

```conf
# mysqld.cnf

-- 보안그룹에 허용되어있는 포트. 
port    = [EC2 보안그룹에 맞는 포트번호]

-- address 0.0.0.0은 모든 연결을 허용한다는 의미, 즉 mysql 프로그램에서 설정한 외부 접속용 계정이 접근제어 수단이 된다.
-- 계정이 아닌 mysql 자체 설정의 접근제어를 원한다면 WAS 서버 public IP 등록
bind-address		= 0.0.0.0
또는
bind-address    = [WAS 서버 public IP]
```

mysql 재시작으로 설정 적용.

```
$ sudo service mysql restart
```

데이터베이스 인스턴스의 설정도 모두 완료되었다. WAS 서버 인스턴스에서 보내는 요청에 대해서만 동작하는 데이터베이스가 될 것이다.

<br>

## WAS(Web Application Server) - Spring boot
WAS용 EC2 인스턴스에서 서버 프로젝트 파일을 `$ git clone` 해서 가져온 후, 
서버 관련 yml 파일을 편집한다. (대게 `src/main/resource/*.yml` 경로에 있다.)

```yml
# application-prod.yml

spring:
  datasource:
    driver-class-name: com.mysql.cj.jdbc.Driver
    url: jdbc:mysql://[DB EC2 인스턴스 public IP]:[Mysql config.d 설정 port 번호]/[database(schema) 이름]?serverTimezone=UTC&characterEncoding=UTF-8
    username: [mysql 외부 접속용 계정]
    password: [mysql 외부 접속용 계정 비밀번호]
handlebars:
  suffix: .html
  enabled: true
security:
  jwt:
    token:
      secret-key: my_secret_is_secret
      expire-length: 3600000
```

여기까지 끝나면 `Reverse Proxy` - `WAS` - `MySQL` 3개의 인스턴스가 연결된다.

빌드 후 실행시켜보자. 

> (별도의 설정을 진행하지 않았다면 MySQL에 테이블이 존재하지 않아 에러가 발생할 것이다.)

POSTMAN 으로 Reverse Proxy 등록한 도메인 네임에 대해 테스트를 진행하면 된다.

여기에 추가적으로 Bastion용 인스턴스를 생성해서 SSH 접근을 하면 아래와 같은 구조가 완성된다.

![image](https://user-images.githubusercontent.com/37354145/121658799-a1bbfe00-cadc-11eb-9ee8-43a4240949dd.png)

<br>

## public IP에 대해
글 전반적으로 사용된 public IP들은 같은 가용영역(지역)에 생성된 EC2 인스턴스 끼리라면 
서로 같은 근거리 네트워크에 포함되므로, private IP로 대체할 수 있다.

개발자가 직접적으로 접근할 때 사용하는 Bastion, 클라이언트가 요청을 최초로 받아들이는 reverse-proxy(web-server)를 
제외한 나머지 인스턴스(WAS, DB)들은 public IP를 사용하지 않는 것을(태초에 EC2 인스턴스 생성시 발급받지 않는 것을) 
추천한다고 한다.

네트워크는 사소한 설정 하나하나가 보안에 직결되므로, 귀찮더라도 가능하다면 최대한 챙겨주는 것이 좋을 것 같다!

<br>

## References
- [(HTTP) 상태 코드 - 307 vs 308](https://perfectacle.github.io/2017/10/16/http-status-code-307-vs-308/)
- [SPF(Sender Policy Framework)란 무엇인가요 ?](http://www.codns.com/b/B05-189)
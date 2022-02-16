---
title: "Mac M1 no matching manifest 에러 해결"
date: 2022-02-16
tags:
    - docker
    - m1
    - arm64
    - x84_64
toc: true
toc_sticky: true
toc_label: "Mac M1 no matching manifest 에러 해결"
---

## 💻 에러 발견

Mac M1 환경에서 미리 작성된 `docker-compose.yml` 파일을 실행시켰을 때 
아래와 같은 에러를 마주할 수 있었다.

```
$docker-compose up -d

[+] Running 0/4
 ⠦ ... Pulling
 ⠦ ... Pulling
 ⠦ ... Pulling
   ⠏ ... Pulling ... layer

no matching manifest for linux/arm64/v8 in the manifest list entries
```

`docker-compose.yml`에 명시된 도커 이미지를 
Mac M1 환경(arm64) 컨테이너에서 동작시킬 수 없어서 나타나는 에러로 추측했다.

<br>

## 💻 해결 방법

`docker-compose.yml` 파일 속 컨테이너들에 
`platform: linux/x84_64` 옵션을 명시해줘서
각각의 컨테이너가 인텔 환경(x84_64)으로 동작하도록 했다.

```
# docker-compose.yml

version: '3.8'

services:
  mysql57:
    platform: linux/x86_64  # 컨테이너 환경 옵션 추가
    container_name: momsitter-local-mysql57
    image: library/mysql:5.7
    ...

  localstack:
    platform: linux/x86_64  # 컨테이너 환경 옵션 추가
    container_name: momsitter-localstack
    image: localstack/localstack:0.12.18
    ...

  ...
```

이후 `$ docker-compose up -d` 명령을 다시 수행해서 정상적으로 동작함을 확인할 수 있었다.

```
$ docker-compose up -d
```

<br>

## References

- [Docker (Apple Silicon/M1 Preview) MySQL "no matching manifest for linux/arm64/v8 in the manifest list entries" - stackoverflow](https://stackoverflow.com/questions/65456814/docker-apple-silicon-m1-preview-mysql-no-matching-manifest-for-linux-arm64-v8)

---
title: "홈 서버 구축기 - CI/CD 파이프라인 구축"
date: 2025-09-09
toc: true
toc_sticky: true
toc_label: "홈 서버 구축기 - CI/CD 파이프라인 구축"
---

## 💾 홈 서버 구축 목표

- 서비스보다는 서버환경 구축 자체에 집중한다.
- 만들고 싶은 서비스가 있으면 바로 파이프라인 구성 후 배포해서 확인해볼 수 있는 환경을 만든다.
- 첫 스텝은 단일 애플리케이션 CI-CD 파이프라이닝
- 두 번째 스탭은 컨테이너화(도커라이징)
- 세 번째 스탭은 데스크탑 리소스 모니터링 환경 구축
- 마지막 스탭으로 컨테이너 오케스트레이션(k8s, argo 등) 도입

지난 시간에는 홈 서버 OS 설치, SSH 연결 설정, 외부 네트워크에서 SSH 접속 설정, 도메인 연결 설정까지 진행했다.  
이번 시간에는 단일 애플리케이션 CI/CD 파이프라인 구축 및 도커라이징까지 진행해본다.

<br>

## 💾 CI/CD 파이프라이닝 툴 선정

사실 GitHub Repository 에 애플리케이션 프로젝트를 관리하는 경우 GitHub Actions 를 활용하는게 가장 편하다.
workflow script 를 작성하는데 다양한 템플릿이 제공되고, script 자체가 굉장히 직관적이다.
게다가 GitHub 에서 자체적으로 상태를 확인할 수 있는 UI 도 제공한다.

CI/CD 파이프라인을 처음 구성해보던 2021년 당시에는 주변에서 GitHub Actions 보다 Jenkins 를 더 많이 활용했었는데,
요즘은 개인 프로젝트 뿐만 아니라 기업에서도 GitHub Actions 도 적극적으로 활용하는 것 같다.
(Jenkins 가 정말 많은 플러그인을 지원하긴하는데, 서로 호환성 고려가 잘 되지 않다보니 뭐 좀 하려다보면 플러그인 충돌이 일어나서 골치아픈 경우가 많았다.)

GitHub Actions 를 사용하지 않을 이유가 없다! 바로 준비해보자.

<br>

## 💾 Push 방식으로 시도해볼까?

CI/CD 파이프라인을 구축할 때 가장 먼저 고민해야하는 부분은 '어떤 방식으로 CI/CD 를 시작할 것인가?' 이다.
가령 develop 브랜치에 push 가 발생했을 때 Actions runner 가 Pull 방식으로 변경된 코드를 끌어와 CI/CD 를 수행할 수도 있고,
반대로 Actions runner 에서 CI 를 수행 후 빌드까지 완료된 파일을 Push 방식으로 서버에 전달할 수도 있다.

각각의 장단이 있겠지만, 우선 GitHub 서버에서 제공하는 Runner 를 이용해
jar 파일 빌드까지 끝낸 후 빌드된 jar 파일을 서버에 Push 하는 방식이 깔끔하다고 판단했다.
홈 서버에 최대한 의존을 없애고 GitHub Actions 에서 모든걸 처리하는게 관리 측면에서 더 편할 걸로 판단헀다!

그럼 이제 SSH key 를 새로 발급 받아 private key 는 workflow 가 동작할 GitHub 에, public key 는 홈서버에 저장 해두면 되는데,
놀랍게도 GitHub 에서는 보안을 이유로 SSH private key 저장을 허용하지 않는다.

<img width="677" height="236" alt="Image" src="https://github.com/user-attachments/assets/9a81df5d-3b97-4c26-9e48-97b6ed061af8" />

`public key format`, 즉 public key 만 저장을 허용한다는 것.
'GitHub workflow 에서 홈서버로 접속하는 짓은 할 수 없고, 홈서버에서 GitHub Repository pull 받는 건 가능함' 이 된다.
다시 말하면 SSH 연결을 베이스로하는 Push 방식은 불가능하다는 것.

Push 방식을 유지하고 싶다면 아래와 같은 해결책들이 있는데, 하자가 하나씩..

- VPN 적용 
  - 애초에 나 이거 귀찮아서 SSH 접속에도 비대칭 키 적용한건데? 
- workflow 실행 시 매번 임시 SSH Key를 생성 
  - 홈 서버의 authorized_keys에 Public Key를 동적으로 등록
  - 작업 완료 후 바로 삭제. 
  - 단점은 홈 서버에 추가 자동화 필요 (authorized_keys 동적 관리).

그래서 결국 Pull 방식으로 생각을 전환했다.

<br>

## 💾 Pull 방식은 뭐가 좋을까?

Pull 방식은 크게 홈 서버에 self-hosted runner 를 설치하여 동작시키는 방식과, GitOps 패턴을 활용하는 방식이 있다.

우선 GitOps 패턴 같은 경우...

- workflow 가 Docker 이미지를 말아 docker image repository 에 업로드 
- 홈 서버에서 변경을 감지하고 이미지를 Pull 받아 후 배포 
- private key 가 GitHub 이 아닌 홈서버로 가서 (관리하기 나름이지만) 조금 더 안전 
- 모든 배포 과정이 커밋으로 남을 수 밖에 없고, 덕분에 롤백도 쉬움

다만 결국 빌드가 완료된 파일을 관리할 저장소가 따로 필요하다는 단점이 있다.

그에 반해 self-hosted runner 방식은...

- GitHub Repository 에서 runner 를 개설하고, 그걸 홈 서버에 runner 를 설치 및 등록한다.
- 이후 workflow script 에서 self-hosted runner 를 지정해주면, 해당 runner 가 workflow 를 수행한다.

참으로 쉽고 간단하다!

유일한 보안상 단점은 어쩔 수 없이 self-hosted runner 트리깅을 위해 홈 서버를 public 하게 노출시켜야 한다는 점인데,
애초에 별도로 네트워크 망을 분리하지 않은 원시적인 형태라 다 public 하게 뚫려 있어서...
우선 self-hosted runner 를 구성하고 차츰 보안을 강화하는 방향으로 결정했다.

<br>

## 💾 self-hosted runner 구성 및 환경 준비

self-hosted runner 같은 경우 4년 전 작성해둔 글을 그대로 따라가면 된다. [self-hosted actions runner 구성](https://hyeon9mak.github.io/github-actions-self-hosted-runner-on-ec2/#-self-hosted-actions-runner-%EA%B5%AC%EC%84%B1)

self-hosted runner 및 로컬에서 `apt-get`, `unzip`, `curl`, `java` 등 명령어를 사용해야하므로 미리 설치해둔다.

```bash
$ sudo apt-get update
$ sudo apt-get install -y unzip curl jq {원하는 JAVA 버전}
````

<br>

## 💾 단일 애플리케이션 배포 스크립트

workflow script 는 아래와 같이 작성했다.

```yaml
name: auto-deployment

on:
  pull_request:
    branches: [ main ]
    types: [ opened, reopened, synchronize ]
    paths-ignore: [ 'ci.properties', '.*ignore', '.*rc', '*.md', '.idea/**', 'doc/**', '.editorconfig', '.java-version', 'gradle-test' ]
  push:
    branches: [ main ]
    paths-ignore: [ 'ci.properties', '.*ignore', '.*rc', '*.md', '.idea/**', 'doc/**', '.editorconfig', '.java-version', 'gradle-test' ]

concurrency:
  group: ${{ github.workflow }}-${{ github.ref }}
  cancel-in-progress: true

defaults:
  run:
    shell: bash

env:
  # Monorepo
  COMMON_INCLUDES: "gradle.properties, *.gradle.kts, Dockerfile"
  # Runtime Versions of Applications
  GRADLE_VERSION: "8.13"
  JAVA_VERSION: "17"

jobs:
  build-and-deploy:
    runs-on: [self-hosted, home-server]

    steps:
      - name: Checkout code
        uses: actions/checkout@v4

      - name: Set up JDK ${{ env.JAVA_VERSION }}
        uses: actions/setup-java@v4
        with:
          java-version: ${{ env.JAVA_VERSION }}
          distribution: 'temurin'

      - name: Setup Gradle ${{ env.GRADLE_VERSION }}
        uses: gradle/gradle-build-action@v2
        with:
          gradle-version: ${{ env.GRADLE_VERSION }}

      - name: Build with Gradle
        run: ./gradlew clean build -x test

      - name: Stop existing application
        run: |
          if pgrep -f "{프로젝트명}" > /dev/null; then
            pkill -f "{프로젝트명}"
            echo "Stopped existing application"
            sleep 5
          fi
        continue-on-error: true

      - name: Move JAR file to deployment directory
        run: |
          mkdir -p ~/deployment
          cp build/libs/*.jar ~/deployment/{프로젝트명}.jar
          echo "JAR file moved to ~/deployment/{프로젝트명}.jar"

      - name: Start application
        run: |
          cd ~/deployment
          nohup java -jar {프로젝트명}.jar > application.log 2>&1 &
          echo "Application started in background"
          sleep 10

      - name: Verify application status
        run: |
            echo "Waiting for application to start..."
            for i in {1..30}; do
              if curl -f -s http://localhost:8080/actuator/health > /dev/null 2>&1; then
                echo "✅ Application is running and healthy"
                curl -s http://localhost:8080/actuator/health | jq '.'
                exit 0
              fi
              echo "Attempt $i: Application not ready yet, waiting..."
              sleep 10
            done
            echo "❌ Application failed to start or health check failed"
            exit 1
```

특징을 정리해보면 아래와 같다.

1. Self-hosted runner 사용: home-server 태그로 실행
2. Gradle로 jar 파일 생성
3. 기존 실행중인 애플리케이션이 있다면 중지
4. jar 파일 runner context 에서 local 로 이동(~/deployment/ 디렉토리로 복사)
5. 백그라운드에서 Java 애플리케이션 실행
6. 상태 확인: 애플리케이션이 정상 실행되는지 검증

여기서 원래 6번 헬스체킹 방식을 단순히 pgrep 만 체크하는 수준이었는데, 
SpringBoot actuator 이용해서 /actuator/health 찔러보는게 더 깔끔한거 같아서 변경했다.
또한 앞서 runner 가 구동중면 죽이고 새로 시작할 수 있도록 concurrency 설정도 추가해줬다.

<br>

## 💾 도커라이징 스크립트

다만 앞으로 여러 애플리케이션을 동시에 운영하고자 한다면 컨테이너화하여 관리하는 것이 훨씬 편하다.
이에 대응하기 위해 스크립트를 아래와 같이 변경했다.

```yaml
name: auto-deployment

on:
  pull_request:
    branches: [ main ]
    types: [ opened, reopened, synchronize ]
    paths-ignore: [ 'ci.properties', '.*ignore', '.*rc', '*.md', '.idea/**', 'doc/**', '.editorconfig', '.java-version', 'gradle-test' ]
  push:
    branches: [ main ]
    paths-ignore: [ 'ci.properties', '.*ignore', '.*rc', '*.md', '.idea/**', 'doc/**', '.editorconfig', '.java-version', 'gradle-test' ]

concurrency:
  group: ${{ github.workflow }}-${{ github.ref }}
  cancel-in-progress: true

defaults:
  run:
    shell: bash

env:
  # Monorepo
  COMMON_INCLUDES: "gradle.properties, *.gradle.kts, Dockerfile"
  # Runtime Versions of Applications
  GRADLE_VERSION: "8.13"
  JAVA_VERSION: "17"

jobs:
  build-and-deploy:
    runs-on: [self-hosted, home-server]
    
    steps:
    - name: Checkout code
      uses: actions/checkout@v4
      
    - name: Set up JDK ${{ env.JAVA_VERSION }}
      uses: actions/setup-java@v4
      with:
        java-version: ${{ env.JAVA_VERSION }}
        distribution: 'temurin'
        
    - name: Build with Gradle
      run: ./gradlew clean build -x test
      
    - name: Stop existing Docker container
      run: |
        if docker ps -q -f "name={프로젝트명}" | grep -q .; then
          docker stop {프로젝트명}
          docker rm {프로젝트명}
          echo "Stopped and removed existing container"
        fi
      continue-on-error: true
      
    - name: Build Docker image
      run: |
        docker build -t {프로젝트명}:latest .
        echo "Docker image built successfully"
        
    - name: Start Docker container
      run: |
        docker run -d \
          --name {프로젝트명} \
          -p 8080:8080 \
          --restart unless-stopped \
          {프로젝트명}:latest
        echo "Docker container started"
        
    - name: Verify application status
      run: |
        echo "Waiting for application to start..."
        for i in {1..30}; do
          if curl -f -s http://localhost:8080/actuator/health > /dev/null 2>&1; then
            echo "✅ Application is running and healthy"
            curl -s http://localhost:8080/actuator/health | jq '.'
            echo "Docker container status:"
            docker ps -f "name={프로젝트명}"
            exit 0
          fi
          echo "Attempt $i: Application not ready yet, waiting..."
          sleep 10
        done
        echo "❌ Application failed to start or health check failed"
        docker logs {프로젝트명}
        exit 1
```

또한 별도로 Dockerfile 도 작성해줘야한다.

```dockerfile
FROM eclipse-temurin:17-jre

WORKDIR /app

COPY build/libs/*.jar {프로젝트 jar 파일명}.jar

EXPOSE 8080

HEALTHCHECK --interval=30s --timeout=10s --start-period=40s --retries=3 \
  CMD curl -f http://localhost:8080/actuator/health || exit 1

ENTRYPOINT ["java", "-jar", "{프로젝트 jar 파일명}.jar"]
```

만약 로컬에서 DB 또한 컨테이너에 올려서 사용하고자 한다면 docker-compose.yml 를 통해 network bridge 를 묶어주는게 편하다.

```yaml
# 앱 배포 (CI/CD workflow 에서 반복 사용)
version: '3.8'

services:
  app:
    image: welcome-to-my-home:latest
    container_name: welcome-to-my-home
    ports:
      - "8080:8080"
    environment:
      - DB_HOST={}
      - DB_PORT={}
      - DB_NAME={}
      - DB_USERNAME={}
      - DB_PASSWORD={}
    networks:
      - shared-network
    restart: unless-stopped

networks:
  shared-network:
    name: welcome-to-my-home-network
    external: true
```
```yaml
# DB 배포 (최초 1회만 실행)
version: '3.8'

services:
  mariadb:
    image: mariadb:10.11
    container_name: {플젝명}_mariadb
    environment:
      MYSQL_ROOT_PASSWORD: root_password
      MYSQL_DATABASE: {}
      MYSQL_USER: {}
      MYSQL_PASSWORD: {}
    ports:
      - "3306:3306"
    volumes:
      - mariadb_data:/var/lib/mysql
    restart: unless-stopped

volumes:
  mariadb_data:
```

그럼 workflow 역시도 docker-compose up -d 로 컨테이너를 띄우도록 변경해주면 된다.
(물론 docker-compose.yml 에서 app 서비스에 build 옵션을 추가해서 docker-compose build && docker-compose up -d 로도 가능하다.)

```yaml
name: auto-deployment

on:
  pull_request:
    branches: [ main ]
    types: [ opened, reopened, synchronize ]
    paths-ignore: [ 'ci.properties', '.*ignore', '.*rc', '*.md', '.idea/**', 'doc/**', '.editorconfig', '.java-version', 'gradle-test' ]
  push:
    branches: [ main ]
    paths-ignore: [ 'ci.properties', '.*ignore', '.*rc', '*.md', '.idea/**', 'doc/**', '.editorconfig', '.java-version', 'gradle-test' ]

concurrency:
  group: ${{ github.workflow }}-${{ github.ref }}
  cancel-in-progress: true

defaults:
  run:
    shell: bash

env:
  # Monorepo
  COMMON_INCLUDES: "gradle.properties, *.gradle.kts, Dockerfile"
  # Runtime Versions of Applications
  GRADLE_VERSION: "8.13"
  JAVA_VERSION: "17"

jobs:
  build-and-deploy:
    runs-on: [self-hosted, home-server]

    steps:
      - name: Checkout code
        uses: actions/checkout@v4

      - name: Set up JDK ${{ env.JAVA_VERSION }}
        uses: actions/setup-java@v4
        with:
          java-version: ${{ env.JAVA_VERSION }}
          distribution: 'temurin'

      - name: Build with Gradle
        run: ./gradlew clean build -x test

      - name: Stop existing app container
        run: |
          docker-compose -f docker-compose.app.yml down
          echo "Stopped existing app container"
        continue-on-error: true

      - name: Build Docker image
        run: |
          docker build -t {프로젝트명}:latest .
          echo "Docker image built successfully"

      - name: Start app container
        run: |
          docker-compose -f docker-compose.app.yml up -d
          echo "App container started"

      - name: Verify application status
        run: |
          echo "Waiting for application to start..."
          for i in {1..30}; do
            if curl -f -s http://localhost:8080/actuator/health > /dev/null 2>&1; then
              echo "✅ Application is running and healthy"
              curl -s http://localhost:8080/actuator/health | jq '.'
              echo "Docker container status:"
              docker ps -f "name={프로젝트명}"
              exit 0
            fi
            echo "Attempt $i: Application not ready yet, waiting..."
            sleep 10
          done
          echo "❌ Application failed to start or health check failed"
          docker-compose logs app
          exit 1
```

그럼 이제 프로젝트 작업 후 main 브랜치에 push 만 하면 알아서 빌드 및 배포가 진행된다.

<img width="1253" height="458" alt="Image" src="https://github.com/user-attachments/assets/7b2daf85-a218-4aec-aa3f-c3563e297415" />

<br>

## 💾 마치며

이제 원하는 서비스를 만들고, main 브랜치에 push 만 하면 알아서 빌드 및 배포가 진행되는 홈 서버가 완성되었다.
앞으로는 각 애플리케이션이 얼마나 많은 리소스를 점유하는지, 
불특정 IP 에서 반복되는 요청이 들어오지는 않는지 등을 모니터링하는 환경을 구축해볼 예정이다.

2화 끝.

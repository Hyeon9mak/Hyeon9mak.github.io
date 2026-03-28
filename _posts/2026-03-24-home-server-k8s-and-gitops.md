---
title: "홈 서버 구축기 - K8s 와 GitOps 기반으로 전환하기"
date: 2026-03-24
toc: true
toc_sticky: true
toc_label: "홈 서버 구축기 - K8s 와 GitOps 기반으로 전환하기"
---

## 💾 홈 서버 구축 목표

- 서비스보다는 서버환경 구축 자체에 집중한다.
- 만들고 싶은 서비스가 있으면 바로 파이프라인 구성 후 배포해서 확인해볼 수 있는 환경을 만든다.
- 첫 스텝은 단일 애플리케이션 CI-CD 파이프라이닝
- 두 번째 스탭은 컨테이너화(도커라이징)
- 세 번째 스탭은 데스크탑 리소스 모니터링 환경 구축
- 마지막 스탭으로 컨테이너 오케스트레이션(k8s, argo 등) 도입

지난 시간에는 Nginx 리버스 프록시를 호스트에 설치하고, 서브 도메인과 DNS 설정을 진행했다.
이번에는 계획에 없던(?) 대규모 전환 작업을 먼저 이야기해야 한다.

3화에서 "리소스 모니터링 환경 구축을 서둘러 진행하겠다"고 예고했는데,
막상 모니터링 환경을 구축하려고 보니 "지금 구조에서 모니터링만 붙이는 게 맞나?"라는 의구심이 들기 시작했다.

<br>

## 💾 기존 구조의 한계

3화까지 구축된 홈 서버의 구조를 정리해보면 아래와 같다.

- GitHub Actions self-hosted runner가 홈 서버에서 직접 빌드 & 배포
- 컨테이너는 `docker run` 혹은 `docker-compose` 로 관리
- Nginx를 호스트에 설치해서 서브 도메인별 리버스 프록시 구성
- SSL 인증서는 certbot으로 수동(반자동) 발급

처음 하나 둘 서비스를 올릴 때는 이 구조가 나쁘지 않았다.
그런데 운영하는 서비스가 세 개, 네 개를 넘어가기 시작하면서 슬슬 문제가 보이기 시작했다.

### 선형으로 늘어나는 설정 파일

서비스 하나를 추가할 때마다 아래 작업이 반복됐다.

- `/etc/nginx/conf.d/{서비스명}.conf` 작성
- `sudo certbot --nginx -d {서브도메인}` 으로 인증서 발급
- 서비스 GitHub repository 에 `.github/workflows/deploy.yml` 작성
    - 이건 서비스마다 특정 옵션을 넣기 위해 내가 결정한 구조이므로 그나마 괜찮았다.

처음에는 별 게 아닌 일이었는데, 서비스가 늘어나면서 어디서 뭘 고쳐야 할지 한 눈에 파악이 되지 않았다.
그리고 반복되는 작업이 너무 귀찮았고, 실수로 Nginx conf 파일을 잘못 작성해서 nginx -t 테스트에 실패하는 일도 종종 생겼다.
(테스트 실패로 Nginx가 reload 되지 않아서 서비스가 잠시 다운되는 장애도 생겼다.)

### 불편한 롤백

배포 후 문제가 생기면 롤백을 해야 하는데, 방법이 마땅치 않았다.
이전 jar 파일을 보관해두지 않았다면 PR을 revert하고 다시 빌드 & 배포를 기다려야 했다.
컨테이너 이미지 태그를 남기는 방식도 시도해봤지만, 이미지를 어디에 저장할지부터 정해야 하는 문제가 생겼다.

### 모니터링 구성 고민

Prometheus + Grafana + Loki 조합으로 모니터링을 구축하고 싶었는데,
서비스마다 docker-compose 파일을 다르게 관리하면서 각 서비스의 로그와 메트릭 수집을 위한 컨테이너 간 네트워크 연결 설정이 복잡해졌다.
컨테이너 오케스트레이션 없이 모니터링 스택을 붙이는 건 어딘가 억지스럽다는 느낌이 들었다.

결국 "리소스 모니터링"으로 가기 전에, "오케스트레이션 레이어를 먼저 도입"하는 게 순서에 맞겠다고 판단했다.

<br>

## 💾 왜 Kubernetes 인가

옛날 같으면 "단일 홈 서버에 k8s 는 오버엔지니어링 아닌가?" 라고 생각했겠지만,
container orchestration 이 너무나 자연스러운 요즘에는 단일 홈 서버여도 도입하지 않을 이유가 없다고 생각한다.

거기에 홀로 k8s 환경을 운영해보면서 여러 트러블 상황을 겪으면 실제 업무에도 큰 도움이 되지 않을까?
결국 홈 서버 구축의 애초 목표가 "나중에 써볼 기술을 미리 경험해보는 것"이었기 때문에,
단일 노드라도 k8s 환경을 직접 운영해보는 게 더 큰 공부가 된다고 판단했다.

당연히 학습 목적 외 실용적인 이유도 많았다.

- **선언형 관리**: YAML 파일 하나로 서비스의 전체 상태를 표현할 수 있다.
- **자가 치유**: 컨테이너가 죽으면 자동으로 재시작된다. 물론 노드(컴퓨터) 자체가 죽으면...
- **Ingress 리소스**: Nginx conf 파일 대신 k8s Ingress 리소스로 라우팅을 선언적으로 관리한다.
- **cert-manager**: Let's Encrypt 인증서 발급과 갱신을 완전 자동화할 수 있다.

물론 아무리 장점이 많다고 해도 단일 노드 홈 서버를 운영하는데 실제 K8s 전체 환경을 구성하는 것은 큰 사치다.
최근에는 경량 K8s 솔루션들이 많이 나와서, 입맛에 따라 적절한 솔루션을 선택할 수 있다.

| | **k3s** | **MicroK8s** | **kind / minikube** |
|---|---|---|---|
| 목적 | 경량 프로덕션 | Ubuntu 환경 최적화 | 로컬 개발/테스트 |
| 플러그인 | 수동 설치 | `microk8s enable` | 별도 애드온 |
| Ubuntu 친화성 | 보통 | 높음 | 낮음 |

이미 Ubuntu Server OS 를 운영하고 있고, `microk8s enable cert-manager` 한 줄로 플러그인을 켤 수 있다는 게 큰 매력이었다.
또한 실제 K8s 와 가장 유사한 사용 경험을 제공하기 때문에, **MicroK8s** 로 결정했다.

<br>

## 💾 왜 GitOps Pattern 인가

k8s를 도입했다고 해서 기존 self-hosted runner 방식을 그대로 쓸 수도 있다. GitHub Actions workflow 에서 `kubectl apply` 를 호출하는 방식이다.
하지만 이 방식에는 분명한 문제점이 있다.

- 클러스터 상태가 별도로 기록되지 않는다. 언젠가 내가 혹은 claude 가 `kubectl` 명령어로 변경을 가했을 때 추적이 안된다.
- 배포 이력이 workflow 실행 로그에만 남는다.
- 롤백을 하려면 이전 매니페스트를 찾아서 다시 apply 해야 한다.

**GitOps** 는 이 문제를 다른 방향으로 해결한다.
클러스터의 "원하는 상태(desired state)"를 Git 레포지토리에 선언해두고,
클러스터가 주기적으로 레포를 확인해서 실제 상태를 원하는 상태로 맞춰나가는 방식이다.

비유하자면 Push 방식에서 Pull 방식으로 변경되는 것이다.

```
코드 변경
  → GHCR 이미지 빌드 & 푸시 (GitHub Actions)
  → k8s-configs 레포 매니페스트 업데이트 (이미지 태그 변경)
  → ArgoCD 자동 감지 & 클러스터 반영
```

덕분에 롤백도 간단해진다. k8s-configs 레포에서 이전 커밋으로 revert 하면 그만이다.

### ArgoCD vs Flux

GitOps 를 수행하기 위한 CD 툴의 양대 산맥은 ArgoCD와 Flux 다.

|       | **ArgoCD**                  | **Flux**                   |
|-------|-----------------------------|----------------------------|
| UI    | 웹 대시보드 제공                   | 별도 UI 없음 (CLI 중심)          |
| 패턴    | App-of-Apps, ApplicationSet | Kustomization, HelmRelease |
| 학습 곡선 | 상대적으로 완만                    | 상대적으로 가파름                  |

개인 홈 서버에서 배포 상태를 시각적으로 확인하고 싶었기 때문에 **ArgoCD** 를 선택했다.
특히 App-of-Apps 패턴을 쓰면 "애플리케이션 목록 자체"도 Git으로 관리할 수 있어서 깔끔하다.
제일 중요한 건 지금까지 근무한 회사에서 모두 ArgoCD 를 사용했다 ㅎㅎ

ArgoCD 를 활용한 GitOps 패턴 일련의 과정을 그림으로 표현하면 아래와 같다.

<img width="637" height="933" alt="Image" src="https://github.com/user-attachments/assets/2b6f02ec-f819-444a-8746-2d02c3cd21b8" />

<br>

## 💾 Ansible로 호스트 환경 코드화하기

GitOps Pattern 덕분에 k8s 워크로드는 ArgoCD가 Git 레포를 바라보며 선언형으로 관리하게 됐다.
그런데 곧 한 가지 불편함이 생겼다.

"그럼 MicroK8s 설치나 플러그인 활성화, 호스트 레벨 패키지 설치는?"

이런 작업들은 아직 수동이고, 어딘가에 기록해두지 않으면 서버를 재구성할 때 처음부터 기억을 더듬어야 한다.
가령 새로운 PC 를 구입해서 멀티 노드 클러스터를 구성하고 싶다면? 그 PC 의 세팅은?
(사실 이 시리즈를 포스팅하는 이유 중 하나이기도 하다...)

이 문제를 해결하는 도구가 **Ansible** 이다.

Ansible 은 SSH 기반의 구성 관리 도구로, YAML 로 작성된 playbook(동작 스크립트)을 실행하면
원격 서버에 필요한 패키지 설치, 서비스 설정, 파일 배포 등을 자동으로 처리한다.
k8s에서 YAML 매니페스트로 워크로드를 선언하듯, Ansible playbook 으로 호스트 환경을 선언하는 것이다.

결과적으로 인프라 전체가 두 레이어로 코드화된다.

| 레이어          | 도구              | 관리 대상                                     |
|--------------|-----------------|-------------------------------------------|
| 호스트 레이어      | Ansible         | OS 패키지, MicroK8s 설치/플러그인, 시스템 서비스         |
| k8s 워크로드 레이어 | ArgoCD (GitOps) | Deployment, Service, Ingress, ConfigMap 등 |

이 구조의 가장 큰 장점은 재현성이다.
서버가 날아가거나 새 머신으로 이전해야 할 때, playbook 실행 하나로 호스트 환경을 복구할 수 있다.
이후 ArgoCD가 k8s-configs 레포를 감지해서 워크로드도 자동으로 복구해준다.

실제 사용 중인 playbook의 일부를 보면 아래와 같다.

```yaml
# setup-home-server.yaml
- name: Setup Home Server
  hosts: homeserver
  become: true

  tasks:
    - name: Install required packages
      apt:
        name:
          - curl
          - git
          - jq
          - snapd
        state: present
        update_cache: yes

    - name: Install MicroK8s
      snap:
        name: microk8s
        classic: true
        channel: "1.33/stable"

    - name: Add user to microk8s group
      user:
        name: "{{ ansible_user }}"
        groups: microk8s
        append: yes

    - name: Enable MicroK8s addons
      command: microk8s enable {{ item }}
      loop:
        - dns
        - ingress
        - cert-manager
        - hostpath-storage
      changed_when: false

    - name: Set kubectl alias
      lineinfile:
        path: "/home/{{ ansible_user }}/.bashrc"
        line: 'alias kubectl="microk8s kubectl"'
        create: yes
```

무엇보다 현재와 같은 식으로 작업 내용을 글로 표현할 때 아주 용이하다 ㅎㅎ

<br>

## 💾 MicroK8s 설치 및 기본 플러그인 구성

앞서 보여준 Ansible playbook이 하는 일을 순서대로 정리하면 아래와 같다.

```bash
# MicroK8s 설치 (snap)
sudo snap install microk8s --classic --channel=1.33/stable

# 현재 사용자를 microk8s 그룹에 추가 (재로그인 필요)
sudo usermod -aG microk8s $USER

# 기본 플러그인 활성화
microk8s enable dns ingress cert-manager hostpath-storage

# kubectl alias 설정
echo 'alias kubectl="microk8s kubectl"' >> ~/.bashrc

# 클러스터 상태 확인
kubectl get nodes
```

이 명령들을 수동으로 한 번 실행해서 동작을 확인한 후, Ansible playbook 으로 옮겨두는 방식으로 작업했다.

MicroK8s 진가가 여기서 나타난다.
`microk8s enable` 명령 하나로 플러그인이 설치되는 게 편리하고, 특히 `cert-manager` 를 따로 설치할 필요 없이 한 줄로 해결된다.

<br>

## 💾 NGINX Ingress + cert-manager (Let's Encrypt TLS 자동화)

### ClusterIssuer 설정

cert-manager가 Let's Encrypt에서 인증서를 자동으로 발급받으려면 ClusterIssuer 리소스가 필요하다.

```yaml
# cluster-issuer.yaml
apiVersion: cert-manager.io/v1
kind: ClusterIssuer
metadata:
  name: letsencrypt-prod
spec:
  acme:
    server: https://acme-v02.api.letsencrypt.org/directory
    email: your@email.com
    privateKeySecretRef:
      name: letsencrypt-prod
    solvers:
      - http01:
          ingress:
            class: public
```

```bash
kubectl apply -f cluster-issuer.yaml
```

### Ingress 리소스 예시

기존에는 Nginx conf 파일에 `server_name`, `proxy_pass` 를 직접 작성했다면,
이제는 k8s Ingress 리소스 YAML로 선언한다.

```yaml
# ingress.yaml
apiVersion: networking.k8s.io/v1
kind: Ingress
metadata:
  name: app-ingress
  annotations:
    cert-manager.io/cluster-issuer: letsencrypt-prod
    nginx.ingress.kubernetes.io/ssl-redirect: "true"
spec:
  ingressClassName: public
  tls:
    - hosts:
        - app.yourdomain.com
      secretName: app-tls
  rules:
    - host: app.yourdomain.com
      http:
        paths:
          - path: /
            pathType: Prefix
            backend:
              service:
                name: app-service
                port:
                  number: 8080
```

`cert-manager.io/cluster-issuer: letsencrypt-prod` 어노테이션 하나로
인증서 발급과 자동 갱신이 모두 처리된다.
certbot을 수동으로 실행하거나 cron으로 갱신 스크립트를 관리할 필요가 없어진 것이다.

<br>

## 💾 ArgoCD 설치 및 App-of-Apps 패턴

### ArgoCD 설치

```bash
kubectl create namespace argocd
kubectl apply -n argocd -f https://raw.githubusercontent.com/argoproj/argo-cd/stable/manifests/install.yaml
```

### App-of-Apps 패턴

ArgoCD의 App-of-Apps 패턴은 "ArgoCD Application 목록 자체를 ArgoCD가 관리하도록 하는 것"이다.
k8s-configs 레포의 구조를 보면 아래와 같다.

```
k8s-configs/
└── argocd/
    └── applications/
        ├── root-app.yaml        # App-of-Apps 진입점
        ├── second-app.yaml
        ├── third-app.yaml
        └── monitoring.yaml
```

`root-app.yaml` 하나만 ArgoCD에 등록해두면,
`applications/` 디렉토리 하위의 Application YAML들을 ArgoCD가 자동으로 감지하고 등록한다.

```yaml
# root-app.yaml
apiVersion: argoproj.io/v1alpha1
kind: Application
metadata:
  name: root-app
  namespace: argocd
spec:
  project: default
  source:
    repoURL: https://github.com/yourname/k8s-configs
    targetRevision: HEAD
    path: argocd/applications
  destination:
    server: https://kubernetes.default.svc
    namespace: argocd
  syncPolicy:
    automated:
      prune: true
      selfHeal: true
```

새로운 서비스를 추가할 때는 `applications/` 에 YAML 파일 하나를 커밋하면 끝이다.
기존처럼 서버에 SSH 접속해서 docker-compose 파일을 배치하거나,
Nginx conf를 추가하고 nginx -t 테스트 후 reload 하는 과정이 사라졌다.

<br>

## 💾 Tailscale VPN으로 관리 서비스 보호하기

ArgoCD 와 Grafana(다음 포스트에서 설치할 예정)는 외부에 공개할 필요가 없다.
오히려 public 으로 열어두면 공격 대상이 될 수 있다.

기존에 SSH 접속을 비대칭 키 방식으로만 허용했던 것처럼,
관리 서비스도 신뢰할 수 있는 디바이스에서만 접근할 수 있으면 충분하다.

**Tailscale** 은 WireGuard 기반의 VPN 서비스로, 설정이 매우 간단하다.
Tailscale 에 기기를 등록하면 `100.x.x.x` 대역의 private IP가 생성되고,
같은 Tailscale 네트워크에 속한 기기끼리 직접 통신이 가능해진다.

호스트에 Tailscale 클라이언트를 설치하는 것도 Ansible playbook 에 포함시켰다.

```yaml
# setup-home-server.yml
    - name: Add Tailscale apt key
      apt_key:
        url: https://pkgs.tailscale.com/stable/ubuntu/noble.gpg
        state: present

    - name: Add Tailscale repository
      apt_repository:
        repo: "deb https://pkgs.tailscale.com/stable/ubuntu noble main"
        state: present

    - name: Install Tailscale
      apt:
        name: tailscale
        state: present
        update_cache: yes
```

설치 후 `sudo tailscale up` 으로 계정에 연결하는 작업은 브라우저 인증이 필요해서 수동으로 진행하면 등록이 완료된다.
Tailscale에 등록된 기기에서만 접근 가능하기 때문에 public ingress에 노출할 필요가 없다.

여기까지 모든 구조를 그림으로 표현하면 아래와 같다.

<img width="1603" height="1100" alt="Image" src="https://github.com/user-attachments/assets/07ac2f16-de3e-4a4c-b3c8-bfb70725135c" />

<br>

## 💾 마치며

전환 이후 서비스를 추가하는 흐름이 아래처럼 바뀌었다.

**이전:**
1. 홈 서버에 SSH 접속
2. `docker-compose.yml` 배치
3. `/etc/nginx/conf.d/{서비스}.conf` 작성
4. `sudo certbot --nginx -d {도메인}`
5. `sudo systemctl reload nginx`

**이후:**
1. 애플리케이션 레포에 `Dockerfile` 및 GitHub Actions workflow 추가 (이미지 빌드 & GHCR 푸시)
2. k8s-configs 레포에 Deployment, Service, Ingress YAML 파일 추가 커밋
3. ArgoCD가 자동으로 감지해서 클러스터에 반영

홈 서버에 직접 SSH 접속해서 설정 파일을 수동으로 만지는 일이 거의 없어졌다.
모든 인프라 상태가 ansible, k8s-configs Git 레포에 선언되어 있고, 변경 이력도 남는다.
롤백도 k8s-configs 레포에서 revert 커밋 하나면 끝이다.

처음 설계했던 목표의 마지막 스탭 "컨테이너 오케스트레이션" 이 드디어 완성됐다.
이제 진짜 남은 건 이전부터 계속 예고해왔던 **리소스 모니터링** 이다.
Prometheus + Grafana + Loki로 구성된 모니터링 스택 구축은 다음 포스트에서 이어가겠다.

4화 끝.

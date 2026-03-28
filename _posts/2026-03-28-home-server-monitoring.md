---
title: "홈 서버 구축기 - Prometheus, Grafana, Loki로 모니터링 환경 구축하기"
date: 2026-03-28
toc: true
toc_sticky: true
toc_label: "홈 서버 구축기 - Prometheus, Grafana, Loki로 모니터링 환경 구축하기"
---

## 💾 홈 서버 구축 목표

- 서비스보다는 서버환경 구축 자체에 집중한다.
- 만들고 싶은 서비스가 있으면 바로 파이프라인 구성 후 배포해서 확인해볼 수 있는 환경을 만든다.
- 첫 스텝은 단일 애플리케이션 CI-CD 파이프라이닝
- 두 번째 스탭은 컨테이너화(도커라이징)
- 세 번째 스탭은 **데스크탑 리소스 모니터링 환경 구축**
- 마지막 스탭으로 컨테이너 오케스트레이션(k8s, argo 등) 도입 (저번 글에 완료)

지난 시간에는 Docker + Nginx 기반의 구조를 MicroK8s + ArgoCD(GitOps) 기반으로 전환했다.
그리고 드디어, 계속 예고만 해왔던 리소스 모니터링 환경을 구축할 차례가 됐다.

<br>

## 💾 모니터링 스택 선정

모니터링 환경을 구축하려면 크게 세 가지 역할이 필요하다.

- **메트릭 수집 & 저장**: CPU, 메모리, 디스크 등 수치 데이터를 모은다.
- **로그 수집 & 저장**: 애플리케이션과 시스템 로그를 모은다.
- **시각화**: 수집한 데이터를 대시보드로 보여준다.

오픈소스를 활용한 가장 널리 쓰이는 조합은 **Prometheus + Loki + Grafana** 다.

| 역할        | 선택            | 이유                                     |
|-----------|---------------|----------------------------------------|
| 메트릭 수집/저장 | Prometheus    | 풍부한 exporter 생태계, Grafana 와의 궁합        |
| 로그 수집     | Grafana Alloy | DaemonSet으로 전 Pod 로그 자동 수집             |
| 로그 저장     | Loki          | Prometheus 와 유사한 레이블 기반, Grafana 와의 궁합 |
| 시각화       | Grafana       | Prometheus, Loki 모두 데이터 소스로 지원         |

세 가지 모두 Grafana Labs 에서 관리하는 프로젝트라 연동이 자연스럽고, Helm chart 도 잘 관리된다.

<br>

## 💾 전체 모니터링 아키텍처

설치 전에 전체 구조를 먼저 파악해두는 게 좋다.

```
[홈 서버 Host]
  ├── node_exporter     :9100  ← CPU, 메모리, 디스크 등 호스트 메트릭
  └── postgres_exporter :9187  ← PostgreSQL 메트릭

[MicroK8s - monitoring namespace]
  ├── Prometheus        :9090  ← 메트릭 수집 & 저장 (node_exporter, postgres_exporter, 앱 스크랩)
  ├── Loki              :3100  ← 로그 저장
  ├── Alloy (DaemonSet)        ← 전 Pod 로그 수집 → Loki
  └── Grafana           :3000  ← 시각화 (Prometheus + Loki 데이터 소스)
```

이전 글에서 정리했던 이미지에서 모니터링 스택 영역을 다시 참고해보자.

<img width="1603" height="1100" alt="Image" src="https://github.com/user-attachments/assets/07ac2f16-de3e-4a4c-b3c8-bfb70725135c" />

4화와 마찬가지로, 모니터링 스택도 두 레이어로 나뉜다.

| 레이어          | 도구                 | 관리 대상                                       |
|--------------|--------------------|---------------------------------------------|
| 호스트 레이어      | Ansible            | node_exporter, postgres_exporter, Helm 배포   |
| k8s 워크로드 레이어 | k8s-configs/ArgoCD | prom-label-proxy, Loki datasource ConfigMap |

node_exporter와 postgres_exporter는 k8s 안에 두지 않고 호스트에 직접 설치했다.
k8s가 중단되더라도 호스트 메트릭은 계속 수집되어야 하기 때문이다.

<br>

## 💾 호스트 메트릭 수집 (node_exporter, postgres_exporter)

두 exporter 모두 Ansible playbook 이 설치를 담당한다.

```yaml
# setup-monitoring.yml
    - name: Install node_exporter
      apt:
        name: prometheus-node-exporter
        state: present
    - name: Download postgres_exporter
      get_url:
        url: https://github.com/prometheus-community/postgres_exporter/releases/download/v0.15.0/postgres_exporter-0.15.0.linux-amd64.tar.gz
        dest: /tmp/postgres_exporter.tar.gz

    - name: Install postgres_exporter binary
      copy:
        src: /tmp/postgres_exporter-0.15.0.linux-amd64/postgres_exporter
        dest: /usr/local/bin/postgres_exporter
        mode: '0755'
        remote_src: yes

    - name: Create postgres_exporter config
      copy:
        dest: /etc/postgres_exporter.env
        content: |
          DATA_SOURCE_NAME=postgresql://postgres:{{ postgres_password }}@localhost:5432/postgres?sslmode=disable
        mode: '0600'
      no_log: true

    - name: Create postgres_exporter systemd service
      copy:
        dest: /etc/systemd/system/postgres_exporter.service
        content: |
          [Unit]
          Description=Prometheus PostgreSQL Exporter
          After=postgresql.service

          [Service]
          User=postgres
          EnvironmentFile=/etc/postgres_exporter.env
          ExecStart=/usr/local/bin/postgres_exporter
          Restart=always

          [Install]
          WantedBy=multi-user.target

    - name: Enable and start postgres_exporter
      systemd:
        name: postgres_exporter
        enabled: yes
        state: started
        daemon_reload: yes
```

당연히 비밀번호 같은 민감한 값은 Ansible Vault 로 암호화해서 관리중이다.

<br>

## 💾 Prometheus 설치 및 스크랩 설정

Prometheus 역시도 Ansible playbook 을 통해 `kube-prometheus-stack` Helm 차트로 배포한다.

```yaml
    - name: Install or upgrade kube-prometheus-stack
      command: >
        microk8s helm3 upgrade --install monitoring prometheus-community/kube-prometheus-stack
        --namespace monitoring
        --values /tmp/prometheus-values.yaml
        --create-namespace
```

Helm values 파일도 playbook 이 동적으로 생성한다. 핵심 설정은 스크랩 대상과 내장 node_exporter 비활성화다.

```yaml
prometheus:
  prometheusSpec:
    retention: "15d"
    storageSpec:
      volumeClaimTemplate:
        spec:
          accessModes: ["ReadWriteOnce"]
          resources:
            requests:
              storage: 10Gi
    additionalScrapeConfigs:
    - job_name: 'postgres-host'
      static_configs:
      - targets: ['{{ ansible_host }}:9187']   # 호스트 IP
    - job_name: 'node-exporter'
      static_configs:
      - targets: ['{{ ansible_host }}:9100']   # 호스트 IP
    - job_name: 'my-service-application'
      static_configs:
      - targets: ['my-service-application-service.my-service-application.svc.cluster.local:8080']

prometheus-node-exporter:
  enabled: false   # 호스트에 직접 설치했으므로 차트 내장 exporter 비활성화
```

<br>

## 💾 Loki + Alloy 로그 수집 설정

Loki 와 Alloy 역시 Ansible playbook 을 활용해서 배포한다.

```yaml
# setup-logging.yml
    - name: Install or upgrade Loki
      command: >
        microk8s helm3 upgrade --install loki grafana/loki
        --namespace monitoring
        --values /tmp/loki-values.yaml

    - name: Install or upgrade Alloy
      command: >
        microk8s helm3 upgrade --install alloy grafana/alloy
        --namespace monitoring
        --values /tmp/alloy-values.yaml
```

### Loki 설치

Loki 는 Prometheus 가 메트릭을 저장하는 것처럼 로그를 저장하는 역할을 수행한다.
Loki 는 레이블 기반으로 로그를 저장하고 LogQL 로 쿼리할 수 있다.

```yaml
# setup-logging.yml
loki:
  auth_enabled: true   # 멀티 테넌트 활성화
  commonConfig:
    replication_factor: 1
  storage:
    type: filesystem
  limits_config:
    retention_period: 744h  # 31일

singleBinary:
  replicas: 1
  persistence:
    enabled: true
    size: 20Gi
```

기본값(`auth_enabled: false`)으로 두면 Loki 는 모든 로그를 하나의 공간에 섞어서 저장한다.
즉, 서비스 로그든 ArgoCD 로그든 Grafana 로그든 전부 한 바구니에 쌓인다.
이 경우 Grafana 에서 "서비스 로그만 보여주는 데이터 소스"를 만들 수가 없다.

`auth_enabled: true`를 켜면 Loki 가 요청 헤더의 `X-Scope-OrgID` 값을 보고
로그를 **테넌트(tenant)** 단위로 분리해서 저장한다.
마치 같은 건물 안에 회사별로 사무실이 나뉘는 것처럼, 로그를 격리된 공간에 각각 쌓는다.

이후 Grafana Alloy 가 로그를 보낼 때 헤더에 테넌트 ID를 실어서 보내면, Loki 는 해당 테넌트 공간에만 로그를 저장한다.
Grafana 에서도 테넌트별로 다른 Loki 데이터 소스를 만들어 연결할 수 있어서, "서비스 담당자에게는 서비스 로그만" 보여주는 구성이 가능해진다.

### Alloy 로 Pod 로그 수집

Alloy 는 Grafana Labs 에서 만든 범용 수집기(collector)다.
이전에는 Promtail 이 같은 역할을 했는데, Alloy 가 그 후속 프로젝트라고 한다.
(사실 정확한 차이점은 잘 모르지만, Alloy 가 후속 프로젝트여서 채택했다.)

DaemonSet 으로 배포하면 모든 노드의 Pod 로그를 자동으로 수집해서 Loki 로 보낸다.

```yaml
# setup-logging.yml
alloy:
  configMap:
    content: |
      discovery.kubernetes "pods" {
        role = "pod"
      }

      discovery.relabel "pod_logs" {
        targets = discovery.kubernetes.pods.targets
        rule {
          source_labels = ["__meta_kubernetes_namespace"]
          target_label  = "namespace"
        }
        rule {
          source_labels = ["__meta_kubernetes_pod_name"]
          target_label  = "pod"
        }
        rule {
          source_labels = ["__meta_kubernetes_pod_container_name"]
          target_label  = "container"
        }
      }

      loki.source.kubernetes "pod_logs" {
        targets    = discovery.relabel.pod_logs.output
        forward_to = [loki.process.my-application-service.receiver, loki.process.default_tenant.receiver]
      }

      // my-application-service 네임스페이스만 통과 → 로그 레벨 레이블 추출
      loki.process "my-application-service" {
        stage.match {
          selector = "{namespace=\"my-application-service\"}"
          action   = "keep"
          stage.regex {
            expression = "^.+\\s+(?P<level>TRACE|DEBUG|INFO|WARN|ERROR)\\s+.*"
          }
          stage.labels {
            values = { level = "" }
          }
        }
        forward_to = [loki.write.my-application-service.receiver]
      }

      // my-application-service 제외한 나머지
      loki.process "default_tenant" {
        stage.match {
          selector = "{namespace=\"my-application-service\"}"
          action   = "drop"
        }
        forward_to = [loki.write.default_tenant.receiver]
      }

      loki.write "my-application-service" {
        endpoint {
          url     = "http://loki.monitoring.svc.cluster.local:3100/loki/api/v1/push"
          headers = { "X-Scope-OrgID" = "my-application-service" }
        }
      }

      loki.write "default_tenant" {
        endpoint {
          url     = "http://loki.monitoring.svc.cluster.local:3100/loki/api/v1/push"
          headers = { "X-Scope-OrgID" = "default" }
        }
      }
```

흐름을 정리하면 이렇다.

1. 전체 Pod 로그를 두 파이프라인으로 분기한다.
2. `my-application-service` 네임스페이스 로그: 로그 레벨(`TRACE/DEBUG/INFO/WARN/ERROR`) 레이블을 추출 후 `my-application-service` 테넌트로 전송한다.
3. 나머지 네임스페이스 로그: `default` 테넌트로 전송한다.

이렇게 분리하면 Grafana 에서 서비스별로 독립된 Loki 데이터 소스를 연결해줄 수 있다.

<br>

## 💾 Grafana 설치 및 데이터 소스 구성

Grafana는 `kube-prometheus-stack`에 번들로 포함되어 있어서 별도 Helm 배포가 필요 없다.
앞서 Prometheus 를 배포한 `setup-monitoring.yml` playbook의 values 파일에 Grafana 설정도 함께 들어있다.

```yaml
# setup-monitoring.yml
grafana:
  grafana.ini:
    users:
      viewers_can_edit: true   # 뷰어도 대시보드 탐색 가능
  adminPassword: "{{ grafana_admin_password }}"
  persistence:
    enabled: true
    size: 5Gi
  dashboards:
    default:
      postgres:
        gnetId: 9628    # PostgreSQL Database
        revision: 7
        datasource: Prometheus
      kubernetes:
        gnetId: 315     # Kubernetes cluster monitoring
        revision: 3
        datasource: Prometheus
```

`gnetId` 는 [Grafana Dashboards](https://grafana.com/grafana/dashboards/) 에서 공유되는 커뮤니티 대시보드 ID다.
값 하나 적어두면 Grafana가 시작할 때 자동으로 대시보드를 불러온다!
Grafana 를 채택한 가장 강력한 이유.

### Grafana 멀티 org 구성

prom-label-proxy 와 Loki 멀티 테넌트를 도입하면서, Grafana 도 멀티 org 로 구성했다.

- **Main org(기본)**: 관리자용. Prometheus 전체 메트릭 + 모든 로그에 접근 가능.
- **MyServiceApplication org**: 특정 서비스 담당자용. prom-label-proxy를 통해 해당 네임스페이스 메트릭만 접근 가능.

이 org 생성과 데이터 소스 연결, 대시보드 가져오기까지 모두 Ansible playbook 이 Grafana HTTP API 를 직접 호출해서 처리한다.

```yaml
# setup-monitoring.yml
    - name: Create MyServiceApplication org (idempotent)
      uri:
        url: "https://grafana.yourdomain.com/api/orgs"
        method: POST
        user: admin
        password: "{{ grafana_admin_pw.stdout }}"
        force_basic_auth: yes
        body_format: json
        body:
          name: "MyServiceApplication"
        status_code: [200, 409]   # 이미 있으면 409 → 무시

    - name: Add Prometheus (MyServiceApplication) datasource to MyServiceApplication org
      uri:
        url: "https://grafana.yourdomain.com/api/datasources"
        method: POST
        headers:
          X-Grafana-Org-Id: "{{ my-service-application_org.json.id }}"
        body_format: json
        body:
          name: "Prometheus (MyServiceApplication)"
          type: prometheus
          url: "http://prom-label-proxy.monitoring.svc.cluster.local:8082"
          isDefault: true

    - name: Import Spring Boot dashboard to MyServiceApplication org
      uri:
        url: "https://grafana.yourdomain.com/api/dashboards/import"
        method: POST
        headers:
          X-Grafana-Org-Id: "{{ my-service-application_org.json.id }}"
        body_format: json
        body:
          dashboard: "{{ spring_boot_dashboard.json }}"   # grafana.com에서 다운로드
          overwrite: true
          inputs:
            - name: "DS_PROMETHEUS"
              type: datasource
              pluginId: prometheus
              value: "Prometheus (MyServiceApplication)"
```

API를 통해 org ID를 받아서 헤더에 `X-Grafana-Org-Id`로 넘기는 방식이다.
playbook이 idempotent하게 설계되어 있어서 재실행해도 409(이미 존재)는 성공으로 처리된다.

MyServiceApplication org에는 Spring Boot(4701), Spring Boot Statistics(6756), Spring Boot 3.x Observability(17175), Kubernetes Pods(13659), PostgreSQL(9628), Kubernetes cluster(315) 대시보드를 임포트했다.

### Grafana 접근 설정

이전에 Tailscale VPN 으로 ArgoCD를 보호한 것처럼, Grafana 도 보호하는게 안전하다.
다만 Grafana 는 팀원이나 외부 관계자에게 대시보드를 공유하고 싶을 때가 있다.
때문에 public HTTPS 와 Tailscale VPN 두 경로를 모두 열어두었다.

이 Ingress와 Tailscale LoadBalancer Service 생성도 Ansible playbook 이 담당한다.

```yaml
# setup-monitoring.yml 
    - name: Expose Grafana via public Ingress
      kubernetes.core.k8s:
        state: present
        definition:
          apiVersion: networking.k8s.io/v1
          kind: Ingress
          metadata:
            name: grafana-public-ingress
            namespace: monitoring
            annotations:
              cert-manager.io/cluster-issuer: "letsencrypt-prod"
              nginx.ingress.kubernetes.io/force-ssl-redirect: "true"
          spec:
            ingressClassName: public
            tls:
            - hosts:
              - grafana.yourdomain.com
              secretName: grafana-tls-public
            rules:
            - host: grafana.yourdomain.com

    - name: Expose Grafana via Tailscale LoadBalancer
      kubernetes.core.k8s:
        state: present
        definition:
          apiVersion: v1
          kind: Service
          metadata:
            name: monitoring-grafana-tailscale
            namespace: monitoring
            annotations:
              tailscale.com/hostname: "{{ grafana_tailscale_hostname }}"
          spec:
            type: LoadBalancer
            loadBalancerClass: tailscale
            selector:
              app.kubernetes.io/name: grafana
```

<br>

## 💾 prom-label-proxy로 메트릭 접근 제어하기

운영하다 보면 특정 서비스 담당자에게 "자기 서비스의 메트릭만" 보여주고 싶은 상황이 생긴다.
Prometheus 전체를 노출하면 다른 서비스의 메트릭까지 다 보이기 때문이다.

이 때 **prom-label-proxy** 를 활용하면 Prometheus 앞단에서 특정 레이블로 필터링된 메트릭만 노출할 수 있다.

```yaml
# prom-label-proxy deployment 예시
args:
  - --proxy-path-prefix=/
  - --upstream=http://prometheus-server:80
  - --label=namespace
  - --label-value=my-service-application
  - --enable-label-apis=true
```

이렇게 하면 `namespace=my-service-application` 인 메트릭만 반환하는 Prometheus 엔드포인트가 생긴다.
Grafana에서 이 proxy URL을 별도 데이터 소스로 추가하면, my-service-application 서비스 담당자에게
해당 네임스페이스의 메트릭만 접근하는 대시보드를 제공할 수 있다!

큰 규모의 서버에서는 큰 의미가 없을 수도 있지만,
여러 팀이 같은 클러스터(단일 노드)를 사용하는 상황에서는 꽤 유용한 패턴이다.

<br>

## 💾 마치며

모니터링 스택을 구축하고 나면 홈 서버 운영이 확연히 달라진다.

<img width="2268" height="1121" alt="Image" src="https://github.com/user-attachments/assets/7105eca4-c72b-46b8-87c5-6666f593e0dd" />

무언가 이상하다는 느낌이 들기 전에, 그래프에서 먼저 보인다.
특정 시간대에 메모리 사용량이 급격히 오른다거나,
불특정 IP에서 이상한 요청이 반복된다거나 하는 것들이 대시보드에 고스란히 드러난다.

<img width="2313" height="998" alt="Image" src="https://github.com/user-attachments/assets/967e90c9-27ae-4eca-a048-45dc60ea650e" />

잘 돌아가고 있는 서비스들을 보며 뿌듯함도 느끼고, 더 나은 환경으로 개선해나갈 아이디어도 떠오른다.

시리즈를 처음 시작했을 때 목표로 잡았던 항목들을 다시 보면 이렇다.

- ✅ 서비스보다는 서버환경 구축 자체에 집중한다.
- ✅ 만들고 싶은 서비스가 있으면 바로 파이프라인 구성 후 배포해서 확인해볼 수 있는 환경을 만든다.
- ✅ 첫 스텝은 단일 애플리케이션 CI-CD 파이프라이닝
- ✅ 두 번째 스탭은 컨테이너화(도커라이징)
- ✅ 세 번째 스탭은 데스크탑 리소스 모니터링 환경 구축
- ✅ 마지막 스탭으로 컨테이너 오케스트레이션(k8s, argo 등) 도입

반년의 인고의 시간을 거쳐, 드디어 목표를 모두 달성했다.

물론 아직 할 게 많다. 단일 노드라 고가용성(HA) 따윈 지킬 수 없고, 데이터 백업도 단순 크론잡에 의존하고 있고,
네트워크 보안도 허술해서 정교하게 다듬어야 할 부분이 많다.

그래도 처음 "집에 서버 한 대는 굴려야지"라는 막연한 생각에서 시작해서,
지금은 GitOps 로 배포하고, 모니터링 대시보드로 상태를 확인할 수 있는 환경이 갖춰졌다.

PC 를 추가 구매해서 멀티 노드 클러스터로 확장하고, 인터넷 회선 대역폭과 전기세에 대해 고민하고
소음과 발열을 줄이는 방법을 찾아보고, 데이터 백업과 보안 강화 방안을 연구하는 등등
하나씩 금칠을 해나갈 일들이 남았다.

그러다 어느 순간 "이럴거면 클라우드 쓰지!" 하고 정리하게 될지도 모르겠다.
그래도, 그게 재미 아닐까.

5화 끝.

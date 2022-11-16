---
title: "GitHub Actions 배포 동시성 설정"
date: 2022-11-16
tags:
    - github-actions
    - deployment
    - concurrency
toc: true
toc_sticky: true
toc_label: "GitHub Actions 배포 동시성 설정"
---

## ⏱ 동시성 설정 고민을 시작한 사건

점심을 먹고 난 후 오후 2시 반쯤, 백엔드 프로젝트 저장소의 Pull Request 2개가 1분 차이(30분, 31분)로 Merge 되는 일이 있었다.
PR 이 main 브랜치에 Merge 되면 GitHub Actions Runner 가 실행되면서 자동으로 배포를 진행하는데,
2개의 PR이 동시에 Merge 되니 당연히 Runner 도 2개가 동시에 돌기 시작했다.

다행히 30분에 Merge 된 작업이 먼저 배포가 완료되고, 곧이어 31분 Merge 작업이 배포가 완료됨을 확인할 수 있었다.
그 과정을 지켜보던 중 'GitHub Actions Runner 2개가 동시에 돌면 문제는 없나?'라는 생각이 들었다.
'만약 31분 Merge 작업이 먼저 배포되고, 뒤따라 30분 Merge 작업이 배포되면?'
최악의 경우엔 클라이언트가 최신버전이 아닌 이전버전의 서비스를 제공받는 상황도 생길 것이었다. 🫠

게다가 GitHub Actions 공식 문서를 읽다보니 아래와 같은 구절을 발견할 수 있었다.

> If you want to use GitHub Actions beyond the **storage or minutes included in your account, you will be billed for additional usage**.  
> 
> 출처 - [About billing for GitHub Actions](https://docs.github.com/en/billing/managing-billing-for-github-actions/about-billing-for-github-actions)

즉, GitHub Actions Runner 2개가 동시에 돌면, 2개 만큼의 리소스 + 시간이 소요되어 추가 비용이 발생한다는 것이다. 😱

때문에 GitHub Actions Runner 가 동시에 도는 일을 막는 방법이 없는지 고민을 시작했다.

<br>

## ⏱ 배포 승인을 기다리는 방법

가장 먼저 떠올린 방법은 [GitHub Actions 워크플로우의 승인 기능](https://blog.outsider.ne.kr/1556)을 이용하는 것이었다.
GitHub 저장소 `Settings` 메뉴를 통해 `Environment` 를 만들고, `Environment protection rules` 로 승인자 수를 등록해주면 된다.

<img width="1151" alt="image" src="https://user-images.githubusercontent.com/37354145/202170195-c2ad120b-9e2e-49a6-be79-80ce0b387ff9.png">

<img width="1208" alt="image" src="https://user-images.githubusercontent.com/37354145/202170326-806d241a-2961-4af2-a905-f087a45f120b.png">

다만 이 방법은 GitHub Actions Runner가 동시에 돌지 않는 것과는 거리가 멀었고, 
[트렁크 기반으로 최대한 빠른 개발과 배포를 지향하는 우리 팀](https://tech.mfort.co.kr/blog/2022-08-05-trunk-based-development/)에게 크게 매력적이지도 못했다.  

<br>

## ⏱ 앞선 작업을 기다리는 방법

두 번째 방법은 앞서 진행되는 작업이 있다면 동시에 수행하지 않고 끝나기를 온전히 기다리는 것이었는데,
[Wait On Check Action](https://github.com/marketplace/actions/wait-on-check) 나
[Consecutive Workflow Action](https://github.com/marketplace/actions/consecutive-workflow-action) 가
그 역할을 톡톡히 수행해 주는 것 같았다.

```yml
# 앞서 실행되는 워크플로우
name: Test

on: [push]

jobs:
  test:
    name: Run tests
    runs-on: ubuntu-latest
      steps:
        ...
```
```yml
# 'Run tests' 종료를 기다리는 워크플로우
name: Publish

on: [push]

jobs:
  publish:
    name: Publish the package
    runs-on: ubuntu-latest
    steps:
      - name: Wait for tests to succeed
        uses: lewagon/wait-on-check-action@v1.2.0
        with:
          ref: ${{ github.ref }}
          check-name: 'Run tests'
          repo-token: ${{ secrets.GITHUB_TOKEN }}
          wait-interval: 10
      ...
```

다만 이 오픈소스들을 사용해도 결국 무의미하게 2번의 Runner 가 수행된다는 점은 다르지 않았고,
오픈소스 특성상 언제 지원이 종료될지 모른다는 불안감이 존재했다.
간단한 기능의 경우 오픈소스를 가볍게 사용하겠지만, 배포처럼 중요한 작업에 사용하기엔 부담이 크게 느껴졌다.

<br>

## ⏱ GitHub Actions concurrency

마지막으로 찾아본 방법이 [GitHub Actions 에서 공식 지원](https://docs.github.com/en/actions/using-workflows/workflow-syntax-for-github-actions#concurrency)하는 
`concurrency` 옵션을 활용하는 것이었다.
`concurrency.group` 을 통해 동시성을 제어할 그룹을 설정하고,
`concurrency.cancel-in-progress` 를 통해 
앞서 실행중인 같은 그룹의 워크 플로우를 강제로 취소시키고 자신의 워크플로우를 실행하는 방식이다.

```yml
concurrency: 
  group: { 자유롭게 사용할 그룹명 }
  cancel-in-progress: true
```

가장 최신버전의 작업이 배포되는 것이 중요한거지, 
앞선 작업을 기다리며 배포되는 것은 크게 의미가 없기 때문에 
GitHub Actions Runner 2개가 동시에 떠있는 상황을 막을 수 있는 가장 좋은 방법인 것 같았다.

그러나 여전히 문제는 있었는데, 앞선 워크플로우를 취소하는게 꼭 최신버전이라는 걸 보장할 수 없었다.
자동으로 최신버전을 보장할 수 있다면 금상첨화겠지만, 그게 불가능하다면 최소한 개발자가 
앞선 워크플로우가 취소되고 새로운 워크플로우가 시작되는 것을 확인할 수 있어야 했다.

때문에 기존 배포의 시작과 성공을 Slack 채널에 알리는 기능을 보완했다. 

<br>

## ⏱ 최소한의 안전장치 마련

기존에는 배포가 시작되거나 성공했을 때 Slack 채널에 알림을 전달하고 있었다. 
이를 보완하여 배포의 시작, 성공 뿐만 아니라, 취소, 실패시에도 알림 메시지를 보내도록 변경했다.

### AS-IS

```yml
# { 전체설정 }

jobs:
  notify-deploy-start:
    runs-on: ubuntu-latest
    outputs:
      message_id: ${{ steps.slack_notify.outputs.message_id }}
    steps:
      - name: Slack Notify Deploy Start
        id: slack_notify
        uses: voxmedia/github-action-slack-notify-build@v1.5.0
        env:
          SLACK_BOT_TOKEN: # { 토큰 }
        with:
          channel: # { 채널명 }
          status: STARTING
          color: warning

    deploy:
      # { 배포작업 }  

  notify-deploy-result:
    needs: [ notify-deploy-start, deploy ]
    runs-on: ubuntu-latest
    
    steps:
      - name: Slack Notify Deploy Prod Success
        if: env.WORKFLOW_CONCLUSION == 'success'
        uses: voxmedia/github-action-slack-notify-build@v1.5.0
        env:
          SLACK_BOT_TOKEN: # { 토큰 }
        with:
          channel: # { 채널명 }
          message_id: ${{ needs.notify-deploy-start.outputs.message_id }}
          status: SUCCESS
          color: good
```

### TO-BE

```yml
# { 전체설정 }

jobs:
  notify-deploy-start:
    runs-on: ubuntu-latest
    outputs:
      message_id: ${{ steps.slack_notify.outputs.message_id }}
    steps:
      - name: Slack Notify Deploy Start
        id: slack_notify
        uses: voxmedia/github-action-slack-notify-build@v1.5.0
        env:
          SLACK_BOT_TOKEN: # { 토큰 }
        with:
          channel: # { 채널명 }
          status: STARTING
          color: warning

    deploy:
      # { 배포작업 }  

  notify-deploy-result:
    needs: [ notify-deploy-start, deploy ]
    runs-on: ubuntu-latest
    if: always() # 취소 되어도, 실패하여도 항상 실행되도록 설정

    steps:
      # env.WORKFLOW_CONCLUSION 키워드를 통해 앞선 job 의 수행 결과를 가져온다.
      - uses: technote-space/workflow-conclusion-action@v3

      - name: Slack Notify Deploy Prod Success
        if: env.WORKFLOW_CONCLUSION == 'success'
        uses: voxmedia/github-action-slack-notify-build@v1.5.0
        env:
          SLACK_BOT_TOKEN: # { 토큰 }
        with:
          channel: # { 채널명 }
          message_id: ${{ needs.notify_deploy_start.outputs.message_id }}
          status: SUCCESS
          color: good

      - name: Slack Notify Deploy Prod Failure
        if: env.WORKFLOW_CONCLUSION == 'failure'
        uses: voxmedia/github-action-slack-notify-build@v1.5.0
        env:
          SLACK_BOT_TOKEN: # { 토큰 }
        with:
          channel: # { 채널명 }
          message_id: ${{ needs.notify_deploy_start.outputs.message_id }}
          status: FAILURE
          color: danger

      - name: Slack Notify Deploy Prod Cancelled
        if: env.WORKFLOW_CONCLUSION == 'cancelled'
        uses: voxmedia/github-action-slack-notify-build@v1.5.0
        env:
          SLACK_BOT_TOKEN: # { 토큰 }
        with:
          channel: # { 채널명 }
          message_id: ${{ needs.notify_deploy_start.outputs.message_id }}
          status: CANCELLED
          color: '#808080'
```

슬랙 채널 알림에 대해서는 2가지 오픈소스를 활용했다.
슬랙 채널 메세지 포맷을 간단히 설정할 수 있는 [github-action-slack-notify-build](https://github.com/voxmedia/github-action-slack-notify-build) 와
앞선 워크플로우 job 의 수행 결과를 가져오는 [workflow-conclusion-action](https://github.com/technote-space/workflow-conclusion-action) 이다.
`env.WORKFLOW_CONCLUSION` 명령어를 통해 앞선 워크플로우 job 의 수행결과를 가져오면, 각각 결과(conclusion)에 따라 다른 메세지를 보내는 방식이다.

<img width="1074" alt="image" src="https://user-images.githubusercontent.com/37354145/202175865-8b4fb6b4-017e-4283-a038-8d9637bf8f0d.png">

이렇게 연달은 배포로 앞선 워크플로우가 취소되었을 때, 취소에 대한 알림 메세지를 받는 것으로 최소한의 안전장치를 마련하고서야 안심할 수 있었다.

<br>

## ⏱ 후기

배포 동시성을 완벽히 제어하진 못했으나, 최악의 상황은 면할 수 있는 안전장치를 마련했다.
찾아보면 더 좋은 해결 방법이 존재할 것 같은데...🥲 그래도 당장 효용성을 가진 결과물이 나온 것에 만족해야겠다.

몇 달전 같았으면 무조건 최고의 방법으로 해결하려고 끝없는 시간을 보냈을텐데,
그렇게 찾아낸 방법들이 결국 쓸모없어지거나 바뀌는 모습들을 보면서 나도 함께 바뀐 것 같다.
현실적으로 주어진 조건과 시간에서 당장의 문제를 해결해내는 방법을 터득한걸까?

그래도 항상 최대한의 퀄리티를 내기 위해 찾아보고 시도하는 습관을 잃진 않았으면 좋겠다.
주기적으로 더 좋은 방법이 있을지 고민해봐야겠다.

<br>

## References

- [About billing for GitHub Actions](https://docs.github.com/en/billing/managing-billing-for-github-actions/about-billing-for-github-actions)
- [GitHub Actions 워크플로우의 승인 기능 사용하기](https://blog.outsider.ne.kr/1556)
- [Wait On Check Action - GitHub Marketplace](https://github.com/marketplace/actions/wait-on-check)
- [Consecutive Workflow Action - GitHub Marketplace](https://github.com/marketplace/actions/consecutive-workflow-action)
- [GitHub Actions concurrency](https://docs.github.com/en/actions/reference/workflow-syntax-for-github-actions#concurrency)
- [voxmedia/github-action-slack-notify-build](https://github.com/voxmedia/github-action-slack-notify-build)
- [technote-space/workflow-conclusion-action](https://github.com/technote-space/workflow-conclusion-action)
- [Git Flow에서 트렁크 기반 개발으로 나아가기](https://tech.mfort.co.kr/blog/2022-08-05-trunk-based-development/)

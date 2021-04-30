---
title: "재부팅 없이 EC2 저장장치 볼륨 늘리기"
date: 2021-04-30
tags:
    - AWS
toc: true
toc_sticky: true
toc_label: "재부팅 없이 EC2 저장장치 볼륨 늘리기"
---

AWS EC2 인스턴스의 저장장치는 EBS(Elastic Block Store)로 구성할 수 있다.   
EBS는 탄력적 저장장치로 볼륨을 자유롭게 키울 수 있는데, 재부팅 없이 볼륨을 키우는 방법에 대해 실습을 진행했다.

## ☁️ 1. EC2 관리 페이지에서 볼륨 확인
![슬라이드1](https://user-images.githubusercontent.com/37354145/116637842-f3328280-a99f-11eb-9c6f-03f101a7d476.png)
AWS EC2 관리 메뉴에서 `Elastic Block Store - 볼륨` 메뉴로 접근해보자.

![슬라이드2](https://user-images.githubusercontent.com/37354145/116637846-f6c60980-a99f-11eb-9a9b-1357200514e2.png)
기존 인스턴스의 볼륨 크기를 확인해보니 100GB로 설정되어 있다.
실제로도 100GB가 사용되고 있는지 궁금해졌다.

<br>

![슬라이드3](https://user-images.githubusercontent.com/37354145/116637848-f7f73680-a99f-11eb-8f3f-1d7700eb97a8.png)
터미널에서 `$ df` 명령을 입력해서 파일시스템들을 살펴보니 `/dev/xvda` 파일 시스템에서 
가장 크게 `1K-bloks` 값을 소유하고 있다는 걸 알 수 있다. 그렇지만 정확한 볼륨 크기를 확인하기 어렵다. 
보편적으로 사용되는 단위로로 볼륨을 확인해보자.

<br>

## ☁️ 2. 인스턴스 터미널에서 볼륨 확인
![슬라이드4](https://user-images.githubusercontent.com/37354145/116637850-f88fcd00-a99f-11eb-87c9-0399565789ad.png)
`$ df`에 `-h(human)` 옵션을 추가해서 사람이 확인하기 편한 단위로 볼륨을 확인할 수 있었다.
`/dev/xvda` 파일 시스템이 100G에 근접한 97G를 점유하고 있다. `/dev/xvda` 옆에 `1`은 파티션 번호를 의미한다.

![슬라이드5](https://user-images.githubusercontent.com/37354145/116637852-f9286380-a99f-11eb-8e9f-7e80c0b7d21b.png)
파일 시스템이 점유중인 볼륨 크기는 확인했지만, 물리적으로 인식되어 있는 디스크의 볼륨이라고 확신 할 수 없다. 
`$ fdisk` 명령을 입력해서 `/dev/xvda` 파일 시스템에게 쥐어진 볼륨을 확인해보자. 

![슬라이드6](https://user-images.githubusercontent.com/37354145/116637856-f9286380-a99f-11eb-93fd-9e6572ab5666.png)
`$ fdisk` 모드 진입 상태에서 `$ p(print)` 명령을 입력해서 디스크 정보를 확인해보니, 100G 임을 확인 할 수 있었다.
이로서 AWS EC2 볼륨 메뉴에서 확인한 100GB가 실제로 적용되고 있음을 확인했다.

<br>

## ☁️ 3. EC2 관리 페이지에서 볼륨 수정
![슬라이드7](https://user-images.githubusercontent.com/37354145/116637857-f9c0fa00-a99f-11eb-9fa3-da7086aec821.png)
다시 AWS EC2 `Elastic Block Store - 볼륨` 메뉴로 돌아와 인스턴스를 우클릭하고, `볼륨 수정`을 선택해보자.

![슬라이드8](https://user-images.githubusercontent.com/37354145/116637860-faf22700-a99f-11eb-93e9-838af83ef194.png)
볼륨 크기를 최소 1GB 에서 1.6TB까지 선택 할 수 있다.  
단, 기존보다 늘릴 순 있지만 줄일 순 없다! 적당한 볼륨으로 선택하자.

![슬라이드10](https://user-images.githubusercontent.com/37354145/116637864-fc235400-a99f-11eb-9e03-ecae0500a864.png)
볼륨 수정 요청 후 일정 시간이 지나면 볼륨 수정이 완료된다. 볼륨 수정이 완료 되어도, 리눅스를 재부팅하는게 아닌 이상 
자동으로 볼륨이 적용되지 않는다. 재부팅 없이 볼륨 수정을 적용한다는 목적을 달성하기 위해 다시 터미널로 돌아간다.

<br>

## ☁️ 4. 인스턴스 터미널에서 볼륨 재할당
![슬라이드11](https://user-images.githubusercontent.com/37354145/116637865-fc235400-a99f-11eb-8da1-59fd1a83f21d.png)
변경된 볼륨을 적용하기에 앞서, 정확한 파티션 번호를 다시 확인해보고 싶다면, `$ parted [파일시스템명] print` 명령을 이용하면 된다.

![슬라이드12](https://user-images.githubusercontent.com/37354145/116637867-fd548100-a99f-11eb-9e90-d8bd084f1521.png)
`$ growpart [파일시스템명] [파티션번호]` 명령을 이용해 볼륨 크기를 적용한다.
기존 크기를 `old: `, 신규로 적용된 크기를 `new: `로 확인 할 수 있다.

![슬라이드13](https://user-images.githubusercontent.com/37354145/116637868-fded1780-a99f-11eb-9ccd-31f3be974788.png)
그러나 정확히 128G가 할당된 것인지는 파악하기 어렵다. `$ fdisk [파일시시스템명]` 명령어를 다시 사용해서 정확한 
크기를 확인해보자. 128G가 잘 적용된 것을 확인할 수 있다.

![슬라이드14](https://user-images.githubusercontent.com/37354145/116637869-fe85ae00-a99f-11eb-9443-52022f050dad.png)
`$ df -h` 명령을 통해 파일 시스템도 확인해보았지만, 파일 시스템에는 아직 128G가 제대로 할당되지 않은 것을 확인할 수 있다. 
기존 97G에서 조금 늘어나긴 했지만, 128G가 온전하게 할당된 것은 아니다.

![슬라이드15](https://user-images.githubusercontent.com/37354145/116637870-fe85ae00-a99f-11eb-8edb-b4ed61afd180.png)
`$ resize2fs [파일시스템명][파티션번호]` 명령을 통해서 파일시스템의 볼륨을 재할당 해주자. 
볼륨이 성공적으로 재할당되고 기존 block의 개수가 13개에서 16개로 늘어났다는 것을 확인할 수 있다.

여기서 block 은 `100GB / 13GB = 7.7GB`, `128GB / 16GB = 8GB`로, 하나당 8G의 디스크를 나누어 갖는 단위임을 유추할 수 있다!

![슬라이드16](https://user-images.githubusercontent.com/37354145/116637871-ff1e4480-a99f-11eb-8c9b-01c99a12d58d.png)
다시 `$ df -h` 명령을 사용해서 파일시스템에 할당된 볼륨의 크기를 확인해보면 128G에 근접한 125G가 할당됨을 확인할 수 있다!

<br>

## ☁️ 요약
1. `AWS EC2 EBS(Elastic Block Store) - 볼륨` 메뉴에 접근
2. 인스턴스 우클릭, `볼륨 수정` 클릭
4. 터미널에서 `$ df -h` 명령을 통해 저장장치(SSD)를 관리 중인 파일시스템 확인
5. `$ fdisk /dev/[파일시스템명]` 명령으로 fdisk 탐색 모드 진입
6. `p` 혹은 `print` 명령으로 파티션 번호와 기대 볼륨 확인  
   (파일시스템명 뒤에 붙은 숫자가 파티션 번호를 의미. 정확한 파티션 번호는 `$ parted /dev/[파일시스템명] print` 명령을 통해 확인 가능)
   
7. `$ growpart /dev/[파일시스템명] [파티션 번호]` 을 통해 실제 저장소 볼륨 확대
8. 볼륨 확대가 완료된 후 `$ fdisk /dev/[파일시스템명]` 명령으로 확대된 볼륨 확인
9. `$ resize2fs /dev/[파일시스템명][파티션번호]` 을 통해 파일 시스템이 제어 가능한 볼륨 재할당
10. `$ df -h` 명령을 통해 파일 시스템이 제어 가능한 볼륨이 확대된 것을 확인

<br>

## References
- [https://docs.aws.amazon.com/ko_kr/AWSEC2/latest/UserGuide/recognize-expanded-volume-linux.html](https://docs.aws.amazon.com/ko_kr/AWSEC2/latest/UserGuide/recognize-expanded-volume-linux.html)
  

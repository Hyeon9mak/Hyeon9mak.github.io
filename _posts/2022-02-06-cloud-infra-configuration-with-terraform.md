---
title: "Terraform을 이용한 클라우드 인프라 환경 구성"
date: 2022-02-06
tags:
    - terraform
    - cloud
    - infrastructure
toc: true
toc_sticky: true
toc_label: "Terraform을 이용한 클라우드 인프라 환경 구성"
---

## 🌕 Terraform 소개
새 AWS 인스턴스를 프로비저닝 하기 위해선 다음을 포함한 몇 가지 기본 정보를 수집해야한다.

- EC2 인스턴스 이름
- 운영 체제 (Image)
- VM 크기
- 지리적 위치 (Region)
- 보안 그룹
- 그 외...

대부분 개발자가 직접 AWS Console(GUI)을 조작하거나 CloudFormation Templates를 통해 프로비저닝을 진행한다.
그러나 인프라 환경을 구성할 때마다 반복해서 AWS Console을 조작하는 것은 리소스 낭비이고, CloudFormation 템플릿은 JSON 기반으로 사람이 읽고 편집하기에 썩 좋지 못하다.

terraform은 이런 문제점들을 관통하는 언어라고 볼 수 있다.

```
# CloudFormation Templates (JSON)

{
  "AWSTemplateFormatVersion" : "2010-09-09",
  "Description" : "AWS CloudFormation Sample Template EC2InstanceWithSecurityGroupSample: Create an Amazon EC2 instance running the Amazon Linux AMI. The AMI is chosen based on the region in which the stack is run.",
  "Parameters" : {
    "KeyName": {
      "Description" : "Name of an existing EC2 KeyPair to enable SSH access to the instance",
      "Type": "AWS::EC2::KeyPair::KeyName",
      "ConstraintDescription" : "must be the name of an existing EC2 KeyPair."
    },
  ...
```
```
# Terraform

resource aws_instance "web" {
  ami           = data.aws_ami.ubuntu.id
  instance_type = "t2.micro"
  
  // Name of an existing EC2 KeyPair 
  // to enable SSH access to the instance

  tags = {
    Name = "HelloWorld"
  }
}
```

그 외에도 잘 알려진 terraform의 장점은 아래와 같다.

- 실행 가능한 문서
- 인간과 기계 모두 해독 가능
- 배우기 쉬움
- 테스트, 공유, 재사용, 자동화
- 모든 주요 클라우드 제공 업체(AWS, Google Cloud 등)에서 작동 가능

<br>

## 🌕 Terraform 인프라 환경 구성 코드 작성
대표적으로 활용되는 명령어는 아래와 같다.

- `provider`: Terraform을 통해 사용할 클라우드 인프라 환경 정보 지정
- `locals`: 파일 내에서 사용할 환경변수 지정
- `module`: 공통적으로 활용할 수 있는 모듈을 정의
- `resource`: 인프라 자원을 생성
- `data`: `resource`를 통해 생성된 인프라 자원을 조회(식별)해서 사용

### provider
```json
# main.tf

terraform {
  required_providers {
    aws = {
      source  = "hashicorp/aws" // "하시코프사/AWS" 설정 사용
    }
  }

  backend "s3" {  // *.tfstate 파일 저장위치 설정
    bucket         = "devzone-tf-state" // S3 버킷 이름
    key            = "onboarding/hyeon9mak-terraform.tfstate" // 생성할 파일명
    region         = "ap-northeast-2" // Variables not allowed
    encrypt        = true
    dynamodb_table = "terraform-tf-state-lock"
    acl            = "bucket-owner-full-control"
  }
}

provider "aws" {  // AWS 지역 설정
  region     = "ap-northeast-2"
}

locals {    // VPC 선택
  vpc_id = "vpc-{vpc 해시값}"
}
```

Terraform을 이용한 ECS 환경을 구성할 때 우선적으로 어떤 클라우드 서비스를 이용할 것인지,
AWS를 이용한다면 `*.tfstate` 파일은 어디에 보관할 것인지, 지역은 어디인지, VPC는 무엇인지 
명시를 해준다.

### locals
```json
# 선언
locals {
  ecs_container_name       = "awesome_container_name"
  ecr_repository_name      = "awesome_repository_name"
  ...
}

# 사용
resource "aws_ecr_repository" "api_repo" {
  name = local.ecr_repository_name
}
```

### module
```json
module "hyeon9mak_ecs_setup" {
  source        = "common/modules/ecs_setup"
  base_name     = "hyeon9mak"
  profile       = "dev"
  common_data   = {
    vpc_public_subnet_ids = data.aws_subnet_ids.api_vpc_public_subnet.ids
    vpc_private_subnet_ids = data.aws_subnet_ids.api_vpc_private_subnet.ids
    ...
  }
}
```

module은 다른 module을 의존하는 형태로 정의될 수도 있다. 가령 위의 Terraform 코드에서는
**hyeon9mak_ecs_setup** 모듈이 `source` 명령어를 통해 **common/modules/ecs_setup** 모듈을 의존하고 있다.
나머지 정보들이 **common/modules/ecs_setup** 모듈로 전달되어 ECS 환경이 구성되는 형태이다.

### resource & data
```json
resource "aws_ecs_cluster" "ecs_cluster" {
  name = "hyeon9mak-backend"

  capacity_providers = ["FARGATE"]

  setting {
    name  = "containerInsights"
    value = "enabled"
  }
}
```
```json
data "aws_ecs_cluster" "ecs_cluster" {
  cluster_name = "hyeon9mak-backend"
}
```

`resource` 명령어를 통해서 클라우드 인프라 컴포넌트를 구성하고,
`data` 명령어를 통해 사전에 구성되어있던 컴포넌트를 찾아서 이용할 수 있다.

미리 생성해둔 ECS 클러스터에 새로운 서비스를 생성하거나,
기존에 만들어둔 보안그룹을 활용하는 등에 사용할 수 있다.

<br>

## 🌕 Terraform 코드 배포(적용)
Terraform 으로 작성한 코드 내용을 실제 인프라 환경에 적용하는데에 3가지 단계가 소요된다.

- `$ terraform init`: Terraform 명령어 사용을 위한 설정 진행. 최초에 입력하는 명령어.
- `$ terraform plan`: 코드 실행시 만들어질 결과 예측. 가장 많이, 자주 활용한다.
- `$ terraform apply`: 실제 인프라 환경에 변경사항을 적용.

### init
`$ terraform init` 명령이 수행되면 **.terraform** 디렉토리와 **.terraform.lock.hcl** 파일이 생성된다.
**.terraform.lock.hcl** 파일을 통해 **.terraform** 디렉토리 내부의 구성 파일들을 다운로드 할 수 있으므로, 
깃과 같은 버전관리 시스템에는 **.terraform** 디렉토리를 체크인하지 않고 **.terraform.lock.hcl** 파일만 체크인하는 방식으로 관리한다.

[Terraform은 주로 AWS S3와 같은 간단한 저장소에 *.tfstate 파일을 업로드하는 것으로 상태를 관리한다.](https://blog.outsider.ne.kr/1290)

> - 동시에 두 사람이 작업한다면 terraform.tfstate가 달라지게 되어 충돌이 발생할 수 있다. 
> 이는 파일의 충돌뿐이 아니라 인프라에도 영향을 줄 수 있다.
> - Git으로 작업하면서 pull로 가져오지 않고 작업한다면 
> 실수로 이전 terraform.tfstate위에서 작업할 수 있다.

### plan
`$ terraform plan` 명령이 수행되면 실제 인프라 환경에 terraform 코드가 반영되면 
어떤 변화가 일어나는지를 확인할 수 있다.

```
module.hyeon9mak_ecs_setup.aws_ecr_repository.api_repo: Refreshing state... [id=hyeon9mak-dev]

...

Terraform will perform the following actions:
  + resource "aws_ecs_service" "api_service" {
      ...

      + deployment_circuit_breaker {
          + enable   = false
          + rollback = false
        }

      + load_balancer {
          + container_name   = "hyeon9mak-container"
          + container_port   = 8080
          + target_group_arn = (known after apply)
        }

      ...
    }

Plan: 5 to add, 0 to change, 0 to destroy.
```

간혹 다른 모듈을 제거하려는 시도를 보이는 경우도 있다.

```
Plan: 5 to add, 0 to change, 1 to destroy.
```

이는 `$ terraform init` 명령을 통해 생성된 *.tfstate 파일에 다른 모듈을 관리 대상으로 
포함하게 되었기 때문이다.
이럴 떈 `$ terranform state rm` 명령어를 통해 *.tfstate 파일을 통해 관리하는 대상에서 제거해주면 된다.

```
$ terraform state rm {다른 모듈 이름}
```

> `*.tfstate`: terraform의 인프라 상태/버전 관리 파일  
> [https://blog.outsider.ne.kr/1290](https://blog.outsider.ne.kr/1290)

### apply
`$ terraform plan` 명령을 통해 확인한 변경사항이 실제로 인프라 환경에 적용된다.
충분히 주의해서 적용하고, 적용된 이후엔 어떤 변화가 있는지 모두 확인해보도록 하자.

<br>

## References

- [https://hashicorp.github.io/field-workshops-terraform/slides/korean/aws/terraform-oss/#1](https://hashicorp.github.io/field-workshops-terraform/slides/korean/aws/terraform-oss/#9)
- [Terraform의 tfstate를 원격으로 관리하기 - Outsider's Dev Story](https://blog.outsider.ne.kr/1290)

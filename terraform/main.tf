terraform {
  required_providers {
    aws = {
      source  = "hashicorp/aws"
      version = "~> 5.0"
    }
  }
  backend "s3" {}
}

provider "aws" {
  region = var.aws_region
}

provider "aws" {
  alias  = "us-east-1"
  region = "us-east-1"
}

module "vpc" {
  source = "./modules/vpc"
}

module "route53" {
  source = "./modules/route53"
  domain_name = var.domain_name
  providers = {
    aws           = aws
    aws.us-east-1 = aws.us-east-1
  }
}

module "cdn" {
  source              = "./modules/cdn"
  domain_name         = var.domain_name
  acm_certificate_arn = module.route53.certificate_arn
  route53_zone_id     = module.route53.zone_id
}

module "ecr" {
  source = "./modules/ecr"
}

module "ecs" {
  source = "./modules/ecs"
  private_subnets = module.vpc.private_subnets
  security_groups = module.vpc.security_groups
}

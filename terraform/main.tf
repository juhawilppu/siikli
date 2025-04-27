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

module "ecr" {
  source = "./modules/ecr"
}

module "rds" {
  source = "./modules/rds"
  vpc_id = module.vpc.vpc_id
  db_subnets = module.vpc.db_subnets
  rds_security_group_id = module.vpc.rds_security_group_id
}

module "alb" {
  source = "./modules/alb"
  alb_sg_id = module.vpc.alb_sg_id
  public_subnet_ids = module.vpc.public_subnets
  vpc_id = module.vpc.vpc_id
}

module "ecs" {
  source = "./modules/ecs"
  private_subnets = module.vpc.private_subnets
  ecs_security_group_id = module.vpc.ecs_security_group_id
  alb_target_group_arn = module.alb.alb_target_group_arn
  vpc_id = module.vpc.vpc_id
}

module "cdn" {
  source              = "./modules/cdn"
  domain_name         = var.domain_name
  acm_certificate_arn = module.route53.certificate_arn
  route53_zone_id     = module.route53.zone_id
  alb_dns_name        = module.alb.alb_dns_name
}

module "redis" {
  source = "./modules/redis"
  valkey_subnet_group_name = module.vpc.valkey_subnet_group_name
  valkey_sg_id = module.vpc.valkey_sg_id
}
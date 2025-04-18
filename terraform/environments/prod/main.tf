terraform {
  required_providers {
    aws = {
      source  = "hashicorp/aws"
      version = "~> 5.0"
    }
  }
  backend "s3" {
    bucket = "siikli-terraform-state"
    key    = "prod/terraform.tfstate"
    region = "eu-north-1"
  }
}

provider "aws" {
  region = var.aws_region
}

module "network" {
  source = "../../modules/network"

  environment = var.environment
  vpc_cidr    = var.vpc_cidr
}

module "database" {
  source = "../../modules/database"

  environment     = var.environment
  vpc_id          = module.network.vpc_id
  private_subnets = module.network.private_subnets
  db_name         = var.db_name
  db_username     = var.db_username
  db_password     = var.db_password
}

module "frontend" {
  source = "../../modules/frontend"

  environment = var.environment
  domain_name = var.domain_name
}

module "backend" {
  source = "../../modules/backend"

  environment     = var.environment
  vpc_id          = module.network.vpc_id
  private_subnets = module.network.private_subnets
  public_subnets  = module.network.public_subnets
  db_endpoint     = module.database.db_endpoint
  db_name         = var.db_name
  db_username     = var.db_username
  db_password     = var.db_password
} 
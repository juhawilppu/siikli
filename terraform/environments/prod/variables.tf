variable "environment" {
  description = "Environment name (e.g., prod, staging)"
  type        = string
  default     = "prod"
}

variable "aws_region" {
  description = "AWS region"
  type        = string
  default     = "eu-north-1"
}

variable "vpc_cidr" {
  description = "CIDR block for VPC"
  type        = string
  default     = "10.0.0.0/16"
}

variable "domain_name" {
  description = "Domain name for the application"
  type        = string
}

variable "db_name" {
  description = "Name of the database"
  type        = string
  default     = "siikli"
}

variable "db_username" {
  description = "Database master username"
  type        = string
  default     = "siikli"
}

variable "db_password" {
  description = "Database master password"
  type        = string
  sensitive   = true
} 
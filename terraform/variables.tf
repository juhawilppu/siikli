variable "domain_name" {
  description = "Domain name for the application"
  type        = string
}

variable "aws_region" {
  description = "AWS region"
  type        = string
  default     = "eu-north-1"
}

variable "app_version" {
  type = string
}

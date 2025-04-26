variable "vpc_ip_range" {
  type        = string
  default     = "10.0.0.0/16"
  description = "VPC CIDR"
}

variable "public_subnets" {
  type        = list(string)
  default     = ["10.0.1.0/24"]
  description = "Public subnet CIDRs"
}

variable "private_subnets" {
  type        = list(string)
  default     = ["10.0.3.0/24"]
  description = "Private subnet CIDRs"
}

variable "db_subnets" {
  type        = list(string)
  default     = ["10.0.5.0/24", "10.0.6.0/24"]
  description = "Database subnet CIDRs"
}

variable "availability_zones" {
  type        = list(string)
  default     = ["eu-north-1a"]
  description = "AWS Availability Zones"
}

variable "db_availability_zones" {
  type        = list(string)
  default     = ["eu-north-1a", "eu-north-1b"]
  description = "AWS Availability Zones for database"
}

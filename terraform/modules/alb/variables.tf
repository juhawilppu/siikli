variable "alb_sg_id" {
  type = string
}

variable "public_subnet_ids" {
  type = list(string)
}

variable "vpc_id" {
  type = string
}

variable "acm_certificate_arn" {
  type = string
}

variable "route53_zone_id" {
  type        = string
  description = "Route53 zone ID for DNS validation"
}
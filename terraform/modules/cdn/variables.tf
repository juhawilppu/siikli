variable "domain_name" {
  description = "Domain name for CloudFront"
  type        = string
}

variable "acm_certificate_arn" {
  description = "ACM certificate ARN (us-east-1)"
  type        = string
}

variable "route53_zone_id" {
  description = "Route53 zone ID"
  type        = string
}

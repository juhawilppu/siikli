resource "aws_acm_certificate" "main" {
  provider          = aws.us-east-1
  domain_name       = var.domain_name
  validation_method = "DNS"

  subject_alternative_names = [
    "www.${var.domain_name}"
  ]

  lifecycle {
    create_before_destroy = true
  }

  tags = {
    Name = "ACM-${var.domain_name}"
  }
}

resource "aws_route53_record" "acm_validation" {
  provider = aws.us-east-1
  for_each = {
    for dvo in aws_acm_certificate.main.domain_validation_options : dvo.domain_name => {
      name  = dvo.resource_record_name
      type  = dvo.resource_record_type
      value = dvo.resource_record_value
    }
  }

  zone_id = aws_route53_zone.siikli.id
  name    = each.value.name
  type    = each.value.type
  records = [each.value.value]
  ttl     = 60
}

resource "aws_acm_certificate_validation" "main" {
  provider                = aws.us-east-1
  certificate_arn         = aws_acm_certificate.main.arn
  validation_record_fqdns = [for r in aws_route53_record.acm_validation : r.fqdn]
}

resource "aws_route53_zone" "siikli" {
  name = var.domain_name

  tags = {
    Name = "HostedZone-${var.domain_name}"
  }
}

resource "aws_ses_domain_identity" "siikli" {
  domain = var.domain_name
}

resource "aws_ses_domain_mail_from" "siikli" {
  domain           = var.domain_name
  mail_from_domain = "mail.${var.domain_name}"
  behavior_on_mx_failure = "UseDefaultValue"
}

resource "aws_route53_record" "ses_verification" {
  zone_id = aws_route53_zone.siikli.id
  name    = "_amazonses.${aws_ses_domain_identity.siikli.domain}"
  type    = "TXT"
  ttl     = 300
  records = [aws_ses_domain_identity.siikli.verification_token]
}

resource "aws_ses_domain_dkim" "siikli" {
  domain = aws_ses_domain_identity.siikli.domain
}

resource "aws_route53_record" "dkim_records" {
  count   = 3
  zone_id = aws_route53_zone.siikli.id
  name    = "${element(aws_ses_domain_dkim.siikli.dkim_tokens, count.index)}._domainkey.${aws_ses_domain_identity.siikli.domain}"
  type    = "CNAME"
  ttl     = 300
  records = ["${element(aws_ses_domain_dkim.siikli.dkim_tokens, count.index)}.dkim.amazonses.com"]
}

locals {
  dkim_txt = "v=DKIM1;k=rsa;p=MIIBIjANBgkqhkiG9w0BAQEFAAOCAQ8AMIIBCgKCAQEAwt0VKkU+HIZYK5xu3GWEGh11AJV072JsxYneZzFpkuTUMzjNTrseK+uvSN0vYAHo5xCL5mtYEt//ucIIZa7WKnzwgDPEXc5OBEJeY5Pszn6uMN33Y0E1eQ3lD3LrWNoDcZ7weIrPHcndv100fAlD4RN5MknE2DgjJ9GlkKgGxQItG297BCFH+ZzcAWwvD/KuIiT/PVGsaE+0p86pSV3jhkHo9uEoz6b6AciMMIV+HlKNcAx5kqcHLa8Y5eM6Q4+ryDNPXQt3RRc5rAlR2QZY/KSy+pmqF/52swBzlZ1Md9C8JIl8Tesg0hOQVVeA3JZ3amoDzufCMtHcloXjQ9L3kwIDAQAB"
}

resource "aws_route53_record" "dkim_default" {
  zone_id = aws_route53_zone.siikli.id
  name    = "default._domainkey.siikli.fi"
  type    = "TXT"
  ttl     = 300
  records = [ join("\"\"", regexall(".{1,255}", local.dkim_txt)) ]
}

resource "aws_route53_record" "dmarc_root" {
  zone_id = aws_route53_zone.siikli.id

  name    = "_dmarc.${var.domain_name}"
  type    = "TXT"
  ttl     = 300
  records = [
    "v=DMARC1; p=reject; sp=reject; rua=mailto:juha.wilppu@siikli.fi"
  ]
}

resource "aws_route53_record" "spf" {
  zone_id = aws_route53_zone.siikli.id
  name    = "mail.${var.domain_name}"
  type    = "TXT"
  ttl     = 300
  records = ["v=spf1 include:amazonses.com -all"]
}

resource "aws_route53_record" "aromaentila" {
  zone_id = aws_route53_zone.siikli.id
  name    = "aromaentila.${var.domain_name}"
  type    = "A"
  ttl     = 300
  records = ["95.85.27.23"]
}

resource "aws_route53_record" "caa" {
  zone_id = aws_route53_zone.siikli.id
  name    = var.domain_name
  type    = "CAA"
  ttl     = 300
  records = [
    "0 issue \"amazon.com\"",
    "0 issue \"letsencrypt.org\"",
    "0 issuewild \"amazon.com\"",
    "0 issuewild \"letsencrypt.org\""
  ]
}

resource "aws_route53_record" "mail_mx" {
  zone_id = aws_route53_zone.siikli.id
  name    = "mail.${var.domain_name}"
  type    = "MX"
  ttl     = 300
  records = ["10 feedback-smtp.eu-north-1.amazonses.com"]
}

resource "aws_route53_record" "mx_root" {
  zone_id = aws_route53_zone.siikli.id
  name    = var.domain_name
  type    = "MX"
  ttl     = 300
  records = [
    "10 mx1.privateemail.com.",
    "10 mx2.privateemail.com.",
  ]
}

resource "aws_route53_record" "spf_root" {
  zone_id = aws_route53_zone.siikli.id
  name    = var.domain_name
  type    = "TXT"
  ttl     = 300
  records = [
    "v=spf1 include:spf.privateemail.com include:amazonses.com ~all"
  ]
}
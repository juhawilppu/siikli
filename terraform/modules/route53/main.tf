resource "aws_route53_zone" "main" {
  name = var.domain_name

  tags = {
    Name = "HostedZone-${var.domain_name}"
  }
}

resource "aws_acm_certificate" "main" {
  provider          = aws.us-east-1
  domain_name       = var.domain_name
  validation_method = "DNS"

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

  zone_id = aws_route53_zone.main.id
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
  name = "siikli.fi"

  tags = {
    Name = "HostedZone-siikli.fi"
  }
}

resource "aws_ses_domain_identity" "siikli" {
  domain = "siikli.fi"
}

resource "aws_ses_domain_mail_from" "siikli" {
  domain           = "siikli.fi"
  mail_from_domain = "mail.siikli.fi"
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

resource "aws_route53_record" "dmarc" {
  zone_id = aws_route53_zone.siikli.id

  name    = "_dmarc.siikli.fi"
  type    = "TXT"
  ttl     = 300
  records = [
    "v=DMARC1; p=none; rua=mailto:admin@siikli.fi"
  ]
}

resource "aws_route53_record" "alb" {
  zone_id = aws_route53_zone.siikli.id
  name    = "v2.${var.domain_name}"
  type    = "A"

  alias {
    name                   = var.alb_dns_name
    zone_id                = var.alb_zone_id
    evaluate_target_health = true
  }
}

resource "aws_route53_record" "main" {
  zone_id = aws_route53_zone.siikli.id
  name    = "siikli.fi"
  type    = "A"
  ttl     = 300
  records = ["95.85.27.23"]
}

resource "aws_route53_record" "main" {
  zone_id = aws_route53_zone.siikli.id
  name    = "www.siikli.fi"
  type    = "A"
  ttl     = 300
  records = ["95.85.27.23"]
}

resource "aws_route53_record" "aromaentila" {
  zone_id = aws_route53_zone.siikli.id
  name    = "aromaentila.siikli.fi"
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
  name    = "mail.siikli.fi"
  type    = "MX"
  ttl     = 300
  records = ["10 feedback-smtp.eu-north-1.amazonses.com"]
}

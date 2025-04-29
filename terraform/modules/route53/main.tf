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

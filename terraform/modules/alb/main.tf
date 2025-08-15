resource "aws_lb" "alb" {
  name               = "siikli-alb"
  internal           = false
  load_balancer_type = "application"
  security_groups    = [var.alb_sg_id]
  subnets            = var.public_subnet_ids

  tags = {
    Name = "siikli-alb"
  }
}

resource "aws_lb_target_group" "siikli_tg" {
  name     = "siikli-tg"
  port     = 3000
  protocol = "HTTP"
  vpc_id   = var.vpc_id
  target_type = "ip"

  health_check {
    path                = "/api/health"
    interval            = 30
    timeout             = 5
    healthy_threshold   = 5
    unhealthy_threshold = 2
    matcher             = "200"
  }

  tags = {
    Name = "siikli-tg"
  }
}

resource "aws_lb_listener" "siikli_http_listener" {
  load_balancer_arn = aws_lb.alb.arn
  port              = "80"
  protocol          = "HTTP"

  default_action {
    type             = "forward"
    target_group_arn = aws_lb_target_group.siikli_tg.arn
  }
}

# ACM certificate for ALB in eu-north-1 region
resource "aws_acm_certificate" "api" {
  domain_name       = "api.siikli.fi"
  validation_method = "DNS"

  lifecycle {
    create_before_destroy = true
  }

  tags = {
    Name = "ACM-api.siikli.fi"
  }
}

# DNS validation records for the API certificate
resource "aws_route53_record" "api_cert_validation" {
  for_each = {
    for dvo in aws_acm_certificate.api.domain_validation_options : dvo.domain_name => {
      name  = dvo.resource_record_name
      type  = dvo.resource_record_type
      value = dvo.resource_record_value
    }
  }

  zone_id = var.route53_zone_id
  name    = each.value.name
  type    = each.value.type
  records = [each.value.value]
  ttl     = 60
}

# Certificate validation
resource "aws_acm_certificate_validation" "api" {
  certificate_arn         = aws_acm_certificate.api.arn
  validation_record_fqdns = [for r in aws_route53_record.api_cert_validation : r.fqdn]
}

# Route53 A record for api.siikli.fi pointing to ALB
resource "aws_route53_record" "api_alias" {
  zone_id = var.route53_zone_id
  name    = "api.siikli.fi"
  type    = "A"

  alias {
    name                   = aws_lb.alb.dns_name
    zone_id                = aws_lb.alb.zone_id
    evaluate_target_health = false
  }
}

# Route53 AAAA record for api.siikli.fi pointing to ALB (IPv6)
resource "aws_route53_record" "api_alias_ipv6" {
  zone_id = var.route53_zone_id
  name    = "api.siikli.fi"
  type    = "AAAA"

  alias {
    name                   = aws_lb.alb.dns_name
    zone_id                = aws_lb.alb.zone_id
    evaluate_target_health = false
  }
}

resource "aws_lb_listener" "siikli_https_listener" {
  load_balancer_arn = aws_lb.alb.arn
  port              = "443"
  protocol          = "HTTPS"
  ssl_policy        = "ELBSecurityPolicy-TLS13-1-2-2021-06"
  certificate_arn   = aws_acm_certificate_validation.api.certificate_arn

  default_action {
    type             = "forward"
    target_group_arn = aws_lb_target_group.siikli_tg.arn
  }

  depends_on = [aws_acm_certificate_validation.api]
}


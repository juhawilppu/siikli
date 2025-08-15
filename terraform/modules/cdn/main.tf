resource "aws_s3_bucket" "site" {
  bucket = var.domain_name
}

resource "aws_s3_bucket_website_configuration" "site" {
  bucket = aws_s3_bucket.site.bucket

  index_document {
    suffix = "index.html"
  }

  error_document {
    key = "error.html"
  }
}

resource "aws_s3_bucket_public_access_block" "site" {
  bucket = aws_s3_bucket.site.id

  block_public_acls       = false
  block_public_policy     = false
  ignore_public_acls      = false
  restrict_public_buckets = false
}

resource "aws_s3_bucket_policy" "site" {
  bucket = aws_s3_bucket.site.id
  policy = jsonencode({
    Version = "2012-10-17",
    Statement = [
      {
        Effect    = "Allow",
        Principal = "*",
        Action    = "s3:GetObject",
        Resource  = "${aws_s3_bucket.site.arn}/*"
      }
    ]
  })
}

resource "aws_cloudfront_response_headers_policy" "csp" {
  name = "siikli-csp-policy"

  security_headers_config {

    content_type_options {
      override = true
    }
    
    content_security_policy {
      content_security_policy = "default-src 'self'; script-src 'self' https://eu-assets.i.posthog.com; style-src 'self' 'unsafe-inline'; font-src 'self'; img-src 'self' data:; connect-src 'self' https://eu-assets.i.posthog.com https://eu.i.posthog.com https://*.ingest.de.sentry.io;"
      override                = true
    }
    frame_options {
      frame_option = "DENY"
      override     = true
    }

    referrer_policy {
      referrer_policy = "strict-origin-when-cross-origin"
      override         = true
    }

    strict_transport_security {
      access_control_max_age_sec = 31536000
      include_subdomains         = true
      preload                    = true
      override                   = true
    }
  }

  custom_headers_config {
    items {
      header   = "Permissions-Policy"
      override = true
      value    = "geolocation=(), microphone=(), camera=()"
    }
  }
}

# CloudFront distribution
resource "aws_cloudfront_distribution" "cdn" {
  origin {
    domain_name = aws_s3_bucket_website_configuration.site.website_endpoint
    origin_id   = "s3-${aws_s3_bucket.site.id}"
    custom_origin_config {
      http_port              = 80
      https_port             = 443
      origin_protocol_policy = "http-only"
      origin_ssl_protocols   = ["TLSv1.2"]
    }
  }

  origin {
    domain_name = "api.siikli.fi"
    origin_id   = "alb-siikli-backend"

    custom_origin_config {
      origin_protocol_policy = "https-only"
      http_port              = 80
      https_port             = 443
      origin_ssl_protocols   = ["TLSv1.2"]
    }
  }

  custom_error_response {
    error_code            = 404
    response_code         = 200
    response_page_path    = "/index.html"
  }

  custom_error_response {
    error_code            = 403
    response_code         = 200
    response_page_path    = "/index.html"
  }

  enabled             = true
  is_ipv6_enabled     = true
  comment             = "CDN for ${var.domain_name}"
  default_root_object = "index.html"

  aliases = [var.domain_name]

  default_cache_behavior {
    target_origin_id       = "s3-${aws_s3_bucket.site.id}"
    viewer_protocol_policy = "redirect-to-https"
    response_headers_policy_id = aws_cloudfront_response_headers_policy.csp.id

    allowed_methods = ["GET", "HEAD"]
    cached_methods  = ["GET", "HEAD"]


    forwarded_values {
      query_string = false
      cookies {
        forward = "none"
      }
    }
  }

  ordered_cache_behavior {
    path_pattern     = "/api/*"
    target_origin_id = "alb-siikli-backend"
    viewer_protocol_policy = "redirect-to-https"
    response_headers_policy_id = aws_cloudfront_response_headers_policy.csp.id


    allowed_methods  = ["HEAD", "GET", "POST", "PUT", "DELETE", "OPTIONS", "PATCH"]
    cached_methods   = ["GET", "HEAD"]

    min_ttl                      = 0
    default_ttl                  = 0
    max_ttl                      = 0

  forwarded_values {
    query_string = true
    headers      = ["*"]
    cookies {
      forward = "all"
    }
  }
}

  viewer_certificate {
    acm_certificate_arn      = var.acm_certificate_arn
    ssl_support_method       = "sni-only"
    minimum_protocol_version = "TLSv1.2_2021"
  }

  restrictions {
    geo_restriction {
      restriction_type = "none"
    }
  }

  tags = {
    Name = "CDN for ${var.domain_name}"
  }
}

resource "aws_route53_record" "alias" {
  zone_id = var.route53_zone_id
  name    = "siikli.fi"
  type    = "A"

  alias {
    name                   = aws_cloudfront_distribution.cdn.domain_name
    zone_id                = aws_cloudfront_distribution.cdn.hosted_zone_id
    evaluate_target_health = false
  }
}

resource "aws_route53_record" "www" {
  zone_id = var.route53_zone_id
  name    = "www.siikli.fi"
  type    = "A"

  alias {
    name                   = aws_cloudfront_distribution.redirect_www.domain_name
    zone_id                = aws_cloudfront_distribution.redirect_www.hosted_zone_id
    evaluate_target_health = false
  }
}


resource "aws_s3_bucket" "redirect_www" {
  bucket = "www.siikli.fi"

  website {
    redirect_all_requests_to = "https://siikli.fi"
  }

  tags = {
    Name = "www.siikli.fi redirect"
  }
}

resource "aws_cloudfront_distribution" "redirect_www" {
  origin {
    domain_name = aws_s3_bucket.redirect_www.website_endpoint
    origin_id   = "www-redirect-origin"
    custom_origin_config {
      http_port              = 80
      https_port             = 443
      origin_protocol_policy = "http-only"
      origin_ssl_protocols   = ["TLSv1.2"]
    }
  }

  enabled             = true
  is_ipv6_enabled     = true
  default_root_object = ""

  default_cache_behavior {
    allowed_methods  = ["GET", "HEAD"]
    cached_methods   = ["GET", "HEAD"]
    target_origin_id = "www-redirect-origin"

    forwarded_values {
      query_string = false
      cookies {
        forward = "none"
      }
    }

    viewer_protocol_policy = "redirect-to-https"
    min_ttl                = 0
    default_ttl            = 0
    max_ttl                = 0
  }

  viewer_certificate {
    acm_certificate_arn = var.acm_certificate_arn  # Must cover www.siikli.fi
    ssl_support_method  = "sni-only"
  }

  restrictions {
    geo_restriction {
      restriction_type = "none"
    }
  }

  aliases = ["www.siikli.fi"]
}
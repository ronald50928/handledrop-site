terraform {
  required_version = ">= 1.5.0"
  required_providers {
    aws = {
      source  = "hashicorp/aws"
      version = "~> 5.0"
    }
  }
}

provider "aws" {
  region = var.region
}

# ACM for CloudFront must be in us-east-1
provider "aws" {
  alias  = "use1"
  region = "us-east-1"
}

data "aws_caller_identity" "current" {}

########################################
# S3 website bucket (public GET only)
########################################
resource "aws_s3_bucket" "site" {
  bucket        = "handledrop-site-${data.aws_caller_identity.current.account_id}"
  force_destroy = true
  tags = {
    Project     = "HandleDrop"
    Environment = "prod"
  }
}

resource "aws_s3_bucket_website_configuration" "site" {
  bucket = aws_s3_bucket.site.id
  index_document { suffix = "index.html" }
  error_document { key = "index.html" }
}

resource "aws_s3_bucket_public_access_block" "site" {
  bucket                  = aws_s3_bucket.site.id
  block_public_acls       = false
  block_public_policy     = false
  restrict_public_buckets = false
  ignore_public_acls      = false
}

resource "aws_s3_bucket_policy" "public_read" {
  bucket = aws_s3_bucket.site.id
  policy = jsonencode({
    Version = "2012-10-17",
    Statement = [
      {
        Sid       = "PublicReadGetObject",
        Effect    = "Allow",
        Principal = "*",
        Action    = ["s3:GetObject"],
        Resource  = ["${aws_s3_bucket.site.arn}/*"]
      }
    ]
  })
}

########################################
# Route53 Hosted Zone for handledrop.net
########################################
resource "aws_route53_zone" "root" {
  name = "handledrop.net"
}

########################################
# ACM certificate (us-east-1) + DNS validation
########################################
resource "aws_acm_certificate" "cert" {
  provider          = aws.use1
  domain_name       = "handledrop.net"
  validation_method = "DNS"
  subject_alternative_names = ["www.handledrop.net"]
  lifecycle { create_before_destroy = true }
}

locals {
  dvos = { for dvo in aws_acm_certificate.cert.domain_validation_options : dvo.domain_name => {
    name   = dvo.resource_record_name
    type   = dvo.resource_record_type
    record = dvo.resource_record_value
  } }
}

resource "aws_route53_record" "cert_validation" {
  for_each = local.dvos
  zone_id  = aws_route53_zone.root.zone_id
  name     = each.value.name
  type     = each.value.type
  ttl      = 60
  records  = [each.value.record]
}

resource "aws_acm_certificate_validation" "cert" {
  provider                = aws.use1
  certificate_arn         = aws_acm_certificate.cert.arn
  validation_record_fqdns = [for r in aws_route53_record.cert_validation : r.fqdn]
}

########################################
# CloudFront distribution (spa fallback)
########################################
resource "aws_cloudfront_distribution" "cdn" {
  enabled         = true
  is_ipv6_enabled = true
  comment         = "HandleDrop CDN"
  default_root_object = "index.html"
  wait_for_deployment = false

  aliases = var.use_acm ? ["handledrop.net", "www.handledrop.net"] : []

  origin {
    domain_name = aws_s3_bucket_website_configuration.site.website_endpoint
    origin_id   = "s3-website-origin"
    custom_origin_config {
      http_port              = 80
      https_port             = 443
      origin_protocol_policy = "http-only"
      origin_ssl_protocols   = ["TLSv1.2"]
    }
  }

  default_cache_behavior {
    allowed_methods  = ["GET", "HEAD", "OPTIONS"]
    cached_methods   = ["GET", "HEAD"]
    target_origin_id = "s3-website-origin"
    viewer_protocol_policy = "redirect-to-https"
    compress = true
    forwarded_values {
      query_string = false
      cookies { forward = "none" }
    }
  }

  price_class = "PriceClass_100"
  restrictions {
    geo_restriction {
      restriction_type = "none"
    }
  }

  viewer_certificate {
    cloudfront_default_certificate = var.use_acm ? false : true
    acm_certificate_arn            = var.use_acm ? aws_acm_certificate_validation.cert.certificate_arn : null
    ssl_support_method             = var.use_acm ? "sni-only" : null
    minimum_protocol_version       = var.use_acm ? "TLSv1.2_2021" : null
  }

  custom_error_response {
    error_code         = 404
    response_code      = 200
    response_page_path = "/index.html"
  }
  custom_error_response {
    error_code         = 403
    response_code      = 200
    response_page_path = "/index.html"
  }

}

########################################
# Route53 alias records to CloudFront
########################################
resource "aws_route53_record" "apex_a" {
  zone_id = aws_route53_zone.root.zone_id
  name    = "handledrop.net"
  type    = "A"
  alias {
    name                   = aws_cloudfront_distribution.cdn.domain_name
    zone_id                = aws_cloudfront_distribution.cdn.hosted_zone_id
    evaluate_target_health = false
  }
}

resource "aws_route53_record" "apex_aaaa" {
  zone_id = aws_route53_zone.root.zone_id
  name    = "handledrop.net"
  type    = "AAAA"
  alias {
    name                   = aws_cloudfront_distribution.cdn.domain_name
    zone_id                = aws_cloudfront_distribution.cdn.hosted_zone_id
    evaluate_target_health = false
  }
}

resource "aws_route53_record" "www_a" {
  zone_id = aws_route53_zone.root.zone_id
  name    = "www.handledrop.net"
  type    = "A"
  alias {
    name                   = aws_cloudfront_distribution.cdn.domain_name
    zone_id                = aws_cloudfront_distribution.cdn.hosted_zone_id
    evaluate_target_health = false
  }
}

resource "aws_route53_record" "www_aaaa" {
  zone_id = aws_route53_zone.root.zone_id
  name    = "www.handledrop.net"
  type    = "AAAA"
  alias {
    name                   = aws_cloudfront_distribution.cdn.domain_name
    zone_id                = aws_cloudfront_distribution.cdn.hosted_zone_id
    evaluate_target_health = false
  }
}

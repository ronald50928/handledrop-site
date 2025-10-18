output "website_endpoint" { value = aws_s3_bucket_website_configuration.site.website_endpoint }
output "cloudfront_domain_name" { value = aws_cloudfront_distribution.cdn.domain_name }
output "distribution_id" { value = aws_cloudfront_distribution.cdn.id }
output "route53_ns" { value = aws_route53_zone.root.name_servers }
output "apex_url" { value = "https://handledrop.net" }
output "bucket_name" { value = aws_s3_bucket.site.bucket }

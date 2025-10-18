# HandleDrop — Static Site + AWS Infra

Bold, 3‑page, static website for HandleDrop deployed on AWS (S3 + CloudFront + Route53). Includes a lightweight audio UX, a canvas background animation with reduced‑motion guard, and Terraform IaC for DNS/SSL/CDN setup.

## Pages
- `index.html` — Landing page and teasers
- `how-it-works.html` — Steps, security callout, roadmap
- `pricing.html` — Free vs Premium, FAQ

## Local Preview
Use any static file server, e.g.:

```bash
python3 -m http.server 8080
# then open http://localhost:8080
```

## Deploy
This repo includes Terraform for:
- S3 bucket (website endpoint)
- CloudFront distribution (SPA fallback to `index.html`)
- Route53 hosted zone and ALIAS records for `handledrop.net` and `www.handledrop.net`
 - ACM certificate (DNS validated in Route53) for custom domain on CloudFront

Scripted deploy:

```bash
./scripts/deploy_s3.sh
```

Prerequisites:
- Terraform >= 1.5
- AWS CLI v2 with credentials configured

Notes:
- After `terraform apply`, copy the four name servers from the `route53_ns` output into your Squarespace domain settings so Route53 becomes authoritative for `handledrop.net`. Propagation can take up to 48 hours.
- For lowest cost and simplicity, S3 website endpoint is used as the CloudFront origin (public GET only). All writes go through AWS-authenticated tooling.
- The output labeled `route53_ns` are the four authoritative nameservers. Update Squarespace nameservers to these four nameservers.

## Cost
Only S3 + CloudFront + Route53 + ACM (free). No WAF. No Lambda@Edge.

## Accessibility
- Mobile-first, semantic structure, proper landmarks
- Respects `prefers-reduced-motion` and never autoplays audio
- Focus outlines and skip link are enabled

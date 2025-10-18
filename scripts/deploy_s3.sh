#!/usr/bin/env bash
set -euo pipefail

REGION=${REGION:-us-east-1}

if ! command -v terraform >/dev/null 2>&1; then
  echo "Terraform is required. Install Terraform >= 1.5." >&2
  exit 1
fi
if ! command -v aws >/dev/null 2>&1; then
  echo "AWS CLI v2 is required. Install and configure credentials." >&2
  exit 1
fi

echo "Initializing and applying Terraform (this will create S3, CloudFront, Route53, ACM)..."
terraform -chdir=infra init -upgrade
terraform -chdir=infra apply -auto-approve -var "region=${REGION}"

BUCKET_NAME=$(terraform -chdir=infra output -raw bucket_name)
echo "Syncing site content to S3 bucket: ${BUCKET_NAME}..."
aws s3 sync . s3://${BUCKET_NAME} \
  --delete \
  --exclude "infra/*" --exclude "scripts/*" \
  --exclude "README.md" --exclude ".git/*" \
  --exclude "*.tf" --exclude "*.sh" \
  --cache-control "public,max-age=3600"

DIST_ID=$(terraform -chdir=infra output -raw distribution_id || true)
if [ -n "${DIST_ID}" ]; then
  echo "Creating CloudFront invalidation for distribution ${DIST_ID}..."
  aws cloudfront create-invalidation --distribution-id "${DIST_ID}" --paths "/*" >/dev/null || true
fi

echo
echo "Route53 NS set (add these at Squarespace for handledrop.net):"
terraform -chdir=infra output route53_ns
echo
echo "CloudFront domain: $(terraform -chdir=infra output -raw cloudfront_domain_name)"
echo "Open: https://handledrop.net (after DNS propagates)"

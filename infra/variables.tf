variable "region" {
  type    = string
  default = "us-east-1"
}

variable "use_acm" {
  description = "When true, attach ACM cert and custom aliases to CloudFront"
  type        = bool
  default     = false
}

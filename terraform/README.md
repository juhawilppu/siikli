# Terraform deployment

This directory contains Terraform configurations for deploying the infrastructure.

## Prerequisites

1. Install Terraform (version >= 1.5.0)
2. Install AWS CLI and configure credentials
3. Ensure you have appropriate AWS permissions

### Login to AWS to create resources for Terraform state management

- S3 bucket, like `siikli-terraform-state-prod`. Enable versioning.
- DynamoDB table named `siikli-terraform-locks`. Partition by `LockID` (string).

# Deployment

- Containers: ECS Fargate (eu-north-1)
- Database: Amazon RDS (PostgreSQL)
- Storage: S3 for PDF documents
- Provisioning: Terraform (modular structure under `terraform/`)

Deployments run automatically when the CI pipeline passes on the `main` branch.

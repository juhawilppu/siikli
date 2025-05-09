export TF_VAR_app_version=$(< version.txt)
terraform init -backend-config=backend-prod.hcl -reconfigure
terraform apply -var-file=envs/prod.tfvars --auto-approve

#!/bin/bash
# Script to deploy the application manually to production environment.
# GitHub pipeline is the preferred way to deploy, this script is for special situations only.

set -e
start=$(date +%s)

command -v docker >/dev/null 2>&1 || { echo >&2 "❌ Docker is not installed. Aborting."; exit 1; }
command -v aws >/dev/null 2>&1 || { echo >&2 "❌ AWS CLI is not installed. Aborting."; exit 1; }

echo "🔍 Running tests..."
npm run test || true

echo "🔍 Running linter..."
npm run lint:frontend
npm run lint:backend

echo "🔍 Formatting prisma schema..."
(
    cd backend
    npx prisma format
)

# Application version
version=$(date +%s)

echo "🏗️ Building frontend..."
(
    cd frontend
    npm run build
)

echo "🏗️ Building backend..."
(
    ECR_REPO=337909750746.dkr.ecr.eu-north-1.amazonaws.com/siikli-backend
    echo $version > terraform/version.txt
    docker build --platform linux/amd64 -f backend/Dockerfile -t siikli-backend:$version --build-arg VERSION=$version .
    docker tag siikli-backend:$version $ECR_REPO:$version
    aws ecr get-login-password --region eu-north-1 | docker login --username AWS --password-stdin $ECR_REPO
    docker push $ECR_REPO:$version
    echo "Pushed siikli-backend:$version to ECR"
)

echo "🚀 Deploying frontend..."
(
    cd frontend
    aws s3 sync ./dist/ s3://app.siikli.fi --delete
)

echo "🚀 Deploying backend..."
(
    cd terraform
    ./deploy_to_prod.sh
)

end=$(date +%s)
echo "--------------------------------"
echo "🎉 Deployment complete!"
echo "📦 Application version: $version"
echo "🌐 Environment: https://app.siikli.fi"
echo "🕒 Total time: $((end - start))s"

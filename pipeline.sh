cd frontend
npm run build
aws s3 sync ./dist/ s3://v2.siikli.fi --delete
cd ..

export version=$(date +%s)
docker build --platform linux/amd64 -t siikli-backend:$version .
# docker run --platform linux/arm64 -e DATABASE_URL="postgresql://siikli:testpassword@host.docker.internal:5432/siikli" -p 3033:3033 siikli-backend:$version
docker tag siikli-backend:$version 337909750746.dkr.ecr.eu-north-1.amazonaws.com/siikli-backend:$version

aws ecr get-login-password --region eu-north-1 | docker login --username AWS --password-stdin 337909750746.dkr.ecr.eu-north-1.amazonaws.com

docker push 337909750746.dkr.ecr.eu-north-1.amazonaws.com/siikli-backend:$version

echo "Pushed siikli-backend:$version to ECR"

cd terraform
./deploy_to_prod.sh

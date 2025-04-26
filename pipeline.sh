cd frontend
npm run build
aws s3 sync ./dist/ s3://v2.siikli.fi --delete


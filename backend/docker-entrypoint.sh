#!/bin/sh

echo "Starting Siikli backend..."

echo "Deploying database migrations..."
npx prisma migrate deploy

echo "Database ready, starting server..."

npm run start
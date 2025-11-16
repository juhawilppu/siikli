#!/bin/bash
set -e

echo "Installing backend deps (shallow)…"
cd backend
npm install --install-strategy=shallow
npm install -D dotenv-cli
npm run prisma:generate
cd ..

echo "Installing root deps…"
npm install

echo "Building shared packages…"
npm run build:packages

echo "Running DB migrations…"
npm run migrate

echo "Setup complete"

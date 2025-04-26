#!/bin/sh

echo "Starting Siikli backend..."

# Wait for the database to be ready
echo "Waiting for database to be ready..."

npm run db:migrate

echo "Database ready, starting server..."

npm run start
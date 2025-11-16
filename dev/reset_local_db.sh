#!/bin/bash
# WARNING: DESTRUCTIVE SCRIPT

set -e

cd backend
npx prisma format
npx prisma migrate reset -f

npm i -D tsx

# Example for adding new migrations
# npx prisma migrate dev --name rename_company_settings_columns

# Verify consistency
npx tsx ./src/dev/verify-history-tables.ts

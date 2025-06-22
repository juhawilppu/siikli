set -e

npx prisma format
npx prisma migrate reset -f
# npx prisma migrate deploy

npm i -D tsx
# npx prisma migrate dev --name rename_company_settings_columns

npx tsx ./src/dev/verify-history-tables.ts

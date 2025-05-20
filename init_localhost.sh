npx prisma migrate reset -f
npm i -D tsx
#npx prisma migrate dev --name rename_company_settings_columns

npx tsx ./src/dev/verify-history-tables.ts

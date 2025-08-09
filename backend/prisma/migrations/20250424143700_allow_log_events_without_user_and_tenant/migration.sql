-- DropForeignKey
ALTER TABLE "log" DROP CONSTRAINT "log_tenantId_fkey";

-- DropForeignKey
ALTER TABLE "log" DROP CONSTRAINT "log_userId_fkey";

-- AlterTable
ALTER TABLE "log" ALTER COLUMN "userId" DROP NOT NULL,
ALTER COLUMN "tenantId" DROP NOT NULL;

-- AddForeignKey
ALTER TABLE "log" ADD CONSTRAINT "log_userId_fkey" FOREIGN KEY ("userId") REFERENCES "user"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "log" ADD CONSTRAINT "log_tenantId_fkey" FOREIGN KEY ("tenantId") REFERENCES "tenant"("id") ON DELETE SET NULL ON UPDATE CASCADE;

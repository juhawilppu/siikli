/*
  Warnings:

  - You are about to drop the column `createdAt` on the `EmailLoginPinCode` table. All the data in the column will be lost.
  - You are about to drop the column `pinCode` on the `EmailLoginPinCode` table. All the data in the column will be lost.
  - You are about to drop the column `tenantId` on the `customer` table. All the data in the column will be lost.
  - You are about to drop the column `createdAt` on the `log` table. All the data in the column will be lost.
  - You are about to drop the column `tenantId` on the `log` table. All the data in the column will be lost.
  - You are about to drop the column `userId` on the `log` table. All the data in the column will be lost.
  - You are about to drop the column `tenantId` on the `order` table. All the data in the column will be lost.
  - You are about to drop the column `tenantId` on the `product` table. All the data in the column will be lost.
  - You are about to drop the column `tenantId` on the `product_subtype` table. All the data in the column will be lost.
  - You are about to drop the column `tenantId` on the `product_type` table. All the data in the column will be lost.
  - You are about to drop the column `createdAt` on the `rate_limit` table. All the data in the column will be lost.
  - You are about to drop the column `googleExternalId` on the `user` table. All the data in the column will be lost.
  - You are about to drop the column `marketingConsent` on the `user` table. All the data in the column will be lost.
  - You are about to drop the column `tenantId` on the `user` table. All the data in the column will be lost.
  - A unique constraint covering the columns `[google_external_id]` on the table `user` will be added. If there are existing duplicate values, this will fail.
  - Added the required column `pin_code` to the `EmailLoginPinCode` table without a default value. This is not possible if the table is not empty.
  - Added the required column `tenant_id` to the `customer` table without a default value. This is not possible if the table is not empty.
  - Added the required column `tenant_id` to the `order` table without a default value. This is not possible if the table is not empty.
  - Added the required column `tenant_id` to the `product` table without a default value. This is not possible if the table is not empty.
  - Added the required column `tenant_id` to the `product_subtype` table without a default value. This is not possible if the table is not empty.
  - Added the required column `tenant_id` to the `product_type` table without a default value. This is not possible if the table is not empty.
  - Added the required column `tenant_id` to the `user` table without a default value. This is not possible if the table is not empty.

*/
-- DropForeignKey
ALTER TABLE "customer" DROP CONSTRAINT "customer_tenantId_fkey";

-- DropForeignKey
ALTER TABLE "log" DROP CONSTRAINT "log_tenantId_fkey";

-- DropForeignKey
ALTER TABLE "log" DROP CONSTRAINT "log_userId_fkey";

-- DropForeignKey
ALTER TABLE "order" DROP CONSTRAINT "order_tenantId_fkey";

-- DropForeignKey
ALTER TABLE "product" DROP CONSTRAINT "product_tenantId_fkey";

-- DropForeignKey
ALTER TABLE "product_subtype" DROP CONSTRAINT "product_subtype_tenantId_fkey";

-- DropForeignKey
ALTER TABLE "product_type" DROP CONSTRAINT "product_type_tenantId_fkey";

-- DropForeignKey
ALTER TABLE "user" DROP CONSTRAINT "user_tenantId_fkey";

-- DropIndex
DROP INDEX "user_googleExternalId_key";

-- AlterTable
ALTER TABLE "EmailLoginPinCode" DROP COLUMN "createdAt",
DROP COLUMN "pinCode",
ADD COLUMN     "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
ADD COLUMN     "pin_code" TEXT NOT NULL;

-- AlterTable
ALTER TABLE "customer" DROP COLUMN "tenantId",
ADD COLUMN     "tenant_id" UUID NOT NULL;

-- AlterTable
ALTER TABLE "log" DROP COLUMN "createdAt",
DROP COLUMN "tenantId",
DROP COLUMN "userId",
ADD COLUMN     "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
ADD COLUMN     "tenant_id" UUID,
ADD COLUMN     "user_id" UUID;

-- AlterTable
ALTER TABLE "order" DROP COLUMN "tenantId",
ADD COLUMN     "tenant_id" UUID NOT NULL;

-- AlterTable
ALTER TABLE "product" DROP COLUMN "tenantId",
ADD COLUMN     "tenant_id" UUID NOT NULL;

-- AlterTable
ALTER TABLE "product_subtype" DROP COLUMN "tenantId",
ADD COLUMN     "tenant_id" UUID NOT NULL;

-- AlterTable
ALTER TABLE "product_type" DROP COLUMN "tenantId",
ADD COLUMN     "tenant_id" UUID NOT NULL;

-- AlterTable
ALTER TABLE "rate_limit" DROP COLUMN "createdAt",
ADD COLUMN     "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP;

-- AlterTable
ALTER TABLE "user" DROP COLUMN "googleExternalId",
DROP COLUMN "marketingConsent",
DROP COLUMN "tenantId",
ADD COLUMN     "google_external_id" VARCHAR(128),
ADD COLUMN     "marketing_consent" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "tenant_id" UUID NOT NULL;

-- CreateIndex
CREATE UNIQUE INDEX "user_google_external_id_key" ON "user"("google_external_id");

-- AddForeignKey
ALTER TABLE "user" ADD CONSTRAINT "user_tenant_id_fkey" FOREIGN KEY ("tenant_id") REFERENCES "tenant"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "customer" ADD CONSTRAINT "customer_tenant_id_fkey" FOREIGN KEY ("tenant_id") REFERENCES "tenant"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "product_type" ADD CONSTRAINT "product_type_tenant_id_fkey" FOREIGN KEY ("tenant_id") REFERENCES "tenant"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "product" ADD CONSTRAINT "product_tenant_id_fkey" FOREIGN KEY ("tenant_id") REFERENCES "tenant"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "order" ADD CONSTRAINT "order_tenant_id_fkey" FOREIGN KEY ("tenant_id") REFERENCES "tenant"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "product_subtype" ADD CONSTRAINT "product_subtype_tenant_id_fkey" FOREIGN KEY ("tenant_id") REFERENCES "tenant"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "log" ADD CONSTRAINT "log_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "user"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "log" ADD CONSTRAINT "log_tenant_id_fkey" FOREIGN KEY ("tenant_id") REFERENCES "tenant"("id") ON DELETE SET NULL ON UPDATE CASCADE;

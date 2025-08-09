/*
  Warnings:

  - Added the required column `tenantId` to the `product_subtype` table without a default value. This is not possible if the table is not empty.
  - Added the required column `tenantId` to the `product_type` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "product_subtype" ADD COLUMN     "tenantId" UUID NOT NULL;

-- AlterTable
ALTER TABLE "product_type" ADD COLUMN     "tenantId" UUID NOT NULL;

-- AddForeignKey
ALTER TABLE "product_type" ADD CONSTRAINT "product_type_tenantId_fkey" FOREIGN KEY ("tenantId") REFERENCES "tenant"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "product_subtype" ADD CONSTRAINT "product_subtype_tenantId_fkey" FOREIGN KEY ("tenantId") REFERENCES "tenant"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

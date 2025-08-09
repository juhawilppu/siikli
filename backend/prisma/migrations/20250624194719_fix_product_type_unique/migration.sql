/*
  Warnings:

  - A unique constraint covering the columns `[type,subtype,tenant_id]` on the table `product_subtype` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[type,tenant_id]` on the table `product_type` will be added. If there are existing duplicate values, this will fail.

*/
-- DropIndex
DROP INDEX "product_subtype_uniq";

-- CreateIndex
CREATE UNIQUE INDEX "product_subtype_uniq" ON "product_subtype"("type", "subtype", "tenant_id");

-- CreateIndex
CREATE UNIQUE INDEX "product_type_uniq" ON "product_type"("type", "tenant_id");

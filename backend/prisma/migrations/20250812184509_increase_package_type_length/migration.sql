/*
  Warnings:

  - You are about to alter the column `name` on the `package_type` table. The data in that column could be lost. The data in that column will be cast from `VarChar(255)` to `VarChar(16)`.
  - You are about to alter the column `name` on the `package_type_history` table. The data in that column could be lost. The data in that column will be cast from `VarChar(255)` to `VarChar(16)`.
  - You are about to alter the column `package_type` on the `product` table. The data in that column could be lost. The data in that column will be cast from `VarChar(255)` to `VarChar(16)`.
  - You are about to alter the column `package_type` on the `product_history` table. The data in that column could be lost. The data in that column will be cast from `VarChar(255)` to `VarChar(16)`.

*/
-- AlterTable
ALTER TABLE "order_row" ALTER COLUMN "package_type" SET DATA TYPE VARCHAR(16);
ALTER TABLE "order_row_history" ALTER COLUMN "package_type" SET DATA TYPE VARCHAR(16);

-- AlterTable
ALTER TABLE "package_type" ALTER COLUMN "name" SET DATA TYPE VARCHAR(16);

-- AlterTable
ALTER TABLE "package_type_history" ALTER COLUMN "name" SET DATA TYPE VARCHAR(16);

-- AlterTable
ALTER TABLE "product" ALTER COLUMN "package_type" SET DATA TYPE VARCHAR(16);

-- AlterTable
ALTER TABLE "product_history" ALTER COLUMN "package_type" SET DATA TYPE VARCHAR(16);

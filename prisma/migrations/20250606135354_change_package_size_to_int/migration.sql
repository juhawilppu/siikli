/*
  Warnings:

  - The `package_size` column on the `product` table would be dropped and recreated. This will lead to data loss if there is data in the column.
  - The `package_size` column on the `product_history` table would be dropped and recreated. This will lead to data loss if there is data in the column.

*/
-- AlterTable
ALTER TABLE "product" DROP COLUMN "package_size",
ADD COLUMN     "package_size" INTEGER;

-- AlterTable
ALTER TABLE "product_history" DROP COLUMN "package_size",
ADD COLUMN     "package_size" INTEGER;

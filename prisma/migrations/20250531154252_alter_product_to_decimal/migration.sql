/*
  Warnings:

  - You are about to alter the column `price` on the `product` table. The data in that column could be lost. The data in that column will be cast from `DoublePrecision` to `Decimal(10,2)`.
  - You are about to alter the column `price0` on the `product` table. The data in that column could be lost. The data in that column will be cast from `DoublePrecision` to `Decimal(10,2)`.
  - You are about to alter the column `price` on the `product_history` table. The data in that column could be lost. The data in that column will be cast from `DoublePrecision` to `Decimal(10,2)`.
  - You are about to alter the column `price0` on the `product_history` table. The data in that column could be lost. The data in that column will be cast from `DoublePrecision` to `Decimal(10,2)`.

*/
-- AlterTable
ALTER TABLE "product" ALTER COLUMN "price" SET DATA TYPE DECIMAL(10,2),
ALTER COLUMN "price0" DROP DEFAULT,
ALTER COLUMN "price0" SET DATA TYPE DECIMAL(10,2);

-- AlterTable
ALTER TABLE "product_history" ALTER COLUMN "price" SET DATA TYPE DECIMAL(10,2),
ALTER COLUMN "price0" SET DATA TYPE DECIMAL(10,2);

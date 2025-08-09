/*
  Warnings:

  - You are about to alter the column `discount` on the `customer` table. The data in that column could be lost. The data in that column will be cast from `DoublePrecision` to `Decimal(65,30)`.
  - You are about to alter the column `discount` on the `customer_history` table. The data in that column could be lost. The data in that column will be cast from `DoublePrecision` to `Decimal(65,30)`.
  - You are about to drop the `InvoiceHistory` table. If the table is not empty, all the data it contains will be lost.

*/
-- AlterTable
ALTER TABLE "customer" ALTER COLUMN "discount" DROP DEFAULT,
ALTER COLUMN "discount" SET DATA TYPE DECIMAL(10,2);

-- AlterTable
ALTER TABLE "customer_history" ALTER COLUMN "show_price_without_tax" DROP DEFAULT,
ALTER COLUMN "created_at" DROP DEFAULT,
ALTER COLUMN "updated_at" DROP DEFAULT,
ALTER COLUMN "discount" DROP DEFAULT,
ALTER COLUMN "discount" SET DATA TYPE DECIMAL(10,2);

-- DropTable
DROP TABLE "InvoiceHistory";

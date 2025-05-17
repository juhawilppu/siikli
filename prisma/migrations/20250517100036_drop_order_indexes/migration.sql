/*
  Warnings:

  - You are about to drop the column `order_index` on the `customer` table. All the data in the column will be lost.
  - You are about to drop the column `order_index` on the `product` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "customer" DROP COLUMN "order_index";

-- AlterTable
ALTER TABLE "product" DROP COLUMN "order_index";

/*
  Warnings:

  - Made the column `show_price_without_tax` on table `customer` required. This step will fail if there are existing NULL values in that column.

*/
-- AlterTable
ALTER TABLE "customer" ALTER COLUMN "show_price_without_tax" SET NOT NULL;

/*
  Warnings:

  - Made the column `name` on table `tenant` required. This step will fail if there are existing NULL values in that column.

*/
-- AlterTable
ALTER TABLE "tenant" ALTER COLUMN "name" SET NOT NULL;

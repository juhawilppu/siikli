/*
  Warnings:

  - You are about to drop the column `externalId` on the `user` table. All the data in the column will be lost.
  - You are about to drop the column `name` on the `user` table. All the data in the column will be lost.
  - A unique constraint covering the columns `[googleExternalId]` on the table `user` will be added. If there are existing duplicate values, this will fail.

*/
-- DropIndex
DROP INDEX "user_externalId_key";

-- AlterTable
ALTER TABLE "user" DROP COLUMN "externalId",
DROP COLUMN "name",
ADD COLUMN     "googleExternalId" VARCHAR(128);

-- CreateIndex
CREATE UNIQUE INDEX "user_googleExternalId_key" ON "user"("googleExternalId");

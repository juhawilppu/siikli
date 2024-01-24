-- AlterTable
ALTER TABLE `customers` ADD COLUMN `tenantId` INTEGER NOT NULL DEFAULT 1;

-- AlterTable
ALTER TABLE `orders` ADD COLUMN `tenantId` INTEGER NOT NULL DEFAULT 1;

-- AddForeignKey
ALTER TABLE `customers` ADD CONSTRAINT `customers_tenantId_fkey` FOREIGN KEY (`tenantId`) REFERENCES `company`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `orders` ADD CONSTRAINT `orders_tenantId_fkey` FOREIGN KEY (`tenantId`) REFERENCES `company`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

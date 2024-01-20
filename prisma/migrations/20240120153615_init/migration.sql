-- CreateTable
CREATE TABLE `company` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `address1` VARCHAR(255) NULL,
    `address2` VARCHAR(255) NULL,
    `business_id` VARCHAR(255) NULL,
    `company_name` VARCHAR(255) NULL,
    `invoice_bank_name` VARCHAR(255) NULL,
    `invoice_bank_number` VARCHAR(255) NULL,
    `invoice_reference` VARCHAR(255) NULL,
    `invoice_sum_row` VARCHAR(255) NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `customers` (
    `customer_id` INTEGER NOT NULL AUTO_INCREMENT,
    `chain` VARCHAR(3) NOT NULL,
    `name` VARCHAR(50) NOT NULL,
    `address` VARCHAR(255) NULL,
    `compensation` DOUBLE NOT NULL,
    `reference` VARCHAR(255) NULL,
    `company_name` VARCHAR(255) NULL,
    `order_index` INTEGER NULL,
    `city` VARCHAR(255) NULL,
    `email` VARCHAR(255) NULL,
    `phone` VARCHAR(255) NULL,
    `postal_code` VARCHAR(5) NULL,
    `address2` VARCHAR(255) NULL,
    `business_id` VARCHAR(255) NULL,
    `customer_group` VARCHAR(256) NULL,
    `show_price_without_tax` BOOLEAN NULL DEFAULT false,

    PRIMARY KEY (`customer_id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `order_product` (
    `order_product_id` INTEGER NOT NULL AUTO_INCREMENT,
    `order_id` INTEGER NOT NULL,
    `product_id` INTEGER NOT NULL,
    `amount` INTEGER NOT NULL,
    `price` FLOAT NOT NULL,
    `package_size` INTEGER NOT NULL,
    `freetext` VARCHAR(500) NULL,
    `package_type` VARCHAR(3) NULL,
    `price0` FLOAT NOT NULL DEFAULT 0,

    INDEX `FKo6helt0ucmegaeachjpx40xhe`(`product_id`),
    PRIMARY KEY (`order_product_id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `product_types` (
    `product_order_index` INTEGER NOT NULL AUTO_INCREMENT,
    `order_index` INTEGER NOT NULL,
    `type` VARCHAR(255) NULL,

    UNIQUE INDEX `product_types_uniq`(`type`),
    PRIMARY KEY (`product_order_index`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `products` (
    `product_id` INTEGER NOT NULL AUTO_INCREMENT,
    `name` VARCHAR(50) NOT NULL,
    `type` VARCHAR(20) NOT NULL,
    `variety` VARCHAR(20) NOT NULL,
    `info` VARCHAR(20) NULL,
    `price` FLOAT NOT NULL,
    `order_index` INTEGER NULL,
    `subtype` VARCHAR(255) NULL,
    `package_size` VARCHAR(255) NULL,
    `package_type` VARCHAR(255) NULL,
    `price0` FLOAT NOT NULL DEFAULT 0,
    `customer_group` VARCHAR(256) NULL,
    `active` BOOLEAN NULL DEFAULT true,

    PRIMARY KEY (`product_id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `orders` (
    `order_id` INTEGER NOT NULL AUTO_INCREMENT,
    `customer_id` INTEGER NOT NULL,
    `delivery_date` DATE NOT NULL,
    `has_note` BIT(1) NOT NULL,
    `note_body` VARCHAR(1000) NULL,
    `note_header` VARCHAR(255) NULL,
    `show_price_without_tax` BOOLEAN NULL DEFAULT false,
    `customer_group` VARCHAR(256) NULL,

    UNIQUE INDEX `order_id`(`order_id`),
    INDEX `customer_id`(`customer_id`),
    PRIMARY KEY (`order_id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `product_subtypes` (
    `subtype_index` INTEGER NOT NULL AUTO_INCREMENT,
    `order_index` INTEGER NOT NULL,
    `subtype` VARCHAR(255) NULL,
    `type` VARCHAR(255) NULL,
    `order_id` INTEGER NULL,

    INDEX `FKgyv4ku1m3s5hid3clootvtqcv`(`order_id`),
    UNIQUE INDEX `product_subtypes_uniq`(`type`, `subtype`),
    PRIMARY KEY (`subtype_index`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- AddForeignKey
ALTER TABLE `order_product` ADD CONSTRAINT `FKo6helt0ucmegaeachjpx40xhe` FOREIGN KEY (`product_id`) REFERENCES `products`(`product_id`) ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE `orders` ADD CONSTRAINT `FKpxtb8awmi0dk6smoh2vp1litg` FOREIGN KEY (`customer_id`) REFERENCES `customers`(`customer_id`) ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE `product_subtypes` ADD CONSTRAINT `FKgyv4ku1m3s5hid3clootvtqcv` FOREIGN KEY (`order_id`) REFERENCES `product_types`(`product_order_index`) ON DELETE NO ACTION ON UPDATE NO ACTION;

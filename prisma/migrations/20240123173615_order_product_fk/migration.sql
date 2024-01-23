-- AddForeignKey
ALTER TABLE `order_product` ADD CONSTRAINT `order_product_order_id_fkey` FOREIGN KEY (`order_id`) REFERENCES `orders`(`order_id`) ON DELETE RESTRICT ON UPDATE CASCADE;

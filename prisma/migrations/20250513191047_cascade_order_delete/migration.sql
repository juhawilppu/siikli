-- DropForeignKey
ALTER TABLE "order_product" DROP CONSTRAINT "order_product_order_id_fkey";

-- AddForeignKey
ALTER TABLE "order_product" ADD CONSTRAINT "order_product_order_id_fkey" FOREIGN KEY ("order_id") REFERENCES "order"("id") ON DELETE CASCADE ON UPDATE CASCADE;

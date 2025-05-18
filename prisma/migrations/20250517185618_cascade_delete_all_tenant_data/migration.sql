-- DropForeignKey
ALTER TABLE "customer" DROP CONSTRAINT "customer_tenant_id_fkey";

-- DropForeignKey
ALTER TABLE "log" DROP CONSTRAINT "log_tenant_id_fkey";

-- DropForeignKey
ALTER TABLE "log" DROP CONSTRAINT "log_user_id_fkey";

-- DropForeignKey
ALTER TABLE "order" DROP CONSTRAINT "order_customer_id_fkey";

-- DropForeignKey
ALTER TABLE "order" DROP CONSTRAINT "order_tenant_id_fkey";

-- DropForeignKey
ALTER TABLE "order_product" DROP CONSTRAINT "FKo6helt0ucmegaeachjpx40xhe";

-- DropForeignKey
ALTER TABLE "order_product" DROP CONSTRAINT "order_product_tenant_id_fkey";

-- DropForeignKey
ALTER TABLE "package_size" DROP CONSTRAINT "package_size_tenant_id_fkey";

-- DropForeignKey
ALTER TABLE "package_type" DROP CONSTRAINT "package_type_tenant_id_fkey";

-- DropForeignKey
ALTER TABLE "product" DROP CONSTRAINT "product_tenant_id_fkey";

-- DropForeignKey
ALTER TABLE "product_subtype" DROP CONSTRAINT "product_subtype_order_id_fkey";

-- DropForeignKey
ALTER TABLE "product_subtype" DROP CONSTRAINT "product_subtype_tenant_id_fkey";

-- DropForeignKey
ALTER TABLE "product_type" DROP CONSTRAINT "product_type_tenant_id_fkey";

-- DropForeignKey
ALTER TABLE "user" DROP CONSTRAINT "user_tenant_id_fkey";

-- AddForeignKey
ALTER TABLE "user" ADD CONSTRAINT "user_tenant_id_fkey" FOREIGN KEY ("tenant_id") REFERENCES "tenant"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "customer" ADD CONSTRAINT "customer_tenant_id_fkey" FOREIGN KEY ("tenant_id") REFERENCES "tenant"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "order_product" ADD CONSTRAINT "order_product_tenant_id_fkey" FOREIGN KEY ("tenant_id") REFERENCES "tenant"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "order_product" ADD CONSTRAINT "order_product_product_id_fkey" FOREIGN KEY ("product_id") REFERENCES "product"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "product_type" ADD CONSTRAINT "product_type_tenant_id_fkey" FOREIGN KEY ("tenant_id") REFERENCES "tenant"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "product" ADD CONSTRAINT "product_tenant_id_fkey" FOREIGN KEY ("tenant_id") REFERENCES "tenant"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "order" ADD CONSTRAINT "order_customer_id_fkey" FOREIGN KEY ("customer_id") REFERENCES "customer"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "order" ADD CONSTRAINT "order_tenant_id_fkey" FOREIGN KEY ("tenant_id") REFERENCES "tenant"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "product_subtype" ADD CONSTRAINT "product_subtype_tenant_id_fkey" FOREIGN KEY ("tenant_id") REFERENCES "tenant"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "product_subtype" ADD CONSTRAINT "product_subtype_order_id_fkey" FOREIGN KEY ("order_id") REFERENCES "product_type"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "log" ADD CONSTRAINT "log_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "user"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "log" ADD CONSTRAINT "log_tenant_id_fkey" FOREIGN KEY ("tenant_id") REFERENCES "tenant"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "package_type" ADD CONSTRAINT "package_type_tenant_id_fkey" FOREIGN KEY ("tenant_id") REFERENCES "tenant"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "package_size" ADD CONSTRAINT "package_size_tenant_id_fkey" FOREIGN KEY ("tenant_id") REFERENCES "tenant"("id") ON DELETE CASCADE ON UPDATE CASCADE;

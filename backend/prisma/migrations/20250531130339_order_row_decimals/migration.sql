/*
  Warnings:

  - You are about to drop the `order_product` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `order_product_history` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropForeignKey
ALTER TABLE "order_product" DROP CONSTRAINT "order_product_order_id_fkey";

-- DropForeignKey
ALTER TABLE "order_product" DROP CONSTRAINT "order_product_product_id_fkey";

-- DropForeignKey
ALTER TABLE "order_product" DROP CONSTRAINT "order_product_tenant_id_fkey";

-- DropTable
DROP TABLE "order_product";

-- DropTable
DROP TABLE "order_product_history";

-- CreateTable
CREATE TABLE "order_row" (
    "id" UUID NOT NULL,
    "order_id" UUID NOT NULL,
    "tenant_id" UUID NOT NULL,
    "product_id" UUID NOT NULL,
    "amount" DECIMAL(10,2) NOT NULL,
    "price" DECIMAL(10,2) NOT NULL,
    "price0" DECIMAL(10,2) NOT NULL,
    "package_size" INTEGER NOT NULL,
    "freetext" VARCHAR(500),
    "package_type" VARCHAR(3),
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "order_row_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "order_row_history" (
    "revision" SERIAL NOT NULL,
    "operation" TEXT NOT NULL,
    "id" UUID NOT NULL,
    "order_id" UUID NOT NULL,
    "tenant_id" UUID NOT NULL,
    "product_id" UUID NOT NULL,
    "amount" DECIMAL(10,2) NOT NULL,
    "price" DECIMAL(10,2) NOT NULL,
    "price0" DECIMAL(10,2) NOT NULL,
    "package_size" INTEGER NOT NULL,
    "freetext" VARCHAR(500),
    "package_type" VARCHAR(3),
    "created_at" TIMESTAMP(3) NOT NULL,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "order_row_history_pkey" PRIMARY KEY ("revision")
);

-- CreateIndex
CREATE INDEX "order_row_tenant_id_idx" ON "order_row"("tenant_id");

-- AddForeignKey
ALTER TABLE "order_row" ADD CONSTRAINT "order_row_tenant_id_fkey" FOREIGN KEY ("tenant_id") REFERENCES "tenant"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "order_row" ADD CONSTRAINT "order_row_product_id_fkey" FOREIGN KEY ("product_id") REFERENCES "product"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "order_row" ADD CONSTRAINT "order_row_order_id_fkey" FOREIGN KEY ("order_id") REFERENCES "order"("id") ON DELETE CASCADE ON UPDATE CASCADE;

DROP TRIGGER IF EXISTS order_row_history_trigger ON "order_row";

CREATE OR REPLACE FUNCTION order_row_history_trigger_func() RETURNS trigger AS $body$
BEGIN
    if (TG_OP = 'INSERT' or TG_OP = 'UPDATE') then
        INSERT INTO order_row_history (
        updated_at,
        order_id,
        tenant_id,
        product_id,
        amount,
        price,
        price0,
        package_size,
        created_at,
        id,
        freetext,
        package_type,
        operation
        )
        VALUES (
            NEW.updated_at,
           NEW.order_id,
           NEW.tenant_id,
           NEW.product_id,
           NEW.amount,
           NEW.price,
           NEW.price0,
           NEW.package_size,
           NEW.created_at,
           NEW.id,
           NEW.freetext,
           NEW.package_type,
            TG_OP
        );

        RETURN NEW;
    elsif (TG_OP = 'DELETE') then
        INSERT INTO order_row_history (
        updated_at,
        order_id,
        tenant_id,
        product_id,
        amount,
        price,
        price0,
        package_size,
        created_at,
        id,
        freetext,
        package_type,
        operation
        )
        VALUES (
            OLD.updated_at,
           OLD.order_id,
           OLD.tenant_id,
           OLD.product_id,
           OLD.amount,
           OLD.price,
           OLD.price0,
           OLD.package_size,
           OLD.created_at,
           OLD.id,
           OLD.freetext,
           OLD.package_type,
            'DELETE'
        );
        RETURN OLD;
    end if;

END;
$body$
LANGUAGE plpgsql;

CREATE TRIGGER order_row_history_trigger
AFTER INSERT OR UPDATE OR DELETE ON "order_row"
FOR EACH ROW EXECUTE FUNCTION order_row_history_trigger_func();
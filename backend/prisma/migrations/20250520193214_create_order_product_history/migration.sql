-- CreateTable
CREATE TABLE "order_product_history" (
    "revision" SERIAL NOT NULL,
    "operation" TEXT NOT NULL,
    "id" UUID NOT NULL,
    "order_id" UUID NOT NULL,
    "tenant_id" UUID NOT NULL,
    "product_id" UUID NOT NULL,
    "amount" INTEGER NOT NULL,
    "price" DOUBLE PRECISION NOT NULL,
    "package_size" INTEGER NOT NULL,
    "freetext" VARCHAR(500),
    "package_type" VARCHAR(3),
    "price0" DOUBLE PRECISION NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "order_product_history_pkey" PRIMARY KEY ("revision")
);

-- AlterTable
ALTER TABLE "order_product" ADD COLUMN     "updated_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP;

-- AlterTable
ALTER TABLE "order_product_history" ADD COLUMN     "updated_at" TIMESTAMP(3) NOT NULL;

DROP TRIGGER IF EXISTS order_product_history_trigger ON "order_product";

CREATE OR REPLACE FUNCTION order_product_history_trigger_func() RETURNS trigger AS $body$
BEGIN
    if (TG_OP = 'INSERT' or TG_OP = 'UPDATE') then
        INSERT INTO order_product_history (
        id,
        order_id,
        product_id,
        amount,
        price,
        package_size,
        tenant_id,
        updated_at,
        price0,
        created_at,
        freetext,
        package_type,
        operation
        )
        VALUES (
            NEW.id,
           NEW.order_id,
           NEW.product_id,
           NEW.amount,
           NEW.price,
           NEW.package_size,
           NEW.tenant_id,
           NEW.updated_at,
           NEW.price0,
           NEW.created_at,
           NEW.freetext,
           NEW.package_type,
            TG_OP
        );

        RETURN NEW;
    elsif (TG_OP = 'DELETE') then
        INSERT INTO order_product_history (
        id,
        order_id,
        product_id,
        amount,
        price,
        package_size,
        tenant_id,
        updated_at,
        price0,
        created_at,
        freetext,
        package_type,
        operation
        )
        VALUES (
            OLD.id,
           OLD.order_id,
           OLD.product_id,
           OLD.amount,
           OLD.price,
           OLD.package_size,
           OLD.tenant_id,
           OLD.updated_at,
           OLD.price0,
           OLD.created_at,
           OLD.freetext,
           OLD.package_type,
            'DELETE'
        );
        RETURN OLD;
    end if;

END;
$body$
LANGUAGE plpgsql;

CREATE TRIGGER order_product_history_trigger
AFTER INSERT OR UPDATE OR DELETE ON "order_product"
FOR EACH ROW EXECUTE FUNCTION order_product_history_trigger_func();
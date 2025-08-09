-- AlterTable
ALTER TABLE "customer" ADD COLUMN     "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
ADD COLUMN     "updated_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP;

-- CreateTable
CREATE TABLE "customer_history" (
    "revision" SERIAL NOT NULL,
    "operation" TEXT NOT NULL,
    "id" UUID NOT NULL,
    "chain" VARCHAR(32) NOT NULL,
    "name" VARCHAR(50) NOT NULL,
    "address" VARCHAR(255),
    "compensation" DOUBLE PRECISION NOT NULL,
    "reference" VARCHAR(255),
    "company_name" VARCHAR(255),
    "city" VARCHAR(255),
    "email" VARCHAR(255),
    "phone" VARCHAR(255),
    "postal_code" VARCHAR(5),
    "address2" VARCHAR(255),
    "business_id" VARCHAR(255),
    "customer_group" VARCHAR(256),
    "show_price_without_tax" BOOLEAN NOT NULL,
    "tenant_id" UUID NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "customer_history_pkey" PRIMARY KEY ("revision")
);

DROP TRIGGER IF EXISTS customer_history_trigger ON "customer";

CREATE OR REPLACE FUNCTION customer_history_trigger_func() RETURNS trigger AS $body$
BEGIN
    if (TG_OP = 'INSERT' or TG_OP = 'UPDATE') then
        INSERT INTO customer_history (
        id,
        compensation,
        show_price_without_tax,
        tenant_id,
        created_at,
        updated_at,
        company_name,
        city,
        email,
        phone,
        postal_code,
        address2,
        business_id,
        chain,
        name,
        address,
        customer_group,
        reference,
        operation
        )
        VALUES (
            NEW.id,
           NEW.compensation,
           NEW.show_price_without_tax,
           NEW.tenant_id,
           NEW.created_at,
           NEW.updated_at,
           NEW.company_name,
           NEW.city,
           NEW.email,
           NEW.phone,
           NEW.postal_code,
           NEW.address2,
           NEW.business_id,
           NEW.chain,
           NEW.name,
           NEW.address,
           NEW.customer_group,
           NEW.reference,
            TG_OP
        );

        RETURN NEW;
    elsif (TG_OP = 'DELETE') then
        INSERT INTO customer_history (
        id,
        compensation,
        show_price_without_tax,
        tenant_id,
        created_at,
        updated_at,
        company_name,
        city,
        email,
        phone,
        postal_code,
        address2,
        business_id,
        chain,
        name,
        address,
        customer_group,
        reference,
        operation
        )
        VALUES (
            OLD.id,
           OLD.compensation,
           OLD.show_price_without_tax,
           OLD.tenant_id,
           OLD.created_at,
           OLD.updated_at,
           OLD.company_name,
           OLD.city,
           OLD.email,
           OLD.phone,
           OLD.postal_code,
           OLD.address2,
           OLD.business_id,
           OLD.chain,
           OLD.name,
           OLD.address,
           OLD.customer_group,
           OLD.reference,
            'DELETE'
        );
        RETURN OLD;
    end if;

END;
$body$
LANGUAGE plpgsql;

CREATE TRIGGER customer_history_trigger
AFTER INSERT OR UPDATE OR DELETE ON "customer"
FOR EACH ROW EXECUTE FUNCTION customer_history_trigger_func();
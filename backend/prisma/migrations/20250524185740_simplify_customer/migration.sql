/*
  Warnings:

  - You are about to drop the column `address` on the `customer` table. All the data in the column will be lost.
  - You are about to drop the column `address2` on the `customer` table. All the data in the column will be lost.
  - You are about to drop the column `chain` on the `customer` table. All the data in the column will be lost.
  - You are about to drop the column `company_name` on the `customer` table. All the data in the column will be lost.
  - You are about to drop the column `compensation` on the `customer` table. All the data in the column will be lost.
  - You are about to drop the column `reference` on the `customer` table. All the data in the column will be lost.
  - You are about to alter the column `customer_group` on the `customer` table. The data in that column could be lost. The data in that column will be cast from `VarChar(256)` to `VarChar(255)`.

*/
-- AlterTable
ALTER TABLE "customer" DROP COLUMN "address",
DROP COLUMN "address2",
DROP COLUMN "chain",
DROP COLUMN "company_name",
DROP COLUMN "compensation",
DROP COLUMN "reference",
ADD COLUMN     "company_legal_name" VARCHAR(255),
ADD COLUMN     "discount" DOUBLE PRECISION NOT NULL DEFAULT 0,
ADD COLUMN     "invoice_reference" VARCHAR(255),
ADD COLUMN     "street_address" VARCHAR(255),
ALTER COLUMN "customer_group" SET DATA TYPE VARCHAR(255);

ALTER TABLE "customer_history" DROP COLUMN "address",
DROP COLUMN "address2",
DROP COLUMN "chain",
DROP COLUMN "company_name",
DROP COLUMN "compensation",
DROP COLUMN "reference",
ADD COLUMN     "company_legal_name" VARCHAR(255),
ADD COLUMN     "discount" DOUBLE PRECISION NOT NULL DEFAULT 0,
ADD COLUMN     "invoice_reference" VARCHAR(255),
ADD COLUMN     "street_address" VARCHAR(255),
ALTER COLUMN "customer_group" SET DATA TYPE VARCHAR(255);

DROP TRIGGER IF EXISTS customer_history_trigger ON "customer";

CREATE OR REPLACE FUNCTION customer_history_trigger_func() RETURNS trigger AS $body$
BEGIN
    if (TG_OP = 'INSERT' or TG_OP = 'UPDATE') then
        INSERT INTO customer_history (
        id,
        show_price_without_tax,
        tenant_id,
        created_at,
        updated_at,
        discount,
        business_id,
        customer_group,
        invoice_reference,
        company_legal_name,
        street_address,
        name,
        city,
        email,
        phone,
        postal_code,
        operation
        )
        VALUES (
            NEW.id,
           NEW.show_price_without_tax,
           NEW.tenant_id,
           NEW.created_at,
           NEW.updated_at,
           NEW.discount,
           NEW.business_id,
           NEW.customer_group,
           NEW.invoice_reference,
           NEW.company_legal_name,
           NEW.street_address,
           NEW.name,
           NEW.city,
           NEW.email,
           NEW.phone,
           NEW.postal_code,
            TG_OP
        );

        RETURN NEW;
    elsif (TG_OP = 'DELETE') then
        INSERT INTO customer_history (
        id,
        show_price_without_tax,
        tenant_id,
        created_at,
        updated_at,
        discount,
        business_id,
        customer_group,
        invoice_reference,
        company_legal_name,
        street_address,
        name,
        city,
        email,
        phone,
        postal_code,
        operation
        )
        VALUES (
            OLD.id,
           OLD.show_price_without_tax,
           OLD.tenant_id,
           OLD.created_at,
           OLD.updated_at,
           OLD.discount,
           OLD.business_id,
           OLD.customer_group,
           OLD.invoice_reference,
           OLD.company_legal_name,
           OLD.street_address,
           OLD.name,
           OLD.city,
           OLD.email,
           OLD.phone,
           OLD.postal_code,
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
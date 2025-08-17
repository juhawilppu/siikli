/*
  Warnings:

  - You are about to drop the column `customer_group` on the `customer` table. All the data in the column will be lost.
  - You are about to drop the column `customer_group` on the `customer_history` table. All the data in the column will be lost.
  - You are about to drop the column `customer_group` on the `product` table. All the data in the column will be lost.
  - You are about to drop the column `info` on the `product` table. All the data in the column will be lost.
  - You are about to drop the column `subtype` on the `product` table. All the data in the column will be lost.
  - You are about to drop the column `type` on the `product` table. All the data in the column will be lost.
  - You are about to drop the column `variety` on the `product` table. All the data in the column will be lost.
  - You are about to drop the column `customer_group` on the `product_history` table. All the data in the column will be lost.
  - You are about to drop the column `info` on the `product_history` table. All the data in the column will be lost.
  - You are about to drop the column `subtype` on the `product_history` table. All the data in the column will be lost.
  - You are about to drop the column `type` on the `product_history` table. All the data in the column will be lost.
  - You are about to drop the column `variety` on the `product_history` table. All the data in the column will be lost.
  - You are about to drop the `product_subtype` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `product_subtype_history` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `product_type` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `product_type_history` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropForeignKey
ALTER TABLE "product_subtype" DROP CONSTRAINT "product_subtype_order_id_fkey";

-- DropForeignKey
ALTER TABLE "product_subtype" DROP CONSTRAINT "product_subtype_tenant_id_fkey";

-- DropForeignKey
ALTER TABLE "product_type" DROP CONSTRAINT "product_type_tenant_id_fkey";

-- AlterTable
ALTER TABLE "customer" DROP COLUMN "customer_group";

-- AlterTable
ALTER TABLE "customer_history" DROP COLUMN "customer_group";

-- AlterTable
ALTER TABLE "product" DROP COLUMN "customer_group",
DROP COLUMN "info",
DROP COLUMN "subtype",
DROP COLUMN "type",
DROP COLUMN "variety";

-- AlterTable
ALTER TABLE "product_history" DROP COLUMN "customer_group",
DROP COLUMN "info",
DROP COLUMN "subtype",
DROP COLUMN "type",
DROP COLUMN "variety";

-- DropTable
DROP TABLE "product_subtype";

-- DropTable
DROP TABLE "product_subtype_history";

-- DropTable
DROP TABLE "product_type";

-- DropTable
DROP TABLE "product_type_history";

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

DROP TRIGGER IF EXISTS product_history_trigger ON "product";

CREATE OR REPLACE FUNCTION product_history_trigger_func() RETURNS trigger AS $body$
BEGIN
    if (TG_OP = 'INSERT' or TG_OP = 'UPDATE') then
        INSERT INTO product_history (
        package_size,
        updated_at,
        id,
        price,
        price0,
        active,
        tenant_id,
        created_at,
        name,
        package_type,
        operation
        )
        VALUES (
            NEW.package_size,
           NEW.updated_at,
           NEW.id,
           NEW.price,
           NEW.price0,
           NEW.active,
           NEW.tenant_id,
           NEW.created_at,
           NEW.name,
           NEW.package_type,
            TG_OP
        );

        RETURN NEW;
    elsif (TG_OP = 'DELETE') then
        INSERT INTO product_history (
        package_size,
        updated_at,
        id,
        price,
        price0,
        active,
        tenant_id,
        created_at,
        name,
        package_type,
        operation
        )
        VALUES (
            OLD.package_size,
           OLD.updated_at,
           OLD.id,
           OLD.price,
           OLD.price0,
           OLD.active,
           OLD.tenant_id,
           OLD.created_at,
           OLD.name,
           OLD.package_type,
            'DELETE'
        );
        RETURN OLD;
    end if;

END;
$body$
LANGUAGE plpgsql;

CREATE TRIGGER product_history_trigger
AFTER INSERT OR UPDATE OR DELETE ON "product"
FOR EACH ROW EXECUTE FUNCTION product_history_trigger_func();

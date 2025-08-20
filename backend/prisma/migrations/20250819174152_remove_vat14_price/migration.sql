/*
  Warnings:

  - You are about to drop the column `show_price_without_tax` on the `customer` table. All the data in the column will be lost.
  - You are about to drop the column `show_price_without_tax` on the `customer_history` table. All the data in the column will be lost.
  - You are about to drop the column `show_price_without_tax` on the `order` table. All the data in the column will be lost.
  - You are about to drop the column `show_price_without_tax` on the `order_history` table. All the data in the column will be lost.
  - You are about to drop the column `price0` on the `order_row` table. All the data in the column will be lost.
  - You are about to drop the column `price0` on the `order_row_history` table. All the data in the column will be lost.
  - You are about to drop the column `price0` on the `product` table. All the data in the column will be lost.
  - You are about to drop the column `price0` on the `product_history` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "customer" DROP COLUMN "show_price_without_tax";

-- AlterTable
ALTER TABLE "customer_history" DROP COLUMN "show_price_without_tax";

-- AlterTable
ALTER TABLE "order" DROP COLUMN "show_price_without_tax";

-- AlterTable
ALTER TABLE "order_history" DROP COLUMN "show_price_without_tax";

-- AlterTable
ALTER TABLE "order_row" DROP COLUMN "price0";

-- AlterTable
ALTER TABLE "order_row_history" DROP COLUMN "price0";

-- AlterTable
ALTER TABLE "product" DROP COLUMN "price0";

-- AlterTable
ALTER TABLE "product_history" DROP COLUMN "price0";

--- Required Trigger SQL ---
DROP TRIGGER IF EXISTS customer_history_trigger ON "customer";

CREATE OR REPLACE FUNCTION customer_history_trigger_func() RETURNS trigger AS $body$
BEGIN
    if (TG_OP = 'INSERT' or TG_OP = 'UPDATE') then
        INSERT INTO customer_history (
        id,
        tenant_id,
        created_at,
        updated_at,
        discount,
        postal_code,
        business_id,
        company_legal_name,
        street_address,
        invoice_reference,
        name,
        city,
        email,
        phone,
        operation
        )
        VALUES (
            NEW.id,
           NEW.tenant_id,
           NEW.created_at,
           NEW.updated_at,
           NEW.discount,
           NEW.postal_code,
           NEW.business_id,
           NEW.company_legal_name,
           NEW.street_address,
           NEW.invoice_reference,
           NEW.name,
           NEW.city,
           NEW.email,
           NEW.phone,
            TG_OP
        );

        RETURN NEW;
    elsif (TG_OP = 'DELETE') then
        INSERT INTO customer_history (
        id,
        tenant_id,
        created_at,
        updated_at,
        discount,
        postal_code,
        business_id,
        company_legal_name,
        street_address,
        invoice_reference,
        name,
        city,
        email,
        phone,
        operation
        )
        VALUES (
            OLD.id,
           OLD.tenant_id,
           OLD.created_at,
           OLD.updated_at,
           OLD.discount,
           OLD.postal_code,
           OLD.business_id,
           OLD.company_legal_name,
           OLD.street_address,
           OLD.invoice_reference,
           OLD.name,
           OLD.city,
           OLD.email,
           OLD.phone,
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

--- Required Trigger SQL ---
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

--- Required Trigger SQL ---
DROP TRIGGER IF EXISTS product_history_trigger ON "product";

CREATE OR REPLACE FUNCTION product_history_trigger_func() RETURNS trigger AS $body$
BEGIN
    if (TG_OP = 'INSERT' or TG_OP = 'UPDATE') then
        INSERT INTO product_history (
        package_size,
        updated_at,
        id,
        price,
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

--- Required Trigger SQL ---
DROP TRIGGER IF EXISTS order_history_trigger ON "order";

CREATE OR REPLACE FUNCTION order_history_trigger_func() RETURNS trigger AS $body$
BEGIN
    if (TG_OP = 'INSERT' or TG_OP = 'UPDATE') then
        INSERT INTO order_history (
        id,
        customer_id,
        delivery_date,
        has_note,
        order_number,
        status,
        invoice_id,
        tenant_id,
        created_at,
        updated_at,
        deleted_at,
        note_body,
        note_header,
        waybill_s3_key,
        operation
        )
        VALUES (
            NEW.id,
           NEW.customer_id,
           NEW.delivery_date,
           NEW.has_note,
           NEW.order_number,
           NEW.status,
           NEW.invoice_id,
           NEW.tenant_id,
           NEW.created_at,
           NEW.updated_at,
           NEW.deleted_at,
           NEW.note_body,
           NEW.note_header,
           NEW.waybill_s3_key,
            TG_OP
        );

        RETURN NEW;
    elsif (TG_OP = 'DELETE') then
        INSERT INTO order_history (
        id,
        customer_id,
        delivery_date,
        has_note,
        order_number,
        status,
        invoice_id,
        tenant_id,
        created_at,
        updated_at,
        deleted_at,
        note_body,
        note_header,
        waybill_s3_key,
        operation
        )
        VALUES (
            OLD.id,
           OLD.customer_id,
           OLD.delivery_date,
           OLD.has_note,
           OLD.order_number,
           OLD.status,
           OLD.invoice_id,
           OLD.tenant_id,
           OLD.created_at,
           OLD.updated_at,
           OLD.deleted_at,
           OLD.note_body,
           OLD.note_header,
           OLD.waybill_s3_key,
            'DELETE'
        );
        RETURN OLD;
    end if;

END;
$body$
LANGUAGE plpgsql;

CREATE TRIGGER order_history_trigger
AFTER INSERT OR UPDATE OR DELETE ON "order"
FOR EACH ROW EXECUTE FUNCTION order_history_trigger_func();

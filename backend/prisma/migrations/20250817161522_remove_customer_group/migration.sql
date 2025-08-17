/*
  Warnings:

  - You are about to drop the column `customer_group` on the `order` table. All the data in the column will be lost.
  - You are about to drop the column `customer_group` on the `order_history` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "order" DROP COLUMN "customer_group";

-- AlterTable
ALTER TABLE "order_history" DROP COLUMN "customer_group";

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
        show_price_without_tax,
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
           NEW.show_price_without_tax,
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
        show_price_without_tax,
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
           OLD.show_price_without_tax,
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
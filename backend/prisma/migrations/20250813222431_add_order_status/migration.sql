-- CreateEnum
CREATE TYPE "OrderStatus" AS ENUM ('WAITING_FOR_DELIVERY', 'DELIVERED', 'INVOICED');

-- AlterTable
ALTER TABLE "order" ADD COLUMN     "status" "OrderStatus" NOT NULL DEFAULT 'WAITING_FOR_DELIVERY';

-- AlterTable
ALTER TABLE "order_history" ADD COLUMN     "status" "OrderStatus" NOT NULL DEFAULT 'WAITING_FOR_DELIVERY';

DROP TRIGGER IF EXISTS order_history_trigger ON "order";

CREATE OR REPLACE FUNCTION order_history_trigger_func() RETURNS trigger AS $body$
BEGIN
    if (TG_OP = 'INSERT' or TG_OP = 'UPDATE') then
        INSERT INTO order_history (
        id,
        customer_id,
        delivery_date,
        has_note,
        deleted_at,
        waybill_number,
        status,
        show_price_without_tax,
        tenant_id,
        created_at,
        updated_at,
        note_body,
        note_header,
        customer_group,
        operation
        )
        VALUES (
            NEW.id,
           NEW.customer_id,
           NEW.delivery_date,
           NEW.has_note,
           NEW.deleted_at,
           NEW.waybill_number,
           NEW.status,
           NEW.show_price_without_tax,
           NEW.tenant_id,
           NEW.created_at,
           NEW.updated_at,
           NEW.note_body,
           NEW.note_header,
           NEW.customer_group,
            TG_OP
        );

        RETURN NEW;
    elsif (TG_OP = 'DELETE') then
        INSERT INTO order_history (
        id,
        customer_id,
        delivery_date,
        has_note,
        deleted_at,
        waybill_number,
        status,
        show_price_without_tax,
        tenant_id,
        created_at,
        updated_at,
        note_body,
        note_header,
        customer_group,
        operation
        )
        VALUES (
            OLD.id,
           OLD.customer_id,
           OLD.delivery_date,
           OLD.has_note,
           OLD.deleted_at,
           OLD.waybill_number,
           OLD.status,
           OLD.show_price_without_tax,
           OLD.tenant_id,
           OLD.created_at,
           OLD.updated_at,
           OLD.note_body,
           OLD.note_header,
           OLD.customer_group,
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
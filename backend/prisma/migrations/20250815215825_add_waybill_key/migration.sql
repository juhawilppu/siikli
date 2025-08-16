-- DropIndex
DROP INDEX "waybill_number_uniq";

-- AlterTable
ALTER TABLE "order" RENAME COLUMN "waybill_number" TO "order_number";
ALTER TABLE "order" ADD COLUMN "waybill_s3_key" VARCHAR(255);

-- AlterTable
ALTER TABLE "order_history" RENAME COLUMN "waybill_number" TO "order_number";
ALTER TABLE "order_history" ADD COLUMN "waybill_s3_key" VARCHAR(255);

-- CreateIndex
CREATE UNIQUE INDEX "order_number_uniq" ON "order"("order_number", "tenant_id");

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
        order_number,
        status,
        invoice_id,
        show_price_without_tax,
        tenant_id,
        created_at,
        updated_at,
        note_body,
        note_header,
        waybill_s3_key,
        customer_group,
        operation
        )
        VALUES (
            NEW.id,
           NEW.customer_id,
           NEW.delivery_date,
           NEW.has_note,
           NEW.deleted_at,
           NEW.order_number,
           NEW.status,
           NEW.invoice_id,
           NEW.show_price_without_tax,
           NEW.tenant_id,
           NEW.created_at,
           NEW.updated_at,
           NEW.note_body,
           NEW.note_header,
           NEW.waybill_s3_key,
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
        order_number,
        status,
        invoice_id,
        show_price_without_tax,
        tenant_id,
        created_at,
        updated_at,
        note_body,
        note_header,
        waybill_s3_key,
        customer_group,
        operation
        )
        VALUES (
            OLD.id,
           OLD.customer_id,
           OLD.delivery_date,
           OLD.has_note,
           OLD.deleted_at,
           OLD.order_number,
           OLD.status,
           OLD.invoice_id,
           OLD.show_price_without_tax,
           OLD.tenant_id,
           OLD.created_at,
           OLD.updated_at,
           OLD.note_body,
           OLD.note_header,
           OLD.waybill_s3_key,
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
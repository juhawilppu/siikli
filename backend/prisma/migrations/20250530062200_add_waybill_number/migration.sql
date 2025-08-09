/*
  Warnings:

  - You are about to drop the column `company_legal_name` on the `customer_history` table. All the data in the column will be lost.
  - You are about to drop the column `discount` on the `customer_history` table. All the data in the column will be lost.
  - You are about to drop the column `invoice_reference` on the `customer_history` table. All the data in the column will be lost.
  - You are about to drop the column `street_address` on the `customer_history` table. All the data in the column will be lost.
  - A unique constraint covering the columns `[waybill_number,tenant_id]` on the table `order` will be added. If there are existing duplicate values, this will fail.
  - Added the required column `chain` to the `customer_history` table without a default value. This is not possible if the table is not empty.
  - Added the required column `compensation` to the `customer_history` table without a default value. This is not possible if the table is not empty.
  - Added the required column `waybill_number` to the `order` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "customer_history" DROP COLUMN "company_legal_name",
DROP COLUMN "discount",
DROP COLUMN "invoice_reference",
DROP COLUMN "street_address",
ADD COLUMN     "address" VARCHAR(255),
ADD COLUMN     "address2" VARCHAR(255),
ADD COLUMN     "chain" VARCHAR(32) NOT NULL,
ADD COLUMN     "company_name" VARCHAR(255),
ADD COLUMN     "compensation" DOUBLE PRECISION NOT NULL,
ADD COLUMN     "reference" VARCHAR(255),
ALTER COLUMN "customer_group" SET DATA TYPE VARCHAR(255);

-- AlterTable
ALTER TABLE "order" ADD COLUMN     "deleted_at" DATE,
ADD COLUMN     "waybill_number" INTEGER NOT NULL;

ALTER TABLE "order_history" ADD COLUMN     "deleted_at" DATE,
ADD COLUMN     "waybill_number" INTEGER NOT NULL;

-- CreateIndex
CREATE UNIQUE INDEX "waybill_number_uniq" ON "order"("waybill_number", "tenant_id");

DROP TRIGGER IF EXISTS order_history_trigger ON "order";

CREATE OR REPLACE FUNCTION order_history_trigger_func() RETURNS trigger AS $body$
BEGIN
    if (TG_OP = 'INSERT' or TG_OP = 'UPDATE') then
        INSERT INTO order_history (
        waybill_number,
        customer_id,
        delivery_date,
        has_note,
        updated_at,
        deleted_at,
        id,
        show_price_without_tax,
        tenant_id,
        created_at,
        note_body,
        note_header,
        customer_group,
        operation
        )
        VALUES (
            NEW.waybill_number,
           NEW.customer_id,
           NEW.delivery_date,
           NEW.has_note,
           NEW.updated_at,
           NEW.deleted_at,
           NEW.id,
           NEW.show_price_without_tax,
           NEW.tenant_id,
           NEW.created_at,
           NEW.note_body,
           NEW.note_header,
           NEW.customer_group,
            TG_OP
        );

        RETURN NEW;
    elsif (TG_OP = 'DELETE') then
        INSERT INTO order_history (
        waybill_number,
        customer_id,
        delivery_date,
        has_note,
        updated_at,
        deleted_at,
        id,
        show_price_without_tax,
        tenant_id,
        created_at,
        note_body,
        note_header,
        customer_group,
        operation
        )
        VALUES (
            OLD.waybill_number,
           OLD.customer_id,
           OLD.delivery_date,
           OLD.has_note,
           OLD.updated_at,
           OLD.deleted_at,
           OLD.id,
           OLD.show_price_without_tax,
           OLD.tenant_id,
           OLD.created_at,
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
ALTER COLUMN "show_price_without_tax" SET DEFAULT false,
ALTER COLUMN "created_at" SET DEFAULT CURRENT_TIMESTAMP,
ALTER COLUMN "updated_at" SET DEFAULT CURRENT_TIMESTAMP;

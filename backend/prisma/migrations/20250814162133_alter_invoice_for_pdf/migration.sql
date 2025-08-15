/*
  Warnings:

  - You are about to drop the column `content` on the `invoice` table. All the data in the column will be lost.
  - You are about to drop the column `content` on the `invoice_history` table. All the data in the column will be lost.
  - Added the required column `filename` to the `invoice` table without a default value. This is not possible if the table is not empty.
  - Added the required column `filename` to the `invoice_history` table without a default value. This is not possible if the table is not empty.

*/

-- Delete all invoices
DELETE FROM "invoice";
DELETE FROM "invoice_history";

-- CreateEnum
CREATE TYPE "InvoiceStatus" AS ENUM ('PENDING', 'PAID');

-- AlterTable
ALTER TABLE "invoice" DROP COLUMN "content",
ADD COLUMN     "filename" VARCHAR(255) NOT NULL,
ADD COLUMN     "total" DECIMAL(10, 2) NOT NULL,
ADD COLUMN     "status" "InvoiceStatus" NOT NULL DEFAULT 'PENDING';

-- AlterTable
ALTER TABLE "invoice_history" DROP COLUMN "content",
ADD COLUMN     "filename" VARCHAR(255) NOT NULL,
ADD COLUMN     "total" DECIMAL(10, 2) NOT NULL,
ADD COLUMN     "status" "InvoiceStatus" NOT NULL DEFAULT 'PENDING';

DROP TRIGGER IF EXISTS invoice_history_trigger ON "invoice";

CREATE OR REPLACE FUNCTION invoice_history_trigger_func() RETURNS trigger AS $body$
BEGIN
    if (TG_OP = 'INSERT' or TG_OP = 'UPDATE') then
        INSERT INTO invoice_history (
        id,
        invoice_number,
        customer_id,
        tenant_id,
        created_at,
        updated_at,
        filename,
        total,
        status,
        operation
        )
        VALUES (
            NEW.id,
           NEW.invoice_number,
           NEW.customer_id,
           NEW.tenant_id,
           NEW.created_at,
           NEW.updated_at,
           NEW.filename,
           NEW.total,
           NEW.status,
            TG_OP
        );

        RETURN NEW;
    elsif (TG_OP = 'DELETE') then
        INSERT INTO invoice_history (
        id,
        invoice_number,
        customer_id,
        tenant_id,
        created_at,
        updated_at,
        filename,
        total,
        status,
        operation
        )
        VALUES (
            OLD.id,
           OLD.invoice_number,
           OLD.customer_id,
           OLD.tenant_id,
           OLD.created_at,
           OLD.updated_at,
           OLD.filename,
           OLD.total,
           OLD.status,
            'DELETE'
        );
        RETURN OLD;
    end if;

END;
$body$
LANGUAGE plpgsql;

CREATE TRIGGER invoice_history_trigger
AFTER INSERT OR UPDATE OR DELETE ON "invoice"
FOR EACH ROW EXECUTE FUNCTION invoice_history_trigger_func();
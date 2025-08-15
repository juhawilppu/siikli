-- AlterTable
ALTER TABLE "invoice_history" ALTER COLUMN "status" DROP DEFAULT;

-- AlterTable
ALTER TABLE "order" ADD COLUMN     "invoice_id" UUID;
ALTER TABLE "order_history" ADD COLUMN     "invoice_id" UUID;

-- AddForeignKey
ALTER TABLE "order" ADD CONSTRAINT "order_invoice_id_fkey" FOREIGN KEY ("invoice_id") REFERENCES "invoice"("id") ON DELETE CASCADE ON UPDATE CASCADE;

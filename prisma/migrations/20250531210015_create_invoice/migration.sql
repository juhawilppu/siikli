-- CreateTable
CREATE TABLE "invoice" (
    "id" UUID NOT NULL,
    "invoice_number" INTEGER NOT NULL,
    "customer_id" UUID NOT NULL,
    "tenant_id" UUID NOT NULL,
    "content" JSONB NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "invoice_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "InvoiceHistory" (
    "revision" SERIAL NOT NULL,
    "operation" TEXT NOT NULL,
    "id" UUID NOT NULL,
    "invoice_number" INTEGER NOT NULL,
    "customer_id" UUID NOT NULL,
    "tenant_id" UUID NOT NULL,
    "content" JSONB NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "InvoiceHistory_pkey" PRIMARY KEY ("revision")
);

-- AddForeignKey
ALTER TABLE "invoice" ADD CONSTRAINT "invoice_tenant_id_fkey" FOREIGN KEY ("tenant_id") REFERENCES "tenant"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "invoice" ADD CONSTRAINT "invoice_customer_id_fkey" FOREIGN KEY ("customer_id") REFERENCES "customer"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- CreateTable
CREATE TABLE "invoice_history" (
    "revision" SERIAL NOT NULL,
    "operation" TEXT NOT NULL,
    "id" UUID NOT NULL,
    "invoice_number" INTEGER NOT NULL,
    "customer_id" UUID NOT NULL,
    "tenant_id" UUID NOT NULL,
    "content" JSONB NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "invoice_history_pkey" PRIMARY KEY ("revision")
);

DROP TRIGGER IF EXISTS invoice_history_trigger ON "invoice";

CREATE OR REPLACE FUNCTION invoice_history_trigger_func() RETURNS trigger AS $body$
BEGIN
    if (TG_OP = 'INSERT' or TG_OP = 'UPDATE') then
        INSERT INTO invoice_history (
        id,
        invoice_number,
        customer_id,
        tenant_id,
        content,
        created_at,
        updated_at,
        operation
        )
        VALUES (
            NEW.id,
           NEW.invoice_number,
           NEW.customer_id,
           NEW.tenant_id,
           NEW.content,
           NEW.created_at,
           NEW.updated_at,
            TG_OP
        );

        RETURN NEW;
    elsif (TG_OP = 'DELETE') then
        INSERT INTO invoice_history (
        id,
        invoice_number,
        customer_id,
        tenant_id,
        content,
        created_at,
        updated_at,
        operation
        )
        VALUES (
            OLD.id,
           OLD.invoice_number,
           OLD.customer_id,
           OLD.tenant_id,
           OLD.content,
           OLD.created_at,
           OLD.updated_at,
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
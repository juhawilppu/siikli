-- AlterTable
ALTER TABLE "tenant" ADD COLUMN     "updated_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP;

-- CreateTable
CREATE TABLE "tenant_history" (
    "revision" SERIAL NOT NULL,
    "id" UUID NOT NULL,
    "name" VARCHAR(255) NOT NULL,
    "street_address" VARCHAR(255),
    "postal_code" VARCHAR(255),
    "city" VARCHAR(255),
    "phone" VARCHAR(255),
    "email" VARCHAR(255),
    "website" VARCHAR(255),
    "business_id" VARCHAR(255),
    "invoice_bank_name" VARCHAR(255),
    "invoice_bank_account" VARCHAR(255),
    "invoice_swift_bic" VARCHAR(255),
    "invoice_reference" VARCHAR(255),
    "invoice_sum_row" VARCHAR(255),
    "signup_completed" BOOLEAN NOT NULL DEFAULT false,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "subscription_type" TEXT NOT NULL DEFAULT 'FREE',
    "subscription_end_date" TIMESTAMP(3),
    "subscription_start_date" TIMESTAMP(3),
    "trial_end_date" TIMESTAMP(3),
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "tenant_history_pkey" PRIMARY KEY ("id")
);

ALTER TABLE "tenant_history" ADD COLUMN     "operation" TEXT NOT NULL,
ALTER COLUMN "updated_at" SET DEFAULT CURRENT_TIMESTAMP;

ALTER TABLE "tenant_history" DROP CONSTRAINT "tenant_history_pkey",
ADD CONSTRAINT "tenant_history_pkey" PRIMARY KEY ("revision");


DROP TRIGGER IF EXISTS tenant_history_trigger ON "tenant";

CREATE OR REPLACE FUNCTION tenant_history_trigger_func() RETURNS trigger AS $body$
BEGIN
    if (TG_OP = 'INSERT' or TG_OP = 'UPDATE') then
        INSERT INTO tenant_history (
        id,
        created_at,
        signup_completed,
        subscription_end_date,
        subscription_start_date,
        trial_end_date,
        updated_at,
        website,
        business_id,
        invoice_bank_name,
        invoice_bank_account,
        invoice_swift_bic,
        invoice_reference,
        invoice_sum_row,
        subscription_type,
        name,
        street_address,
        postal_code,
        city,
        phone,
        email,
        operation
        )
        VALUES (
            NEW.id,
           NEW.created_at,
           NEW.signup_completed,
           NEW.subscription_end_date,
           NEW.subscription_start_date,
           NEW.trial_end_date,
           NEW.updated_at,
           NEW.website,
           NEW.business_id,
           NEW.invoice_bank_name,
           NEW.invoice_bank_account,
           NEW.invoice_swift_bic,
           NEW.invoice_reference,
           NEW.invoice_sum_row,
           NEW.subscription_type,
           NEW.name,
           NEW.street_address,
           NEW.postal_code,
           NEW.city,
           NEW.phone,
           NEW.email,
            TG_OP
        );

        RETURN NEW;
    elsif (TG_OP = 'DELETE') then
        INSERT INTO tenant_history (
        id,
        created_at,
        signup_completed,
        subscription_end_date,
        subscription_start_date,
        trial_end_date,
        updated_at,
        website,
        business_id,
        invoice_bank_name,
        invoice_bank_account,
        invoice_swift_bic,
        invoice_reference,
        invoice_sum_row,
        subscription_type,
        name,
        street_address,
        postal_code,
        city,
        phone,
        email,
        operation
        )
        VALUES (
            OLD.id,
           OLD.created_at,
           OLD.signup_completed,
           OLD.subscription_end_date,
           OLD.subscription_start_date,
           OLD.trial_end_date,
           OLD.updated_at,
           OLD.website,
           OLD.business_id,
           OLD.invoice_bank_name,
           OLD.invoice_bank_account,
           OLD.invoice_swift_bic,
           OLD.invoice_reference,
           OLD.invoice_sum_row,
           OLD.subscription_type,
           OLD.name,
           OLD.street_address,
           OLD.postal_code,
           OLD.city,
           OLD.phone,
           OLD.email,
            'DELETE'
        );
        RETURN OLD;
    end if;

END;
$body$
LANGUAGE plpgsql;

CREATE TRIGGER tenant_history_trigger
AFTER INSERT OR UPDATE OR DELETE ON "tenant"
FOR EACH ROW EXECUTE FUNCTION tenant_history_trigger_func();
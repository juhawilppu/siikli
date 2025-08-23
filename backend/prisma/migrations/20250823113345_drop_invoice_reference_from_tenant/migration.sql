/*
  Warnings:

  - You are about to drop the column `invoice_reference` on the `tenant` table. All the data in the column will be lost.
  - You are about to drop the column `invoice_reference` on the `tenant_history` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "tenant" DROP COLUMN "invoice_reference";

-- AlterTable
ALTER TABLE "tenant_history" DROP COLUMN "invoice_reference";

--- Required Trigger SQL ---
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
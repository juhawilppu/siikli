-- AlterTable
ALTER TABLE "user" ADD COLUMN     "last_login_at" TIMESTAMP(3);

-- AlterTable
ALTER TABLE "user_history" ADD COLUMN     "last_login_at" TIMESTAMP(3);

-- RenameIndex
ALTER INDEX "product_subtypes_uniq" RENAME TO "product_subtype_uniq";

DROP TRIGGER IF EXISTS user_history_trigger ON "user";

CREATE OR REPLACE FUNCTION user_history_trigger_func() RETURNS trigger AS $body$
BEGIN
    if (TG_OP = 'INSERT' or TG_OP = 'UPDATE') then
        INSERT INTO user_history (
        last_login_at,
        id,
        created_at,
        updated_at,
        marketing_consent,
        tenant_id,
        google_external_id,
        email,
        operation
        )
        VALUES (
            NEW.last_login_at,
           NEW.id,
           NEW.created_at,
           NEW.updated_at,
           NEW.marketing_consent,
           NEW.tenant_id,
           NEW.google_external_id,
           NEW.email,
            TG_OP
        );

        RETURN NEW;
    elsif (TG_OP = 'DELETE') then
        INSERT INTO user_history (
        last_login_at,
        id,
        created_at,
        updated_at,
        marketing_consent,
        tenant_id,
        google_external_id,
        email,
        operation
        )
        VALUES (
            OLD.last_login_at,
           OLD.id,
           OLD.created_at,
           OLD.updated_at,
           OLD.marketing_consent,
           OLD.tenant_id,
           OLD.google_external_id,
           OLD.email,
            'DELETE'
        );
        RETURN OLD;
    end if;

END;
$body$
LANGUAGE plpgsql;

CREATE TRIGGER user_history_trigger
AFTER INSERT OR UPDATE OR DELETE ON "user"
FOR EACH ROW EXECUTE FUNCTION user_history_trigger_func();
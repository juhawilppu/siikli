-- CreateEnum
CREATE TYPE "Role" AS ENUM ('USER', 'OWNER');

-- AlterTable
ALTER TABLE "user" ADD COLUMN     "role" "Role" NOT NULL DEFAULT 'USER';

-- AlterTable
ALTER TABLE "user_history" ADD COLUMN     "role" "Role" NOT NULL DEFAULT 'USER';

DROP TRIGGER IF EXISTS user_history_trigger ON "user";

CREATE OR REPLACE FUNCTION user_history_trigger_func() RETURNS trigger AS $body$
BEGIN
    if (TG_OP = 'INSERT' or TG_OP = 'UPDATE') then
        INSERT INTO user_history (
        role,
        id,
        updated_at,
        last_login_at,
        marketing_consent,
        tenant_id,
        created_at,
        google_external_id,
        email,
        operation
        )
        VALUES (
            NEW.role,
           NEW.id,
           NEW.updated_at,
           NEW.last_login_at,
           NEW.marketing_consent,
           NEW.tenant_id,
           NEW.created_at,
           NEW.google_external_id,
           NEW.email,
            TG_OP
        );

        RETURN NEW;
    elsif (TG_OP = 'DELETE') then
        INSERT INTO user_history (
        role,
        id,
        updated_at,
        last_login_at,
        marketing_consent,
        tenant_id,
        created_at,
        google_external_id,
        email,
        operation
        )
        VALUES (
            OLD.role,
           OLD.id,
           OLD.updated_at,
           OLD.last_login_at,
           OLD.marketing_consent,
           OLD.tenant_id,
           OLD.created_at,
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
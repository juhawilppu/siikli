-- AlterTable
ALTER TABLE "user" ADD COLUMN     "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
ADD COLUMN     "updated_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP;

-- CreateTable
CREATE TABLE "user_history" (
    "revision" SERIAL NOT NULL,
    "operation" TEXT NOT NULL,
    "id" UUID NOT NULL,
    "google_external_id" VARCHAR(128),
    "email" TEXT NOT NULL,
    "tenant_id" UUID NOT NULL,
    "marketing_consent" BOOLEAN NOT NULL DEFAULT false,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "user_history_pkey" PRIMARY KEY ("revision")
);

DROP TRIGGER IF EXISTS user_history_trigger ON "user";

CREATE OR REPLACE FUNCTION user_history_trigger_func() RETURNS trigger AS $body$
BEGIN
    if (TG_OP = 'INSERT' or TG_OP = 'UPDATE') then
        INSERT INTO user_history (
        marketing_consent,
        id,
        created_at,
        updated_at,
        tenant_id,
        google_external_id,
        email,
        operation
        )
        VALUES (
            NEW.marketing_consent,
           NEW.id,
           NEW.created_at,
           NEW.updated_at,
           NEW.tenant_id,
           NEW.google_external_id,
           NEW.email,
            TG_OP
        );

        RETURN NEW;
    elsif (TG_OP = 'DELETE') then
        INSERT INTO user_history (
        marketing_consent,
        id,
        created_at,
        updated_at,
        tenant_id,
        google_external_id,
        email,
        operation
        )
        VALUES (
            OLD.marketing_consent,
           OLD.id,
           OLD.created_at,
           OLD.updated_at,
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
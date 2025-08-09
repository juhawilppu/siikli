/*
  Warnings:

  - You are about to drop the `EmailLoginPinCode` table. If the table is not empty, all the data it contains will be lost.

*/
-- AlterTable
ALTER TABLE "tenant_history" ALTER COLUMN "signup_completed" DROP DEFAULT,
ALTER COLUMN "created_at" DROP DEFAULT,
ALTER COLUMN "subscription_type" DROP DEFAULT,
ALTER COLUMN "updated_at" DROP DEFAULT;

-- AlterTable
ALTER TABLE "user_history" ALTER COLUMN "marketing_consent" DROP DEFAULT,
ALTER COLUMN "created_at" DROP DEFAULT,
ALTER COLUMN "updated_at" DROP DEFAULT;

-- DropTable
DROP TABLE "EmailLoginPinCode";

-- CreateTable
CREATE TABLE "email_login_pin_code" (
    "id" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "pin_code" TEXT NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "email_login_pin_code_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "email_login_pin_code_history" (
    "revision" SERIAL NOT NULL,
    "operation" TEXT NOT NULL,
    "id" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "pin_code" TEXT NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "email_login_pin_code_history_pkey" PRIMARY KEY ("revision")
);

DROP TRIGGER IF EXISTS email_login_pin_code_history_trigger ON "email_login_pin_code";

CREATE OR REPLACE FUNCTION email_login_pin_code_history_trigger_func() RETURNS trigger AS $body$
BEGIN
    if (TG_OP = 'INSERT' or TG_OP = 'UPDATE') then
        INSERT INTO email_login_pin_code_history (
        created_at,
        updated_at,
        id,
        email,
        pin_code,
        operation
        )
        VALUES (
            NEW.created_at,
           NEW.updated_at,
           NEW.id,
           NEW.email,
           NEW.pin_code,
            TG_OP
        );

        RETURN NEW;
    elsif (TG_OP = 'DELETE') then
        INSERT INTO email_login_pin_code_history (
        created_at,
        updated_at,
        id,
        email,
        pin_code,
        operation
        )
        VALUES (
            OLD.created_at,
           OLD.updated_at,
           OLD.id,
           OLD.email,
           OLD.pin_code,
            'DELETE'
        );
        RETURN OLD;
    end if;

END;
$body$
LANGUAGE plpgsql;

CREATE TRIGGER email_login_pin_code_history_trigger
AFTER INSERT OR UPDATE OR DELETE ON "email_login_pin_code"
FOR EACH ROW EXECUTE FUNCTION email_login_pin_code_history_trigger_func();
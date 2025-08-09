-- AlterTable
ALTER TABLE "log" ADD COLUMN     "updated_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP;

-- AlterTable
ALTER TABLE "order" ADD COLUMN     "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
ADD COLUMN     "updated_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP;

-- AlterTable
ALTER TABLE "package_size" ADD COLUMN     "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
ADD COLUMN     "updated_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP;

-- AlterTable
ALTER TABLE "package_type" ADD COLUMN     "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
ADD COLUMN     "updated_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP;

-- AlterTable
ALTER TABLE "product" ADD COLUMN     "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
ADD COLUMN     "updated_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP;

-- AlterTable
ALTER TABLE "product_subtype" ADD COLUMN     "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
ADD COLUMN     "updated_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP;

-- AlterTable
ALTER TABLE "product_type" ADD COLUMN     "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
ADD COLUMN     "updated_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP;

-- AlterTable
ALTER TABLE "rate_limit" ADD COLUMN     "updated_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP;

-- CreateTable
CREATE TABLE "product_type_history" (
    "revision" SERIAL NOT NULL,
    "operation" TEXT NOT NULL,
    "id" UUID NOT NULL,
    "tenant_id" UUID NOT NULL,
    "order_index" INTEGER NOT NULL,
    "type" VARCHAR(255),
    "created_at" TIMESTAMP(3) NOT NULL,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "product_type_history_pkey" PRIMARY KEY ("revision")
);

-- CreateTable
CREATE TABLE "product_history" (
    "revision" SERIAL NOT NULL,
    "operation" TEXT NOT NULL,
    "id" UUID NOT NULL,
    "tenant_id" UUID NOT NULL,
    "name" VARCHAR(64) NOT NULL,
    "variety" VARCHAR(32),
    "info" VARCHAR(32),
    "price" DOUBLE PRECISION,
    "type" VARCHAR(32),
    "subtype" VARCHAR(255),
    "package_size" VARCHAR(255),
    "package_type" VARCHAR(255),
    "price0" DOUBLE PRECISION,
    "customer_group" VARCHAR(256),
    "active" BOOLEAN,
    "created_at" TIMESTAMP(3) NOT NULL,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "product_history_pkey" PRIMARY KEY ("revision")
);

-- CreateTable
CREATE TABLE "order_history" (
    "revision" SERIAL NOT NULL,
    "operation" TEXT NOT NULL,
    "id" UUID NOT NULL,
    "customer_id" UUID NOT NULL,
    "delivery_date" DATE NOT NULL,
    "has_note" BOOLEAN NOT NULL,
    "note_body" VARCHAR(1000),
    "note_header" VARCHAR(255),
    "show_price_without_tax" BOOLEAN,
    "customer_group" VARCHAR(256),
    "tenant_id" UUID NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "order_history_pkey" PRIMARY KEY ("revision")
);

-- CreateTable
CREATE TABLE "product_subtype_history" (
    "revision" SERIAL NOT NULL,
    "operation" TEXT NOT NULL,
    "id" UUID NOT NULL,
    "tenant_id" UUID NOT NULL,
    "order_index" INTEGER NOT NULL,
    "subtype" VARCHAR(255),
    "type" VARCHAR(255),
    "order_id" UUID,
    "created_at" TIMESTAMP(3) NOT NULL,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "product_subtype_history_pkey" PRIMARY KEY ("revision")
);

-- CreateTable
CREATE TABLE "rate_limit_history" (
    "revision" SERIAL NOT NULL,
    "operation" TEXT NOT NULL,
    "id" UUID NOT NULL,
    "ip" VARCHAR(255) NOT NULL,
    "key" VARCHAR(255) NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "rate_limit_history_pkey" PRIMARY KEY ("revision")
);

-- CreateTable
CREATE TABLE "package_type_history" (
    "revision" SERIAL NOT NULL,
    "operation" TEXT NOT NULL,
    "id" UUID NOT NULL,
    "name" VARCHAR(255) NOT NULL,
    "tenant_id" UUID NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "package_type_history_pkey" PRIMARY KEY ("revision")
);

-- CreateTable
CREATE TABLE "package_size_history" (
    "revision" SERIAL NOT NULL,
    "operation" TEXT NOT NULL,
    "id" UUID NOT NULL,
    "size" INTEGER NOT NULL,
    "tenant_id" UUID NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "package_size_history_pkey" PRIMARY KEY ("revision")
);

DROP TRIGGER IF EXISTS product_type_history_trigger ON "product_type";

CREATE OR REPLACE FUNCTION product_type_history_trigger_func() RETURNS trigger AS $body$
BEGIN
    if (TG_OP = 'INSERT' or TG_OP = 'UPDATE') then
        INSERT INTO product_type_history (
        id,
        order_index,
        tenant_id,
        created_at,
        updated_at,
        type,
        operation
        )
        VALUES (
            NEW.id,
           NEW.order_index,
           NEW.tenant_id,
           NEW.created_at,
           NEW.updated_at,
           NEW.type,
            TG_OP
        );

        RETURN NEW;
    elsif (TG_OP = 'DELETE') then
        INSERT INTO product_type_history (
        id,
        order_index,
        tenant_id,
        created_at,
        updated_at,
        type,
        operation
        )
        VALUES (
            OLD.id,
           OLD.order_index,
           OLD.tenant_id,
           OLD.created_at,
           OLD.updated_at,
           OLD.type,
            'DELETE'
        );
        RETURN OLD;
    end if;

END;
$body$
LANGUAGE plpgsql;

CREATE TRIGGER product_type_history_trigger
AFTER INSERT OR UPDATE OR DELETE ON "product_type"
FOR EACH ROW EXECUTE FUNCTION product_type_history_trigger_func();

--- Required Trigger SQL ---
DROP TRIGGER IF EXISTS product_history_trigger ON "product";

CREATE OR REPLACE FUNCTION product_history_trigger_func() RETURNS trigger AS $body$
BEGIN
    if (TG_OP = 'INSERT' or TG_OP = 'UPDATE') then
        INSERT INTO product_history (
        id,
        price,
        price0,
        active,
        tenant_id,
        created_at,
        updated_at,
        package_size,
        package_type,
        name,
        type,
        variety,
        info,
        customer_group,
        subtype,
        operation
        )
        VALUES (
            NEW.id,
           NEW.price,
           NEW.price0,
           NEW.active,
           NEW.tenant_id,
           NEW.created_at,
           NEW.updated_at,
           NEW.package_size,
           NEW.package_type,
           NEW.name,
           NEW.type,
           NEW.variety,
           NEW.info,
           NEW.customer_group,
           NEW.subtype,
            TG_OP
        );

        RETURN NEW;
    elsif (TG_OP = 'DELETE') then
        INSERT INTO product_history (
        id,
        price,
        price0,
        active,
        tenant_id,
        created_at,
        updated_at,
        package_size,
        package_type,
        name,
        type,
        variety,
        info,
        customer_group,
        subtype,
        operation
        )
        VALUES (
            OLD.id,
           OLD.price,
           OLD.price0,
           OLD.active,
           OLD.tenant_id,
           OLD.created_at,
           OLD.updated_at,
           OLD.package_size,
           OLD.package_type,
           OLD.name,
           OLD.type,
           OLD.variety,
           OLD.info,
           OLD.customer_group,
           OLD.subtype,
            'DELETE'
        );
        RETURN OLD;
    end if;

END;
$body$
LANGUAGE plpgsql;

CREATE TRIGGER product_history_trigger
AFTER INSERT OR UPDATE OR DELETE ON "product"
FOR EACH ROW EXECUTE FUNCTION product_history_trigger_func();

--- Required Trigger SQL ---
DROP TRIGGER IF EXISTS order_history_trigger ON "order";

CREATE OR REPLACE FUNCTION order_history_trigger_func() RETURNS trigger AS $body$
BEGIN
    if (TG_OP = 'INSERT' or TG_OP = 'UPDATE') then
        INSERT INTO order_history (
        id,
        customer_id,
        delivery_date,
        has_note,
        tenant_id,
        created_at,
        updated_at,
        show_price_without_tax,
        note_body,
        note_header,
        customer_group,
        operation
        )
        VALUES (
            NEW.id,
           NEW.customer_id,
           NEW.delivery_date,
           NEW.has_note,
           NEW.tenant_id,
           NEW.created_at,
           NEW.updated_at,
           NEW.show_price_without_tax,
           NEW.note_body,
           NEW.note_header,
           NEW.customer_group,
            TG_OP
        );

        RETURN NEW;
    elsif (TG_OP = 'DELETE') then
        INSERT INTO order_history (
        id,
        customer_id,
        delivery_date,
        has_note,
        tenant_id,
        created_at,
        updated_at,
        show_price_without_tax,
        note_body,
        note_header,
        customer_group,
        operation
        )
        VALUES (
            OLD.id,
           OLD.customer_id,
           OLD.delivery_date,
           OLD.has_note,
           OLD.tenant_id,
           OLD.created_at,
           OLD.updated_at,
           OLD.show_price_without_tax,
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

--- Required Trigger SQL ---
DROP TRIGGER IF EXISTS rate_limit_history_trigger ON "rate_limit";

CREATE OR REPLACE FUNCTION rate_limit_history_trigger_func() RETURNS trigger AS $body$
BEGIN
    if (TG_OP = 'INSERT' or TG_OP = 'UPDATE') then
        INSERT INTO rate_limit_history (
        id,
        created_at,
        updated_at,
        ip,
        key,
        operation
        )
        VALUES (
            NEW.id,
           NEW.created_at,
           NEW.updated_at,
           NEW.ip,
           NEW.key,
            TG_OP
        );

        RETURN NEW;
    elsif (TG_OP = 'DELETE') then
        INSERT INTO rate_limit_history (
        id,
        created_at,
        updated_at,
        ip,
        key,
        operation
        )
        VALUES (
            OLD.id,
           OLD.created_at,
           OLD.updated_at,
           OLD.ip,
           OLD.key,
            'DELETE'
        );
        RETURN OLD;
    end if;

END;
$body$
LANGUAGE plpgsql;

CREATE TRIGGER rate_limit_history_trigger
AFTER INSERT OR UPDATE OR DELETE ON "rate_limit"
FOR EACH ROW EXECUTE FUNCTION rate_limit_history_trigger_func();

--- Required Trigger SQL ---
DROP TRIGGER IF EXISTS package_type_history_trigger ON "package_type";

CREATE OR REPLACE FUNCTION package_type_history_trigger_func() RETURNS trigger AS $body$
BEGIN
    if (TG_OP = 'INSERT' or TG_OP = 'UPDATE') then
        INSERT INTO package_type_history (
        id,
        tenant_id,
        created_at,
        updated_at,
        name,
        operation
        )
        VALUES (
            NEW.id,
           NEW.tenant_id,
           NEW.created_at,
           NEW.updated_at,
           NEW.name,
            TG_OP
        );

        RETURN NEW;
    elsif (TG_OP = 'DELETE') then
        INSERT INTO package_type_history (
        id,
        tenant_id,
        created_at,
        updated_at,
        name,
        operation
        )
        VALUES (
            OLD.id,
           OLD.tenant_id,
           OLD.created_at,
           OLD.updated_at,
           OLD.name,
            'DELETE'
        );
        RETURN OLD;
    end if;

END;
$body$
LANGUAGE plpgsql;

CREATE TRIGGER package_type_history_trigger
AFTER INSERT OR UPDATE OR DELETE ON "package_type"
FOR EACH ROW EXECUTE FUNCTION package_type_history_trigger_func();

--- Required Trigger SQL ---
DROP TRIGGER IF EXISTS package_size_history_trigger ON "package_size";

CREATE OR REPLACE FUNCTION package_size_history_trigger_func() RETURNS trigger AS $body$
BEGIN
    if (TG_OP = 'INSERT' or TG_OP = 'UPDATE') then
        INSERT INTO package_size_history (
        id,
        size,
        tenant_id,
        created_at,
        updated_at,
        operation
        )
        VALUES (
            NEW.id,
           NEW.size,
           NEW.tenant_id,
           NEW.created_at,
           NEW.updated_at,
            TG_OP
        );

        RETURN NEW;
    elsif (TG_OP = 'DELETE') then
        INSERT INTO package_size_history (
        id,
        size,
        tenant_id,
        created_at,
        updated_at,
        operation
        )
        VALUES (
            OLD.id,
           OLD.size,
           OLD.tenant_id,
           OLD.created_at,
           OLD.updated_at,
            'DELETE'
        );
        RETURN OLD;
    end if;

END;
$body$
LANGUAGE plpgsql;

CREATE TRIGGER package_size_history_trigger
AFTER INSERT OR UPDATE OR DELETE ON "package_size"
FOR EACH ROW EXECUTE FUNCTION package_size_history_trigger_func();

DROP TRIGGER IF EXISTS product_subtype_history_trigger ON "product_subtype";

CREATE OR REPLACE FUNCTION product_subtype_history_trigger_func() RETURNS trigger AS $body$
BEGIN
    if (TG_OP = 'INSERT' or TG_OP = 'UPDATE') then
        INSERT INTO product_subtype_history (
        updated_at,
        order_index,
        created_at,
        id,
        order_id,
        tenant_id,
        subtype,
        type,
        operation
        )
        VALUES (
            NEW.updated_at,
           NEW.order_index,
           NEW.created_at,
           NEW.id,
           NEW.order_id,
           NEW.tenant_id,
           NEW.subtype,
           NEW.type,
            TG_OP
        );

        RETURN NEW;
    elsif (TG_OP = 'DELETE') then
        INSERT INTO product_subtype_history (
        updated_at,
        order_index,
        created_at,
        id,
        order_id,
        tenant_id,
        subtype,
        type,
        operation
        )
        VALUES (
            OLD.updated_at,
           OLD.order_index,
           OLD.created_at,
           OLD.id,
           OLD.order_id,
           OLD.tenant_id,
           OLD.subtype,
           OLD.type,
            'DELETE'
        );
        RETURN OLD;
    end if;

END;
$body$
LANGUAGE plpgsql;

CREATE TRIGGER product_subtype_history_trigger
AFTER INSERT OR UPDATE OR DELETE ON "product_subtype"
FOR EACH ROW EXECUTE FUNCTION product_subtype_history_trigger_func();
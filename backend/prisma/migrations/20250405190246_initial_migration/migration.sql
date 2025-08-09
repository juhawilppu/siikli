-- CreateTable
CREATE TABLE "tenant" (
    "id" UUID NOT NULL,
    "name" VARCHAR(255),
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

    CONSTRAINT "tenant_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "user" (
    "id" TEXT NOT NULL,
    "externalId" VARCHAR(128) NOT NULL,
    "username" VARCHAR(128) NOT NULL,
    "email" TEXT NOT NULL,
    "name" TEXT,
    "tenantId" UUID NOT NULL,

    CONSTRAINT "user_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "customer" (
    "id" UUID NOT NULL,
    "chain" VARCHAR(3) NOT NULL,
    "name" VARCHAR(50) NOT NULL,
    "address" VARCHAR(255),
    "compensation" DOUBLE PRECISION NOT NULL,
    "reference" VARCHAR(255),
    "company_name" VARCHAR(255),
    "order_index" INTEGER,
    "city" VARCHAR(255),
    "email" VARCHAR(255),
    "phone" VARCHAR(255),
    "postal_code" VARCHAR(5),
    "address2" VARCHAR(255),
    "business_id" VARCHAR(255),
    "customer_group" VARCHAR(256),
    "show_price_without_tax" BOOLEAN DEFAULT false,
    "tenantId" UUID NOT NULL,

    CONSTRAINT "customer_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "order_product" (
    "id" UUID NOT NULL,
    "order_id" UUID NOT NULL,
    "product_id" UUID NOT NULL,
    "amount" INTEGER NOT NULL,
    "price" DOUBLE PRECISION NOT NULL,
    "package_size" INTEGER NOT NULL,
    "freetext" VARCHAR(500),
    "package_type" VARCHAR(3),
    "price0" DOUBLE PRECISION NOT NULL DEFAULT 0,

    CONSTRAINT "order_product_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "product_type" (
    "id" UUID NOT NULL,
    "order_index" INTEGER NOT NULL,
    "type" VARCHAR(255),

    CONSTRAINT "product_type_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "product" (
    "id" UUID NOT NULL,
    "name" VARCHAR(50) NOT NULL,
    "type" VARCHAR(20) NOT NULL,
    "variety" VARCHAR(20) NOT NULL,
    "info" VARCHAR(20),
    "price" DOUBLE PRECISION NOT NULL,
    "order_index" INTEGER,
    "subtype" VARCHAR(255),
    "package_size" VARCHAR(255),
    "package_type" VARCHAR(255),
    "price0" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "customer_group" VARCHAR(256),
    "active" BOOLEAN DEFAULT true,

    CONSTRAINT "product_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "order" (
    "id" UUID NOT NULL,
    "customer_id" UUID NOT NULL,
    "delivery_date" DATE NOT NULL,
    "has_note" BOOLEAN NOT NULL,
    "note_body" VARCHAR(1000),
    "note_header" VARCHAR(255),
    "show_price_without_tax" BOOLEAN DEFAULT false,
    "customer_group" VARCHAR(256),
    "tenantId" UUID NOT NULL,

    CONSTRAINT "order_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "product_subtype" (
    "id" UUID NOT NULL,
    "order_index" INTEGER NOT NULL,
    "subtype" VARCHAR(255),
    "type" VARCHAR(255),
    "order_id" UUID,

    CONSTRAINT "product_subtype_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "user_externalId_key" ON "user"("externalId");

-- CreateIndex
CREATE UNIQUE INDEX "user_username_key" ON "user"("username");

-- CreateIndex
CREATE UNIQUE INDEX "user_email_key" ON "user"("email");

-- CreateIndex
CREATE INDEX "order_product_product_id_idx" ON "order_product"("product_id");

-- CreateIndex
CREATE INDEX "customer_id" ON "order"("customer_id");

-- CreateIndex
CREATE INDEX "product_subtype_order_id_idx" ON "product_subtype"("order_id");

-- CreateIndex
CREATE UNIQUE INDEX "product_subtypes_uniq" ON "product_subtype"("type", "subtype");

-- AddForeignKey
ALTER TABLE "user" ADD CONSTRAINT "user_tenantId_fkey" FOREIGN KEY ("tenantId") REFERENCES "tenant"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "customer" ADD CONSTRAINT "customer_tenantId_fkey" FOREIGN KEY ("tenantId") REFERENCES "tenant"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "order_product" ADD CONSTRAINT "FKo6helt0ucmegaeachjpx40xhe" FOREIGN KEY ("product_id") REFERENCES "product"("id") ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "order_product" ADD CONSTRAINT "order_product_order_id_fkey" FOREIGN KEY ("order_id") REFERENCES "order"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "order" ADD CONSTRAINT "order_customer_id_fkey" FOREIGN KEY ("customer_id") REFERENCES "customer"("id") ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "order" ADD CONSTRAINT "order_tenantId_fkey" FOREIGN KEY ("tenantId") REFERENCES "tenant"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "product_subtype" ADD CONSTRAINT "product_subtype_order_id_fkey" FOREIGN KEY ("order_id") REFERENCES "product_type"("id") ON DELETE NO ACTION ON UPDATE NO ACTION;

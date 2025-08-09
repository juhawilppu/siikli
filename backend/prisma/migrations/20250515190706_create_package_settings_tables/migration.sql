-- CreateTable
CREATE TABLE "package_type" (
    "id" UUID NOT NULL,
    "name" VARCHAR(255) NOT NULL,
    "tenant_id" UUID NOT NULL,

    CONSTRAINT "package_type_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "package_size" (
    "id" UUID NOT NULL,
    "size" INTEGER NOT NULL,
    "tenant_id" UUID NOT NULL,

    CONSTRAINT "package_size_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "package_type" ADD CONSTRAINT "package_type_tenant_id_fkey" FOREIGN KEY ("tenant_id") REFERENCES "tenant"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "package_size" ADD CONSTRAINT "package_size_tenant_id_fkey" FOREIGN KEY ("tenant_id") REFERENCES "tenant"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

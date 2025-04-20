-- CreateTable
CREATE TABLE "rate_limit" (
    "id" UUID NOT NULL,
    "ip" VARCHAR(255) NOT NULL,
    "key" VARCHAR(255) NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "rate_limit_pkey" PRIMARY KEY ("id")
);

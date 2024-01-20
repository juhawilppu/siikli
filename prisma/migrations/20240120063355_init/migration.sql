-- CreateTable
CREATE TABLE "Order" (
    "order_id" SERIAL NOT NULL,
    "customer_id" INTEGER NOT NULL,
    "delivery_date" TEXT NOT NULL,
    "has_note" BOOLEAN NOT NULL DEFAULT false,
    "note_header" VARCHAR(256) NOT NULL,
    "note_body" VARCHAR(256) NOT NULL,

    CONSTRAINT "Order_pkey" PRIMARY KEY ("order_id")
);

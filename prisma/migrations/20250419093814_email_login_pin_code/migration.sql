-- CreateTable
CREATE TABLE "EmailLoginPinCode" (
    "id" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "pinCode" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "EmailLoginPinCode_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "EmailLoginPinCode_email_key" ON "EmailLoginPinCode"("email");

-- AlterTable
ALTER TABLE "tenant" ADD COLUMN     "subscription_end_date" TIMESTAMP(3),
ADD COLUMN     "subscription_start_date" TIMESTAMP(3),
ADD COLUMN     "subscription_type" TEXT NOT NULL DEFAULT 'FREE',
ADD COLUMN     "trial_end_date" TIMESTAMP(3);

-- CreateEnum
CREATE TYPE "OrderStatus" AS ENUM ('WAITING_FOR_DELIVERY', 'DELIVERED', 'INVOICED');

-- AlterTable
ALTER TABLE "order" ADD COLUMN     "status" "OrderStatus" NOT NULL DEFAULT 'WAITING_FOR_DELIVERY';

-- AlterTable
ALTER TABLE "order_history" ADD COLUMN     "status" "OrderStatus" NOT NULL DEFAULT 'WAITING_FOR_DELIVERY';

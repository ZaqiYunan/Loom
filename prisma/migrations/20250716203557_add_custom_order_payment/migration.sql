-- AlterTable
ALTER TABLE "custom_orders" ADD COLUMN     "paid_at" TIMESTAMP(3),
ADD COLUMN     "payment_status" TEXT DEFAULT 'unpaid',
ADD COLUMN     "snap_token" TEXT,
ADD COLUMN     "updated_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP;

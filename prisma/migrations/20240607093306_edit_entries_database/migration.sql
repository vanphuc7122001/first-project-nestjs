-- AlterTable
ALTER TABLE "products" ADD COLUMN     "sold" INTEGER NOT NULL DEFAULT 0;

-- CreateTable
CREATE TABLE "cart-items" (
    "user_id" VARCHAR(36) NOT NULL,
    "product_id" VARCHAR(36) NOT NULL,
    "quantity" INTEGER NOT NULL,

    CONSTRAINT "cart-items_pkey" PRIMARY KEY ("user_id","product_id")
);

-- CreateTable
CREATE TABLE "order_details" (
    "order_id" VARCHAR(36) NOT NULL,
    "product_id" VARCHAR(36) NOT NULL,
    "product_name" VARCHAR(255) NOT NULL,
    "product_price" VARCHAR(255) NOT NULL,
    "product_quantity" VARCHAR(255) NOT NULL,

    CONSTRAINT "order_details_pkey" PRIMARY KEY ("order_id","product_id")
);

-- CreateTable
CREATE TABLE "orders" (
    "id" VARCHAR(36) NOT NULL,
    "user_id" VARCHAR(36) NOT NULL,
    "payment_method" VARCHAR(100) NOT NULL,
    "shipping_address" VARCHAR(255) NOT NULL,
    "shipping_method" VARCHAR(100) NOT NULL,
    "phone" VARCHAR(10) NOT NULL,
    "status" VARCHAR(30) NOT NULL,
    "total" DOUBLE PRECISION NOT NULL,
    "note" VARCHAR(255) NOT NULL,

    CONSTRAINT "orders_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "tracking_orders" (
    "user_id" VARCHAR(36) NOT NULL,
    "order_id" VARCHAR(36) NOT NULL,
    "status" VARCHAR(20) NOT NULL,
    "updated_at" TIMESTAMPTZ(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "tracking_orders_pkey" PRIMARY KEY ("order_id","status")
);

-- AddForeignKey
ALTER TABLE "cart-items" ADD CONSTRAINT "cart-items_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "cart-items" ADD CONSTRAINT "cart-items_product_id_fkey" FOREIGN KEY ("product_id") REFERENCES "products"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "order_details" ADD CONSTRAINT "order_details_order_id_fkey" FOREIGN KEY ("order_id") REFERENCES "orders"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "order_details" ADD CONSTRAINT "order_details_product_id_fkey" FOREIGN KEY ("product_id") REFERENCES "products"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "orders" ADD CONSTRAINT "orders_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "tracking_orders" ADD CONSTRAINT "tracking_orders_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "tracking_orders" ADD CONSTRAINT "tracking_orders_order_id_fkey" FOREIGN KEY ("order_id") REFERENCES "orders"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

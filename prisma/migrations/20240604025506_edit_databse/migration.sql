/*
  Warnings:

  - You are about to drop the column `adminStatus` on the `users` table. All the data in the column will be lost.
  - You are about to drop the column `userStatus` on the `users` table. All the data in the column will be lost.
  - Added the required column `admin_status` to the `users` table without a default value. This is not possible if the table is not empty.
  - Added the required column `saler_status` to the `users` table without a default value. This is not possible if the table is not empty.
  - Added the required column `user_status` to the `users` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "users" DROP COLUMN "adminStatus",
DROP COLUMN "userStatus",
ADD COLUMN     "admin_status" VARCHAR(255) NOT NULL,
ADD COLUMN     "is_saler" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "saler_status" VARCHAR(255) NOT NULL,
ADD COLUMN     "user_status" VARCHAR(255) NOT NULL;

-- CreateTable
CREATE TABLE "categories" (
    "id" VARCHAR(36) NOT NULL,
    "name" VARCHAR(255) NOT NULL,
    "description" VARCHAR(255),
    "parent_id" VARCHAR(36),
    "created_at" TIMESTAMPTZ(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ(3),
    "deleted_at" TIMESTAMPTZ(3),

    CONSTRAINT "categories_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "products" (
    "id" VARCHAR(36) NOT NULL,
    "name" VARCHAR(255) NOT NULL,
    "description" VARCHAR(255),
    "price" DOUBLE PRECISION NOT NULL,
    "category_id" VARCHAR(36) NOT NULL,
    "quantity" INTEGER NOT NULL,
    "isDraft" BOOLEAN NOT NULL DEFAULT false,
    "isPublished" BOOLEAN NOT NULL DEFAULT false,
    "created_at" TIMESTAMPTZ(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ(3),
    "deleted_at" TIMESTAMPTZ(3),

    CONSTRAINT "products_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "categories" ADD CONSTRAINT "categories_parent_id_fkey" FOREIGN KEY ("parent_id") REFERENCES "categories"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "products" ADD CONSTRAINT "products_category_id_fkey" FOREIGN KEY ("category_id") REFERENCES "categories"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

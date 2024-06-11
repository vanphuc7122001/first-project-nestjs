/*
  Warnings:

  - You are about to drop the column `total` on the `orders` table. All the data in the column will be lost.
  - Added the required column `total_before` to the `orders` table without a default value. This is not possible if the table is not empty.
  - Added the required column `totla_after` to the `orders` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "orders" DROP COLUMN "total",
ADD COLUMN     "total_before" DOUBLE PRECISION NOT NULL,
ADD COLUMN     "totla_after" DOUBLE PRECISION NOT NULL;

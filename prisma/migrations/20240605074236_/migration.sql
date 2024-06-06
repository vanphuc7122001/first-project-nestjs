/*
  Warnings:

  - You are about to drop the column `isPublished` on the `products` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "products" DROP COLUMN "isPublished",
ADD COLUMN     "is_publish" BOOLEAN NOT NULL DEFAULT false;

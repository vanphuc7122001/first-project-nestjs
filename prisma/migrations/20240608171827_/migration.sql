/*
  Warnings:

  - You are about to drop the `_CategoryToProduct` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropForeignKey
ALTER TABLE "_CategoryToProduct" DROP CONSTRAINT "_CategoryToProduct_A_fkey";

-- DropForeignKey
ALTER TABLE "_CategoryToProduct" DROP CONSTRAINT "_CategoryToProduct_B_fkey";

-- DropTable
DROP TABLE "_CategoryToProduct";

-- CreateTable
CREATE TABLE "products_on_catetories" (
    "category_id" VARCHAR(36) NOT NULL,
    "product_id" VARCHAR(36) NOT NULL,

    CONSTRAINT "products_on_catetories_pkey" PRIMARY KEY ("category_id","product_id")
);

-- AddForeignKey
ALTER TABLE "products_on_catetories" ADD CONSTRAINT "products_on_catetories_category_id_fkey" FOREIGN KEY ("category_id") REFERENCES "categories"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "products_on_catetories" ADD CONSTRAINT "products_on_catetories_product_id_fkey" FOREIGN KEY ("product_id") REFERENCES "products"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

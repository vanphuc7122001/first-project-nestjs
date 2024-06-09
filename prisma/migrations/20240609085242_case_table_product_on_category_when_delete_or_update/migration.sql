-- DropForeignKey
ALTER TABLE "products_on_catetories" DROP CONSTRAINT "products_on_catetories_category_id_fkey";

-- DropForeignKey
ALTER TABLE "products_on_catetories" DROP CONSTRAINT "products_on_catetories_product_id_fkey";

-- AddForeignKey
ALTER TABLE "products_on_catetories" ADD CONSTRAINT "products_on_catetories_category_id_fkey" FOREIGN KEY ("category_id") REFERENCES "categories"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "products_on_catetories" ADD CONSTRAINT "products_on_catetories_product_id_fkey" FOREIGN KEY ("product_id") REFERENCES "products"("id") ON DELETE CASCADE ON UPDATE CASCADE;

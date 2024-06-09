import { ProductOnCategoryRepository, ProductRepository } from "./repositories";

import { CategoryModule } from "@modules/category/category.module";
import { Module } from "@nestjs/common";
import { ProductController } from "./controllers";
import { ProductService } from "./services";

@Module({
  imports: [CategoryModule],
  controllers: [ProductController],
  providers: [ProductService, ProductRepository, ProductOnCategoryRepository],
})
export class ProductModule {}

import { Module } from "@nestjs/common";
import { ProductController } from "./controllers";
import { ProductRepository } from "./repositories";
import { ProductService } from "./services";

@Module({
  controllers: [ProductController],
  providers: [ProductService, ProductRepository],
})
export class ProductModule {}

import { CategoryController } from "./controllers";
import { CategoryRepository } from "./repositories";
import { CategoryService } from "./services";
import { Module } from "@nestjs/common";

@Module({
  providers: [CategoryRepository, CategoryService],
  controllers: [CategoryController],
})
export class CategoryModule {}

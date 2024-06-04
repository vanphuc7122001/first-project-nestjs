import { Controller, Post } from "@nestjs/common";

@Controller("categories")
export class CategoryController {
  @Post()
  createCategory() {
    return "create category";
  }
}

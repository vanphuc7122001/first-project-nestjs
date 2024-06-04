import { Controller, Delete, Get, Param, Patch, Post } from "@nestjs/common";

@Controller("products")
export class ProductController {
  @Post()
  createProduct() {
    return "create product";
  }

  @Get(":id")
  getProduct(@Param("id") id: string) {
    return "get product detail";
  }

  @Get("publishes")
  getProductsPublished() {
    return "get products";
  }

  @Get("un-publishes")
  getProductsUnPublished() {
    return "get products";
  }

  @Patch(":id")
  updateInfoProduct(@Param("id") id: string) {
    return "update product";
  }

  @Patch("publish/:id")
  publishProduct(@Param("id") id: string) {
    return "update product";
  }

  @Patch("un-publish/:id")
  unPublishProduct(@Param("id") id: string) {
    return "update product";
  }

  @Delete(":id")
  removeProduct(@Param("id") id: string) {
    return "Delete product";
  }
}

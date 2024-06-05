import { JoiValidationPipe } from "@common/pipes";
import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
} from "@nestjs/common";
import { CreateProductValidator } from "../validators";
import { ProductService } from "../services";
import { CreateProductDto } from "../dtos/create-product.dto";

@Controller("products")
export class ProductController {
  constructor(private readonly _productService: ProductService) {}
  @Post()
  async createProduct(
    @Body(new JoiValidationPipe(CreateProductValidator)) data: CreateProductDto
  ) {
    return await this._productService.createProduct(data);
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

  // TODO add table order handle after
  @Delete(":id")
  removeProduct(@Param("id") id: string) {
    return "Delete product";
  }
}

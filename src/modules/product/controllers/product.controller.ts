import { JoiValidationPipe } from "@common/pipes";
import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
  Query,
  Req,
  UseGuards,
} from "@nestjs/common";
import { CreateProductValidator, UpdateProductValidator } from "../validators";
import { ProductService } from "../services";
import { CreateProductDto } from "../dtos/create-product.dto";
import { AdminJwtAccessAuthGuard } from "@modules/auth/guards";
import { BaseQueryParamsValidator } from "@common/validators";
import { BaseQueryParams } from "@common/dtos";
import { Request } from "express";
import { ResponseService } from "@shared/response/response.service";
import { UpdateProductDto } from "../dtos/update-product.dto.";

@Controller("products")
export class ProductController {
  constructor(private readonly _productService: ProductService) {}

  @UseGuards(AdminJwtAccessAuthGuard)
  @Post()
  async createProduct(
    @Body(new JoiValidationPipe(CreateProductValidator)) data: CreateProductDto
  ) {
    return await this._productService.createProduct(data);
  }

  @Get(":id")
  async getProduct(@Param("id") id: string) {
    return await this._productService.getProduct(id);
  }

  @Get("")
  async getProducts(
    @Query(new JoiValidationPipe(BaseQueryParamsValidator))
    query: BaseQueryParams,
    @Req() req: Request
  ) {
    const { count, data } = await this._productService.getProducts(query);

    return ResponseService.paginateResponse({
      count,
      data,
      query,
      req,
    });
  }

  @UseGuards(AdminJwtAccessAuthGuard)
  @Get("publishes")
  async getProductsPublished(@Param("id") id: string) {
    return "Get Products Published";
  }

  @Get("un-publishes")
  getProductsUnPublished() {
    return "get products";
  }

  @UseGuards(AdminJwtAccessAuthGuard)
  @Patch(":id")
  updateInfoProduct(
    @Param("id") id: string,
    @Body(new JoiValidationPipe(UpdateProductValidator)) data: UpdateProductDto
  ) {
    return this._productService.updateInfoProduct(id, data);
  }

  @UseGuards(AdminJwtAccessAuthGuard)
  @Patch("publish/:id")
  async publishProduct(@Param("id") id: string) {
    return await this._productService.publishProduct(id);
  }

  @UseGuards(AdminJwtAccessAuthGuard)
  @Patch("un-publish/:id")
  async unPublishProduct(@Param("id") id: string) {
    return await this._productService.unPublishProduct(id);
  }

  // TODO add table order handle after
  @Delete(":id")
  removeProduct(@Param("id") id: string) {
    return "Delete product";
  }
}

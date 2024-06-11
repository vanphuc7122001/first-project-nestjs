import { JoiValidationPipe } from "@common/pipes";
import {
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
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
import { UpdateProductDto } from "../dtos/update-product.dto";
import { HttpStatusCode } from "axios";
import { AuthGuard } from "@nestjs/passport";
import {
  ADMIN_JWT_ACCESS_STRATEGY,
  JWT_ACCESS_STRATEGY,
  SALER_JWT_ACCESS_STRATEGY,
} from "@modules/auth/strategies";

@Controller("products")
export class ProductController {
  constructor(private readonly _productService: ProductService) {}

  @HttpCode(HttpStatusCode.Created)
  @UseGuards(
    AuthGuard([
      SALER_JWT_ACCESS_STRATEGY,
      ADMIN_JWT_ACCESS_STRATEGY,
      JWT_ACCESS_STRATEGY,
    ])
  )
  @Post()
  async createProduct(
    @Body(new JoiValidationPipe(CreateProductValidator)) data: CreateProductDto
  ) {
    const result = await this._productService.createProduct(data);
    return {
      ...result,
    };
  }

  @HttpCode(HttpStatusCode.Ok)
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

  @HttpCode(HttpStatusCode.Ok)
  @Get("categories/:id/specific")
  async getProductsByCategoryByIdSpecific(
    @Query(new JoiValidationPipe(BaseQueryParamsValidator))
    query: BaseQueryParams,
    @Req() req: Request,
    @Param("id") id: string
  ) {
    const { count, data } =
      await this._productService.getProductsByCategoryByIdSpecific(query, id);

    return ResponseService.paginateResponse({
      count,
      data,
      query,
      req,
    });
  }

  @HttpCode(HttpStatusCode.Ok)
  @UseGuards(AdminJwtAccessAuthGuard)
  @Get("publishes")
  async getProductsPublish(
    @Query(new JoiValidationPipe(BaseQueryParamsValidator))
    query: BaseQueryParams,
    @Req() req: Request
  ) {
    const { count, data } = await this._productService.getProductsPublish(
      query
    );

    return ResponseService.paginateResponse({
      count,
      data,
      query,
      req,
    });
  }

  @HttpCode(HttpStatusCode.Ok)
  @Get("un-publishes")
  async getProductsUnPublished(
    @Query(new JoiValidationPipe(BaseQueryParamsValidator))
    query: BaseQueryParams,
    @Req() req: Request
  ) {
    const { count, data } = await this._productService.getProductsUnPublish(
      query
    );

    return ResponseService.paginateResponse({
      count,
      data,
      query,
      req,
    });
  }

  @HttpCode(HttpStatusCode.Ok)
  @UseGuards(AdminJwtAccessAuthGuard)
  @Patch(":id")
  async updateInfoProduct(
    @Param("id") id: string,
    @Body(new JoiValidationPipe(UpdateProductValidator)) data: UpdateProductDto
  ) {
    const result = await this._productService.updateInfoProduct(id, data);
    return {
      ...result,
    };
  }

  @HttpCode(HttpStatusCode.Ok)
  @UseGuards(AdminJwtAccessAuthGuard)
  @Patch("publish/:id")
  async publishProduct(@Param("id") id: string) {
    const result = await this._productService.publishProduct(id);

    return {
      ...result,
    };
  }

  @HttpCode(HttpStatusCode.Ok)
  @UseGuards(AdminJwtAccessAuthGuard)
  @Patch("un-publish/:id")
  async unPublishProduct(@Param("id") id: string) {
    const result = await this._productService.unPublishProduct(id);

    return {
      ...result,
    };
  }

  // TODO add table order handle after
  @HttpCode(HttpStatusCode.NoContent)
  @Delete(":id")
  async removeProduct(@Param("id") id: string) {
    const result = await this._productService.removeProduct(id);
    return {
      ...result,
    };
  }

  @HttpCode(HttpStatusCode.Created)
  @Get(":id")
  async getProduct(@Param("id") id: string) {
    const result = await this._productService.getProduct(id);

    return {
      ...result,
    };
  }
}

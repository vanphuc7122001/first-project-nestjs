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

import {
  AdminJwtAccessAuthGuard,
  SalerJwtAccessAuthGuard,
} from "@modules/auth/guards";
import { CreateCategoryDto, UpdateCategoryDto } from "../dtos";
import { JoiValidationPipe } from "@common/pipes";
import {
  CreateCategoryValidator,
  UpdateCategoryValidator,
} from "../validators";
import { CategoryService } from "../services";
import { BaseQueryParamsValidator } from "@common/validators";
import { BaseQueryParams } from "@common/dtos";
import { ResponseService } from "@shared/response/response.service";
import { Request } from "express";
import { HttpStatusCode } from "axios";

@Controller("categories")
export class CategoryController {
  constructor(private readonly _categoryService: CategoryService) {}

  @HttpCode(HttpStatusCode.Created)
  @Post()
  @UseGuards(AdminJwtAccessAuthGuard)
  async createCategory(
    @Body(new JoiValidationPipe(CreateCategoryValidator))
    data: CreateCategoryDto
  ) {
    const result = await this._categoryService.createCategory(data);
    return {
      ...result,
    };
  }

  @HttpCode(HttpStatusCode.Ok)
  @Get()
  @UseGuards(AdminJwtAccessAuthGuard)
  async getCategories(
    @Query(new JoiValidationPipe(BaseQueryParamsValidator))
    query: BaseQueryParams,
    @Req() req: Request
  ) {
    const { count, data } = await this._categoryService.getCategories(query);

    return ResponseService.paginateResponse({
      data,
      count,
      query,
      req,
    });
  }

  @HttpCode(HttpStatusCode.Ok)
  @Patch(":id")
  @UseGuards(AdminJwtAccessAuthGuard)
  async updateCategory(
    @Body(new JoiValidationPipe(UpdateCategoryValidator))
    data: UpdateCategoryDto,
    @Param("id") id: string
  ) {
    const result = await this._categoryService.updateCategory(id, data);
    return {
      ...result,
    };
  }

  @HttpCode(HttpStatusCode.NoContent)
  @Delete(":id")
  async deleteCategory(@Param("id") id: string) {
    const result = await this._categoryService.deleteCategory(id);
    return {
      ...result,
    };
  }
}

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

import { AdminJwtAccessAuthGuard } from "@modules/auth/guards";
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

@Controller("categories")
export class CategoryController {
  constructor(private readonly _categoryService: CategoryService) {}
  @Post()
  @UseGuards(AdminJwtAccessAuthGuard)
  async createCategory(
    @Body(new JoiValidationPipe(CreateCategoryValidator))
    data: CreateCategoryDto
  ) {
    return await this._categoryService.createCategory(data);
  }

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

  @Patch(":id")
  @UseGuards(AdminJwtAccessAuthGuard)
  async updateCategory(
    @Body(new JoiValidationPipe(UpdateCategoryValidator))
    data: UpdateCategoryDto,
    @Param("id") id: string
  ) {
    return await this._categoryService.updateCategory(id, data);
  }

  @Delete(":id")
  async deleteCategory(@Param("id") id: string) {
    return await this._categoryService.deleteCategory(id);
  }
}

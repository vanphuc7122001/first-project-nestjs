import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from "@nestjs/common";
import { CATEGORY_ERRORS, PRODUCT_ERRORS } from "src/content/errors";

import { CategoryService } from "@modules/category/services";
import { CreateProductDto } from "../dtos/create-product.dto";
import { PRODUCT_SUCCESS } from "src/content/succeses/product.success";
import { Prisma } from "@prisma/client";
import { ProductRepository } from "../repositories";

@Injectable()
export class ProductService {
  constructor(
    private readonly _productRepository: ProductRepository,
    private readonly _categoryService: CategoryService
  ) {}

  /** ============================== CRUD ============================== */
  async createProduct(data: CreateProductDto) {
    const { name, categories, ...rest } = data;

    const categoryIds = categories.map((item) => item.id);

    const [foundProduct, duplicates, _] = await Promise.all([
      this._findProductByName(name),
      this._categoryService.checkDuplicateCategoryIds(categoryIds),
      await Promise.all(
        // Have check category in database ?
        categories.map(async (category) => {
          return await this._categoryService.findCategoryById(category.id);
        })
      ),
    ]);

    // Have check product name already exists in db?
    if (foundProduct) {
      throw new NotFoundException(PRODUCT_ERRORS.PRODUCT_02.message);
    }

    // Have check id of category unique ?
    if (duplicates.length > 0) {
      throw new BadRequestException(PRODUCT_ERRORS.PRODUCT_03.message);
    }

    await this._productRepository.create({
      name,
      ...rest,
      categories: {
        connect: categoryIds.map((id) => ({ id })),
      },
    });

    return {
      message: PRODUCT_SUCCESS.CREATE_PRODUCT,
    };
  }

  /** ============================== Func general ============================== */
  private async _findProductByName(name: string) {
    return await this._productRepository.findOne({
      where: {
        name,
      },
    });
  }
}

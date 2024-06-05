import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from "@nestjs/common";

import { BaseQueryParams } from "@common/dtos";
import { CategoryService } from "@modules/category/services";
import { CreateProductDto } from "../dtos/create-product.dto";
import { PRODUCT_ERRORS } from "src/content/errors";
import { PRODUCT_SUCCESS } from "src/content/succeses/product.success";
import { ProductRepository } from "../repositories";
import { UpdateProductDto } from "../dtos/update-product.dto.";

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
          const foundCategory = await this._categoryService.findCategoryById(
            category.id
          );

          // Have check level category === 2?
          if (foundCategory.level !== 2)
            throw new BadRequestException(PRODUCT_ERRORS.PRODUCT_04.message);

          return foundCategory;
        })
      ),
    ]);

    // Have check product name already exists in db?
    if (foundProduct)
      throw new NotFoundException(PRODUCT_ERRORS.PRODUCT_02.message);

    // Have check id of category unique ?
    if (duplicates.length > 0)
      throw new BadRequestException(PRODUCT_ERRORS.PRODUCT_03.message);

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

  async getProduct(id: string) {
    return await this._findProductById(id);
  }

  async getProducts(query: BaseQueryParams) {
    const { page = 1, limit = 10, search, sort } = query;

    const [count, data] = await Promise.all([
      this._productRepository.count({
        where: {
          name: {
            contains: search,
          },
          deletedAt: null,
        },
      }),
      this._productRepository.findMany({
        where: {
          name: {
            contains: search,
          },
          deletedAt: null,
        },
        include: {
          categories: true,
        },
        skip: (page - 1) * limit,
        take: limit,
        orderBy: sort,
      }),
    ]);

    return {
      count,
      data,
    };
  }

  async updateInfoProduct(id: string, data: UpdateProductDto) {
    const { name, categories, ...rest } = data;

    const categoryIds = categories && categories.map((item) => item.id);

    const [foundProduct, duplicates, _] = await Promise.all([
      name && this._findProductByName(name),
      categories &&
        this._categoryService.checkDuplicateCategoryIds(categoryIds),
      categories &&
        (await Promise.all(
          // Have check category in database ?
          categories.map(async (category) => {
            const foundCategory = await this._categoryService.findCategoryById(
              category.id
            );

            // Have check level category === 2?
            if (foundCategory.level !== 2)
              throw new BadRequestException(PRODUCT_ERRORS.PRODUCT_04.message);

            return foundCategory;
          })
        )),
    ]);

    // Have check product name already exists in db?
    if (foundProduct)
      throw new NotFoundException(PRODUCT_ERRORS.PRODUCT_02.message);

    // Have check id of category unique ?
    if (duplicates.length > 0)
      throw new BadRequestException(PRODUCT_ERRORS.PRODUCT_03.message);

    await this._productRepository.update({
      where: {
        id,
      },
      data: {
        ...data,
        categories: {
          set: [],
          connect: categoryIds.map((id) => ({ id })),
        },
      },
    });
    return {
      message: PRODUCT_SUCCESS.UPDATE_PRODUCT,
    };
  }

  async publishProduct(id: string) {
    await this._productRepository.update({
      where: {
        id,
      },
      data: {
        isPublished: true,
      },
    });

    return {
      message: PRODUCT_SUCCESS.PUBLISH_PRODUCT_SUCCESS,
    };
  }

  async unPublishProduct(id: string) {
    await this._productRepository.update({
      where: {
        id,
      },
      data: {
        isPublished: true,
      },
    });

    return {
      message: PRODUCT_SUCCESS.UNPUBLISH_PRODUCT_SUCCESS,
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

  private async _findProductById(id: string) {
    return await this._productRepository
      .findOneOrThrow({
        where: {
          id,
          deletedAt: null,
        },
        include: {
          categories: true,
        },
      })
      .catch(() => {
        throw new NotFoundException(PRODUCT_ERRORS.PRODUCT_01.message);
      });
  }
}

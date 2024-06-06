import {
  BadRequestException,
  ConflictException,
  Injectable,
  NotFoundException,
} from "@nestjs/common";
import { CATEGORY_ERRORS, PRODUCT_ERRORS } from "src/content/errors";

import { BaseQueryParams } from "@common/dtos";
import { CategoryService } from "@modules/category/services";
import { CreateProductDto } from "../dtos/create-product.dto";
import { ProductRepository } from "../repositories";
import { UpdateProductDto } from "../dtos/update-product.dto.";
import { isObject } from "@common/utils";

@Injectable()
export class ProductService {
  constructor(
    private readonly _productRepository: ProductRepository,
    private readonly _categoryService: CategoryService
  ) {}

  /** ============================== CRUD ============================== */
  async createProduct(data: CreateProductDto) {
    const { name, categoryId, ...rest } = data;

    const [foundProductName, foundCategory] = await Promise.all([
      this._findProductByName(name),
      this._categoryService.findOne(
        { id: categoryId },
        {
          id: true,
          parent: {
            select: {
              id: true,
              parent: {
                select: {
                  id: true,
                },
              },
            },
          },
        }
      ),
    ]);

    // Have check product name already exists in db?
    if (foundProductName) {
      throw new NotFoundException(PRODUCT_ERRORS.PRODUCT_02.message);
    }

    // Have check category exists in db?
    if (!foundCategory) {
      throw new NotFoundException(CATEGORY_ERRORS.CATEGORY_04.message);
    }

    const categoryIds = this._recursiveCategoryIds(foundCategory);
    // const categoryIds = [
    //   foundCategory.id,
    //   foundCategory?.parentId,
    //   foundCategory?.parent?.parentId,
    // ].filter((id) => id);

    await this._productRepository.create({
      name,
      ...rest,
      categories: {
        connect: categoryIds.map((id) => ({ id })),
      },
    });

    return {
      success: true,
    };
  }

  async getProduct(id: string) {
    const foundProduct = await this._productRepository.findOne({
      where: {
        id,
      },
    });

    if (!foundProduct) {
      throw new NotFoundException(PRODUCT_ERRORS.PRODUCT_01.message);
    }

    return {
      ...foundProduct,
    };
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

  async getProductsByCategoryById(query: BaseQueryParams, id: string) {
    const { page = 1, limit = 10, search, sort } = query;

    const [count, data] = await Promise.all([
      this._productRepository.count({
        where: {
          categories: {
            some: {
              id,
            },
          },
          name: {
            contains: search,
          },
        },
      }),
      this._productRepository.findMany({
        where: {
          categories: {
            some: {
              id,
            },
          },
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

  async getProductsPublish(query: BaseQueryParams) {
    const { page = 1, limit = 10, search, sort } = query;

    const [count, data] = await Promise.all([
      this._productRepository.count({
        where: {
          name: {
            contains: search,
          },
          deletedAt: null,
          isPublished: true,
        },
      }),
      this._productRepository.findMany({
        where: {
          name: {
            contains: search,
          },
          deletedAt: null,
          isPublished: true,
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

  async getProductsUnPublish(query: BaseQueryParams) {
    const { page = 1, limit = 10, search, sort } = query;

    const [count, data] = await Promise.all([
      this._productRepository.count({
        where: {
          name: {
            contains: search,
          },
          deletedAt: null,
          isPublished: false,
        },
      }),
      this._productRepository.findMany({
        where: {
          name: {
            contains: search,
          },
          deletedAt: null,
          isPublished: false,
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
    const { name, categoryId, ...rest } = data;

    const [foundProduct, foundCategory] = await Promise.all([
      this._productRepository.findOne({ where: { id } }),
      this._categoryService.findOne(
        { id: categoryId },
        {
          id: true,
          parent: {
            select: {
              id: true,
              parent: {
                select: {
                  id: true,
                },
              },
            },
          },
        }
      ),
    ]);

    if (!foundProduct) {
      throw new NotFoundException(PRODUCT_ERRORS.PRODUCT_01.message);
    }

    // // Have check product name already exists in db?
    if (foundProduct.name === name) {
      throw new ConflictException(PRODUCT_ERRORS.PRODUCT_02.message);
    }

    // Have check category exists in db?
    if (!foundCategory) {
      throw new NotFoundException(CATEGORY_ERRORS.CATEGORY_04.message);
    }

    const categoryIds = this._recursiveCategoryIds(foundCategory);

    await this._productRepository.update({
      where: {
        id,
      },
      data: {
        name,
        ...rest,
        categories: {
          set: [],
          connect: categoryIds.map((id) => ({ id })),
        },
      },
    });
    return {
      success: true,
    };
  }

  async publishProduct(id: string) {
    const foundProduct = await this._productRepository.findOne({
      where: {
        id,
        deletedAt: null,
      },
    });

    if (!foundProduct) {
      throw new NotFoundException(PRODUCT_ERRORS.PRODUCT_01.message);
    }

    const result = await this._productRepository.update({
      where: {
        id,
        deletedAt: null,
      },
      data: {
        isPublished: true,
      },
      select: {
        id: true,
        name: true,
        categories: {
          select: {
            id: true,
            name: true,
            level: true,
          },
        },
      },
    });

    return { ...result };
  }

  async unPublishProduct(id: string) {
    const foundProduct = await this._productRepository.findOne({
      where: {
        id,
        deletedAt: null,
      },
    });

    if (!foundProduct) {
      throw new NotFoundException(PRODUCT_ERRORS.PRODUCT_01.message);
    }

    const result = await this._productRepository.update({
      where: {
        id,
        deletedAt: null,
      },
      data: {
        isPublished: false,
      },
      select: {
        id: true,
        name: true,
        categories: {
          select: {
            id: true,
            name: true,
            level: true,
          },
        },
      },
    });

    return {
      ...result,
    };
  }

  // TODO : when having order then check condition remove
  async removeProduct(id: string) {
    const foundProduct = await this._productRepository.findOne({
      where: {
        id,
        deletedAt: null,
      },
    });

    if (!foundProduct) {
      throw new NotFoundException(PRODUCT_ERRORS.PRODUCT_01.message);
    }

    await this._productRepository.delete({
      id,
    });

    return {};
  }

  /** ============================== Func general ============================== */
  private async _findProductByName(name: string) {
    return await this._productRepository.findOne({
      where: {
        name,
      },
      select: {
        categories: true,
      },
    });
  }

  private _recursiveCategoryIds(categoryObject) {
    let categoryIds = [categoryObject.id];

    if (isObject(categoryObject.parent)) {
      categoryIds = [
        ...categoryIds,
        ...this._recursiveCategoryIds(categoryObject.parent),
      ];
    }

    return categoryIds;
  }
}

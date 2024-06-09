import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from "@nestjs/common";
import { CATEGORY_ERRORS, PRODUCT_ERRORS } from "src/content/errors";
import {
  ProductOnCategoryRepository,
  ProductRepository,
} from "../repositories";

import { BaseQueryParams } from "@common/dtos";
import { CategoryService } from "@modules/category/services";
import { CreateProductDto } from "../dtos/create-product.dto";
import { PrismaService } from "@shared/prisma/prisma.service";
import { UpdateProductDto } from "../dtos/update-product.dto.";
import { isObject } from "@common/utils";
import { randomUUID } from "crypto";

@Injectable()
export class ProductService {
  constructor(
    private readonly _productRepository: ProductRepository,
    private readonly _categoryService: CategoryService,
    private readonly _productOnCategoryRepository: ProductOnCategoryRepository
  ) {}

  /** ============================== CRUD ============================== */
  async createProduct(data: CreateProductDto) {
    const { name, categories, ...rest } = data;

    let ids = [];

    const categoryIds = new Set(categories.map((item) => item.id));

    const [foundProductName, _] = await Promise.all([
      this._findProductByName(name),
      await Promise.all(
        // Have check category in database ?
        [...categoryIds].map(async (categoryId) => {
          const foundCategory = await this._categoryService.findCategoryById(
            categoryId
          );

          if (!foundCategory) {
            throw new BadRequestException(CATEGORY_ERRORS.CATEGORY_04.message);
          }

          ids = [...ids, ...this._recursiveCategoryIds(foundCategory)];

          return foundCategory;
        })
      ),
    ]);

    // Have check product name already exists in db?
    if (foundProductName) {
      throw new NotFoundException(PRODUCT_ERRORS.PRODUCT_02.message);
    }

    const productId = randomUUID();

    await this._productRepository.create({
      name,
      ...rest,
      categories: {
        create: ids.map((id) => ({
          category: {
            connect: {
              id,
            },
          },
        })),
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

  async getProductsByCategoryByIdSpecific(query: BaseQueryParams, id: string) {
    const { page = 1, limit = 10, search, sort } = query;

    const [count, data] = await Promise.all([
      this._productRepository.count({
        where: {
          categories: {
            some: {
              categoryId: id,
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
              categoryId: id,
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

  async updateInfoProduct(productId: string, data: UpdateProductDto) {
    const { name, categories, ...rest } = data;

    let ids = [];

    const categoryIds =
      (categories.length > 0 ?? []) &&
      new Set(categories.map((item) => item.id));

    const foundProductName = await this._findProductById(productId);

    // Have check product name already exists in db?
    if (foundProductName.name === name) {
      throw new NotFoundException(PRODUCT_ERRORS.PRODUCT_02.message);
    }

    categories &&
      (await Promise.all(
        // Have check category in database ?
        categories.map(async (category) => {
          const foundCategory = await this._categoryService.findCategoryById(
            category.id
          );

          if (!foundCategory) {
            throw new BadRequestException(CATEGORY_ERRORS.CATEGORY_04.message);
          }

          ids = [...ids, ...this._recursiveCategoryIds(foundCategory)];

          return foundCategory;
        })
      ));

    if (categoryIds) {
      const listProductOnCategory =
        await this._productOnCategoryRepository.findMany({
          where: {
            productId,
          },
        });

      const categoryIdsDisconnected = listProductOnCategory.map(
        (item) => item.categoryId
      );

      await Promise.all(
        categoryIdsDisconnected.map(async (id) => {
          await this._productOnCategoryRepository.delete({
            categoryId_productId: {
              categoryId: id,
              productId,
            },
          });
        })
      );

      await this._productRepository.update({
        data: {
          name: name ?? foundProductName.name,
          ...rest,
          categories: {
            create: ids.map((id) => ({
              category: {
                connect: {
                  id,
                },
              },
            })),
          },
        },
        where: {
          id: productId,
        },
      });
    }

    if (!categoryIds) {
      await this._productRepository.update({
        data: {
          name: name ?? foundProductName.name,
          ...rest,
        },
        where: {
          id: productId,
        },
      });
    }

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
            category: {
              select: {
                id: true,
                name: true,
                level: true,
                parentId: true,
              },
            },
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
            category: {
              select: {
                id: true,
                name: true,
                level: true,
              },
            },
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
    const result = await this._productRepository.findOne({
      where: {
        name,
      },
      select: {
        categories: true,
      },
    });
    return result;
  }

  private async _findProductById(id: string) {
    const result = await this._productRepository.findOne({
      where: {
        id,
      },
    });

    return result;
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

import {
  BadRequestException,
  ConflictException,
  Injectable,
  NotFoundException,
} from "@nestjs/common";
import { CreateCategoryDto, UpdateCategoryDto } from "../dtos";

import { BaseQueryParams } from "@common/dtos";
import { CATEGORY_ERRORS } from "src/content/errors";
import { CATEGORY_SUCCESS } from "src/content/succeses";
import { CategoryRepository } from "../repositories";

@Injectable()
export class CategoryService {
  constructor(private readonly _categoryRepository: CategoryRepository) {}
  /** ============================== CRUD ============================== */

  async createCategory(data: CreateCategoryDto) {
    const { name, parentId } = data;

    if (!parentId) {
      const foundCategory = await this._categoryRepository.findCategoryByName(
        name
      );

      if (!foundCategory) {
        await this._categoryRepository.create({ name, level: 0 });
      }

      throw new ConflictException(CATEGORY_ERRORS.CATEGORY_01.message);
    }

    const foundParent = await this._categoryRepository
      .findOneOrThrow({
        where: {
          id: parentId,
        },
      })
      .catch(() => {
        throw new NotFoundException(CATEGORY_ERRORS.CATEGORY_02.message);
      });

    if (foundParent.level === 2) {
      throw new BadRequestException(CATEGORY_ERRORS.CATEGORY_03.message);
    }

    await this._categoryRepository.create({
      name,
      parent: {
        connect: {
          id: parentId,
        },
      },
      level: foundParent.level + 1,
    });

    return {
      message: CATEGORY_SUCCESS.CREATE_CATEGORY,
    };
  }

  async getCategories(query: BaseQueryParams) {
    const { page = 1, limit = 10 } = query;
    const [count, data] = await Promise.all([
      this._categoryRepository.count({}),
      this._categoryRepository.findMany({
        where: {
          level: 0,
        },
        include: {
          children: {
            include: {
              children: true,
            },
          },
        },
        skip: (page - 1) * limit,
        take: limit,
      }),
    ]);

    return {
      count,
      data,
    };
  }

  async updateCategory(id: string, data: UpdateCategoryDto) {
    await Promise.all([
      this.findCategoryById(id),
      this._categoryRepository.update({
        where: {
          id,
        },
        data,
      }),
    ]);

    return {
      message: CATEGORY_SUCCESS.UPDATE_CATEGORY,
    };
  }

  async deleteCategory(id: string) {
    const foundCategory = await this._categoryRepository
      .findOneOrThrowWithInclude({ id }, { children: true, products: true })
      .catch(() => {
        throw new NotFoundException(CATEGORY_ERRORS.CATEGORY_04.message);
      });

    if (
      foundCategory.children.length > 0 ||
      foundCategory.products.length > 0
    ) {
      throw new BadRequestException(CATEGORY_ERRORS.CATEGORY_05.message);
    }

    await this._categoryRepository.delete({ id });

    return {
      message: CATEGORY_SUCCESS.DELETE_CATEGORY,
    };
  }

  /** ============================== Func general ============================== */
  async findCategoryById(id: string) {
    return await this._categoryRepository
      .findOneOrThrow({
        where: {
          id,
        },
      })
      .catch(() => {
        throw new NotFoundException(CATEGORY_ERRORS.CATEGORY_04.message);
      });
  }

  async checkDuplicateCategoryIds(arr: string[]): Promise<string[]> {
    const duplicates: string[] = [];
    const seen = new Set<string>();

    for (const item of arr) {
      if (seen.has(item)) {
        duplicates.push(item);
      } else {
        seen.add(item);
      }
    }

    return duplicates;
  }
}

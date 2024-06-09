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
import { Prisma } from "@prisma/client";

@Injectable()
export class CategoryService {
  constructor(private readonly _categoryRepository: CategoryRepository) {}
  /** ============================== CRUD ============================== */

  async createCategory(data: CreateCategoryDto) {
    const { name, parentId } = data;

    const foundName = await this._categoryRepository.findOne({
      name,
    });

    if (foundName) {
      throw new ConflictException(CATEGORY_ERRORS.CATEGORY_01.message);
    }

    if (!parentId) {
      return await this._categoryRepository.create({ name, level: 0 });
    }

    const foundParent = await this._categoryRepository.findOne({
      id: parentId,
    });

    if (!foundParent) {
      throw new NotFoundException(CATEGORY_ERRORS.CATEGORY_02.message);
    }

    // Have check level of parent ? => can not create sub level 4, sub have 3 level : 0,1,2
    if (foundParent.level === 2) {
      throw new BadRequestException(CATEGORY_ERRORS.CATEGORY_03.message);
    }

    const newCategory = await this._categoryRepository.create(
      {
        name,
        parent: {
          connect: {
            id: parentId,
          },
        },
        level: foundParent.level + 1,
      },
      {
        id: true,
        level: true,
        name: true,
        parentId: true,
      }
    );

    return {
      ...newCategory,
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
    const { name } = data;
    const isCategory = await this.findCategoryById(id); // this function was check not found

    if (!isCategory) {
      throw new NotFoundException(CATEGORY_ERRORS.CATEGORY_04.message);
    }

    if (isCategory.name === name) {
      throw new ConflictException(CATEGORY_ERRORS.CATEGORY_01.message);
    }

    const result = await this._categoryRepository.update({
      where: {
        id,
      },
      data,
      select: {
        id: true,
        level: true,
        name: true,
        parent: true,
      },
    });

    return {
      ...result,
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

    return {};
  }

  /** ============================== Func general ============================== */
  async findCategoryById(id: string) {
    return await this._categoryRepository.findOne(
      { id },
      { parent: true, id: true, level: true, name: true, parentId: true }
    );
  }

  async findOne(
    where: Prisma.CategoryWhereInput,
    select?: Prisma.CategorySelect
  ) {
    return this._categoryRepository.findOne(where, select);
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

  private _recusiveCategory(categoryIds: any): string[] {
    let ids = [categoryIds.id];

    if (categoryIds.children.length > 0) {
      ids = [
        ...ids,
        ...categoryIds.children.reduce((acc, item) => {
          return [...acc, ...this._recusiveCategory(item)];
        }, []),
      ];
      // [
      //   ...ids,
      //   ...categoryIds.children.map((item) => ...this._recusiveCategory(item))
      // ]
    }

    return ids;
  }
}

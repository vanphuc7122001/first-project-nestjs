import {
  BadRequestException,
  ConflictException,
  Injectable,
  NotFoundException,
} from "@nestjs/common";
import { CreateCategoryDto, UpdateCategoryDto } from "../dtos";

import { BaseQueryParams } from "@common/dtos";
import { CategoryRepository } from "../repositories";

@Injectable()
export class CategoryService {
  constructor(private readonly _categoryRepository: CategoryRepository) {}
  async createCategory(data: CreateCategoryDto) {
    const { name, parentId } = data;

    if (!parentId) {
      const foundCategory = await this._categoryRepository.findCategoryByName(
        name
      );

      if (!foundCategory) {
        await this._categoryRepository.create({ name, level: 0 });
      }

      throw new ConflictException("Category name already exists");
    }

    const foundParent = await this._categoryRepository
      .findOneOrThrow({
        where: {
          id: parentId,
        },
      })
      .catch(() => {
        throw new NotFoundException("Could not find category parent");
      });

    if (foundParent.level === 2) {
      throw new BadRequestException("Subcategory level cannot greather than 3");
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
      message: "Create category successfully",
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
      this._categoryRepository
        .findOneOrThrow({
          where: {
            id: id,
          },
        })
        .catch(() => {
          throw new NotFoundException("Category not found");
        }),
      this._categoryRepository.update({
        where: {
          id,
        },
        data,
      }),
    ]);

    return {
      message: "Update message successfully",
    };
  }

  async deleteCategory(id: string) {
    const foundCategory = await this._categoryRepository
      .findOneOrThrow({
        where: {
          id,
        },
        include: {
          products: true,
          children: true,
        },
      })
      .catch(() => {
        throw new NotFoundException("Category not found");
      });

    // if(foundCategory.)
  }
}

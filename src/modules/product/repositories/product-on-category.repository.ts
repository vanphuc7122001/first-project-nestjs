import { DefaultArgs } from "@prisma/client/runtime/library";
import { Injectable } from "@nestjs/common";
import { Prisma } from "@prisma/client";
import { PrismaService } from "@shared/prisma/prisma.service";

@Injectable()
export class ProductOnCategoryRepository {
  private readonly _model: Prisma.ProductOnCategoryDelegate<DefaultArgs>;

  constructor(private readonly _prismaService: PrismaService) {
    this._model = this._prismaService.productOnCategory;
  }

  async create(data: Prisma.ProductOnCategoryCreateInput) {
    return await this._model.create({ data });
  }

  async findOne(params: Prisma.ProductOnCategoryFindFirstArgs) {
    return await this._model.findFirst(params);
  }

  async findMany(params: Prisma.ProductOnCategoryFindManyArgs) {
    return await this._model.findMany(params);
  }

  async update(params: Prisma.ProductOnCategoryUpdateArgs) {
    return await this._model.update(params);
  }

  async delete(where: Prisma.ProductOnCategoryWhereUniqueInput) {
    return await this._model.delete({ where });
  }
}

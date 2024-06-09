import { DefaultArgs } from "@prisma/client/runtime/library";
import { Injectable } from "@nestjs/common";
import { Prisma } from "@prisma/client";
import { PrismaService } from "@shared/prisma/prisma.service";

@Injectable()
export class ProductRepository {
  private readonly _model: Prisma.ProductDelegate<DefaultArgs>;

  constructor(private readonly _prismaService: PrismaService) {
    this._model = this._prismaService.product;
  }

  async create(data: Prisma.ProductCreateInput) {
    return await this._model.create({ data });
  }

  async findOne(params: Prisma.ProductFindFirstArgs) {
    return await this._model.findFirst(params);
  }

  async findOneOrThrow(params: Prisma.ProductFindFirstOrThrowArgs) {
    return await this._model.findFirstOrThrow(params);
  }

  async findMany(params: Prisma.ProductFindManyArgs) {
    return await this._model.findMany(params);
  }

  async count(params: Prisma.ProductCountArgs) {
    return await this._model.count(params);
  }

  async update(params: Prisma.ProductUpdateArgs) {
    return await this._model.update(params);
  }

  async upsert(params: Prisma.ProductUpsertArgs) {
    return await this._model.upsert(params);
  }

  async delete(where: Prisma.ProductWhereUniqueInput) {
    return await this._model.delete({ where });
  }
}

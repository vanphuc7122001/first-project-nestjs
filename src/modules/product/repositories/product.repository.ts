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
    return this._model.create({ data });
  }

  async findOne(params: Prisma.ProductFindFirstArgs) {
    return this._model.findFirst(params);
  }

  async findOneOrThrow(params: Prisma.ProductFindFirstOrThrowArgs) {
    return this._model.findFirstOrThrow(params);
  }

  async findMany(params: Prisma.ProductFindManyArgs) {
    return this._model.findMany(params);
  }

  async count(params: Prisma.ProductCountArgs) {
    return this._model.count(params);
  }

  async update(params: Prisma.ProductUpdateArgs) {
    return this._model.update(params);
  }

  async delete(where: Prisma.ProductWhereUniqueInput) {
    return this._model.delete({ where });
  }
}

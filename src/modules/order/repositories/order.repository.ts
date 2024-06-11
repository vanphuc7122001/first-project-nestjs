import { DefaultArgs } from "@prisma/client/runtime/library";
import { Injectable } from "@nestjs/common";
import { Prisma } from "@prisma/client";
import { PrismaService } from "@shared/prisma/prisma.service";

@Injectable()
export class OrderRepository {
  private readonly _model: Prisma.OrderDelegate<DefaultArgs>;

  constructor(private readonly _prismaService: PrismaService) {
    this._model = this._prismaService.order;
  }

  async create(data: Prisma.OrderCreateInput) {
    return await this._model.create({ data });
  }

  async update(params: Prisma.OrderUpdateArgs) {
    return await this._model.update(params);
  }

  async findOne(params: Prisma.OrderFindFirstArgs) {
    return await this._model.findFirst(params);
  }

  async findAll(params: Prisma.OrderFindManyArgs) {
    return await this._model.findMany(params);
  }

  async count(params: Prisma.OrderCountArgs) {
    return await this._model.count(params);
  }
}

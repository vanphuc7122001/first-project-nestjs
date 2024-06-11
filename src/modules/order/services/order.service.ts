import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from "@nestjs/common";
import { CreateOrderDto, UpdateStatusOrderDto } from "../dtos";

import { ORDER_ERRORS } from "src/content/errors";
import { OrderQueryParams } from "../dtos/order-query-param.dto";
import { OrderRepository } from "../repositories";
import { OrderStatus } from "../enums";
import { Prisma } from "@prisma/client";
import { ProductService } from "@modules/product/services";

@Injectable()
export class OrderService {
  constructor(
    private readonly _orderRepository: OrderRepository,
    private readonly _productService: ProductService
  ) {}
  async createOrder(data: CreateOrderDto, userId: string) {
    const { orderDetails, status, totalAfter, ...rest } = data;

    await this._validateQuantityProduct(orderDetails);

    const totalBefore = orderDetails.reduce(
      (acc, { productPrice, productQuantity }) => {
        return (acc += productPrice * productQuantity);
      },
      0
    );

    await this._orderRepository.create({
      ...rest,
      totalBefore,
      totalAfter,
      status: OrderStatus.NOT_COMFIRM,
      user: {
        connect: {
          id: userId,
        },
      },
      orderDetails: {
        create: orderDetails.map(
          ({ productId, productName, productPrice, productQuantity }) => ({
            productName,
            productPrice,
            productQuantity,
            product: {
              connect: {
                id: productId,
              },
            },
          })
        ),
      },
      trackingOrders: {
        create: {
          status: OrderStatus.NOT_COMFIRM,
          userId, // not use connect, it will not table user , Have user exist in db?
        },
      },
    });

    return {
      success: true,
    };
  }

  async getOrders(query: OrderQueryParams, userId: string, isUser: boolean) {
    const { page, limit, sort = {}, where } = query;
    const conditions: Prisma.OrderWhereInput = isUser
      ? {
          ...where,
          userId,
        }
      : { ...where };

    console.log("query conditions", conditions);

    // const conditions: Prisma.OrderWhereInput = {
    //   OR: [
    //     ...(where?.status && [
    //       ...where?.status.map((item) => ({
    //         status: item,
    //       })),
    //     ]),
    //   ],
    // };

    // const customSort = ['created', 'updated']
    // Object.keys(sort).forEach(key => {
    //   if(!customSort.includes(key)) orderBy[key] = sort[key];
    // })

    const [data, count] = await Promise.all([
      this._orderRepository.findAll({
        where: { ...conditions },
        skip: (page - 1) * limit,
        take: limit,
        orderBy: sort,
        include: {
          orderDetails: {
            select: {
              productName: true,
              productPrice: true,
              productQuantity: true,
            },
          },
        },
      }),
      this._orderRepository.count({
        where: { ...conditions },
      }),
    ]);

    return {
      count,
      data,
    };
  }

  async updateStatusOrder(data: UpdateStatusOrderDto, id: string) {
    const { status } = data;

    switch (status) {
      case OrderStatus.CONFIRM:
        return await this.changeStatusConfirm(id);
      case OrderStatus.IN_TRANSIT:
        return await this.changeStatusInTransit(id);
      case OrderStatus.RECEIVED:
        return await this.changeStatusReceived(id);
      case OrderStatus.CANCEL:
        return await this.changeStatusCancel(id);
      default:
        throw new BadRequestException("Error due to pass wrong status");
    }
  }
  /** ============================== Sub fuc in update status=================================== */
  async changeStatusConfirm(orderId: string) {
    const order = await this._findOrder(orderId);

    if (!order) {
      throw new NotFoundException(ORDER_ERRORS.ORDER_02.message);
    }

    if (order.status !== OrderStatus.NOT_COMFIRM) {
      throw new BadRequestException("Can not change status");
    }

    await this._updateStatus(orderId, OrderStatus.CONFIRM);

    return {
      success: true,
    };
  }

  async changeStatusInTransit(orderId: string) {
    const order = await this._findOrder(orderId);

    if (!order) {
      throw new NotFoundException(ORDER_ERRORS.ORDER_02.message);
    }

    if (order.status !== OrderStatus.CONFIRM) {
      throw new BadRequestException("Can not change status");
    }

    await this._updateStatus(orderId, OrderStatus.IN_TRANSIT);

    return {
      success: true,
    };
  }

  async changeStatusReceived(orderId: string) {
    const order = await this._findOrder(orderId);

    if (!order) {
      throw new NotFoundException(ORDER_ERRORS.ORDER_02.message);
    }

    if (order.status !== OrderStatus.IN_TRANSIT) {
      throw new BadRequestException("Can not change status");
    }

    await this._updateStatus(orderId, OrderStatus.RECEIVED);

    return {
      success: true,
    };
  }

  async changeStatusCancel(orderId: string) {
    const order = await this._findOrder(orderId);

    if (!order) {
      throw new NotFoundException(ORDER_ERRORS.ORDER_02.message);
    }

    if (order.status !== OrderStatus.NOT_COMFIRM) {
      throw new BadRequestException("Can not change status");
    }

    await this._updateStatus(orderId, OrderStatus.CANCEL);

    return {
      success: true,
    };
  }

  /**===================== Func general =============================== */

  private async _validateQuantityProduct(orderDetails) {
    await Promise.all(
      orderDetails.map(async ({ productId, productQuantity }) => {
        const isCheckQuantity = await this._productService.getProduct(
          productId
        );

        if (isCheckQuantity && isCheckQuantity.quantity < productQuantity) {
          throw new BadRequestException(ORDER_ERRORS.ORDER_01.message);
        }

        const quantity = isCheckQuantity.quantity - productQuantity;

        await this._productService.updateQuatityProduct(
          isCheckQuantity.id,
          quantity
        );
      })
    );
  }

  private async _findOrder(id: string) {
    const order = await this._orderRepository.findOne({
      where: {
        id,
      },
    });

    if (!order) {
      throw new NotFoundException(ORDER_ERRORS.ORDER_02.message);
    }

    return order;
  }

  private async _updateStatus(id: string, status: string) {
    await this._orderRepository.update({
      where: {
        id,
      },
      data: {
        status,
      },
    });
  }
}

import { JoiValidationPipe } from "@common/pipes";
import {
  Body,
  Controller,
  Get,
  HttpCode,
  Param,
  Patch,
  Post,
  Req,
  UseGuards,
} from "@nestjs/common";
import { CreateOrderValidator, UpdateStatusValidator } from "../validators";
import { CreateOrderDto, UpdateStatusOrderDto } from "../dtos";
import { AdminJwtAccessAuthGuard } from "@modules/auth/guards";
import { RequestUser } from "@common/decorators";
import { JwtAccessPayload } from "@modules/auth/dtos";
import { OrderService } from "../services";
import { HttpStatusCode } from "axios";
import { OrderQueryParamsValidator } from "../validators/base-query-param-order";
import { OrderQueryParams } from "../dtos/order-query-param.dto";
import { Request } from "express";
import { ResponseService } from "@shared/response/response.service";
import { OrderStatus } from "../enums";

/**
 * Key features
 * 1. Create order [user]
 * 2. List order [user, admin, saler]
 * 3. List order for admin or saler
 * 4. Detail order (tracking order)
 * 5. Cacncel order [user_id, saler , admin]
 * 6. Update status order[saler , admin]
 */
@Controller("orders")
export class OrderController {
  constructor(private readonly _orderService: OrderService) {}

  @HttpCode(HttpStatusCode.Created)
  @Post()
  @UseGuards(AdminJwtAccessAuthGuard)
  async createOrder(
    @Body(new JoiValidationPipe(CreateOrderValidator)) data: CreateOrderDto,
    @RequestUser() user: JwtAccessPayload
  ) {
    const { id: userId } = user;
    const result = await this._orderService.createOrder(data, userId);
    return {
      ...result,
    };
  }

  @HttpCode(HttpStatusCode.Ok)
  @Get()
  @UseGuards(AdminJwtAccessAuthGuard)
  async getOrders(
    @Body(new JoiValidationPipe(OrderQueryParamsValidator))
    query: OrderQueryParams,
    @Req() req: Request,
    @RequestUser() user: JwtAccessPayload
  ) {
    const { id: userId, isUser } = user;
    const { data, count } = await this._orderService.getOrders(
      query,
      userId,
      isUser
    );
    return ResponseService.paginateResponse({
      count,
      data,
      query,
      req,
    });
  }

  @Patch(":id")
  async updateStatus(
    @Body(new JoiValidationPipe(UpdateStatusValidator))
    data: UpdateStatusOrderDto,
    @Param("id") id: string
  ) {
    const result = await this._orderService.updateStatusOrder(data, id);
    return {
      ...result,
    };
  }
}

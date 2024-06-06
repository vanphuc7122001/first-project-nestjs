import {
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  Post,
  Query,
  Req,
  UseGuards,
} from "@nestjs/common";

import { UserSerivce } from "../services";
import { BaseQueryParams } from "@common/dtos";
import { JoiValidationPipe } from "@common/pipes";
import { BaseQueryParamsValidator } from "@common/validators";
import { ResponseService } from "@shared/response/response.service";
import { Request } from "express";
import { AdminJwtAccessAuthGuard } from "@modules/auth/guards";
import { CreateSalerDto } from "../dtos";
import {
  CreateSubadminValidator,
  UnBlockAccountValidator,
} from "../validators";
import { BlockAccountValidator } from "../validators/block-account.validator";
import { BlockAccountDto } from "../dtos";
import { RequestUser } from "@common/decorators";
import { JwtAccessPayload } from "@modules/auth/dtos";
import { HttpStatusCode } from "axios";

@Controller("admin/users")
export class UserController {
  constructor(private readonly _userService: UserSerivce) {}

  @HttpCode(HttpStatusCode.Ok)
  @UseGuards(AdminJwtAccessAuthGuard)
  @Get()
  async getUsers(
    @Query(new JoiValidationPipe(BaseQueryParamsValidator))
    query: BaseQueryParams,
    @Req() req: Request
  ) {
    const { count, data } = await this._userService.findAll(query);
    return ResponseService.paginateResponse({
      count,
      data,
      query,
      req,
    });
  }

  // TODO Edit subadmin => saler
  @HttpCode(HttpStatusCode.Created)
  @Post("create-saler")
  @UseGuards(AdminJwtAccessAuthGuard)
  async createSubadmin(
    @Body(new JoiValidationPipe(CreateSubadminValidator))
    data: CreateSalerDto
  ) {
    const result = await this._userService.createSaler(data);
    return {
      ...result,
    };
  }

  @HttpCode(HttpStatusCode.Ok)
  @Post("block")
  @UseGuards(AdminJwtAccessAuthGuard)
  blockSalerOrUser(
    @Body(new JoiValidationPipe(BlockAccountValidator)) data: BlockAccountDto
  ) {
    const result = this._userService.blockSalerOrUser(data);

    return {
      ...result,
    };
  }

  @HttpCode(HttpStatusCode.Ok)
  @Post("unblock")
  @UseGuards(AdminJwtAccessAuthGuard)
  async unBlockSalerOrUser(
    @Body(new JoiValidationPipe(UnBlockAccountValidator)) data: BlockAccountDto
  ) {
    const result = await this._userService.unBlockSalerOrUser(data);
    return {
      ...result,
    };
  }

  @HttpCode(HttpStatusCode.NoContent)
  @Delete(":id")
  @UseGuards(AdminJwtAccessAuthGuard)
  async removeAccount(@RequestUser() user: JwtAccessPayload) {
    const { id } = user;
    const result = await this._userService.removeAccount(id);
    return {
      ...result,
    };
  }
}

import {
  Body,
  Controller,
  Delete,
  Get,
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

@Controller("admin/users")
export class UserController {
  constructor(private readonly _userService: UserSerivce) {}

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
  @Post("create-saler")
  @UseGuards(AdminJwtAccessAuthGuard)
  createSubadmin(
    @Body(new JoiValidationPipe(CreateSubadminValidator))
    data: CreateSalerDto
  ) {
    return this._userService.createSaler(data);
  }

  @Post("block")
  @UseGuards(AdminJwtAccessAuthGuard)
  blockSalerOrUser(
    @Body(new JoiValidationPipe(BlockAccountValidator)) data: BlockAccountDto
  ) {
    return this._userService.blockSalerOrUser(data);
  }

  @Post("unblock")
  @UseGuards(AdminJwtAccessAuthGuard)
  unBlockSalerOrUser(
    @Body(new JoiValidationPipe(UnBlockAccountValidator)) data: BlockAccountDto
  ) {
    return this._userService.unBlockSalerOrUser(data);
  }

  @Delete(":id")
  @UseGuards(AdminJwtAccessAuthGuard)
  async removeAccount(@RequestUser() user: JwtAccessPayload) {
    const { id } = user;
    return await this._userService.removeAccount(id);
  }
}

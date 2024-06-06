import { SalerJwtAccessAuthGuard } from "./../guards";
import { JoiValidationPipe } from "@common/pipes";
import {
  Body,
  Controller,
  HttpCode,
  Post,
  Req,
  UseGuards,
} from "@nestjs/common";
import {
  ChangePasswordDto,
  GetStartedDto,
  JwtAccessPayload,
  LoginDto,
  RefreshTokenDto,
} from "../dtos";
import { LocalAuthGuard } from "../guards";
import { AuthService } from "../services";
import {
  ChangePasswordValidator,
  GetStartedValidator,
  LoginValidator,
  RefreshTokenValidator,
} from "../validators";
import { RequestUser } from "@common/decorators";
import { HttpStatusCode } from "axios";

@Controller("saler/auth")
export class SalerAuthControler {
  constructor(private readonly _authService: AuthService) {}

  @HttpCode(HttpStatusCode.Ok)
  @Post("get-started")
  async getStarted(
    @Body(new JoiValidationPipe(GetStartedValidator)) data: GetStartedDto
  ) {
    const result = await this._authService.getStarted(data);
    return {
      ...result,
    };
  }

  @HttpCode(HttpStatusCode.Ok)
  @UseGuards(LocalAuthGuard)
  @Post("login")
  async login(
    @Req() req,
    @Body(new JoiValidationPipe(LoginValidator)) data: LoginDto
  ) {
    const result = await this._authService.salerLogin(
      req.user as JwtAccessPayload
    );
    return {
      ...result,
    };
  }

  @HttpCode(HttpStatusCode.Ok)
  @Post("refresh-token")
  async refreshToken(
    @Body(new JoiValidationPipe(RefreshTokenValidator)) data: RefreshTokenDto
  ) {
    const result = await this._authService.salerRefreshToken(data);
    return {
      ...result,
    };
  }

  @HttpCode(HttpStatusCode.Ok)
  @UseGuards(SalerJwtAccessAuthGuard)
  @Post("change-password")
  async changePassword(
    @Body(new JoiValidationPipe(ChangePasswordValidator))
    data: ChangePasswordDto,
    @RequestUser() user: JwtAccessPayload
  ) {
    const { id } = user;
    const result = await this._authService.changePassword(data, id);
    return {
      ...result,
    };
  }
}

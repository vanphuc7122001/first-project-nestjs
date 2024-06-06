import { RequestUser } from "./../../../common/decorators/request-user.decorator";
import { JoiValidationPipe } from "@common/pipes";
import {
  Body,
  Controller,
  Get,
  HttpCode,
  Post,
  Req,
  Res,
  UseGuards,
} from "@nestjs/common";

import {
  ChangePasswordDto,
  ForgotPasswordDto,
  GetStartedDto,
  JwtAccessPayload,
  RefreshTokenDto,
  RegisterDto,
  ResetPasswordDto,
} from "../dtos";

import { JwtAccessAuthGuard, LocalAuthGuard } from "../guards";

import { AuthService } from "../services";

import {
  ChangePasswordValidator,
  ForgotPasswordValidator,
  GetStartedValidator,
  RefreshTokenValidator,
  RegisterValidator,
  ResetPasswordValidator,
} from "../validators";

import { Request, Response } from "express";
import { VerifyForgotPasswordDto } from "../dtos";
import { VerifyForgotPasswordValidator } from "../validators/verify-forgot-password.validator";
import { HttpStatusCode } from "axios";

@Controller("general/auth")
export class AuthController {
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

  @HttpCode(HttpStatusCode.Created)
  @Post("register")
  async register(
    @Body(new JoiValidationPipe(RegisterValidator)) data: RegisterDto
  ) {
    const result = await this._authService.register(data);
    return {
      ...result,
    };
  }

  @HttpCode(HttpStatusCode.Ok)
  @UseGuards(LocalAuthGuard)
  @Post("login")
  async login(@Req() req: Request) {
    const result = await this._authService.userLogin(
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
    const { refresh } = data;
    const result = await this._authService.userRefreshToken(refresh);
    return {
      ...result,
    };
  }

  @HttpCode(HttpStatusCode.Ok)
  @Post("forgot-password")
  async forgotPassword(
    @Body(new JoiValidationPipe(ForgotPasswordValidator))
    data: ForgotPasswordDto
  ) {
    const { email } = data;
    const result = await this._authService.forgotPassword(email);
    return {
      ...result,
    };
  }

  @HttpCode(HttpStatusCode.Ok)
  @Post("verify-forgot-password")
  async verifyForgotPassword(
    @Body(new JoiValidationPipe(VerifyForgotPasswordValidator))
    data: VerifyForgotPasswordDto,
    @Res() res: Response
  ) {
    const { forgot_password_token } = data;

    await this._authService.verifyForgotPassword(forgot_password_token);

    // can skip optional front-end process
    const url = `http://localhost:4000/reset-password?token=${forgot_password_token}`;

    return res.redirect(url);
  }

  @HttpCode(HttpStatusCode.Ok)
  @Post("reset-password")
  async resetPassword(
    @Body(new JoiValidationPipe(ResetPasswordValidator)) data: ResetPasswordDto
  ) {
    const result = await this._authService.resetPassword(data);
    return {
      ...result,
    };
  }

  // After login
  @UseGuards(JwtAccessAuthGuard)
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

  @UseGuards(JwtAccessAuthGuard)
  @Get("profile")
  @UseGuards()
  async getOwnProfile(@RequestUser() user: JwtAccessPayload) {
    const { id } = user;
    const result = await this._authService.getOwnProfile(id);
    return {
      ...result,
    };
  }
}

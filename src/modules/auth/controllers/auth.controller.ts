import { RequestUser } from "./../../../common/decorators/request-user.decorator";
import { JoiValidationPipe } from "@common/pipes";
import {
  Body,
  Controller,
  Get,
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

@Controller("general/auth")
export class AuthController {
  constructor(private readonly _authService: AuthService) {}

  @Post("get-started")
  async getStarted(
    @Body(new JoiValidationPipe(GetStartedValidator)) data: GetStartedDto
  ) {
    return this._authService.getStarted(data);
  }

  @Post("register")
  async register(
    @Body(new JoiValidationPipe(RegisterValidator)) data: RegisterDto
  ) {
    return this._authService.register(data);
  }

  @UseGuards(LocalAuthGuard)
  @Post("login")
  async login(@Req() req: Request) {
    return this._authService.userLogin(req.user as JwtAccessPayload);
  }

  @Post("refresh-token")
  async refreshToken(
    @Body(new JoiValidationPipe(RefreshTokenValidator)) data: RefreshTokenDto
  ) {
    const { refresh } = data;
    return this._authService.userRefreshToken(refresh);
  }

  @Post("forgot-password")
  async forgotPassword(
    @Body(new JoiValidationPipe(ForgotPasswordValidator))
    data: ForgotPasswordDto
  ) {
    const { email } = data;
    return this._authService.forgotPassword(email);
  }

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

  @Post("reset-password")
  async resetPassword(
    @Body(new JoiValidationPipe(ResetPasswordValidator)) data: ResetPasswordDto
  ) {
    return this._authService.resetPassword(data);
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
    return this._authService.changePassword(data, id);
  }

  @UseGuards(JwtAccessAuthGuard)
  @Get("profile")
  @UseGuards()
  async getOwnProfile(@RequestUser() user: JwtAccessPayload) {
    // throw new BadRequestException(AUTH_ERRORS.AUTH_01);
    const { id } = user;
    return await this._authService.getOwnProfile(id);
  }
}

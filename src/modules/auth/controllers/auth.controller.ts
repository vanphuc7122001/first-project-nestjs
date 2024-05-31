import { RequestUser } from "./../../../common/decorators/request-user.decorator";
import { JoiValidationPipe } from "@common/pipes";
import {
  BadRequestException,
  Body,
  Controller,
  Get,
  Post,
  UseGuards,
} from "@nestjs/common";
import {
  ChangePasswordDto,
  ForgotPasswordDto,
  RefreshTokenDto,
  RegisterDto,
  ResetPasswordDto,
} from "../dtos";
import { JwtAccessAuthGuard, LocalAuthGuard } from "../guards";
import { AuthService } from "../services";
import {
  ChangePasswordValidator,
  ForgotPasswordValidator,
  RefreshTokenValidator,
  RegisterValidator,
  ResetPasswordValidator,
} from "../validators";
import { AUTH_ERRORS } from "src/content/errors/auth.error";

@Controller("general/auth")
export class AuthController {
  constructor(private readonly _authService: AuthService) {}

  @Post("register")
  async register(
    @Body(new JoiValidationPipe(RegisterValidator)) data: RegisterDto
  ) {
    return this._authService.register(data);
  }

  @UseGuards(LocalAuthGuard)
  @Post("login")
  async login() {
    return this._authService.login();
  }

  @Post("refresh-token")
  async refreshToken(
    @Body(new JoiValidationPipe(RefreshTokenValidator)) data: RefreshTokenDto
  ) {
    return this._authService.userRefreshToken();
  }

  @Post("forgot-password")
  async forgotPassword(
    @Body(new JoiValidationPipe(ForgotPasswordValidator))
    data: ForgotPasswordDto
  ) {
    const { id: userId } = data;
    return this._authService.forgotPassword(userId);
  }

  @Post("reset-password")
  async resetPassword(
    @Body(new JoiValidationPipe(ResetPasswordValidator)) data: ResetPasswordDto
  ) {
    return this._authService.resetPassword(data);
  }

  // After login
  @UseGuards(JwtAccessAuthGuard)
  @Post("update-password")
  async changePassword(
    @Body(new JoiValidationPipe(ChangePasswordValidator))
    data: ChangePasswordDto
  ) {
    return this._authService.changePassword();
  }

  // @UseGuards(JwtAccessAuthGuard)
  // @Get('profile')
  // @UseGuards() user: RequestUser;
  // async getOwnProfile() {
  //   throw new BadRequestException(AUTH_ERRORS.AUTH_01)
  //   return user;
  // }
}

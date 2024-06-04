import { AdminJwtAccessAuthGuard } from "./../guards";
import { JoiValidationPipe } from "@common/pipes";
import { Body, Controller, Post, Req, UseGuards } from "@nestjs/common";
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

@Controller("admin/auth")
export class AdminAuthController {
  constructor(private readonly _authService: AuthService) {}

  @Post("get-started")
  async getStarted(
    @Body(new JoiValidationPipe(GetStartedValidator)) data: GetStartedDto
  ) {
    return this._authService.getStarted(data);
  }

  @UseGuards(LocalAuthGuard)
  @Post("login")
  async login(
    @Req() req,
    @Body(new JoiValidationPipe(LoginValidator)) data: LoginDto
  ) {
    return this._authService.adminLogin(req.user as JwtAccessPayload);
  }

  @Post("refresh-token")
  async refreshToken(
    @Body(new JoiValidationPipe(RefreshTokenValidator)) data: RefreshTokenDto
  ) {
    return this._authService.adminRefreshToken(data);
  }

  @UseGuards(AdminJwtAccessAuthGuard)
  @Post("change-password")
  async changePassword(
    @Body(new JoiValidationPipe(ChangePasswordValidator))
    data: ChangePasswordDto,
    @RequestUser() user: JwtAccessPayload
  ) {
    const { id } = user;
    return this._authService.changePassword(data, id);
  }
}

import { AdminJwtAccessAuthGuard } from "./../guards/admin-jwt-access-auth.guard";
import { JoiValidationPipe } from "@common/pipes";
import { Body, Controller, Post, Req, UseGuards } from "@nestjs/common";
import { GetStartedDto, JwtAccessPayload, RefreshTokenDto } from "../dtos";
import { LocalAuthGuard } from "../guards";
import { AuthService } from "../services";
import { GetStartedValidator, RefreshTokenValidator } from "../validators";

@Controller("admin/auth")
export class AdminAuthController {
  constructor(private readonly _authService: AuthService) {}

  // @Post('get-started')
  // async getStarted(
  //   @Body(new JoiValidationPipe(GetStartedValidator)) data: GetStartedDto
  // ) {
  //   return this._authService.adminGetStarted(data);
  // }

  @UseGuards(LocalAuthGuard)
  @Post("login")
  async login(@Req() req) {
    return this._authService.adminLogin(req.user);
  }

  @Post("refresh-token")
  async refreshToken(
    @Body(new JoiValidationPipe(RefreshTokenValidator)) data: RefreshTokenDto
  ) {
    return this._authService.adminRefreshToken();
  }

  // @UseGuards(AdminJwtAccessAuthGuard)
  // @Post('update-password')
  // async updatePassword(
  //   @Body(new JoiValidationPipe())
  //   data:
  // ) {
  //   return this._authService.changePassword()
  // }
}

import { AdminAuthController, AuthController } from "./controllers";
import { JwtAccessStrategy, LocalStrategy } from "./strategies";

import { AuthService } from "./services";
import { Module } from "@nestjs/common";
import { UserModule } from "@modules/user/user.module";

@Module({
  imports: [UserModule],
  controllers: [AdminAuthController, AuthController],
  providers: [
    AuthService,
    // UserSerivce,
    // Passport strategies
    JwtAccessStrategy,
    // JwtRefreshStrategy,
    LocalStrategy,

    // Repositories
  ],
  exports: [AuthService],
})
export class AuthModule {}

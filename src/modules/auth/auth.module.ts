import {
  AdminAuthController,
  AuthController,
  SalerAuthControler,
} from "./controllers";
import {
  AdminJwtAccessStrategy,
  JwtAccessStrategy,
  LocalStrategy,
  SalerJwtAccessStrategy,
} from "./strategies";

import { AuthQueueService } from "./services/auth-queue.service";
import { AuthService } from "./services";
import { Module } from "@nestjs/common";
import { UserModule } from "@modules/user/user.module";

@Module({
  imports: [UserModule],
  controllers: [AdminAuthController, AuthController, SalerAuthControler],
  providers: [
    AuthService,
    AuthQueueService,
    // UserSerivce,
    // Passport strategies
    JwtAccessStrategy,
    AdminJwtAccessStrategy,
    SalerJwtAccessStrategy,
    LocalStrategy,

    // Repositories
  ],
  exports: [AuthService, AuthQueueService],
})
export class AuthModule {}

import { APP_FILTER, APP_INTERCEPTOR } from "@nestjs/core";

import { AllExceptionsFilter } from "@common/filters";
import { AppController } from "./app.controller";
import { AppService } from "./app.service";
import { AuthModule } from "@modules/auth/auth.module";
import { ConfigModule } from "@nestjs/config";
import { ConfigSchema } from "@config/config.schema";
import { EmailModule } from "@shared/email/email.module";
import { Environment } from "@common/enums";
import { Module } from "@nestjs/common";
import { PrismaModule } from "@shared/prisma/prisma.module";
import { ResponseModule } from "@shared/response/response.module";
import { ResponseTransformInterceptor } from "@common/interceptors";
import { UserModule } from "@modules/user/user.module";

@Module({
  imports: [
    ConfigModule.forRoot({
      envFilePath: `.env.${process.env.NODE_ENV || Environment.DEVELOPMENT}`,
      isGlobal: true,
      cache: true,
      validationSchema: ConfigSchema,
    }),

    // Shared modules
    PrismaModule,
    ResponseModule,
    EmailModule,

    // Feature modules
    AuthModule,
    UserModule,
  ],
  controllers: [AppController],
  providers: [
    AppService,
    { provide: APP_FILTER, useClass: AllExceptionsFilter },
    { provide: APP_INTERCEPTOR, useClass: ResponseTransformInterceptor },
  ],
})
export class AppModule {}

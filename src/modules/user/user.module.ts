import { Module } from "@nestjs/common";
import { UserController } from "./controllers";
import { UserRepository } from "./repositories";
import { UserSerivce } from "./services";

@Module({
  providers: [UserSerivce, UserRepository],
  controllers: [UserController],
  exports: [UserSerivce],
})
export class UserModule {}

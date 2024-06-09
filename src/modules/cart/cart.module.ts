import { CartController } from "./controllers/cart.controller";
import { CartRepository } from "./repositories";
import { CartService } from "./services";
import { Module } from "@nestjs/common";

@Module({
  controllers: [CartController],
  providers: [CartService, CartRepository],
})
export class CartModule {}

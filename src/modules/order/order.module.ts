import { Module } from "@nestjs/common";
import { OrderController } from "./controllers";
import { OrderRepository } from "./repositories";
import { OrderService } from "./services";

@Module({
  controllers: [OrderController],
  providers: [OrderService, OrderRepository],
})
export class OrderModule {}

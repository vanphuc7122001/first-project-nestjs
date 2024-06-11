import { Module } from "@nestjs/common";
import { OrderController } from "./controllers";
import { OrderRepository } from "./repositories";
import { OrderService } from "./services";
import { ProductModule } from "@modules/product/product.module";

@Module({
  imports: [ProductModule],
  controllers: [OrderController],
  providers: [OrderService, OrderRepository],
})
export class OrderModule {}

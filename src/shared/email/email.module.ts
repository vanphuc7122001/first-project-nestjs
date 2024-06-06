import { Global, Module } from "@nestjs/common";

import { BullModule } from "@nestjs/bull";
import { EmailService } from "./services";

@Global()
@Module({
  imports: [
    BullModule.registerQueue({
      name: "email",
    }),
  ],
  providers: [EmailService, BullModule],
  exports: [EmailService],
})
export class EmailModule {}

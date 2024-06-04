import { EmailService, SendMailQueue } from "./services";
import { Global, Module } from "@nestjs/common";

import { BullModule } from "@nestjs/bull";
import { MailConsumer } from "./consumer";

@Global()
@Module({
  imports: [
    BullModule.registerQueue({
      name: "email",
    }),
  ],
  providers: [EmailService, BullModule, SendMailQueue, MailConsumer],
  exports: [EmailService, SendMailQueue, SendMailQueue],
})
export class EmailModule {}

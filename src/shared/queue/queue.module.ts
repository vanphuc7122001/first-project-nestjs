import { ConfigModule, ConfigService } from "@nestjs/config";
import { Global, Module } from "@nestjs/common";

import { AuthConsumer } from "./consumers/auth.consumer";
import { AuthModule } from "@modules/auth/auth.module";
import { BullModule } from "@nestjs/bull";
import { QUEUE_NAMES } from "./contants";
import { QueueService } from "./queue.service";

@Global()
@Module({
  imports: [
    BullModule.forRootAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (config: ConfigService) => {
        return {
          redis: {
            host: "localhost", // thay config inject env.development
            port: 6379,
          },
        };
      },
    }),

    BullModule.registerQueue({
      name: QUEUE_NAMES.AUTH_QUEUE, // assign from queue name in file index folder constants
    }),

    //
    AuthModule,
  ],
  providers: [AuthConsumer, QueueService],
  exports: [QueueService],
})
export class QueueModule {}

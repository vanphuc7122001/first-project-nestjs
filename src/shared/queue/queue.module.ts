import { ConfigModule, ConfigService } from "@nestjs/config";
import { Global, Module } from "@nestjs/common";

import { AuthConsumer } from "./consumers/auth.consumer";
import { AuthModule } from "@modules/auth/auth.module";
import { BullModule } from "@nestjs/bull";
import { CONFIG_VAR } from "@config/config.constant";
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
            host: config.get(CONFIG_VAR.REDIS_HOST),
            port: config.get(CONFIG_VAR.REDIS_PORT),
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

import { Process, Processor } from "@nestjs/bull";

import { AUTH_QUEUE_PROCESS_NAME } from "@modules/auth/constants/auth-queue-name.constant";
import { AuthQueueService } from "@modules/auth/services/auth-queue.service";
import { Job } from "bull";
import { QUEUE_NAMES } from "../contants";

@Processor(QUEUE_NAMES.AUTH_QUEUE) // get from QUEUE_NAME
export class AuthConsumer {
  constructor(private readonly _authQueueService: AuthQueueService) {}

  @Process(AUTH_QUEUE_PROCESS_NAME.SEND_FORGOT_PASSWORD_EMAIL)
  async handleSendForgotPasswordMail(job: Job<unknown>) {
    const { data } = job;
    await this._authQueueService.handleSendForgotPasswordMail(data);
  }
}

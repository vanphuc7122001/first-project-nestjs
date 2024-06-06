import { AUTH_QUEUE_PROCESS_NAME } from "../constants/auth-queue-name.constant";
import { EmailService } from "@shared/email/services";
import { Injectable } from "@nestjs/common";
import { QUEUE_NAMES } from "@shared/queue/contants";
import { QueueService } from "@shared/queue/queue.service";

@Injectable()
export class AuthQueueService {
  constructor(
    private readonly _emailService: EmailService,
    private readonly _queueService: QueueService
  ) {}

  async addJobSendForgotPasswordMail(token: string, email: string) {
    await this._queueService.addJob<{ token: string; email: string }>({
      queueName: QUEUE_NAMES.AUTH_QUEUE,
      proccessName: AUTH_QUEUE_PROCESS_NAME.SEND_FORGOT_PASSWORD_EMAIL,
      payload: { token, email },
    });
  }

  async handleSendForgotPasswordMail(data: any) {
    const { token, email } = data;
    await this._emailService.sendForgotPasswordEmail({
      forgotPasswordToken: token,
      toAddress: email,
      subject: "Forgot password",
    });
  }
}

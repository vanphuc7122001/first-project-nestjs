import { OnQueueActive, Process, Processor } from "@nestjs/bull";

import { EmailService } from "../services";
import { Job } from "bull";

type sendMailJobType = {
  toAddress: string;
  subject: string;
  forgotPasswordToken: string;
};

@Processor("email")
export class MailConsumer {
  constructor(private readonly _emailSerice: EmailService) {}

  @OnQueueActive()
  onActive(job: Job) {
    console.log(
      `Processing job ${job.id} of type ${job.name} with data ${job.data}...`
    );
  }

  @Process("sendMailForgotPassword")
  async sendMailForgotPassword(job: Job<unknown>) {
    const { toAddress, subject, forgotPasswordToken } =
      job.data as sendMailJobType;

    await this._emailSerice.sendForgotPasswordEmail({
      subject,
      toAddress,
      forgotPasswordToken,
    });
  }
}

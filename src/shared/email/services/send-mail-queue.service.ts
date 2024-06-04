import { InjectQueue } from "@nestjs/bull";
import { Injectable } from "@nestjs/common";
import { Queue } from "bull";
import { EmailService } from "./email.service";

@Injectable()
export class SendMailQueue {
  constructor(@InjectQueue("email") private _audioQueue: Queue) {}

  async sendMailForgotPassword({
    toAddress,
    subject,
    forgotPasswordToken,
  }: {
    toAddress: string;
    subject: string;
    forgotPasswordToken: string;
  }) {
    await this._audioQueue.add("sendMailForgotPassword", {
      toAddress,
      subject,
      forgotPasswordToken,
    });
  }
}

import * as fs from "fs";
import * as nodemailer from "nodemailer";
import * as path from "path";

import { BadGatewayException, Injectable } from "@nestjs/common";

import { CONFIG_VAR } from "@config/config.constant";
import { ConfigService } from "@nestjs/config";

@Injectable()
export class EmailService {
  private transporter: nodemailer.Transporter;

  constructor(private configService: ConfigService) {
    this.transporter = nodemailer.createTransport({
      host: this.configService.get<string>(CONFIG_VAR.SMTP_HOST),
      port: this.configService.get<number>(CONFIG_VAR.SMTP_PORT),
      secure: false, // true cho 465, false cho các cổng khác
      auth: {
        user: this.configService.get<string>(CONFIG_VAR.SMTP_EMAIL),
        pass: this.configService.get<string>(CONFIG_VAR.SMTP_PASS),
      },
    });
  }

  private readTemplate({
    fileName,
    title,
    content,
    titleLink,
    link,
  }: {
    fileName: string;
    title: string;
    content: string;
    titleLink: string;
    link: string;
  }) {
    return fs
      .readFileSync(
        path.resolve("src", "shared", "email", "templates", fileName),
        "utf-8"
      )
      .replace("{{title}}", title)
      .replace("{{content}}", content)
      .replace("{{titleLink}}", titleLink)
      .replace("{{link}}", link);
  }

  async sendForgotPasswordEmail({
    toAddress,
    subject,
    forgotPasswordToken,
  }: {
    toAddress: string;
    subject: string;
    forgotPasswordToken: string;
  }): Promise<void> {
    const fileHtml = this.readTemplate({
      fileName: "forgot-password.html",
      title:
        "You are receiving this email because you requested to reset your password",
      content: "Click the button below to reset your password",
      titleLink: "Reset password",
      link: `http://localhost:4000/forgot-password?token=${forgotPasswordToken}`,
    });

    const mailOptions = {
      from: this.configService.get<string>(CONFIG_VAR.SMTP_EMAIL),
      to: toAddress,
      subject,
      html: fileHtml,
    };

    try {
      await this.transporter.sendMail(mailOptions);
      // console.log("Forgot password email sent successfully");
    } catch (error) {
      // console.error("Error sending forgot password email:", error);
      throw new BadGatewayException("Failed to send forgot password email");
    }
  }
}

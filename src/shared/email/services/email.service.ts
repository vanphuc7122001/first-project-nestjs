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

  private readTemplate(fileName: string) {
    return fs.readFileSync(
      path.resolve("src", "shared", "email", "templates", fileName),
      "utf-8"
    );
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
    const fileHtml = this.readTemplate("forgot-password.html");

    const mailOptions = {
      from: this.configService.get<string>(CONFIG_VAR.SMTP_EMAIL),
      to: toAddress,
      subject,
      html: fileHtml
        .replace(
          "{{title}}",
          "You are receiving this email because you requested to reset your password"
        )
        .replace("{{content}}", "Click the button below to reset your password")
        .replace("{{titleLink}}", "Reset password")
        .replace(
          "{{link}}",
          `http://localhost:4000/forgot-password?token=${forgotPasswordToken}`
        ),
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

import { Injectable } from '@nestjs/common';
import { MailerService } from '@nestjs-modules/mailer';

@Injectable()
export class NotificationService {
  constructor(private mailerService: MailerService) {}

  async sendLoginVerificationEmail(
    to: string,
    name: string,
    code: string,
  ): Promise<unknown> {
    return await this.mailerService.sendMail({
      to,
      from: 'info@sef.com',
      subject: 'Login Request',
      template: './loginVerification',
      context: {
        name,
        code,
      },
    });
  }

  async sendForgotPasswordEmail(
    to: string,
    name: string,
    url: string,
  ): Promise<unknown> {
    return await this.mailerService.sendMail({
      to,
      from: 'info@sef.com',
      subject: 'Forgot Password',
      template: './forgotPassword',
      context: {
        name,
        url,
      },
    });
  }

  async sendInviteEmail(
    to: string,
    name: string,
    url: string,
  ): Promise<unknown> {
    return await this.mailerService.sendMail({
      to,
      from: 'info@sef.com',
      subject: 'User Invitation',
      template: './forgotPassword',
      context: {
        name,
        url,
      },
    });
  }
}

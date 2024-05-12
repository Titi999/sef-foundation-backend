import { Injectable } from '@nestjs/common';
import { MailerService } from '@nestjs-modules/mailer';

@Injectable()
export class NotificationService {
  constructor(private mailerService: MailerService) {}

  async sendLoginVerificationEmail(
    to: string,
    subject: string,
    name: string,
    code: string,
  ): Promise<unknown> {
    return await this.mailerService.sendMail({
      to,
      from: 'info@sef.com',
      subject,
      template: './loginVerification',
      context: {
        name,
        code,
      },
    });
  }
}

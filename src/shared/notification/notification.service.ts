import { Injectable } from '@nestjs/common';
import { MailerService } from '@nestjs-modules/mailer';

@Injectable()
export class NotificationService {
  constructor(private mailerService: MailerService) {}

  async sendEmail(
    body: string,
    to: string,
    subject: string,
    name: string,
    url: string,
    action: string,
  ): Promise<unknown> {
    return await this.mailerService.sendMail({
      to,
      from: 'info@sef.com',
      subject,
      template: './email',
      context: {
        name,
        url,
        subject,
        body,
        action,
      },
    });
  }
}

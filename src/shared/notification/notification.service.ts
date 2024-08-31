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
      from: 'info@sefad2009.org',
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
      from: 'info@sefad2009.org',
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
    password: string,
  ): Promise<unknown> {
    return await this.mailerService.sendMail({
      to,
      from: 'info@sefad2009.org',
      subject: 'User Invitation',
      template: './userInvitation',
      context: {
        name,
        url,
        password,
      },
    });
  }

  async sendApproveEmail(
    to: string,
    name: string,
    amount: string,
  ): Promise<unknown> {
    return await this.mailerService.sendMail({
      to,
      from: 'info@sefad2009.org',
      subject: 'Request Approved',
      template: './approveDisbursement',
      context: {
        name,
        amount,
      },
    });
  }

  async sendFundsAllocatedEmail(
    to: string,
    name: string,
    amount: string,
  ): Promise<unknown> {
    return await this.mailerService.sendMail({
      to,
      from: 'info@sefad2009.org',
      subject: 'Funds allocated ',
      template: './fundsAllocated',
      context: {
        name,
        amount,
      },
    });
  }

  async sendFundsDisbursedEmail(
    to: string,
    name: string,
    amount: string,
  ): Promise<unknown> {
    return await this.mailerService.sendMail({
      to,
      from: 'info@sefad2009.org',
      subject: 'Funds Disbursed',
      template: './fundsDisbursed',
      context: {
        name,
        amount,
      },
    });
  }

  async newRequestEmail(
    to: string,
    name: string,
    amount: string,
  ): Promise<unknown> {
    return await this.mailerService.sendMail({
      to,
      from: 'info@sefad2009.org',
      subject: 'New Request Added',
      template: './newRequest',
      context: {
        name,
        amount,
      },
    });
  }

  async sendDeclineEmail(to: string, name: string): Promise<unknown> {
    return await this.mailerService.sendMail({
      to,
      from: 'info@sefad2009.org',
      subject: 'Request Declined',
      template: './declineDisbursement',
      context: {
        name,
      },
    });
  }
}

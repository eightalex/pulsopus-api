import { Injectable } from '@nestjs/common';
import { MailerService as NestMailerService } from '@nestjs-modules/mailer';

@Injectable()
export class MailerService {
  private noReplyFrom = 'Pulsopus Team <noreply@pulsopus.dev>';
  constructor(private readonly service: NestMailerService) {}

  private dtoMockEmailTo(email: string) {
    return 'pulsopus.dev+' + email.replace('@pulsopus.dev', '@gmail.com');
  }

  public async sendUserAccessApproved(params: {
    to: string;
    userName: string;
    loginLink: string;
  }) {
    const { to, userName, loginLink } = params;
    try {
      await this.service.sendMail({
        template: 'user-access-approved',
        to: this.dtoMockEmailTo(to),
        from: this.noReplyFrom,
        subject: 'Access Granted to Pulsopus',
        context: {
          userName,
          loginLink,
        },
      });
    } catch (err) {
      console.log('error', err);
    }
  }

  public async sendUserAccessRejected({
    to,
    userName,
  }: {
    to: string;
    userName: string;
  }) {
    try {
      await this.service.sendMail({
        template: 'user-access-rejected',
        to: this.dtoMockEmailTo(to),
        from: this.noReplyFrom,
        subject: 'Access Request for Pulsopus',
        context: {
          userName,
        },
      });
    } catch (err) {
      console.log('error', err);
    }
  }

  public async sendAccessRequestForAdmin(dto: {
    to: string;
    adminName: string;
    userName: string;
    loginLink: string;
    approveLink: string;
    denyLink: string;
  }) {
    const { to, adminName, userName, loginLink, approveLink, denyLink } = dto;
    this.dtoMockEmailTo(to);
    return;
    try {
      await this.service.sendMail({
        template: 'admin-access-request',
        to: this.dtoMockEmailTo(to),
        from: this.noReplyFrom,
        subject: 'Access Request for Pulsopus',
        context: {
          adminName,
          userName,
          loginLink,
          approveLink,
          denyLink,
        },
      });
    } catch (err) {
      console.log('error', err);
    }
  }
}

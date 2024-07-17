import { Injectable, Logger } from '@nestjs/common';
import { MailerService as NestMailerService } from '@nestjs-modules/mailer';

@Injectable()
export class MailerService {
  private readonly logger = new Logger(MailerService.name);
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
      this.logger.log(`Send mail [user-access-approved]: to: ${to}`);
    } catch (err) {
      this.logger.error(err);
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
      this.logger.log(`Send mail [user-access-rejected]: to: ${to}`);
    } catch (err) {
      this.logger.error(err);
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
      this.logger.log(`Send mail [admin-access-request]: to: ${to}`);
    } catch (err) {
      this.logger.error(err);
    }
  }
}

import { Injectable } from '@nestjs/common';
import { MailerService as NestMailerService } from '@nestjs-modules/mailer';

@Injectable()
export class MailerService {
  constructor(private readonly service: NestMailerService) {}

  public async sendUserAccessApproved(dto: {
    adminName: string;
    userName: string;
    loginLinkUrl: string;
  }) {
    const { adminName, userName, loginLinkUrl } = dto;
    try {
      await this.service.sendMail({
        to: 'dev.radchenkobs@gmail.com',
        from: 'dev.radchenkobs@gmail.com',
        subject: 'Access Granted to Pulsopus',
        template: 'user-access-approved',
        context: {
          admin_name: adminName,
          user_name: userName,
          login_url: loginLinkUrl,
        },
      });
    } catch (err) {
      console.log('error', err);
    }
  }

  public async sendUserAccessRejected({ userName }: { userName: string }) {
    try {
      await this.service.sendMail({
        to: 'dev.radchenkobs@gmail.com',
        from: 'dev.radchenkobs@gmail.com',
        subject: 'Access Request for Pulsopus',
        template: 'user-access-rejected',
        context: {
          user_name: userName,
        },
      });
    } catch (err) {
      console.log('error', err);
    }
  }

  public async sendAccessRequestForAdmin(dto: {
    adminName: string;
    userName: string;
    loginLinkUrl: string;
  }) {
    const { adminName, userName, loginLinkUrl } = dto;
    try {
      await this.service.sendMail({
        to: 'dev.radchenkobs@gmail.com',
        from: 'dev.radchenkobs@gmail.com',
        subject: 'Access Request for Pulsopus',
        template: 'admin-access-request',
        context: {
          admin_name: adminName,
          user_name: userName,
          login_url: loginLinkUrl,
        },
      });
    } catch (err) {
      console.log('error', err);
    }
  }

  // public async example() {
  //   try {
  //     await this.service.sendMail({
  //       to: 'dev.radchenkobs@gmail.com',
  //       from: 'dev.radchenkobs@gmail.com',
  //       subject: 'Welcome to Nice App! Confirm your Email',
  //       // template: './transactional', // either change to ./transactional or rename transactional.html to confirmation.html
  //       template: './admin-access-request',
  //       context: {
  //         title: 'title',
  //         desctiption: 'desctiption',
  //         name: 'user.name context',
  //         url: 'url context',
  //         admin_name: 'admin_name',
  //         user_name: 'user_name',
  //         login_url: 'login_url',
  //       },
  //     });
  //   } catch (err) {
  //     console.error('err', err);
  //   }
  // }
}

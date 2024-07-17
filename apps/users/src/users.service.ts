import { Model } from 'mongoose';
import { DatabaseService } from '@app/database/database.service';
import {
  UserResponseDto,
  UsersAccessRequestBodyRequestDto,
  UsersDeleteRequestDto,
} from '@app/dto';
import { UsersUpdateBodyRequestDto } from '@app/dto/users/users-update-body.request.dto';
import {
  EAccessRequestDecision,
  EUserRole,
  EUserStatus,
  TokenPayload,
  User,
} from '@app/entities';
import { MailerService } from '@app/mailer';
import {
  BadRequestException,
  ForbiddenException,
  HttpException,
  HttpStatus,
  Injectable,
  Logger,
  NotFoundException,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { InjectModel } from '@nestjs/mongoose';

@Injectable()
export class UsersService {
  private readonly logger = new Logger(UsersService.name);
  constructor(
    @InjectModel(User.name)
    private readonly userModel: Model<User>,
    private readonly databaseService: DatabaseService,
    private readonly mailerService: MailerService,
    private readonly configService: ConfigService,
  ) {}

  private get clientUrl(): string {
    const { client } = this.configService.get('url');
    return client;
  }

  private get clientAppUrl(): string {
    const { app } = this.configService.get('url');
    return app;
  }

  public async getById(id: User['id']): Promise<User> {
    const user = await this.userModel.findById(id).exec();
    if (!user) {
      throw new NotFoundException('User not found');
    }
    return user;
  }

  public async getByEmail(email: User['email']): Promise<User> {
    const user = await this.userModel.findOne({ email }).exec();
    if (!user) {
      throw new NotFoundException('User not found!');
    }
    return user;
  }

  public async getAllByRequester(
    tokenPayload: TokenPayload,
  ): Promise<UserResponseDto[]> {
    const { sub, role } = tokenPayload;
    if (!sub) {
      throw new BadRequestException(
        'Unexpected exception. No user recipient id',
      );
    }
    if (!role) {
      throw new BadRequestException('Unexpected exception. No user role');
    }
    if (role !== EUserRole.ADMIN) {
      const us = await this.userModel
        .find({ status: EUserStatus.ACTIVE })
        .exec();
      return us.map((u) => u.response());
    }

    const us = await this.userModel
      .find({
        $or: [
          { status: EUserStatus.ACTIVE },
          {
            $and: [
              { accessRequestAdminId: tokenPayload.sub },
              { status: EUserStatus.PENDING },
            ],
          },
        ],
      })
      .sort({
        status: -1,
        role: 1,
        username: 1,
        updated_at: 1,
      })
      .exec();
    return us.map((u) => User.response(u));
  }

  public async updateUserByIdDto(
    id: User['id'],
    dto: UsersUpdateBodyRequestDto,
  ): Promise<UserResponseDto> {
    const user = await this.userModel.findByIdAndUpdate(id, { ...dto }).exec();
    return UserResponseDto.of(user);
  }

  public async deleteUsers(
    params: UsersDeleteRequestDto,
    tokePayload: TokenPayload,
  ): Promise<void> {
    const u = await this.getById(tokePayload.sub);
    if (!u || !u.isActive || !u.isAdmin) {
      throw new ForbiddenException('No permission');
    }
    await this.userModel.deleteMany({ _id: { $in: params.ids } });
  }

  public async createUserAccessRequest(
    fromId: User['_id'],
    toId: User['_id'],
  ): Promise<UserResponseDto> {
    try {
      const u = await this.userModel.findById(fromId).exec();
      u.accessRequestAdminId = toId;
      u.status = EUserStatus.PENDING;
      await u.save();

      const admin = await this.userModel.findById(toId).exec();
      await this.mailerService.sendAccessRequestForAdmin({
        to: admin.email,
        adminName: admin.username,
        userName: u.username,
        loginLink: this.clientAppUrl,
        approveLink: this.clientUrl,
        denyLink: this.clientUrl,
      });
      return u.response();
    } catch (err) {
      this.logger.error(err);
    }
  }

  public async setUserAccessRequestDecision(
    fromId: User['_id'],
    body: UsersAccessRequestBodyRequestDto,
    tokenPayload: TokenPayload,
  ): Promise<void> {
    try {
      const user = await this.userModel
        .findOne({
          _id: fromId,
          accessRequestAdminId: tokenPayload.sub,
        })
        .exec();
      user.accessRequestAdminId = null;

      if (body.decision === EAccessRequestDecision.ACCEPT) {
        user.status = EUserStatus.ACTIVE;
        await this.mailerService.sendUserAccessApproved({
          to: user.email,
          userName: user.username,
          loginLink: this.clientUrl,
        });
      } else {
        user.status = EUserStatus.INACTIVE;
        await this.mailerService.sendUserAccessRejected({
          to: user.email,
          userName: user.username,
        });
      }
      await user.save();
    } catch (err) {
      throw new HttpException(
        'Oops... Something wrong!',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  public async test() {
    try {
      const u = await this.userModel.findOne({ username: 'user test' }).exec();
      const admin = await this.userModel
        .findOne({ username: 'admin test' })
        .exec();
      await this.mailerService.sendAccessRequestForAdmin({
        to: admin.email,
        adminName: admin.username,
        userName: u.username,
        loginLink: this.clientUrl,
        approveLink: this.clientUrl,
        denyLink: this.clientUrl,
      });
      await this.mailerService.sendUserAccessApproved({
        to: u.email,
        userName: u.username,
        loginLink: this.clientUrl,
      });
      await this.mailerService.sendUserAccessRejected({
        to: u.email,
        userName: u.username,
      });
    } catch (err) {
      throw new HttpException(err, HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }
}

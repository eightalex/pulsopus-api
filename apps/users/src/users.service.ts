import {
  UserResponseDto,
  UsersAccessRequestBodyRequestDto,
  UsersDeleteRequestDto,
} from '@app/dto';
import { UsersUpdateBodyRequestDto } from '@app/dto/users/users-update-body.request.dto';
import {
  EUserRole,
  TokenPayload,
  User,
  UserAccessRequest,
  UserAccessRequestRepository,
  UserRepository,
} from '@app/entities';
import { MailerService } from '@app/mailer';
import {
  BadRequestException,
  Injectable,
  Logger,
  NotFoundException,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class UsersService {
  private readonly logger = new Logger(UsersService.name);

  constructor(
    private readonly userRepository: UserRepository,
    private readonly userAccessRequestRepository: UserAccessRequestRepository,
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

  public async create(user: User): Promise<User> {
    return this.userRepository.save(user);
  }

  public async getById(id: User['id']): Promise<User> {
    const user = await this.userRepository.findOneBy({ id });
    if (!user) {
      throw new NotFoundException('User not found');
    }
    return user;
  }

  public async getByEmail(email: User['email']): Promise<User> {
    const user = await this.userRepository.findOneBy({ email });
    if (!user) {
      throw new NotFoundException('User not found!');
    }
    return user;
  }

  public async getOrCreateDefaultByEmail(
    email: User['email'],
    partial: Partial<User> = {},
  ): Promise<User> {
    let user: User | null = null;
    try {
      user = await this.getByEmail(email);
    } catch (error) {
      const defaultUser: Partial<User> = {
        isActive: false,
        role: EUserRole.VIEWER,
        password: 'password',
        ...partial,
      };
      const newUser = await User.create({
        email,
        username: email.replace(/@.\S+$/, ''),
        ...defaultUser,
      });
      user = await this.create(newUser);
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

    if (role === EUserRole.VIEWER) {
      const users = await this.userRepository.findByActive();
      return users.map(UserResponseDto.of);
    }

    if (role === EUserRole.ADMIN) {
      const users =
        await this.userRepository.findByActiveOrByPendingAccessRequestedUserId(
          sub,
        );
      return users.map(UserResponseDto.of);
    }

    // if (role !== EUserRole.ADMIN) {
    //   const us = await this.userRepository
    //     .find({ status: EUserStatus.ACTIVE })
    //     .exec();
    //   return us.map((u) => u.response());
    // }
    //
    // const us = await this.userRepository
    //   .find({
    //     $or: [
    //       { status: EUserStatus.ACTIVE },
    //       {
    //         $and: [
    //           { accessRequestAdminId: tokenPayload.sub },
    //           { status: EUserStatus.PENDING },
    //         ],
    //       },
    //     ],
    //   })
    //   .sort({
    //     status: -1,
    //     role: 1,
    //     username: 1,
    //     updated_at: 1,
    //   })
    //   .exec();
    // return us.map((u) => User.response(u));
  }

  public async updateUserByIdDto(
    id: User['id'],
    dto: UsersUpdateBodyRequestDto,
  ): Promise<UserResponseDto> {
    const u = await this.getById(id);
    return UserResponseDto.of(u);
    // const user = await this.userRepository
    //   .findByIdAndUpdate(id, { ...dto })
    //   .exec();
    // return UserResponseDto.of(user);
  }

  public async deleteUsers(
    params: UsersDeleteRequestDto,
    tokePayload: TokenPayload,
  ): Promise<void> {
    // const u = await this.getById(tokePayload.sub);
    // if (!u || !u.isActive || !u.isAdmin) {
    //   throw new ForbiddenException('No permission');
    // }
    // await this.userRepository.deleteMany({ _id: { $in: params.ids } });
  }

  public async createUserAccessRequest(
    requesterId: User['id'],
    requestedUserId: User['id'],
  ): Promise<void> {
    const requester = await this.getById(requesterId);
    const requestedUser = await this.getById(requestedUserId);

    try {
      await this.userAccessRequestRepository.save(
        UserAccessRequest.of({
          requester,
          requestedUser,
        }),
      );

      await this.mailerService.sendAccessRequestForAdmin({
        to: requestedUser.email,
        adminName: requestedUser.username,
        userName: requester.username,
        loginLink: this.clientAppUrl,
        approveLink: this.clientUrl,
        denyLink: this.clientUrl,
      });
    } catch (error) {
      this.logger.error(error);
    }
  }

  public async setUserAccessRequestDecision(
    fromId: User['id'],
    body: UsersAccessRequestBodyRequestDto,
    tokenPayload: TokenPayload,
  ): Promise<void> {
    // try {
    //   const user = await this.userRepository
    //     .findOne({
    //       _id: fromId,
    //       accessRequestAdminId: tokenPayload.sub,
    //     })
    //     .exec();
    //   user.accessRequestAdminId = null;
    //
    //   if (body.decision === EAccessRequestDecision.ACCEPT) {
    //     user.status = EUserStatus.ACTIVE;
    //     await this.mailerService.sendUserAccessApproved({
    //       to: user.email,
    //       userName: user.username,
    //       loginLink: this.clientUrl,
    //     });
    //   } else {
    //     user.status = EUserStatus.INACTIVE;
    //     await this.mailerService.sendUserAccessRejected({
    //       to: user.email,
    //       userName: user.username,
    //     });
    //   }
    //   await user.save();
    // } catch (err) {
    //   throw new HttpException(
    //     'Oops... Something wrong!',
    //     HttpStatus.INTERNAL_SERVER_ERROR,
    //   );
    // }
  }
}

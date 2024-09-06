import { In } from 'typeorm';
import {
  UserFindSelectionDto,
  UsersDeleteRequestDto,
  UsersFilterRequestDto,
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
  ForbiddenException,
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
      const defaultUser = {
        isActive: false,
        role: EUserRole.VIEWER,
        password: 'password',
        ...partial,
      } as Partial<User>;
      const newUser = await User.create({
        email,
        username: email.replace(/@.\S+$/, ''),
        ...defaultUser,
      });
      user = await this.create(newUser);
    }
    return user;
  }

  public async getUsers(): Promise<User[]> {
    return this.userRepository.find();
  }

  public async getAllByRequesterWithFilter(
    tokenPayload: TokenPayload,
    filter: UsersFilterRequestDto = new UsersFilterRequestDto(),
  ): Promise<User[]> {
    const { sub, role } = tokenPayload;
    if (!sub) {
      throw new BadRequestException(
        'Unexpected exception. No user recipient id',
      );
    }
    if (!role || ![EUserRole.VIEWER, EUserRole.ADMIN].includes(role)) {
      throw new BadRequestException(
        'Unexpected exception. Unsupported user role',
      );
    }

    if (role === EUserRole.VIEWER) {
      return this.userRepository.findByActive(
        UserFindSelectionDto.of(filter.from, filter.from),
      );
    }

    if (role === EUserRole.ADMIN) {
      return this.userRepository.findByActiveOrByPendingAccessRequestedUserId(
        sub,
        UserFindSelectionDto.of(filter.from, filter.from),
      );
    }
  }

  public async updateUserById(
    id: User['id'],
    dto: UsersUpdateBodyRequestDto,
  ): Promise<User> {
    await this.userRepository.update(
      {
        id,
      },
      {
        ...dto,
      },
    );
    return this.getById(id);
  }

  public async deleteUsers(
    params: UsersDeleteRequestDto,
    tokePayload: TokenPayload,
  ): Promise<void> {
    const admin = await this.getById(tokePayload.sub);
    if (!admin || !admin.isActive || !admin.isAdmin) {
      throw new ForbiddenException('No permission');
    }
    await this.userRepository.delete({
      id: In(params.ids),
    });
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

  public async approveRequest(
    id: User['id'],
    tokenPayload: TokenPayload,
  ): Promise<User> {
    const { sub } = tokenPayload;
    const admin = await this.getById(sub);

    if (!admin.isActive || !admin.isAdmin) {
      throw new ForbiddenException('No permission');
    }

    const requests =
      await this.userAccessRequestRepository.findByPendingAndRequesterIdAndRequestedUserId(
        id,
        sub,
      );

    for (const request of requests) {
      await this.userAccessRequestRepository.approveById(request.id);
    }

    return this.userRepository.activateUserById(id);
  }

  public async rejectRequest(
    id: User['id'],
    tokenPayload: TokenPayload,
  ): Promise<User> {
    const requests =
      await this.userAccessRequestRepository.findByPendingAndRequesterIdAndRequestedUserId(
        id,
        tokenPayload.sub,
      );

    for (const request of requests) {
      await this.userAccessRequestRepository.rejectById(request.id);
    }

    return this.getById(id);
  }
}

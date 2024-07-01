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
import {
  BadRequestException,
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';

@Injectable()
export class UsersService {
  constructor(
    @InjectModel(User.name)
    private readonly userModel: Model<User>,
    private readonly databaseService: DatabaseService,
  ) {}

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
    const user = await this.userModel.findByIdAndUpdate(id, { ...dto });
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
    await this.databaseService.updateDatabaseData();
  }

  public async createUserAccessRequest(
    fromId: User['_id'],
    toId: User['_id'],
  ): Promise<UserResponseDto> {
    const u = await this.userModel.findById(fromId);
    u.accessRequestAdminId = toId;
    u.status = EUserStatus.PENDING;
    await u.save();
    return u.response();
  }

  public async setUserAccessRequestDecision(
    fromId: User['_id'],
    body: UsersAccessRequestBodyRequestDto,
    tokenPayload: TokenPayload,
  ): Promise<void> {
    const user = await this.userModel.findOne({
      _id: fromId,
      accessRequestAdminId: tokenPayload.sub,
    });
    user.accessRequestAdminId = null;
    user.status =
      body.decision === EAccessRequestDecision.ACCEPT
        ? EUserStatus.ACTIVE
        : EUserStatus.INACTIVE;
    await user.save();
  }
}

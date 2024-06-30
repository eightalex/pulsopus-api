import { Model, Types } from 'mongoose';
import { UserResponseDto, UsersDeleteRequestDto } from '@app/dto';
import { UsersUpdateBodyRequestDto } from '@app/dto/users/users-update-body.request.dto';
import {
  AccessRequest,
  EAccessRequestStatus,
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
    @InjectModel(AccessRequest.name)
    private readonly accessRequestModel: Model<AccessRequest>,
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
      return us.map((u) => User.response(u));
    }
    const accessRequests = await this.accessRequestModel
      .find()
      .where('toId')
      .equals(new Types.ObjectId(sub))
      .where('status')
      .equals(EAccessRequestStatus.ACTIVE)
      .exec();
    const requestUserIds = [
      ...new Set(
        accessRequests.map(({ fromId }) =>
          new Types.ObjectId(fromId).toHexString(),
        ),
      ),
    ];

    const us = await this.userModel
      .find({
        $or: [{ status: EUserStatus.ACTIVE }, { _id: { $in: requestUserIds } }],
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

  public async updateUser(user: User): Promise<User> {
    return this.userModel.findByIdAndUpdate(user);
  }

  public async changeUserStatusById(
    id: User['id'],
    status: EUserStatus = EUserStatus.ACTIVE,
  ): Promise<User> {
    const st = EUserStatus[status] || EUserStatus.ACTIVE;
    const user = await this.getById(id);
    // if (!user) {
    //   throw new NotFoundException(`User by ID: ${id} not found!`);
    // }
    // user.status = UserStatus.of(st);
    // await this.updateUser(user);
    return user;
  }

  public async updateUserByIdDto(
    id: User['id'],
    dto: UsersUpdateBodyRequestDto,
  ): Promise<User> {
    const user = await this.getById(id);
    // Object.entries(dto).forEach(([k, v]) => {
    //   if (k === 'status') {
    //     user[k] = UserStatus.of(v);
    //   }
    //   if (k === 'role') {
    //     user[k] = EUserRole[v];
    //   }
    // });
    return this.updateUser(user);
  }

  public async deleteUsers(
    params: UsersDeleteRequestDto,
    tokePayload: TokenPayload,
  ): Promise<void> {
    const u = await this.getById(tokePayload.sub);
    if (!u || !u.isActive || !u.isAdmin) {
      throw new ForbiddenException('No permission');
    }
    await this.userModel.deleteOne({ _id: { $in: params.ids } });
  }

  public async createUserAccessRequest(
    fromId: User['_id'],
    toId: User['_id'],
  ): Promise<AccessRequest> {
    const accessRequest = await this.accessRequestModel.create({
      fromId,
      toId,
    });
    const request = await accessRequest.save();
    const u = await this.userModel.findById(fromId);
    u.accessRequestIds.push(request._id);
    u.status = EUserStatus.PENDING;
    await u.save();
    return request;
  }
}

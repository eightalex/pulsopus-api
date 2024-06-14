import { UsersUpdateBodyRequestDto } from '@app/dto/users/users-update-body.request.dto';
import {
  EUserRole,
  EUserStatus,
  User,
  UserRole,
  UserStatus,
} from '@app/entities';
import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { MockService } from '@/api/src/mock/mock.service';

@Injectable()
export class UsersService {
  constructor(private readonly mock: MockService) {}

  public async getById(id: User['id']) {
    const user = await this.mock.users.findOneBy({ id });
    if (!user) {
      throw new NotFoundException('User not found');
    }
    return user;
  }

  public async getByEmail(email: User['email']): Promise<User> {
    const user = await this.mock.users.findOneBy({ email });
    if (!user) {
      // const us = createMember(email);
      // this.users = [...this.users, us];
      // return us;
      throw new NotFoundException('User not found!');
    }
    return user;
  }

  public async findAll(filter: Record<string, string[]>): Promise<User[]> {
    const usrs = await this.mock.users.find();
    return usrs.filter((u) => u._filter(filter));
  }

  public async findAllForRole(
    filter: Record<string, string[]>,
    role: EUserRole,
  ): Promise<User[]> {
    if (!role) {
      throw new BadRequestException('Unexpected exception. No user role');
    }
    const usrs = await this.findAll(filter);
    return usrs.filter((u) => u._viewByRole(role));
  }

  public async updateUser(user: User): Promise<User> {
    const updatedUser = await this.mock.users.update(user);
    if (!updatedUser) {
      throw new BadRequestException('Exception user update!');
    }
    return updatedUser;
  }

  public async reset() {
    const users = await this.mock.users.find();
    for (const user of users) {
      try {
        if (user.isAdmin) continue;
        user.status = UserStatus.of(EUserStatus.INACTIVE);
        await this.updateUser(user);
      } catch (err) {
        console.error(err.message);
      }
    }
  }

  public async changeUserStatusById(
    id: User['id'],
    status: EUserStatus = EUserStatus.ACTIVE,
  ): Promise<User> {
    const st = EUserStatus[status] || EUserStatus.ACTIVE;
    const user = await this.getById(id);
    if (!user) {
      throw new NotFoundException(`User by ID: ${id} not found!`);
    }
    user.status = UserStatus.of(st);
    await this.updateUser(user);
    return user;
  }

  public async updateUserByIdDto(
    id: User['id'],
    dto: UsersUpdateBodyRequestDto,
  ): Promise<User> {
    const user = await this.getById(id);
    Object.entries(dto).forEach(([k, v]) => {
      if (k === 'status') {
        user[k] = UserStatus.of(v);
      }
      if (k === 'role') {
        user[k] = UserRole.of(v);
      }
    });
    return this.updateUser(user);
  }
}

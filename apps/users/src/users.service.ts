import { DatabaseService } from '@app/database/database.service';
import { UsersDeleteRequestDto } from '@app/dto';
import { UsersUpdateBodyRequestDto } from '@app/dto/users/users-update-body.request.dto';
import {
  EUserRole,
  EUserStatus,
  Role,
  TokenPayload,
  User,
  UserStatus,
} from '@app/entities';
import {
  BadRequestException,
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';

@Injectable()
export class UsersService {
  constructor(private readonly db: DatabaseService) {}

  public async getById(id: User['id']): Promise<User> {
    const user = await this.db.userRepository.findOneBy({ id });
    if (!user) {
      throw new NotFoundException('User not found');
    }
    return user;
  }

  public async getByEmail(email: User['email']): Promise<User> {
    const user = await this.db.userRepository.findOneBy({ email });
    if (!user) {
      throw new NotFoundException('User not found!');
    }
    return user;
  }

  public async findAll(filter?: Record<string, string[]>): Promise<User[]> {
    const usrs = await this.db.userRepository.find();
    if (!filter) return usrs;
    return usrs
      .filter((u) => u._filter(filter))
      .sort((p, n) =>
        p.username.toLowerCase().localeCompare(n.username.toLowerCase()),
      );
  }

  public async findAllForRole(
    filter: Record<string, string[]>,
    role: EUserRole,
  ): Promise<User[]> {
    if (!role) {
      throw new BadRequestException('Unexpected exception. No user role');
    }
    const usrs = await this.findAll(filter);
    return usrs
      .filter((u) => u._viewByRole(role))
      .sort((p, n) => {
        const statusA = p.status.value;
        const statusB = n.status.value;
        const statusOrdering = [EUserStatus.PENDING];
        return (
          statusOrdering.indexOf(statusA) - statusOrdering.indexOf(statusB)
        );
      });
  }

  public async updateUser(user: User): Promise<User> {
    const updatedUser = await this.db.userRepository.update(user);
    if (!updatedUser) {
      throw new BadRequestException('Exception user update!');
    }
    return updatedUser;
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
        user[k] = Role.of(v);
      }
    });
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
    await this.db.userRepository.remove(params.ids);
  }
}

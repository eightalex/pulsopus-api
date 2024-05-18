import { UsersFilterRequestDto } from '@app/dto';
import { User } from '@app/entities';
import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { Db } from '@/api/src/mock/helpers/db';
import { MockService } from '@/api/src/mock/mock.service';

@Injectable()
export class UsersService {
  public readonly db = new Db();
  public users = [];

  constructor(private readonly mock: MockService) {}

  public async getById(id: string) {
    const user = await this.mock.users.findOneBy({ id });
    if (!user) {
      throw new NotFoundException('User not found');
    }
    return user;
  }

  public async getByEmail(email: string): Promise<User> {
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

  public async updateUser(user: User): Promise<User> {
    const updatedUser = await this.mock.users.update(user);
    if (!updatedUser) {
      throw new BadRequestException('Exception user update!');
    }
    return updatedUser;
  }
}

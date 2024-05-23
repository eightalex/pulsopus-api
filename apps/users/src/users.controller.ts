import { UsePublic } from '@app/common';
import { UsersFilterRequestDto } from '@app/dto/users/users-filter.request.dto';
import { EUserStatus, User, USER_GROUP } from '@app/entities';
import {
  Controller,
  Get,
  Param,
  Query,
  SerializeOptions,
  ValidationPipe,
} from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { UsersService } from './users.service';

@ApiTags('users')
@Controller('users')
@SerializeOptions({ groups: [USER_GROUP.ALL] })
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @UsePublic()
  @Get()
  public async index(
    @Query(ValidationPipe) filter: UsersFilterRequestDto,
  ): Promise<{ users: User[] }> {
    const users = await this.usersService.findAll(
      filter as Record<string, string[]>,
    );
    return { users };
  }

  @UsePublic()
  @Get('reset')
  public async reset() {
    await this.usersService.reset();
    return 'reset';
  }

  @UsePublic()
  @Get(':id')
  public testId(@Param() params: { id: User['id'] }) {
    return this.usersService.getById(params.id);
  }

  @UsePublic()
  @Get(':id/status/:status')
  public async changeUserStatusById(
    @Param() params: { id: User['id']; status: EUserStatus },
  ) {
    const res = {
      successfully: true,
      statuses: [...Object.values(EUserStatus)],
    };
    try {
      const user = await this.usersService.changeUserStatusById(
        params.id,
        params.status,
      );
      return {
        ...res,
        user,
      };
    } catch (err) {
      return {
        ...res,
        successfully: false,
        message: err.message,
      };
    }
  }
}

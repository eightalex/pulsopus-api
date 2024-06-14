import { UsePublic, UseRoles, UserTokenRole } from '@app/common';
import { UsersFilterRequestDto } from '@app/dto/users/users-filter.request.dto';
import { UsersUpdateBodyRequestDto } from '@app/dto/users/users-update-body.request.dto';
import { EUserRole, EUserStatus, User, USER_GROUP } from '@app/entities';
import {
  Body,
  Controller,
  Get,
  Param,
  Put,
  Query,
  SerializeOptions,
  ValidationPipe,
} from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { UsersService } from './users.service';

@ApiTags('users')
@Controller('users')
@SerializeOptions({ groups: [USER_GROUP.FULL] })
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @Get()
  public async index(
    @Query(ValidationPipe) filter: UsersFilterRequestDto,
    @UserTokenRole() role: EUserRole,
  ): Promise<{ users: User[] }> {
    const users = await this.usersService.findAllForRole(
      filter as Record<string, string[]>,
      role,
    );
    return { users };
  }

  @Put(':id')
  @UseRoles(EUserRole.ADMIN)
  public async updateUser(
    @Param() params: { id: User['id'] },
    @Body() body: UsersUpdateBodyRequestDto,
  ): Promise<{ user: User }> {
    const user = await this.usersService.updateUserByIdDto(params.id, body);
    return { user };
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

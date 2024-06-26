import {
  UsePublic,
  UseRoles,
  UserTokenPayload,
  UserTokenRole,
} from '@app/common';
import {
  UsersDeleteRequestDto,
  UsersFilterRequestDto,
  UsersUpdateBodyRequestDto,
} from '@app/dto';
import {
  EUserRole,
  EUserStatus,
  Role,
  TokenPayload,
  User,
  USER_GROUP,
  UserStatus,
} from '@app/entities';
import {
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  HttpStatus,
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
@SerializeOptions({ groups: [USER_GROUP.LIST] })
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @Get()
  public async getAllUsers(
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

  @Get('statuses')
  public async getUserStatuses(
    @UserTokenRole() fromRole: EUserRole,
  ): Promise<{ statuses: UserStatus[] }> {
    const statuses = Object.keys(EUserStatus).map((k) =>
      UserStatus.of(k as EUserStatus, fromRole),
    );
    return { statuses };
  }

  @Get('roles')
  public async getUserRoles(
    @UserTokenRole() fromRole: EUserRole,
  ): Promise<{ roles: Role[] }> {
    const roles = Object.keys(EUserRole).map((k) =>
      Role.of(k as EUserRole, fromRole),
    );
    return { roles };
  }

  @Get(':id')
  @UsePublic()
  public async getUserById(
    @Param() params: { id: User['id'] },
  ): Promise<{ user: User }> {
    const user = await this.usersService.getById(params.id);
    return { user };
  }

  @Delete()
  @HttpCode(HttpStatus.NO_CONTENT)
  public async deleteUserByIds(
    @Query() params: UsersDeleteRequestDto,
    @UserTokenPayload() tokenPayload: TokenPayload,
  ): Promise<void> {
    return this.usersService.deleteUsers(params, tokenPayload);
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

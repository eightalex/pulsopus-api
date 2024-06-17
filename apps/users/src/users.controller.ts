import { UsePublic, UseRoles, UserTokenRole } from '@app/common';
import { UsersFilterRequestDto } from '@app/dto/users/users-filter.request.dto';
import { UsersUpdateBodyRequestDto } from '@app/dto/users/users-update-body.request.dto';
import {
  EUserRole,
  EUserStatus,
  User,
  USER_GROUP,
  UserRole,
  UserStatus,
} from '@app/entities';
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

  @Get('public')
  @UsePublic()
  public async usePublic(): Promise<{ users: User[] }> {
    const users = await this.usersService.findAll();
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
  ): Promise<{ roles: UserRole[] }> {
    const roles = Object.keys(EUserRole).map((k) =>
      UserRole.of(k as EUserRole, fromRole),
    );
    return { roles };
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

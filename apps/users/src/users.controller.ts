import { UseRoles, UserTokenPayload } from '@app/common';
import {
  UsersAccessBodyRequestDto,
  UsersDeleteRequestDto,
  UsersFilterRequestDto,
  UsersUpdateBodyRequestDto,
} from '@app/dto';
import { EUserRole, TokenPayload, User, USER_GROUP } from '@app/entities';
import {
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  HttpStatus,
  Param,
  Post,
  Put,
  Query,
  SerializeOptions,
  ValidationPipe,
} from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { UsersGateway } from '@/users/src/users.gateway';
import { UsersService } from './users.service';

@ApiTags('users')
@Controller('users')
@SerializeOptions({ groups: [USER_GROUP.LIST] })
export class UsersController {
  constructor(
    private readonly usersService: UsersService,
    private readonly usersGateway: UsersGateway,
  ) {}

  @SerializeOptions({ groups: [USER_GROUP.PROFILE] })
  @Get()
  public async getUsers(): Promise<{ users: User[] }> {
    const users = await this.usersService.getUsers();
    return { users };
  }

  @Get('activity')
  public async getAllUsers(
    @Query(ValidationPipe) filter: UsersFilterRequestDto,
    @UserTokenPayload() tokenPayload: TokenPayload,
  ): Promise<{ users: User[] }> {
    const users = await this.usersService.getAllByRequesterWithFilter(
      tokenPayload,
      filter,
    );
    return { users };
  }

  @Get(':id')
  @SerializeOptions({ groups: [USER_GROUP.PROFILE] })
  public async getById(
    @Param() params: { id: User['id'] },
  ): Promise<{ user: User }> {
    const user = { id: params.id } as User;
    return { user };
  }

  @Put(':id')
  @UseRoles(EUserRole.ADMIN)
  public async updateUser(
    @Param() params: { id: User['id'] },
    @Body() body: UsersUpdateBodyRequestDto,
    @UserTokenPayload() tokenPayload: TokenPayload,
  ): Promise<{ user: User }> {
    const user = await this.usersService.updateUserById(params.id, body);
    this.usersGateway.sendEventUpdateUser({
      userId: params.id,
      requesterUserId: tokenPayload.sub,
      updatedParams: body,
    });
    return { user };
  }

  @Post('access/approve')
  @UseRoles(EUserRole.ADMIN)
  @HttpCode(HttpStatus.NO_CONTENT)
  public async approveAccessRequest(
    @Body() body: UsersAccessBodyRequestDto,
    @UserTokenPayload() tokenPayload: TokenPayload,
  ): Promise<User> {
    return this.usersService.approveRequest(body, tokenPayload);
  }

  @Post('access/reject')
  @UseRoles(EUserRole.ADMIN)
  @HttpCode(HttpStatus.NO_CONTENT)
  public async rejectAccessRequest(
    @Body() body: UsersAccessBodyRequestDto,
    @UserTokenPayload() tokenPayload: TokenPayload,
  ): Promise<User> {
    return this.usersService.rejectRequest(body, tokenPayload);
  }

  @Delete()
  @UseRoles(EUserRole.ADMIN)
  @HttpCode(HttpStatus.NO_CONTENT)
  public async deleteUserByIds(
    @Query() params: UsersDeleteRequestDto,
    @UserTokenPayload() tokenPayload: TokenPayload,
  ): Promise<void> {
    await this.usersService.deleteUsers(params, tokenPayload);
    params.ids.forEach((userId) => {
      this.usersGateway.sendEventDeleteUser({
        userId,
        requesterUserId: tokenPayload.sub,
      });
    });
  }
}

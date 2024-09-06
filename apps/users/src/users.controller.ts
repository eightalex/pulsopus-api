import { Request } from 'express';
import { UserAuthorization, UseRoles, UserTokenPayload } from '@app/common';
import {
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
  Req,
  SerializeOptions,
  ValidationPipe,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { ApiTags } from '@nestjs/swagger';
import { AuthService } from '@/auth/src/auth.service';
import { UsersGateway } from '@/users/src/users.gateway';
import { UsersService } from './users.service';

@ApiTags('users')
@Controller('users')
@SerializeOptions({ groups: [USER_GROUP.LIST] })
export class UsersController {
  constructor(
    private readonly config: ConfigService,
    private readonly usersService: UsersService,
    private readonly usersGateway: UsersGateway,
    private readonly authService: AuthService,
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

  @Post(':id/access/approve')
  @UseRoles(EUserRole.ADMIN)
  @HttpCode(HttpStatus.NO_CONTENT)
  public async approveAccessRequest(
    @Param(ValidationPipe) params: { id: User['id'] },
    @UserTokenPayload() tokenPayload: TokenPayload,
  ): Promise<User> {
    return this.usersService.approveRequest(params.id, tokenPayload);
  }

  @Post(':id/access/reject')
  @UseRoles(EUserRole.ADMIN)
  @HttpCode(HttpStatus.NO_CONTENT)
  public async rejectAccessRequest(
    @Param(ValidationPipe) params: { id: User['id'] },
    @UserTokenPayload() tokenPayload: TokenPayload,
  ): Promise<User> {
    return this.usersService.rejectRequest(params.id, tokenPayload);
  }

  @Get('admin/connect')
  @UseRoles(EUserRole.ADMIN)
  public async getAdminSocketConnection(
    @UserAuthorization() token: string,
    @Req() req: Request,
  ): Promise<{ link: string }> {
    const t = await this.authService.rebuildToken(token);
    const protocol = req.protocol === 'https' ? 'wss' : 'ws';
    const host = req.get('Host');
    const link = `${protocol}://${host}/api/v1/users?token=${t}`;
    return { link };
  }
}

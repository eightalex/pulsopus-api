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
import { UsersService } from './users.service';

@ApiTags('users')
@Controller('users')
@SerializeOptions({ groups: [USER_GROUP.LIST] })
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @SerializeOptions({ groups: [USER_GROUP.PROFILE] })
  @Get()
  public async getUsers(): Promise<{ users: User[] }> {
    const users = await this.usersService.getUsers();
    return { users };
  }

  @SerializeOptions({ groups: [USER_GROUP.LIST] })
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

  @Put(':id')
  @UseRoles(EUserRole.ADMIN)
  public async updateUser(
    @Param() params: { id: User['id'] },
    @Body() body: UsersUpdateBodyRequestDto,
  ): Promise<{ user: User }> {
    const user = await this.usersService.updateUserByIdDto(params.id, body);
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
    return this.usersService.deleteUsers(params, tokenPayload);
  }
}

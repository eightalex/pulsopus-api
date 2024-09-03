import { UseRoles, UserTokenPayload } from '@app/common';
import {
  UserResponseDto,
  UsersAccessRequestBodyRequestDto,
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
  ): Promise<{ users: UserResponseDto[] }> {
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
  ): Promise<{ user: UserResponseDto }> {
    const user = await this.usersService.updateUserByIdDto(params.id, body);
    return { user };
  }

  @Post(':id/access')
  @UseRoles(EUserRole.ADMIN)
  @HttpCode(HttpStatus.NO_CONTENT)
  public async acceptPending(
    @Param() params: { id: User['id'] },
    @Body() body: UsersAccessRequestBodyRequestDto,
    @UserTokenPayload() tokenPayload: TokenPayload,
  ): Promise<void> {
    await this.usersService.setUserAccessRequestDecision(
      params.id,
      body,
      tokenPayload,
    );
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

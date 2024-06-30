import { UsePublic, UseRoles, UserTokenPayload } from '@app/common';
import {
  UserResponseDto,
  UsersDeleteRequestDto,
  UsersFilterRequestDto,
  UsersUpdateBodyRequestDto,
} from '@app/dto';
import {
  EUserRole,
  EUserStatus,
  TokenPayload,
  User,
  USER_GROUP,
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
    @UserTokenPayload() tokenPayload: TokenPayload,
  ): Promise<{ users: UserResponseDto[] }> {
    const users = await this.usersService.getAllByRequester(tokenPayload);
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

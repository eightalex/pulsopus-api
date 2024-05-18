import { UsePublic } from '@app/common';
import { UsersFilterRequestDto } from '@app/dto/users/users-filter.request.dto';
import { User, USER_GROUP } from '@app/entities';
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
    console.log('filter', filter);
    const users = await this.usersService.findAll(
      filter as Record<string, string[]>,
    );
    return { users };
  }

  @UsePublic()
  @Get(':id')
  public testId(@Param() params: { id: string }) {
    return params.id;
  }

  @UsePublic()
  @Get('/reset')
  public async reset() {
    await this.usersService.reset();
  }
}

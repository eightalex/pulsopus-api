import { UsePublic } from '@app/common';
import { Controller, Get } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { UsersService } from './users.service';

@ApiTags('users')
@Controller('users')
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @UsePublic()
  @Get()
  public get() {
    return {
      userId: 'userId',
    };
  }
}

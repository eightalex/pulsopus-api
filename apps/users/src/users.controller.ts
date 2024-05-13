import { UsePublic } from '@app/common';
import { Controller, Get, Param } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { UsersService } from './users.service';

@ApiTags('users')
@Controller('users')
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @UsePublic()
  @Get(':id')
  public testId(@Param() params: { id: string }) {
    return params.id;
  }

  // @UsePublic()
  // @Get('test')
  // public test() {
  //   return {
  //     test: 'test',
  //   };
  // }
}

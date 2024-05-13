import { Injectable } from '@nestjs/common';

@Injectable()
export class UsersService {
  public getById(id: string) {
    return 'user response';
  }
}

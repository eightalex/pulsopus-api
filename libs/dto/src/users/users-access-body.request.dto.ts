import { IsString } from 'class-validator';
import { User } from '@app/entities';

export class UsersAccessBodyRequestDto {
  @IsString()
  id: User['id'];
}

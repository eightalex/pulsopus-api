import { IsEmail } from 'class-validator';

export class AuthLoginSendRequestDto {
  @IsEmail()
  recipient!: string;

  @IsEmail()
  login!: string;
}

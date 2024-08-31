import { IsEmail } from 'class-validator';

export class AuthLoginRequestDto {
  @IsEmail()
  login!: string;
}

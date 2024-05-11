import {
  IsEmail,
  IsNotEmpty,
  IsString,
  IsStrongPassword,
  MaxLength,
  MinLength,
} from 'class-validator';

export class AuthLoginRequestDto {
  @IsEmail()
  login!: string;

  @IsString()
  // @IsStrongPassword()
  @IsNotEmpty()
  @MinLength(4)
  @MaxLength(16)
  password: string;
}

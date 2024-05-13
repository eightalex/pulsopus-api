import {
  IsEmail,
  IsNotEmpty,
  IsString,
  IsStrongPassword,
  MaxLength,
  MinLength,
} from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class AuthLoginRequestDto {
  @ApiProperty()
  @IsEmail()
  login!: string;

  @ApiProperty()
  @IsString()
  // @IsStrongPassword()
  @IsNotEmpty()
  @MinLength(4)
  @MaxLength(16)
  password: string;
}

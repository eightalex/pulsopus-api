import { Response } from 'express';
import { UsePublic, UserAuthorization } from '@app/common';
import {
  Body,
  Controller,
  HttpCode,
  HttpStatus,
  Post,
  Res,
} from '@nestjs/common';
import { AuthLoginRequestDto, AuthResponseDto } from './dto/';
import { AuthService } from './auth.service';

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @UsePublic()
  @Post('login')
  @HttpCode(HttpStatus.OK)
  public async login(
    @Body() body: AuthLoginRequestDto,
    @Res({ passthrough: true }) res: Response,
  ): Promise<AuthResponseDto> {
    const data = await this.authService.signIn(body);
    res.setHeader('Authorization', data.accessToken);
    res.cookie('refresh', data.refreshToken, {
      httpOnly: true,
    });
    return data;
  }

  @UsePublic()
  @Post('token')
  @HttpCode(HttpStatus.OK)
  public async token(
    @UserAuthorization() token: string,
    @Res({ passthrough: true }) res: Response,
  ): Promise<AuthResponseDto> {
    const data = await this.authService.tokenLogin(token);
    res.setHeader('Authorization', data.accessToken);
    res.cookie('refresh', data.refreshToken, {
      httpOnly: true,
      maxAge: 3600000,
    });
    return data;
  }

  @UsePublic()
  @Post('logout')
  @HttpCode(HttpStatus.OK)
  public async logout(
    @UserAuthorization() token: string,
    @Res({ passthrough: true }) res: Response,
  ): Promise<AuthResponseDto> {
    const data = await this.authService.tokenLogin(token);
    res.setHeader('Authorization', '');
    res.cookie('refresh', '', {
      httpOnly: true,
      maxAge: 0,
    });
    return data;
  }
}

import { Response } from 'express';
import { UsePublic, UserAuthorization } from '@app/common';
import { AuthLoginRequestDto, AuthResponseDto } from '@app/dto';
import {
  Body,
  Controller,
  HttpCode,
  HttpStatus,
  Inject,
  Post,
  Res,
} from '@nestjs/common';
import { ApiBody, ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';
import { AuthService } from './auth.service';

@ApiTags('auth')
@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  // swagger
  @ApiOperation({ summary: 'login by user credential.' })
  @ApiBody({ type: AuthLoginRequestDto })
  @ApiResponse({
    status: 200,
    description: 'login user OK',
    type: AuthResponseDto,
  })
  @ApiResponse({
    status: 404,
    description: 'Body user credential error validation.',
  })
  // endpoint
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

  // swagger
  @ApiOperation({ summary: 'login by user token.' })
  @ApiResponse({
    status: 200,
    description: 'login user OK',
    type: AuthResponseDto,
  })
  // endpoint
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

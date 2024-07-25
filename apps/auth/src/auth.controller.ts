import { Response } from 'express';
import { UsePublic, UserAuthorization } from '@app/common';
import {
  AuthLoginRequestDto,
  AuthLoginSendRequestDto,
  AuthResponseDto,
} from '@app/dto';
import { USER_GROUP } from '@app/entities';
import {
  Body,
  Controller,
  Get,
  HttpCode,
  HttpStatus,
  Param,
  Post,
  Res,
  SerializeOptions,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { ApiBody, ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';
import { AuthService } from './auth.service';

@ApiTags('auth')
@Controller('auth')
@SerializeOptions({ groups: [USER_GROUP.AUTH] })
export class AuthController {
  constructor(
    private readonly authService: AuthService,
    private readonly config: ConfigService,
  ) {}

  private setResponseToken(res: Response, token: string) {
    // TODO: get domain from config | secure IS_DEV ? false : true
    res.cookie('token', token, {
      httpOnly: true,
      // domain: 'localhost',
      domain: '.pulsopus.dev',
      secure: true,
    });
    res.setHeader('Authorization', `Bearer ${token}`);
  }

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
    this.setResponseToken(res, data.accessToken);
    // res.setHeader('Authorization', data.accessToken);
    // res.cookie('refresh', data.refreshToken, {
    //   httpOnly: true,
    // });
    // res.cookie('token', data.accessToken, {
    //   httpOnly: false,
    //   // domain: '.app.localhost',
    //   domain: '127.0.0.1',
    // });
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
  @Post('token')
  @HttpCode(HttpStatus.OK)
  public async token(
    @UserAuthorization() token: string,
    @Res({ passthrough: true }) res: Response,
  ): Promise<AuthResponseDto> {
    const data = await this.authService.tokenLogin(token);
    this.setResponseToken(res, data.accessToken);
    // res.setHeader('Authorization', data.accessToken);
    // res.cookie('refresh', data.refreshToken, {
    //   httpOnly: true,
    //   maxAge: 3600000,
    // });
    // res.cookie('token', data.accessToken, {
    //   httpOnly: false,
    //   // domain: '.app.localhost',
    //   domain: '127.0.0.1',
    // });
    return data;
  }

  // swagger
  @ApiOperation({ summary: 'logout by user token.' })
  @ApiResponse({
    status: HttpStatus.NO_CONTENT,
    description: 'logout user OK',
  })
  // endpoint
  @Post('logout')
  @HttpCode(HttpStatus.NO_CONTENT)
  public async logout(
    @UserAuthorization() token: string,
    @Res({ passthrough: true }) res: Response,
  ): Promise<void> {
    await this.authService.logout(token);
    res.setHeader('Authorization', '');
    res.cookie('refresh', '', {
      httpOnly: true,
      maxAge: 0,
    });
    res.cookie('token', '', {
      maxAge: 0,
      httpOnly: true,
    });
  }

  // swagger
  @ApiOperation({
    summary: 'request access from administrator with user credential.',
  })
  @ApiBody({ type: AuthLoginSendRequestDto })
  @ApiResponse({ status: 204, description: 'request sent' })
  // endpoint
  @UsePublic()
  @Post('request-access')
  @HttpCode(HttpStatus.NO_CONTENT)
  public async requestAccessAdmin(
    @Body() dto: AuthLoginSendRequestDto,
  ): Promise<void> {
    await this.authService.requestAccess(dto);
  }

  @UsePublic()
  @Get('test/:login')
  public testEmail(@Param() param: { login: string }) {
    return this.authService.signIn({
      login: param.login,
      password: 'password',
    });
  }
}

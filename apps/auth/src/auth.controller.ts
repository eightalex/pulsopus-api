import { Response } from 'express';
import {
  JwtRefreshGuard,
  UsePublic,
  UserAuthorization,
  UserAuthorizationRefresh,
} from '@app/common';
import { TConfig } from '@app/common';
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
  UseGuards,
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
    private readonly configService: ConfigService<TConfig>,
  ) {}

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
    this.authService.setAuthResponseCookieToken(
      res,
      data.accessToken,
      data.refreshToken,
    );
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
    this.authService.setAuthResponseCookieToken(
      res,
      data.accessToken,
      data.refreshToken,
    );
    return data;
  }

  // swagger
  @ApiOperation({ summary: 'refresh user tokens.' })
  @ApiResponse({
    status: 200,
    description: 'refresh user OK',
    type: AuthResponseDto,
  })
  // endpoint
  @Post('refresh')
  @HttpCode(HttpStatus.OK)
  @UsePublic()
  @UseGuards(JwtRefreshGuard)
  public async refreshToken(
    @UserAuthorizationRefresh() refreshToken: string,
    @Res({ passthrough: true }) res: Response,
  ): Promise<AuthResponseDto> {
    // TODO: create refresh auth
    const data = await this.authService.tokenRefresh(refreshToken);
    this.authService.setAuthResponseCookieToken(
      res,
      data.accessToken,
      data.refreshToken,
    );
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
    console.time('logout time');
    await this.authService.logout(res, token);
    console.timeEnd('logout time');
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
    });
  }
}

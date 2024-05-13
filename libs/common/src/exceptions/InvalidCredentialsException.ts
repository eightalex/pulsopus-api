import {
  HttpException,
  HttpExceptionOptions,
  HttpStatus,
} from '@nestjs/common';

export class InvalidCredentialsException extends HttpException {
  constructor(
    response: string = 'Invalid credentials',
    statusCode = HttpStatus.UNAUTHORIZED,
    options?: HttpExceptionOptions,
  ) {
    super(response, statusCode, options);
  }
}

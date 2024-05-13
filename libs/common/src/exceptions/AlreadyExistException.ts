import { HttpException, HttpExceptionOptions, HttpStatus } from '@nestjs/common';

export class AlreadyExistException extends HttpException {
	constructor(response: string, options?: HttpExceptionOptions) {
		super(response, HttpStatus.CONFLICT, options);
	}
}

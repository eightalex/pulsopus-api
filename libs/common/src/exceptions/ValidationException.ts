import {
  BadRequestException,
  HttpExceptionOptions,
  ValidationError,
} from '@nestjs/common';

interface ITransformException {
  message: string[];
}

const isValidationError = (object: any | any[]): boolean => {
  const target = Array.isArray(object) ? object[0] : object;
  return 'property' in target || 'target:' in target;
};

const transformException = (errors: ValidationError[]): ITransformException => {
  const message = errors.reduce((acc, { property, target, constraints }) => {
    const vs = Object.values(constraints);
    acc = [...acc, ...vs];
    return acc;
  }, []);
  return { message };
};

export class ValidationException extends BadRequestException {
  constructor(
    objectOrError: any,
    descriptionOrOptions?: string | HttpExceptionOptions,
  ) {
    if (isValidationError(objectOrError)) {
      super(transformException(objectOrError), descriptionOrOptions);
      return;
    }
    super(objectOrError, descriptionOrOptions);
  }
}

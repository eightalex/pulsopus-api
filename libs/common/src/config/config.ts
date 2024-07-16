import { plainToInstance } from 'class-transformer';
import { IsNumber, IsString, validateSync } from 'class-validator';

class EnvironmentVariables {
  @IsString()
  PREFIX_GLOBAL: string;
  @IsString()
  PREFIX_VERSION: string;

  @IsNumber()
  PORT_API: number;
  @IsNumber()
  PORT_AUTH: number;
  @IsNumber()
  PORT_DEPARTMENTS: number;

  @IsString()
  HOST_API: string;
  @IsString()
  HOST_AUTH: string;
  @IsString()
  HOST_DEPARTMENTS: string;

  @IsString()
  MONGODB_URI: string;

  // MAILER
  @IsString()
  MAIL_HOST: string;
  @IsNumber()
  MAIL_PORT: number;
  @IsString()
  MAIL_USER: string;
  @IsString()
  MAIL_PASSWORD: string;
}

export const validateConfig = (config: Record<string, unknown>) => {
  const validatedConfig = plainToInstance(EnvironmentVariables, config, {
    enableImplicitConversion: true,
  });
  const errors = validateSync(validatedConfig, {
    skipMissingProperties: false,
  });

  if (errors.length > 0) {
    throw new Error(errors.toString());
  }
  return validatedConfig;
};

export default (): Record<string, unknown> => ({
  prefix: {
    version: process.env.PREFIX_VERSION || 'v',
    global: process.env.PREFIX_GLOBAL || 'api',
  },
  port: {
    api: parseInt(process.env.PORT_API, 10) || 8080,
    auth: parseInt(process.env.PORT_AUTH, 10) || 8081,
    users: parseInt(process.env.PORT_USERS, 10) || 8085,
    departments: parseInt(process.env.PORT_EMPLOYYES, 10) || 8086,
  },
  host: {
    api: process.env.HOST_API || '0.0.0.0',
    auth: process.env.HOST_AUTH || 'auth',
    users: process.env.HOST_AUTH || 'users',
    departments: process.env.HOST_EMPLOYYES || 'departments',
  },
  database: {
    host: process.env.DATABASE_HOST,
    port: parseInt(process.env.DATABASE_PORT, 10) || 5432,
  },
  db: {
    mongo: {
      uri: process.env.MONGODB_URI,
    },
    pg: {
      host: process.env.DATABASE_HOST,
      port: parseInt(process.env.DATABASE_PORT, 10) || 5432,
    },
  },
  secret: {
    access: {
      key: process.env.JWT_SECRET_ACCESS,
      expire: process.env.JWT_SECRET_ACCESS_EXPIRE,
    },
    refresh: {
      key: process.env.JWT_SECRET_REFRESH,
      expire: process.env.JWT_SECRET_REFRESH_EXPIRE,
    },
  },
  mailer: {
    host: process.env.MAIL_HOST,
    port: process.env.MAIL_PORT,
    user: process.env.MAIL_USER,
    password: process.env.MAIL_PASSWORD,
  },
});

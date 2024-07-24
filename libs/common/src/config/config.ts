import { plainToInstance } from 'class-transformer';
import { IsNumber, IsString, validateSync } from 'class-validator';

class EnvironmentVariables {
  @IsString()
  NODE_ENV: string;

  @IsString()
  PREFIX_GLOBAL: string;
  @IsString()
  PREFIX_VERSION: string;

  @IsNumber()
  PORT_API: number;
  @IsNumber()
  PORT_AUTH: number;
  @IsNumber()
  PORT_USERS: number;
  @IsNumber()
  PORT_DEPARTMENTS: number;

  @IsString()
  HOST_API: string;
  @IsString()
  HOST_AUTH: string;
  @IsString()
  HOST_USERS: string;
  @IsString()
  HOST_DEPARTMENTS: string;

  @IsString()
  JWT_SECRET_ACCESS: string;
  @IsString()
  JWT_SECRET_REFRESH: string;
  @IsString()
  JWT_SECRET_ACCESS_EXPIRE: string;
  @IsString()
  JWT_SECRET_REFRESH_EXPIRE: string;

  @IsString()
  MONGODB_URI: string;

  @IsString()
  DB_HOST: string;
  @IsString()
  DB_USERNAME: string;
  @IsString()
  DB_PASSWORD: string;
  @IsNumber()
  DB_PORT: number;
  @IsString()
  DB_NAME: string;

  @IsString()
  CLIENT_URL: string;
  @IsString()
  APP_URL: string;

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
  NODE_ENV: process.env.NODE_ENV || 'development',
  IS_DEV: process.env.NODE_ENV === 'development',
  prefix: {
    version: process.env.PREFIX_VERSION || 'v',
    global: process.env.PREFIX_GLOBAL || 'api',
  },
  port: {
    api: parseInt(process.env.PORT_API, 10) || 8080,
    auth: parseInt(process.env.PORT_AUTH, 10) || 8081,
    users: parseInt(process.env.PORT_USERS, 10) || 8085,
    departments: parseInt(process.env.PORT_DEPARTMENTS, 10) || 8086,
  },
  host: {
    api: process.env.HOST_API || '0.0.0.0',
    auth: process.env.HOST_AUTH || 'auth',
    users: process.env.HOST_USERS || 'users',
    departments: process.env.HOST_DEPARTMENTS || 'departments',
  },
  db: {
    mongo: {
      uri: process.env.MONGODB_URI,
    },
    pg: {
      host: process.env.DB_HOST,
      port: parseInt(process.env.DB_PORT, 10) || 5432,
      username: process.env.DB_USERNAME,
      password: process.env.DB_PASSWORD,
      name: process.env.DB_NAME,
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
  url: {
    client: process.env.CLIENT_URL || 'https://pulsopus.dev',
    app: process.env.APP_URL || 'https://app.pulsopus.dev',
  },
});

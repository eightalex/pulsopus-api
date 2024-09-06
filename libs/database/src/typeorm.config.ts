import * as fs from 'fs';
import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { TypeOrmModuleOptions, TypeOrmOptionsFactory } from '@nestjs/typeorm';
import { entities } from './database.entities';

@Injectable()
export class TypeOrmConfigService implements TypeOrmOptionsFactory {
  constructor(private readonly config: ConfigService) {}

  public createTypeOrmOptions():
    | Promise<TypeOrmModuleOptions>
    | TypeOrmModuleOptions {
    const db = this.config.get('db.pg');
    const isDev = this.config.get<boolean>('IS_DEV');
    const ca = isDev ? '' : fs.readFileSync(db.ca).toString();
    return {
      type: 'postgres',
      host: db.host,
      port: db.port,
      username: db.username,
      password: db.password,
      database: db.name,
      synchronize: true,
      retryAttempts: 5,
      retryDelay: 5000,
      autoLoadEntities: true,
      entities,
      ssl: Boolean(isDev || !ca)
        ? false
        : {
            rejectUnauthorized: true,
            ca,
          },
      logging: isDev ? false : ['query', 'error'],
    };
  }
}

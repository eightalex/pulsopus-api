import { Connection, MongooseError } from 'mongoose';
import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import {
  MongooseModuleOptions,
  MongooseOptionsFactory,
} from '@nestjs/mongoose';

@Injectable()
export class MongooseConfigService implements MongooseOptionsFactory {
  constructor(private readonly config: ConfigService) {}

  private connectionFactory(connection: Connection, name: string) {
    const str = `${name}: ID: ${connection.id}, ${connection.name}.`;
    console.log(str);
    return connection;
  }

  private connectionErrorFactory(error: MongooseError): MongooseError {
    console.log('MONGOOSE CONNECTION ERROR: ', error);
    return error;
  }

  public createMongooseOptions(): MongooseModuleOptions {
    const { mongo } = this.config.get('db');
    return {
      uri: mongo.uri,
      retryAttempts: 1,
      retryDelay: 1,
      connectionFactory: this.connectionFactory,
      connectionErrorFactory: this.connectionErrorFactory,
    };
  }
}

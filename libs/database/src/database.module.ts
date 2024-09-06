import { ConfigModule } from '@app/common';
import { entities, repositories } from '@app/database/database.entities';
import { DatabaseService } from '@app/database/database.service';
import { forwardRef, Module } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { DataLoaderModule } from './data-loader/data-loader.module';
import { TypeOrmConfigService } from './typeorm.config';

@Module({
  imports: [
    ConfigModule,
    TypeOrmModule.forRootAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useClass: TypeOrmConfigService,
    }),
    TypeOrmModule.forFeature(entities),
    forwardRef(() => DataLoaderModule),
  ],
  providers: [DatabaseService, ...repositories],
  exports: [DatabaseService, TypeOrmModule, ...repositories],
})
export class DatabaseModule {}

import { ConfigModule } from '@app/common';
import { entities } from '@app/database/database.entities';
import { DatabaseService } from '@app/database/database.service';
import { Department, DepartmentSchema, User } from '@app/entities';
import { forwardRef, Module } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { MongooseModule } from '@nestjs/mongoose';
import { TypeOrmModule } from '@nestjs/typeorm';
import { MigrationModule } from './migration/migration.module';
import { MongooseConfigService } from './mongoose.config';
import { TypeOrmConfigService } from './typeorm.config';

@Module({
  imports: [
    ConfigModule,
    // MongooseModule.forRootAsync({
    //   imports: [ConfigModule],
    //   useClass: MongooseConfigService,
    //   inject: [ConfigService],
    // }),
    // MongooseModule.forFeature([
    //   { name: User.name, schema: UserSchema },
    //   { name: Department.name, schema: DepartmentSchema },
    // ]),
    TypeOrmModule.forRootAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useClass: TypeOrmConfigService,
    }),
    TypeOrmModule.forFeature(entities),
    // forwardRef(() => MigrationModule),
  ],
  providers: [DatabaseService],
  // exports: [MongooseModule, DatabaseService],
  exports: [TypeOrmModule, DatabaseService],
})
export class DatabaseModule {}

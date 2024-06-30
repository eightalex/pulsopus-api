import { ConfigModule } from '@app/common';
import {
  AccessRequest,
  AccessRequestSchema,
  Department,
  DepartmentSchema,
  User,
  UserSchema,
} from '@app/entities';
import { forwardRef, Module } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { MongooseModule } from '@nestjs/mongoose';
import { MigrationModule } from './migration/migration.module';
import { MongooseConfigService } from './mongoose.config';

@Module({
  imports: [
    ConfigModule,
    MongooseModule.forRootAsync({
      imports: [ConfigModule],
      useClass: MongooseConfigService,
      inject: [ConfigService],
    }),
    MongooseModule.forFeature([
      { name: User.name, schema: UserSchema },
      { name: Department.name, schema: DepartmentSchema },
      { name: AccessRequest.name, schema: AccessRequestSchema },
    ]),
    // TypeOrmModule.forRootAsync({
    //   imports: [ConfigModule],
    //   inject: [ConfigService],
    //   useClass: TypeOrmConfigService,
    // }),
    forwardRef(() => MigrationModule),
  ],
  providers: [],
  exports: [MongooseModule],
})
export class DatabaseModule {}

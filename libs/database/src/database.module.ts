import { ConfigModule } from '@app/common';
import { DatabaseService } from '@app/database/database.service';
import { Department, DepartmentSchema, User, UserSchema } from '@app/entities';
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
    ]),
    // TypeOrmModule.forRootAsync({
    //   imports: [ConfigModule],
    //   inject: [ConfigService],
    //   useClass: TypeOrmConfigService,
    // }),
    forwardRef(() => MigrationModule),
  ],
  providers: [DatabaseService],
  exports: [MongooseModule, DatabaseService],
})
export class DatabaseModule {}

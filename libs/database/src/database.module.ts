import { ConfigModule } from '@app/common';
import { Module } from '@nestjs/common';
import { DatabaseService } from './database.service';

@Module({
  imports: [
    ConfigModule,
    // TypeOrmModule.forRootAsync({
    //   imports: [ConfigModule],
    //   inject: [ConfigService],
    //   useClass: TypeOrmConfigService,
    // }),
  ],
  providers: [DatabaseService],
  exports: [DatabaseService],
})
export class DatabaseModule {}

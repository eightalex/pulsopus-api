import { forwardRef, Module } from '@nestjs/common';
import { DatabaseModule } from '../database.module';
import { MigrationService } from './migration.service';

@Module({
  imports: [forwardRef(() => DatabaseModule)],
  providers: [MigrationService],
})
export class MigrationModule {}

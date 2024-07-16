import { MailerModule } from '@app/mailer';
import { forwardRef, Module } from '@nestjs/common';
import { DatabaseModule } from '../database.module';
import { MigrationService } from './migration.service';

@Module({
  imports: [forwardRef(() => DatabaseModule), MailerModule],
  providers: [MigrationService],
  exports: [MigrationService],
})
export class MigrationModule {}

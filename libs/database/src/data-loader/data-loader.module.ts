import { DatabaseModule } from '@app/database';
import { forwardRef, Module } from '@nestjs/common';
import { DataLoaderService } from './data-loader.service';

@Module({
  imports: [forwardRef(() => DatabaseModule)],
  providers: [DataLoaderService],
  exports: [DataLoaderService],
})
export class DataLoaderModule {}

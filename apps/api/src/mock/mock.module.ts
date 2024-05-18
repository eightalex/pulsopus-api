import { Module } from '@nestjs/common';
import { MockService } from '@/api/src/mock/mock.service';

@Module({
  imports: [],
  controllers: [],
  providers: [MockService],
  exports: [MockService],
})
export class MockModule {}

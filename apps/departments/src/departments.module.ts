import { Module } from '@nestjs/common';
import { MockService } from '@/api/src/mock/mock.service';
import { DepartmentController } from './department.controller';
import { DepartmentService } from './department.service';

@Module({
  imports: [],
  controllers: [DepartmentController],
  providers: [DepartmentService, MockService],
})
export class DepartmentsModule {}

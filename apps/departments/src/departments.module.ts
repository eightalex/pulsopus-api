import { DatabaseService } from '@app/database/database.service';
import { Module } from '@nestjs/common';
import { DepartmentController } from './department.controller';
import { DepartmentService } from './department.service';

@Module({
  imports: [],
  controllers: [DepartmentController],
  providers: [DepartmentService, DatabaseService],
})
export class DepartmentsModule {}

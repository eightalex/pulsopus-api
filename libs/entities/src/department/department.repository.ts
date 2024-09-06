import { DataSource, Repository } from 'typeorm';
import { Department } from '@app/entities';
import { Injectable } from '@nestjs/common';

@Injectable()
export class DepartmentRepository extends Repository<Department> {
  constructor(private dataSource: DataSource) {
    super(Department, dataSource.createEntityManager());
  }
}

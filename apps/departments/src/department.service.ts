import { DatabaseService } from '@app/database/database.service';
import { Injectable } from '@nestjs/common';

@Injectable()
export class DepartmentService {
  constructor(private readonly db: DatabaseService) {}
  public async get() {
    return this.db.departmentRepository.find();
  }
}

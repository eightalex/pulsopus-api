import { Injectable } from '@nestjs/common';
import { MockService } from '@/api/src/mock/mock.service';

@Injectable()
export class DepartmentService {
  constructor(private readonly mock: MockService) {}
  public async get() {
    return this.mock.department.find();
  }
}

import { Model } from 'mongoose';
import { DepartmentResponseDto } from '@app/dto';
import { Department } from '@app/entities';
import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';

@Injectable()
export class DepartmentService {
  constructor(
    @InjectModel(Department.name)
    private readonly departmentModel: Model<Department>,
  ) {}
  public async get(): Promise<DepartmentResponseDto[]> {
    const departments = await this.departmentModel.find();
    return departments.map((d) => Department.response(d));
  }
}

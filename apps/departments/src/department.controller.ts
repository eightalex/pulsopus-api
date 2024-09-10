import { UsePublic } from '@app/common';
import { USER_GROUP } from '@app/entities';
import { Department } from '@app/entities/department/department.entity';
import { Controller, Get, SerializeOptions } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { DepartmentService } from './department.service';

@ApiTags('departments')
@Controller('departments')
@SerializeOptions({ groups: [USER_GROUP.LIST] })
export class DepartmentController {
  constructor(private readonly departmentService: DepartmentService) {}

  @UsePublic()
  @Get()
  public async getAll(): Promise<{ departments: Department[] }> {
    const departments = await this.departmentService.findAll();
    return { departments };
  }
}

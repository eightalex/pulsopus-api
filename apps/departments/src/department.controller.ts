import { UsePublic } from '@app/common';
import { DepartmentResponseDto } from '@app/dto';
import { USER_GROUP } from '@app/entities';
import { Department } from '@app/entities/department.entity';
import { Controller, Get, SerializeOptions } from '@nestjs/common';
import { DepartmentService } from './department.service';

@Controller('departments')
@SerializeOptions({ groups: [USER_GROUP.LIST] })
export class DepartmentController {
  constructor(private readonly departmentService: DepartmentService) {}

  @UsePublic()
  @Get()
  public async getAll(): Promise<{ departments: DepartmentResponseDto[] }> {
    const departments = await this.departmentService.get();
    return { departments };
  }
}

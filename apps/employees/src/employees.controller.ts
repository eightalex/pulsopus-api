import { UsePublic } from '@app/common';
import { Controller, Get } from '@nestjs/common';
import { EmployeesService, IReaded } from './employees.service';

@Controller()
export class EmployeesController {
  constructor(private readonly employeesService: EmployeesService) {}

  @UsePublic()
  @Get('file')
  public getFile(): Promise<IReaded[]> {
    return this.employeesService.readFile();
  }
}

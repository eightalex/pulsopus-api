import { UsePublic } from '@app/common';
import { Controller, Get } from '@nestjs/common';
import { EmployeesService } from './employees.service';

@Controller()
export class EmployeesController {
  constructor(private readonly employeesService: EmployeesService) {}

  @UsePublic()
  @Get('file')
  public getFile() {
    return this.employeesService.readFile();
  }
}

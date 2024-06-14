import { UsePublic } from '@app/common';
import { Controller, Get } from '@nestjs/common';
import { ApiService } from './api.service';

@Controller()
export class ApiController {
  constructor(private readonly apiService: ApiService) {}

  @UsePublic()
  @Get()
  public async index(): Promise<string> {
    return this.apiService.getIndex();
  }
}

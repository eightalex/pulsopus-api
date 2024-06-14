import { UsePublic } from '@app/common';
import { Controller, Get } from '@nestjs/common';
import { MockService } from '@/api/src/mock/mock.service';
import { ApiService } from './api.service';

@Controller()
export class ApiController {
  constructor(
    private readonly apiService: ApiService,
    private readonly mockService: MockService,
  ) {}

  @UsePublic()
  @Get()
  public async index(): Promise<string> {
    await this.mockService.reset();
    return this.apiService.getIndex();
  }
}

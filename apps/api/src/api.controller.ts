import { UsePublic } from '@app/common';
import { Controller, Get } from '@nestjs/common';
import { ApiService } from './api.service';

@Controller()
export class ApiController {
  constructor(private readonly apiService: ApiService) {}

  @UsePublic()
  @Get()
  public index(): string {
    return this.apiService.getIndex();
  }

  @UsePublic()
  @Get('cloudinary')
  public cloudinary(): { timestamp: number; signature: string } {
    return this.apiService.cloudinary();
  }
}

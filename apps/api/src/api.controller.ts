import { createReadStream, writeFile } from 'fs';
import { join } from 'path';
import { UsePublic } from '@app/common';
import { Controller, Get, StreamableFile } from '@nestjs/common';
import { ApiService } from './api.service';

@Controller()
export class ApiController {
  constructor(private readonly apiService: ApiService) {}

  @UsePublic()
  @Get()
  public async index(): Promise<string> {
    return this.apiService.getIndex();
  }

  @UsePublic()
  @Get('file')
  file() {
    const d = JSON.stringify([1, 2, 3, 4, 5]);
    writeFile('static/text.json', d, 'utf-8', (error) => {
      if (error) {
        console.log(`WRITE ERROR: ${error}`);
      } else {
        console.log('FILE WRITTEN TO');
      }
    });
    const file = createReadStream(join(process.cwd(), 'package.json'));
    const rd = new StreamableFile(file);
    return rd;
  }

  @UsePublic()
  @Get('migrate')
  migrate() {}
}

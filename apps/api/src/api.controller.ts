import { Response } from 'express';
import { createReadStream } from 'fs';
import { UsePublic } from '@app/common';
import { DatabaseService } from '@app/database/database.service';
import * as csv from '@fast-csv/parse';
import { Controller, Get, Res } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { ApiService } from './api.service';

@ApiTags('api')
@Controller()
export class ApiController {
  constructor(
    private readonly apiService: ApiService,
    private readonly databaseService: DatabaseService,
  ) {}

  @UsePublic()
  @Get()
  public async index(): Promise<string> {
    return this.apiService.getIndex();
  }
  @UsePublic()
  @Get('restart')
  public async restart(): Promise<void> {
    await this.databaseService.reset();
  }

  @UsePublic()
  @Get('file')
  public async getDataFile(@Res() res: Response) {
    const filePath = 'static/data.csv';
    const results = [];
    createReadStream(filePath)
      .pipe(csv.parse({ headers: true }))
      .on('data', (data) => results.push(data))
      .on('end', () => {
        res.json(results);
      })
      .on('error', () => {
        res.status(500).send('Error reading the CSV file');
      });
  }

  @UsePublic()
  @Get('file/download')
  public async downloadDataFile(@Res() res: Response) {
    const filePath = 'static/data.csv';
    res.set({
      'Content-Type': 'text/plain',
      'Content-Disposition': 'attachment; filename="data.csv"',
    });
    res.download(filePath);
  }
}

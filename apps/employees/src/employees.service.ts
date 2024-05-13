import { createReadStream } from 'fs';
import * as csv from '@fast-csv/parse';
import { Injectable } from '@nestjs/common';

const rowParser = (row) => {
  return Object.entries(row).reduce((acc, [k, v]) => {
    const keys = ['name', 'position', 'department'];
    if (keys.includes(k.trim().toLowerCase())) {
      acc[k.trim().toLowerCase()] = (v as string).trim();
      return acc;
    }
    if (k === 'Department') {
      acc[k] = v;
      return acc;
    }
    const d = acc.data || {};
    acc.data = {
      ...d,
      [k]: v,
    };
    return acc;
  }, {} as any);
};

export interface IReaded
  extends Record<string, string | Record<string, string>> {}

@Injectable()
export class EmployeesService {
  private readed?: IReaded[];
  private async readDataFile(): Promise<IReaded[]> {
    return await new Promise((resolve) => {
      const result: IReaded[] = [];
      createReadStream('static/data.csv')
        .pipe(csv.parse({ headers: true }))
        .on('error', (error) => console.error(error))
        .on('data', (row) => {
          result.push(rowParser(row));
        })
        .on('end', () => resolve(result));
    });
  }

  private async getReadedFile(): Promise<IReaded[]> {
    if (this.readed) return this.readed;
    this.readed = await this.readDataFile();
    return this.readed;
  }

  public async readFile() {
    return this.getReadedFile();
  }
}

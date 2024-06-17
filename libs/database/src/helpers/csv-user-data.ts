import { createReadStream } from 'fs';
import * as csv from '@fast-csv/parse';
import { rowParser } from './mock';

export interface IReaded
  extends Record<string, string | Record<string, string>> {
  name: string;
  position: string;
  department: string;
  data: Record<string, string>;
}

export class CsvUserData {
  private readed?: IReaded[];
  constructor() {
    this.getReadedFile();
  }

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

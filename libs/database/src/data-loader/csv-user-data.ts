import { createReadStream } from 'fs';
import * as moment from 'moment';
import { EDepartment, EUserRole, User } from '@app/entities';
import * as csv from '@fast-csv/parse';

export interface IReaded
  extends Record<string, string | Record<string, string>> {
  name: string;
  position: string;
  department: string;
  data: Record<string, string>;
}

interface IParseCsvDataReturn
  extends Pick<User, 'email' | 'username' | 'isActive' | 'position' | 'role'> {
  department?: EDepartment;
  activity?: Record<number, number>;
}

const departmentsValuesMap: Map<string, EDepartment> = new Map([
  ['QA', EDepartment.QA],
  ['HR', EDepartment.HR],
  ['UI/UX Design', EDepartment.DESIGN],
  ['Development', EDepartment.DEVELOPMENT],
  ['DevOps', EDepartment.DEV_OPS],
  ['Project Management', EDepartment.PROJECT_MANAGER],
]);

export const presetsUsers: IParseCsvDataReturn[] = [
  {
    username: 'user',
    role: EUserRole.VIEWER,
    isActive: false,
  },
  {
    username: 'admin',
    role: EUserRole.ADMIN,
    isActive: true,
  },
].map((data) => {
  const username = `${data.username} test`;
  const email = `${data.username}@pulsopus.dev`;
  return {
    ...data,
    username,
    email,
    password: 'password',
  } as IParseCsvDataReturn;
});

export class CsvUserData {
  private rowParser(row): IReaded {
    const result = {
      data: {},
    } as IReaded;
    const fields = ['name', 'position', 'department'];
    for (const rowKey in row) {
      const k = rowKey.trim().toLowerCase();
      const v = String(row[rowKey] || '').trim();
      if (fields.includes(k)) {
        result[k] = v;
        continue;
      }
      if (v.length) {
        result.data[k] = v;
      }
    }
    return result;
  }

  private async readDataFile(): Promise<IReaded[]> {
    let c = 0;
    const res = await new Promise((resolve) => {
      const result: IReaded[] = [];
      createReadStream('static/data.csv')
        .pipe(csv.parse({ headers: true }))
        .on('error', (error) => console.error(error))
        .on('data', (row) => {
          c++;
          result.push(this.rowParser(row));
        })
        .on('end', () => resolve(result));
    });
    console.log('read rows from csv file: ', c);
    return res as unknown as IReaded[];
  }

  private parseData(r: IReaded): IParseCsvDataReturn {
    const department = departmentsValuesMap.get(
      r.department.replace('department', '').trim(),
    );
    const email = r.name
      .split(' ')
      .map((s) => s.toLowerCase())
      .join('.')
      .concat('@pulsopus.dev');

    const parseDateFormat = 'YYYY-MM-DD';

    return {
      role: EUserRole.VIEWER,
      username: r.name,
      email,
      password: 'password',
      department,
      isActive: true,
      position: r.position,
      activity: Object.entries(r.data).reduce(
        (acc, [date, value]) => {
          const isNum = /\d/.test(value);
          if (!isNum) return acc;
          const d = moment(date, parseDateFormat).startOf('d');
          if (!d.isValid()) return acc;
          const v = value.replace(/,/gm, '');
          acc[d.valueOf()] = Number(v);
          return acc;
        },
        {} as Record<number, number>,
      ),
    } as IParseCsvDataReturn;
  }

  public async getParsedCsvData(): Promise<IParseCsvDataReturn[]> {
    const data = await this.readDataFile();
    return data.map(this.parseData);
  }
}

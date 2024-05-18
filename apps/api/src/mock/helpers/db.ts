import { User } from '@app/entities';
import { createFromCsv, usersMock } from '@/api/src/mock/helpers/mock';
import { CsvRead, IReaded } from './csv-read';

export class Db {
  private readed: IReaded[];
  public users: User[] = [];

  constructor() {
    this.init();
  }

  private async init() {
    this.readed = await new CsvRead().readFile();
    const csvusrs = this.readed.map((r) => createFromCsv(r));
    this.users = [...csvusrs, ...usersMock];
  }

  public async findBy(by: Partial<User>): Promise<User[]> {
    return this.users.filter((u) =>
      Object.keys(by).every((k) => u[k] === by[k]),
    );
  }

  public async findOneBy(by: Partial<User>): Promise<User> {
    return this.users.find((u) => Object.keys(by).every((k) => u[k] === by[k]));
  }

  public async find(): Promise<User[]> {
    return this.users;
  }
}

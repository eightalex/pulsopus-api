import { sortBy } from 'lodash';
import { EDepartment, User } from '@app/entities';
import { Department } from '@app/entities/department.entity';
import { UserActivity } from '@app/entities/user-activity.entity';
import { Injectable } from '@nestjs/common';
import { CsvRead, IReaded } from '@/api/src/mock/helpers/csv-read';
import { createFromCsv, usersMock } from '@/api/src/mock/helpers/mock';

class MockDB<Type extends { id: string }> {
  list: Type[] = [];
  constructor(list: Type[]) {
    this.list = [...Array.from(list)];
  }

  public async findBy(by: Partial<Type>): Promise<Type[]> {
    return this.list.filter((u) =>
      Object.keys(by).every((k) => u[k] === by[k]),
    );
  }

  public async findOneBy(by: Partial<Type>): Promise<Type> {
    return this.list.find((u) => Object.keys(by).every((k) => u[k] === by[k]));
  }

  public async find(): Promise<Type[]> {
    return this.list;
  }

  public async create(entity: Type): Promise<Type> {
    this.list = [...this.list, entity];
    return entity;
  }

  public async updateOneBy(by: Partial<Type>, update: Type): Promise<Type> {
    const entity = await this.findOneBy(by);
    if (!entity) return null;
    const updatedEntity = { ...entity, ...update };
    this.list.map((e) => {
      if (e.id !== updatedEntity.id) return e;
      return updatedEntity;
    });
  }

  public async update(update: Type): Promise<Type> {
    let entity = null;
    this.list.map((e) => {
      if (e.id !== update.id) return e;
      entity = update;
      return update;
    });
    return entity;
  }
}

@Injectable()
export class MockService {
  private readed: IReaded[];
  private usersList: User[] = [];
  private departmentList: Department[] = [];

  public users: MockDB<User>;
  public department: MockDB<Department>;

  constructor() {
    this.init();
  }

  private async init() {
    this.readed = await new CsvRead().readFile();
    const csvusrs = this.readed.map((r) => createFromCsv(r));
    this.usersList = [...csvusrs, ...usersMock];
    //
    const dps = this.usersList.reduce((acc, u) => {
      const act = acc[u.department.name] || {};
      u.activity.forEach(({ date, value }) => {
        let res = act[date] || 0;
        if (Number(value)) {
          res = (res + Number(value)) / 2;
        }
        act[date] = res;
      });
      acc[u.department.name] = act;
      return acc;
    }, {});

    const companyData = Object.values(dps).reduce((acc, value) => {
      for (const [date, v] of Object.entries(value)) {
        if (!v) continue;
        const pv = acc[date] || 0;
        if (!pv) {
          acc[date] = v;
        } else {
          acc[date] = (pv + v) / 2;
        }
      }
      return acc;
    }, {});

    const companyDepartment = new Department({
      name: EDepartment.COMPANY,
      activity: Object.entries(companyData).map(
        ([date, value]) => new UserActivity({ date, value }),
      ),
    });

    const departList = Object.entries(dps).map(
      ([name, data]: [EDepartment, Record<string, number>]) =>
        new Department({
          name,
          activity: Object.entries(data).map(
            ([date, value]) =>
              new UserActivity({ date, value: value.toString() }),
          ),
        }),
    );

    departList.push(companyDepartment);
    this.departmentList = departList;

    this.usersList = this.usersList.map((u) => {
      companyDepartment.addUser(u);
      u.department = departList.find(({ name }) => u.department.name === name);
      u.department.addUser(u);
      return u;
    });

    this.users = new MockDB<User>(sortBy(this.usersList, (u) => u.username));
    this.department = new MockDB<Department>(sortBy(departList, (u) => u.name));
  }

  public async reset() {
    this.usersList = undefined;
    this.departmentList = undefined;
    this.users = undefined;
    this.department = undefined;
    await this.init();
  }
}

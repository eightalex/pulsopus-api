// import { sortBy } from 'lodash';
import { EDepartment, User, UserActivity } from '@app/entities';
import { Department } from '@app/entities/department.entity';
import { Injectable } from '@nestjs/common';
import { CsvRead, IReaded } from '@/api/src/mock/helpers/csv-read';
import { createFromCsv, usersMock } from '@/api/src/mock/helpers/mock';

class MockDB<
  Type extends { id: string; createdAt: number; updatedAt: number },
> {
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
      update.updatedAt = Date.now();
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

  private createStockDepartments() {
    return Object.keys(EDepartment).map((k: keyof typeof EDepartment) => {
      return Department.of(EDepartment[k]);
    });
  }

  private async createStockUsers() {
    this.readed = await new CsvRead().readFile();
    const csvusrs = this.readed.map((r) => createFromCsv(r));
    return [...csvusrs, ...usersMock];
  }

  private async init() {
    const deps = this.createStockDepartments();
    const users = await this.createStockUsers();
    //
    this.departmentList = deps.map((d) => {
      users.forEach((u) => {
        if (u.department.value !== d.value) return;
        u.department = d;
        d.users.push(u);
      });
      return d;
    });

    this.departmentList = this.departmentList.reduce((acc, d, _, arr) => {
      if (d.value !== EDepartment.COMPANY) return [...acc, d];
      d.users = arr.reduce((us, d) => {
        return [...us, ...d.users];
      }, [] as User[]);
      return [...acc, d];
    }, [] as Department[]);

    this.departmentList = this.departmentList.map((d) => {
      const map = d.users.reduce((map, a) => {
        a.activity.forEach(({ date, value }) => {
          const prevV = map.get(date) || Number(value);
          const nextV = prevV + Number(value) / 2;
          map.set(date, nextV);
        });
        return map;
      }, new Map<string, number>());
      d.activity = [...map].map(([date, value]) =>
        UserActivity.of(d.id, date, value.toString()),
      );
      return d;
    });

    const compDep = this.departmentList.find(
      (d) => d.value === EDepartment.COMPANY,
    );

    if (compDep) {
      this.usersList = compDep.users;
    }

    this.department = new MockDB<Department>(this.departmentList);
    this.users = new MockDB<User>(this.usersList);
  }

  public async reset() {
    this.readed = [];
    this.usersList = [];
    this.departmentList = [];
    this.users = undefined;
    this.department = undefined;
    await this.init();
  }
}

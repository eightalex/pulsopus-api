import { Activity, Department, EDepartment, User } from '@app/entities';
import { Injectable } from '@nestjs/common';
import { CsvUserData } from './helpers/csv-user-data';
import { createFromCsv, usersMock } from './helpers/mock';
import { Repository } from './helpers/repository';

@Injectable()
export class DatabaseService {
  private departmentsValuesMap: Map<Department['value'], Department> =
    new Map();
  private departmentsMap: Map<Department['id'], Department> = new Map();
  private usersMap: Map<User['id'], User> = new Map();
  public userRepository: Repository<User>;
  public departmentRepository: Repository<Department>;
  constructor() {
    this.initial();
  }

  private async createStockData() {
    const usrsReaded = await new CsvUserData().readFile();
    const csvusrs = usrsReaded.map((r) => createFromCsv(r));
    const usrs = [...csvusrs, ...usersMock];
    for (const usr of usrs) {
      this.usersMap.set(usr.id, usr);
    }
    //
    const departments = Object.keys(EDepartment).map(
      (k: keyof typeof EDepartment) => {
        return Department.of(EDepartment[k]);
      },
    );
    for (const department of departments) {
      this.departmentsMap.set(department.id, department);
      this.departmentsValuesMap.set(department.value, department);
    }
    return departments;
  }

  public computeData() {
    const companyActivityMap: Map<string, number> = new Map();
    for (const [userId, user] of this.usersMap) {
      user.department =
        this.departmentsValuesMap.get(user.department?.value) || undefined;
      this.usersMap.set(userId, user);
      //
      const cmp = this.departmentsValuesMap.get(EDepartment.COMPANY);
      cmp.users.push(user);
      //
      if (user.department) {
        user.department.users.push(user);
      }

      user.activity.forEach(({ date, value }) => {
        const compDayAct = companyActivityMap.get(date) || 0;
        companyActivityMap.set(date, compDayAct + Number(value) || 0);
      });
    }

    const actMap = this.departmentsValuesMap
      .get(EDepartment.COMPANY)
      .activity.reduce((m, { date, value }) => {
        m.set(date, value);
        return m;
      }, new Map());

    for (const d of this.departmentsValuesMap.values()) {
      const depActMap: Map<string, number> = new Map();
      d.users = d.users.map((u) => {
        u.activity = u.activity.map(({ date, value }, index, activities) => {
          const cmpAct = actMap.get(date) || value;
          const rate = !value ? 0 : (value / cmpAct) * 100;
          const prevV = !index ? 0 : activities[index - 1].value;
          const trend = value - prevV;
          const depDayAct = depActMap.get(date) || 0;
          depActMap.set(date, depDayAct + Number(value) || 0);
          return Activity.of(date, value, rate, trend);
        });
        this.usersMap.set(u.id, u);
        return u;
      });
      d.activity = [...depActMap.entries()].map(([date, value]) => {
        const cmpValue = companyActivityMap.get(date) || 0;
        const rate = !cmpValue || !value ? 0 : (value / cmpValue) * 100;
        return new Activity({
          date,
          value,
          rate,
        });
      });
      this.departmentsMap.set(d.id, d);
    }
  }

  private createRepository() {
    this.userRepository = new Repository<User>(this.usersMap, this);
    this.departmentRepository = new Repository<Department>(
      this.departmentsMap,
      this,
    );
  }

  private async initial() {
    await this.createStockData();
    this.computeData();
    this.createRepository();
  }
}

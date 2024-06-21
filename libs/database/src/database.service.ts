import * as _ from 'lodash';
import * as moment from 'moment';
import { v4 as uuidv4 } from 'uuid';
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
    const readedUserInstances = usrsReaded.map((r) => createFromCsv(r));
    // ---------------------------------------------
    // copy activity data
    const uMock = usersMock.map(
      (u) =>
        new User({
          ...u,
          activity: [],
        }),
    );
    //
    const csvusrs = readedUserInstances.map((u) => {
      const prevAct = [];
      const currAct = [];
      const nextAct = [];
      const diff = u.activity.length + 2;
      for (const act of u.activity) {
        const cD = moment(Number(act.date)).startOf('day').valueOf();
        const pD = moment(cD).subtract(diff, 'day').startOf('day').valueOf();
        const nD = moment(cD).add(diff, 'day').startOf('day').valueOf();
        const cV = Number(act.value) || 0;
        const pV = cV * _.random(0.8, 1.3);
        const nV = cV * _.random(0.1, 1.3);
        currAct.push(Activity.of(cD, cV));
        prevAct.push(Activity.of(pD, pV));
        nextAct.push(Activity.of(nD, nV));
      }
      const activity = [...prevAct, ...currAct, ...nextAct];
      return new User({ ...u, activity });
    });
    //
    const nameSplit = (name, prefix) => `${prefix} ${name.split(' ')[0]}`;
    const designDepartmentUsers = [...csvusrs].map((u) => {
      return new User({
        ...u,
        id: uuidv4(),
        username: nameSplit(u.username, 'design'),
        email: `d-${u.email}`,
        department: Department.of(EDepartment.DESIGN),
        activity: u.activity
          .filter((a) => !!a && !!a.date)
          .map((a) => {
            return Activity.of(a.date, Number(a.value) * _.random(0.1, 0.8));
          }),
      });
    });
    const productDepartmentUsers = [...csvusrs].map((u) => {
      return new User({
        ...u,
        id: uuidv4(),
        username: nameSplit(u.username, 'product'),
        email: `p-${u.email}`,
        department: Department.of(EDepartment.PRODUCT),
        activity: u.activity
          .filter((a) => !!a && !!a.date)
          .map((a) => {
            return Activity.of(a.date, Number(a.value) * _.random(0.2, 0.4));
          }),
      });
    });
    const marketingDepartmentUsers = [...csvusrs].map((u) => {
      return new User({
        ...u,
        id: uuidv4(),
        username: nameSplit(u.username, 'marketing'),
        email: `m-${u.email}`,
        department: Department.of(EDepartment.MARKETING),
        activity: u.activity
          .filter((a) => !!a && !!a.date)
          .map((a) => {
            return Activity.of(a.date, _.random(0, 60));
          }),
      });
    });
    //
    const usrs = [
      ...csvusrs,
      ...designDepartmentUsers,
      ...productDepartmentUsers,
      ...marketingDepartmentUsers,
      ...uMock,
    ];
    // ---------------------------------------------
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
    const usersNameIds = new Map<string, string>();
    for (const [userId, user] of this.usersMap) {
      usersNameIds.set(user.username, userId);
      user.department =
        this.departmentsValuesMap.get(user.department?.value) || undefined;
      this.usersMap.set(userId, user);
      //
      const cmp = this.departmentsValuesMap.get(EDepartment.COMPANY);
      cmp.users.push(user);
      this.departmentsValuesMap.set(EDepartment.COMPANY, cmp);
      //
      if (user.department) {
        user.department.users.push(user);
      }
    }

    const departmentActivitiesMap: Map<
      EDepartment,
      Map<string, number>
    > = new Map();
    for (const d of this.departmentsValuesMap.values()) {
      const activitiesMap =
        departmentActivitiesMap.get(d.value) || new Map<string, number>();
      for (const user of d.users) {
        for (const { date, value } of user.activity) {
          const d = Number(date).toString();
          const prevValue = activitiesMap.get(d) || 0;
          const nextValue = prevValue + Number(value);
          activitiesMap.set(d, nextValue);
        }
      }
      departmentActivitiesMap.set(d.value, activitiesMap);
    }
    const companyActivityMap = departmentActivitiesMap.get(EDepartment.COMPANY);

    for (const d of this.departmentsValuesMap.values()) {
      d.users = d.users.map((u) => {
        u.activity = u.activity.map((activity, index, activities) => {
          const { date, value = 0 } = activity;
          const cmpAct = companyActivityMap.get(date) || value;
          const rate = !value ? 0 : (value / cmpAct) * 100;
          const prevV = !index ? 0 : activities[index - 1].value;
          const trend = value - prevV;
          return Activity.of(date, value, rate, trend);
        });
        const newUser = new User({
          ...u,
          id: usersNameIds.get(u.username),
        });
        this.usersMap.set(newUser.id, newUser);
        return newUser;
      });
      const depActMap = departmentActivitiesMap.get(d.value);
      d.activity = [...depActMap.entries()].map(([date, value]) => {
        const cmpValue = companyActivityMap.get(date) || 0;
        const rate = !(cmpValue && value) ? 0 : (value / cmpValue) * 100;
        return Activity.of(date, value, rate);
      });
      this.departmentsMap.set(d.id, d);
    }

    this.usersMap = new Map(
      [...this.usersMap.values()].map((u, i) => {
        const id = (usersNameIds[u.username] as string) || i.toString();
        return [id, new User({ ...u, id })];
      }),
    );
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

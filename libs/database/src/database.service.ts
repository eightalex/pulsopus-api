import * as _ from 'lodash';
import * as moment from 'moment';
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

  private calcTrend(value: number, prevValue: number): number {
    if (!value && !prevValue) return 0;
    if (!value) return -100;
    if (!prevValue) return 100;
    const cV = Math.max(Number(value), 1);
    const pV = Math.max(Number(prevValue), 1);
    const diffAbsolute = cV / pV;
    return cV >= pV ? (diffAbsolute - 1) * 100 : (1 - diffAbsolute) * -100;
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
        const pV = (cV || 1) * _.random(0.8, 1.3);
        const nV = (cV || 1) * _.random(0.1, 1.3);
        currAct.push(Activity.of(cD, cV));
        // prevAct.push(Activity.of(pD, pV));
        // nextAct.push(Activity.of(nD, nV));
      }
      const activity = [...prevAct, ...currAct, ...nextAct];
      return new User({ ...u, activity });
    });
    //
    const usrs = [...csvusrs, ...uMock];
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

  private computeData() {
    const usersNameIds = new Map<string, string>();
    let count = 0;
    const step = 1;
    for (const [userId, user] of this.usersMap) {
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

      const newId = (count + step).toString();
      usersNameIds.set(user.username, newId);
      count++;
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
        u.id = usersNameIds.get(u.username);
        u.activity = u.activity.map((activity, index, activities) => {
          const { date, value = 0 } = activity;
          const cmpAct = companyActivityMap.get(date) || value;
          const rate = !value ? 0 : (value / cmpAct) * 100;
          const prevV = !index ? 0 : activities[index - 1].value;
          const trend = this.calcTrend(value, prevV);
          return Activity.of(date, value, rate, trend);
        });
        this.usersMap.set(u.id, u);
        return u;
      });
      const depActMap = departmentActivitiesMap.get(d.value);
      d.activity = [...depActMap.entries()].map(([date, value], index, arr) => {
        const cmpValue = companyActivityMap.get(date) || 0;
        const rate = !(cmpValue && value) ? 0 : (value / cmpValue) * 100;
        return Activity.of(
          date,
          value,
          rate,
          this.calcTrend(value, !index ? 0 : arr[index - 1][1]),
        );
      });
      this.departmentsMap.set(d.id, d);
    }
  }

  private createRepository() {
    this.departmentRepository = new Repository<Department>(
      this.departmentsMap,
      this,
    );
    this.userRepository = new Repository<User>(this.usersMap, this);
  }

  private updateRepository() {
    this.departmentRepository.setInitial(this.departmentsMap);
    this.userRepository.setInitial(this.usersMap);
  }

  private async initial() {
    await this.createStockData();
    this.computeData();
    this.createRepository();
  }

  public rebuildData() {
    this.usersMap = this.userRepository.mapState;
    this.computeData();
    this.updateRepository();
  }
}

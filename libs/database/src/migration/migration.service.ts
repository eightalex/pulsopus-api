import {
  Activity,
  Department,
  EDepartment,
  User,
  UserAccessRequestRepository,
  UserActivity,
  UserActivityRepository,
  UserRepository,
} from '@app/entities';
import { Injectable } from '@nestjs/common';
import { CsvUserData, presetsUsers } from './csv-user-data';

const sortCompareObjectKeys = (
  p: [string | number, unknown],
  n: [string | number, unknown],
) => {
  const prev = Number(p[0]);
  const next = Number(n[0]);
  return prev - next;
};

@Injectable()
export class MigrationService {
  constructor(
    private readonly userRepository: UserRepository,
    private readonly userActivityRepository: UserActivityRepository,
    private readonly userAccessRequestRepository: UserAccessRequestRepository,
  ) {
    this.initial();
  }
  private async dropRecords() {
    await this.userRepository.deleteAllRecords();
    await this.userActivityRepository.deleteAllRecords();
    await this.userAccessRequestRepository.deleteAllRecords();
    console.log('DELETE ALL RECORDS');
  }

  public calcTrend(value: number, prevValue: number): number {
    if (!value && !prevValue) return 0;
    if (!value) return -100;
    if (!prevValue) return 100;
    const cV = Math.max(Number(value), 1);
    const pV = Math.max(Number(prevValue), 1);
    const diffAbsolute = cV / pV;
    return cV >= pV ? (diffAbsolute - 1) * 100 : (1 - diffAbsolute) * -100;
  }

  private async insertUsersAndActivity() {
    const readedUserInstances = await new CsvUserData().getParsedCsvData();
    const usersForCreate = [
      ...new Map(
        [...readedUserInstances, ...presetsUsers].map((u) => [u['email'], u]),
      ).values(),
    ];

    const activities = usersForCreate.reduce(
      (acc, { activity }) => {
        if (!activity) return acc;
        Object.entries(activity).forEach(([d, v]) => {
          const date = Number(d);
          const accValue = acc.get(date) || 0;
          acc.set(date, accValue + v);
        });
        return acc;
      },
      new Map() as Map<number, number>,
    );

    for (const userForCreate of usersForCreate) {
      const { activity, ...u } = userForCreate;
      const user = await this.userRepository.save(await User.create(u));
      for (const key in activity) {
        const value = activity[key];
        const date = Number(key);
        const absolute = activities.get(date) || value;
        const rate = (value / absolute) * 100;
        const act = UserActivity.of({
          date,
          value,
          rate,
          user,
        });
        await this.userActivityRepository.save(act);
      }
      // const depValue = userForCreate.department;
      // const department = await this.departmentModel.findOne({
      //   value: depValue,
      // });
      // const company = await this.departmentModel.findOne({
      //   value: EDepartment.COMPANY,
      // });
      //
      // const activities = Object.entries(userForCreate.activity || {})
      //   .sort(sortCompareObjectKeys)
      //   .reduce((acc, [d, v], idx, arr) => {
      //     const date = Number(d);
      //     const trend = MigrationService.calcTrend(v, arr[idx - 1]?.[1]);
      //     acc[date] = Activity.of(date, v, -1, trend);
      //     return acc;
      //   }, {});
      // const u = await this.userModel.create({
      //   ...userForCreate,
      //   department,
      //   activities,
      // });
      // if (department) {
      //   department.userIds.push(u._id);
      //   await department.save();
      // }
      // if (company) {
      //   company.userIds.push(u._id);
      //   await company.save();
      // }
    }
  }

  // private async createStockData() {
  //   await this.createStockDepartments();
  //   await this.insertUsersAndActivity();
  // }
  //
  // private async fillDepartmentActivities() {
  //   const departments = await this.departmentModel
  //     .find()
  //     .populate(['users'])
  //     .exec();
  //   for (const department of departments) {
  //     const activities: Map<number, number> = new Map<number, number>();
  //     for (const user of department.users) {
  //       [...user.activities.entries()].forEach(([d, activity]) => {
  //         const date = Number(d);
  //         const value = activities.get(date) || 0;
  //         const userValue = Number(activity.value);
  //         activities.set(date, value + userValue);
  //       });
  //     }
  //     const depActivities = [...activities.entries()]
  //       .sort(sortCompareObjectKeys)
  //       .reduce((acc, [d, v], idx, arr) => {
  //         const date = Number(d);
  //         const trend = MigrationService.calcTrend(v, arr[idx - 1]?.[1]);
  //         acc[date] = Activity.of(
  //           date,
  //           v,
  //           department.value === EDepartment.COMPANY ? 100 : 0,
  //           trend,
  //         );
  //         return acc;
  //       }, {});
  //     department.activities = depActivities as Map<number, Activity>;
  //     await department.save();
  //   }
  // }
  //
  // private async computeDepartmentsRate() {
  //   const company = await this.departmentModel
  //     .findOne({
  //       value: EDepartment.COMPANY,
  //     })
  //     .exec();
  //   const companyActivityMap = [...company.activities.entries()].reduce(
  //     (acc, [d, act]) => {
  //       acc.set(Number(d), act.value);
  //       return acc;
  //     },
  //     new Map(),
  //   );
  //   const departments = await this.departmentModel
  //     .find({
  //       value: {
  //         $ne: EDepartment.COMPANY,
  //       },
  //     })
  //     .exec();
  //   for (const department of departments) {
  //     department.activities = [...department.activities.entries()].reduce(
  //       (acc, [d, activity]) => {
  //         const date = Number(d);
  //         const { value = 0, trend = 0 } = activity;
  //         const cmpValue = companyActivityMap.get(date) || 0;
  //         const rate = !(cmpValue && value) ? 0 : (value / cmpValue) * 100;
  //         acc[date] = Activity.of(date, value, rate, trend);
  //         return acc;
  //       },
  //       {},
  //     ) as Map<number, Activity>;
  //     await department.save();
  //   }
  // }
  // private async computeUsersRate() {
  //   const company = await this.departmentModel
  //     .findOne({
  //       value: EDepartment.COMPANY,
  //     })
  //     .exec();
  //   const companyActivityMap = [...company.activities.entries()].reduce(
  //     (acc, [d, act]) => {
  //       acc.set(Number(d), act.value);
  //       return acc;
  //     },
  //     new Map(),
  //   );
  //   //
  //   const departmentsMap = new Map<
  //     Department['value'],
  //     Map<number, Activity>
  //   >();
  //   const departments = await this.departmentModel.find().exec();
  //   for (const department of departments) {
  //     departmentsMap.set(
  //       department.value,
  //       [...department.activities.values()].reduce((acc, act) => {
  //         acc.set(act.date, act);
  //         return acc;
  //       }, new Map()),
  //     );
  //   }
  //   //
  //   const users = await this.userModel.find().exec();
  //   for (const user of users) {
  //     if (!user.department?._id) continue;
  //     const dep = departmentsMap.get(user.department?.value);
  //     if (!dep) continue;
  //     user.activities = [...user.activities.entries()].reduce(
  //       (acc, [d, activity]) => {
  //         const date = Number(d);
  //         const { value, trend = 0 } = activity;
  //         const absoluteValue = companyActivityMap.get(date) || 0;
  //         // const absoluteValue = dep.get(date)?.value || 0;
  //         let rate = !(absoluteValue && value)
  //           ? 0
  //           : (value / absoluteValue) * 100;
  //         if (value === null) {
  //           rate = value;
  //         }
  //         acc[date] = Activity.of(date, value, rate, trend);
  //         return acc;
  //       },
  //       {},
  //     ) as Map<number, Activity>;
  //     await user.save();
  //   }
  // }
  //
  // private async computeData() {
  //   await this.computeDepartmentsRate();
  //   await this.computeUsersRate();
  // }

  private async initial() {
    console.time('MIGRATED');
    console.log('MIGRATED START');

    await this.dropRecords();

    await this.insertUsersAndActivity();

    // await this.fillUserActivityTrendRate();

    // await this.createStockData();
    //
    // await this.fillDepartmentActivities();
    //
    // await this.computeData();

    console.log('MIGRATED END');
    console.timeEnd('MIGRATED');
  }
}

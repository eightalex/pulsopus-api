import { Connection, Model } from 'mongoose';
import { MigrationService } from '@app/database/migration/migration.service';
import { Activity, Department, EDepartment, User } from '@app/entities';
import { Injectable } from '@nestjs/common';
import { InjectConnection, InjectModel } from '@nestjs/mongoose';

const sortCompareObjectKeys = (
  p: [string | number, unknown],
  n: [string | number, unknown],
) => {
  const prev = Number(p[0]);
  const next = Number(n[0]);
  return prev - next;
};

@Injectable()
export class DatabaseService {
  constructor(
    @InjectConnection()
    private readonly connection: Connection,
    @InjectModel(User.name)
    private readonly userModel: Model<User>,
    @InjectModel(Department.name)
    private readonly departmentModel: Model<Department>,
  ) {}

  private async fillDepartmentActivities() {
    const departments = await this.departmentModel
      .find()
      .populate(['users'])
      .exec();
    for (const department of departments) {
      const activities: Map<number, number> = new Map<number, number>();
      for (const user of department.users) {
        [...user.activities.entries()].forEach(([d, activity]) => {
          const date = Number(d);
          const value = activities.get(date) || 0;
          const userValue = Number(activity.value);
          activities.set(date, value + userValue);
        });
      }
      const depActivities = [...activities.entries()]
        .sort(sortCompareObjectKeys)
        .reduce((acc, [d, v], idx, arr) => {
          const date = Number(d);
          const trend = MigrationService.calcTrend(v, arr[idx - 1]?.[1]);
          acc[date] = Activity.of(
            date,
            v,
            department.value === EDepartment.COMPANY ? 100 : 0,
            trend,
          );
          return acc;
        }, {});
      department.activities = depActivities as Map<number, Activity>;
      await department.save();
    }
  }

  private async computeDepartmentsRate() {
    const company = await this.departmentModel
      .findOne({
        value: EDepartment.COMPANY,
      })
      .exec();
    const companyActivityMap = [...company.activities.entries()].reduce(
      (acc, [d, act]) => {
        acc.set(Number(d), act.value);
        return acc;
      },
      new Map(),
    );
    const departments = await this.departmentModel
      .find({
        value: {
          $ne: EDepartment.COMPANY,
        },
      })
      .exec();
    for (const department of departments) {
      department.activities = [...department.activities.entries()].reduce(
        (acc, [d, activity]) => {
          const date = Number(d);
          const { value = 0, trend = 0 } = activity;
          const cmpValue = companyActivityMap.get(date) || 0;
          const rate = !(cmpValue && value) ? 0 : (value / cmpValue) * 100;
          acc[date] = Activity.of(date, value, rate, trend);
          return acc;
        },
        {},
      ) as Map<number, Activity>;
      await department.save();
    }
  }

  private async computeUsersRate() {
    const company = await this.departmentModel
      .findOne({
        value: EDepartment.COMPANY,
      })
      .exec();
    const companyActivityMap = [...company.activities.entries()].reduce(
      (acc, [d, act]) => {
        acc.set(Number(d), act.value);
        return acc;
      },
      new Map(),
    );
    //
    const departmentsMap = new Map<
      Department['value'],
      Map<number, Activity>
    >();
    const departments = await this.departmentModel.find().exec();
    for (const department of departments) {
      departmentsMap.set(
        department.value,
        [...department.activities.values()].reduce((acc, act) => {
          acc.set(act.date, act);
          return acc;
        }, new Map()),
      );
    }
    //
    const users = await this.userModel.find().exec();
    for (const user of users) {
      if (!user.department?._id) continue;
      const dep = departmentsMap.get(user.department?.value);
      if (!dep) continue;
      user.activities = [...user.activities.entries()].reduce(
        (acc, [d, activity]) => {
          const date = Number(d);
          const { value, trend = 0 } = activity;
          const absoluteValue = companyActivityMap.get(date) || 0;
          // const absoluteValue = dep.get(date)?.value || 0;
          let rate = !(absoluteValue && value)
            ? 0
            : (value / absoluteValue) * 100;
          if (value === null) {
            rate = value;
          }
          acc[date] = Activity.of(date, value, rate, trend);
          return acc;
        },
        {},
      ) as Map<number, Activity>;
      await user.save();
    }
  }

  private async computeData() {
    await this.computeDepartmentsRate();
    await this.computeUsersRate();
  }

  public async updateDatabaseData() {
    await this.fillDepartmentActivities();
    await this.computeData();
  }
}

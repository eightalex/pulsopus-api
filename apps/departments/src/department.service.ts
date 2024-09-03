import {
  Department,
  EDepartment,
  User,
  UserActivityRepository,
  UserRepository,
} from '@app/entities';
import { Injectable } from '@nestjs/common';

@Injectable()
export class DepartmentService {
  private readonly departments: Map<string, Department> = new Map();
  constructor(
    private readonly userRepository: UserRepository,
    private readonly userActivityRepository: UserActivityRepository,
  ) {
    this.computedDepartments();
  }

  private async computedDepartments() {
    const activities = await this.userActivityRepository.find({
      select: ['value', 'date'],
    });
    const users = await this.userRepository.find({
      relations: ['activities'],
    });

    const absoluteDateActivities = activities.reduce((acc, act) => {
      const d = Number(act.date);
      const v = Number(act.value);
      const abs = acc.get(d) || 0;
      acc.set(d, abs + v);
      return acc;
    }, new Map<number, number>());

    const departments = users
      .reduce(
        (acc, u) => {
          if (!u.department) return acc;
          const list = acc.get(u.department) || [];
          acc.set(u.department, [...list, u]);
          return acc;
        },
        new Map() as Map<EDepartment, User[]>,
      )
      .set(EDepartment.COMPANY, users);

    const departmentList = [...departments.entries()].reduce(
      (res, [value, us], index) => {
        const activityValuesMap = us.reduce((map, u) => {
          if (!u.activities) return map;
          u.activities.forEach((act) => {
            const d = Number(act.date);
            const v = Number(act.value);
            const vAbs = Number(map.get(d)) || 0;
            map.set(d, vAbs + v);
          });
          return map;
        }, new Map<number, number>());

        const activities = [...activityValuesMap.entries()].reduce(
          (acc, [d, v]) => {
            const date = Number(d);
            const value = Number(v);
            const absolute = absoluteDateActivities.get(date) || value;
            const rate = (value / absolute) * 100;
            acc.set(d, {
              value,
              rate,
              date,
            });
            return acc;
          },
          new Map<number, { date: number; value: number; rate: number }>(),
        );

        const dep = new Department({
          id: String(index + 1).concat(String(us.length).padStart(2, '0')),
          value,
          users: us,
          activities,
        });
        this.departments.set(dep.id, dep);
        res = [...res, dep];
        return res;
      },
      [] as Department[],
    );
    return departmentList;
  }

  public async findAll(): Promise<Department[]> {
    return [...this.departments.values()];
  }
}

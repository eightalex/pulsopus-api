import { Expose, Transform } from 'class-transformer';
import { v4 as uuidv4 } from 'uuid';
import { AbstractEntity } from '@app/entities/abstract.entity';
import { departmentNames } from '@app/entities/constants/names';
import { User } from '@app/entities/user.entity';
import { UserActivity } from '@app/entities/user-activity.entity';
import { ApiProperty } from '@nestjs/swagger';
import { EDepartment } from './constants';

export class Department extends AbstractEntity {
  public id: string;

  @ApiProperty({ enum: () => EDepartment })
  public value: EDepartment;

  @ApiProperty({ type: () => [UserActivity] })
  @Transform(({ value: activity }) =>
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    activity.map(({ refId, ...data }: UserActivity) => data),
  )
  public activity: UserActivity[] = [];

  public users: User[] = [];

  constructor(partial: Partial<Department>) {
    super();
    Object.assign(this, partial);
  }

  static of(
    department: EDepartment,
    rest: Partial<Department> = {},
  ): Department {
    return new Department({
      id: uuidv4(),
      value: department,
      ...rest,
    });
  }

  @Expose()
  public get label(): string {
    return departmentNames[this.value];
  }

  public addUser(user: User) {
    const u = this.users.find(({ id }) => id === user.id);
    if (u) return;
    user.department = this;
    this.users.push(user);
  }
}

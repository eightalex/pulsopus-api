import { Expose, Transform } from 'class-transformer';
import { AbstractEntity } from '@app/entities/abstract.entity';
import { User } from '@app/entities/user.entity';
import { UserActivity } from '@app/entities/user-activity.entity';
import { ApiProperty } from '@nestjs/swagger';
import { EDepartment } from './constants';

const departmentLabels: Record<EDepartment, string> = {
  [EDepartment.DEVELOPMENT]: EDepartment.DEVELOPMENT.toLowerCase(),
  [EDepartment.PRODUCT]: EDepartment.PRODUCT.toLowerCase(),
  [EDepartment.ADMINISTRATION]: EDepartment.ADMINISTRATION.toLowerCase(),
  [EDepartment.MARKETING]: EDepartment.MARKETING.toLowerCase(),
  [EDepartment.DESIGN]: EDepartment.DESIGN.toLowerCase(),
  [EDepartment.HR]: EDepartment.HR.toLowerCase(),
  [EDepartment.UNKNOWN]: EDepartment.UNKNOWN.toLowerCase(),
  [EDepartment.COMPANY]: EDepartment.COMPANY.toLowerCase(),
};

export class Department extends AbstractEntity {
  @ApiProperty({ enum: () => EDepartment })
  public name: EDepartment;

  @ApiProperty({ type: () => [UserActivity] })
  @Transform(({ value: activity }) =>
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    activity.map(({ userId, ...data }: UserActivity) => data),
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
    return new Department({ name: department, ...rest });
  }

  @Expose()
  public get label(): string {
    return departmentLabels[this.name];
  }

  public addUser(users: User) {
    const u = this.users.find(({ id }) => id === users.id);
    if (u) return;
    this.users.push(users);
  }
}

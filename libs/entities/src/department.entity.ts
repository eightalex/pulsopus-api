import { Expose, Transform } from 'class-transformer';
import { v4 as uuidv4 } from 'uuid';
import { AbstractEntity, Activity } from '@app/entities';
import { departmentNamesMap } from '@app/entities/constants/names';
import { User } from '@app/entities/user.entity';
import { ApiProperty } from '@nestjs/swagger';
import { EDepartment } from './constants';

export class Department extends AbstractEntity {
  public id: string;

  @ApiProperty({ enum: () => EDepartment })
  public value: EDepartment;

  @ApiProperty({ type: () => [Activity] })
  @Transform(({ value: activity }) =>
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    activity.map(({ ...data }: Activity) => data),
  )
  public activity: Activity[] = [];

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
    return this.value ? departmentNamesMap.get(this.value) : this.value;
  }
}

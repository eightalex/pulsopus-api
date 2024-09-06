import { Exclude, Expose } from 'class-transformer';
import { EDepartment } from '@app/entities';
import { departmentLabelMap } from '@app/entities/constants';
import { User } from '@app/entities/user/user.entity';
import { ApiProperty } from '@nestjs/swagger';

interface IActivity {
  date: number;
  value: number;
  rate: number;
}

export class Department {
  id: string;

  @ApiProperty({ enum: () => EDepartment })
  public value: EDepartment;

  public users: User[] = [];

  @Exclude()
  public activities: Map<number, IActivity>;

  constructor(partial: Partial<Department>) {
    Object.assign(this as Department, partial);
  }

  @Expose()
  public get label(): string {
    return departmentLabelMap.get(this.value);
  }

  @Expose()
  public get activity(): IActivity[] {
    return [...this.activities.values()];
  }
}

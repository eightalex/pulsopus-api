import { User } from '@app/entities/user.entity';

export class UserActivity {
  refId: User['id'];
  date: string;
  value: string;
  rate: number;
  trend: number;

  constructor(partial: Partial<UserActivity>) {
    Object.assign(this, partial);
  }

  static of(refId: string, date: string | number, value: string): UserActivity {
    return new UserActivity({
      refId,
      date: date.toString(),
      value,
    });
  }
}

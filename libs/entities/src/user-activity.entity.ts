import * as moment from 'moment';
import { User } from '@app/entities/user.entity';

export class UserActivity {
  userId: User['id'];
  date: string;
  value: string;

  constructor(partial: Partial<UserActivity>) {
    Object.assign(this, partial);
  }

  static of(id: User['id'], date: string, value: string): UserActivity {
    return new UserActivity({
      userId: id,
      date: moment(date, 'DD-MM-YYYY').valueOf().toString(),
      value,
    });
  }
  static ofUser(user: User, date: string, value: string): UserActivity {
    return new UserActivity({
      userId: user.id,
      date,
      value,
    });
  }
}

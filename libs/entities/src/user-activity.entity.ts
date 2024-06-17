export class UserActivity {
  date: string;
  value: number;
  rate?: number;
  trend?: number;

  constructor(partial: Partial<UserActivity>) {
    Object.assign(this, partial);
  }

  static of(
    date: string | number,
    value: number,
    rate?: number,
    trend?: number,
  ): UserActivity {
    return new UserActivity({
      date: date.toString(),
      value,
      rate,
      trend,
    });
  }
}

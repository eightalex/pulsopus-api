export class Activity {
  date: string;
  value: number;
  rate: number;
  trend?: number;

  constructor(partial: Partial<Activity>) {
    Object.assign(this, partial);
  }

  static of(
    date: string | number,
    value: number,
    rate?: number,
    trend?: number,
  ): Activity {
    return new Activity({
      date: date.toString(),
      value,
      rate,
      trend,
    });
  }
}

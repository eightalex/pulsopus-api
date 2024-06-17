export class Activity {
  date: string;
  value: number;

  constructor(partial: Partial<Activity>) {
    Object.assign(this, partial);
  }

  static of(date: string | number, value: number): Activity {
    return new Activity({
      date: date.toString(),
      value,
    });
  }
}

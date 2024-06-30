import { ApiProperty } from '@nestjs/swagger';

export class Activity {
  @ApiProperty()
  date: number;
  @ApiProperty()
  value: number | null;
  @ApiProperty()
  rate?: number | null;
  @ApiProperty()
  trend?: number;

  constructor(partial: Partial<Activity>) {
    Object.assign(this, partial);
  }

  static of(
    date: number,
    value: number | null,
    rate?: number | null,
    trend?: number,
  ): Activity {
    return new Activity({
      date,
      value,
      rate,
      trend,
    });
  }
}

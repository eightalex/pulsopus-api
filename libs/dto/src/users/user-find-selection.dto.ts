import * as moment from 'moment';

export class UserFindSelectionDto {
  public readonly startDate: number;
  public readonly endDate: number;

  private constructor(start: moment.MomentInput, end: moment.MomentInput) {
    this.startDate =
      typeof start === 'number' ? start : moment(start).valueOf();
    this.endDate = typeof end === 'number' ? end : moment(end).valueOf();
  }

  static of(
    start: number = 0,
    end: number = moment().endOf('d').valueOf(),
  ): UserFindSelectionDto {
    return new UserFindSelectionDto(start, end);
  }
}

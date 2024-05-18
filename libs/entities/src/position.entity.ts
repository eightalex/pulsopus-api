import { Expose } from 'class-transformer';
import { AbstractEntity } from '@app/entities/abstract.entity';
import { ApiProperty } from '@nestjs/swagger';
import { EPosition } from './constants';

const departmentLabels: Record<EPosition, string> = {
  [EPosition.DEVELOPER_SENIOR]: 'Senior Developer',
  [EPosition.DEVELOPER_JUNIOR]: 'Junior developer',
  [EPosition.QA_JUNIOR]: 'Junior QA',
  [EPosition.QA_LEAD]: 'QA Lead',
  [EPosition.PROJECT_MANAGER]: 'Project Manager',
  [EPosition.UNKNOWN]: 'UNKNOWN',
};

export class Position extends AbstractEntity {
  @ApiProperty({ enum: () => EPosition })
  public name: EPosition;

  constructor(partial: Partial<Position>) {
    super();
    Object.assign(this, partial);
  }

  static of(position: EPosition, rest: Partial<Position> = {}): Position {
    return new Position({ name: position, ...rest });
  }

  static ofLabel(label: string): Position {
    const position = Object.entries(departmentLabels).reduce((acc, [k, v]) => {
      if (v === label) return k as EPosition;
      return EPosition.DEVELOPER_JUNIOR;
    }, '' as EPosition);
    return Position.of(position);
  }

  @Expose()
  public get label(): string {
    return departmentLabels[this.name];
  }
}

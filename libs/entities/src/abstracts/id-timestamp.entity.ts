import { PrimaryGeneratedColumn } from 'typeorm';
import { ApiProperty } from '@nestjs/swagger';
import { TimestampEntity } from './timestamp.entity';

export abstract class IdTimestampEntity extends TimestampEntity {
  @ApiProperty()
  @PrimaryGeneratedColumn()
  public readonly id: number;
}

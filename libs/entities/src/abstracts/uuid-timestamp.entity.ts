import { PrimaryGeneratedColumn } from 'typeorm';
import { ApiProperty } from '@nestjs/swagger';
import { TimestampEntity } from './timestamp.entity';

export abstract class UuidTimestampEntity extends TimestampEntity {
  @ApiProperty()
  @PrimaryGeneratedColumn('uuid')
  public readonly id: string;
}

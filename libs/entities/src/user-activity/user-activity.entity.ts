import { Exclude } from 'class-transformer';
import {
  Column,
  Entity,
  Index,
  ManyToOne,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { TimestampEntity } from '@app/entities/abstracts/timestamp.entity';
import { User } from '@app/entities/user/user.entity';
import { ApiProperty } from '@nestjs/swagger';

@Entity('user_activities')
export class UserActivity extends TimestampEntity {
  @Exclude()
  @ApiProperty()
  @PrimaryGeneratedColumn()
  public readonly id: number;

  @ManyToOne(() => User, (user) => user.activities, { onDelete: 'SET NULL' })
  user: User;

  @ApiProperty()
  @Index()
  @Column({
    nullable: false,
    type: 'numeric',
  })
  date: number;

  @ApiProperty()
  @Column({
    nullable: false,
    type: 'numeric',
    comment:
      'total traffic data in bytes for the employee during the specified of "date" period.',
  })
  value: number;

  @ApiProperty()
  @Column({
    nullable: false,
    type: 'numeric',
    default: 0,
    comment: 'value as a percentage of total traffic and employeе value',
  })
  rate: number;

  @ApiProperty()
  trend?: number = 0;

  private constructor(partial: Partial<UserActivity>) {
    super();
    Object.assign(this as Partial<UserActivity>, partial);
  }

  static of(partial: Partial<UserActivity>): UserActivity {
    return new UserActivity(partial);
  }
}

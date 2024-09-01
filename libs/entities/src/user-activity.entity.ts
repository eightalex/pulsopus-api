import moment from 'moment';
import { BeforeInsert, Column, Entity, Index, ManyToOne } from 'typeorm';
import { IdTimestampEntity } from '@app/entities/abstracts/id-timestamp.entity';
import { User } from '@app/entities/user.entity';
import { ApiProperty } from '@nestjs/swagger';

@Entity('user_activities')
export class UserActivity extends IdTimestampEntity {
  @ManyToOne(() => User, (user) => user.activities)
  user: User;

  @ApiProperty()
  @Index()
  @Column({ nullable: false })
  date: number;

  @ApiProperty()
  @Column({ nullable: false })
  value: number;

  constructor(partial: Partial<UserActivity>) {
    super();
    Object.assign(this as Partial<UserActivity>, partial);
  }

  @BeforeInsert()
  beforeInsert() {
    this.date = moment(this.date).startOf('d').valueOf();
  }
}

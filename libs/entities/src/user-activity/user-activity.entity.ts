import { Column, Entity, Index, ManyToOne } from 'typeorm';
import { IdTimestampEntity } from '@app/entities/abstracts/id-timestamp.entity';
import { User } from '@app/entities/user/user.entity';
import { ApiProperty } from '@nestjs/swagger';

@Entity('user_activities')
export class UserActivity extends IdTimestampEntity {
  @ManyToOne(() => User, (user) => user.activities, { onDelete: 'SET NULL' })
  user: User;

  @ApiProperty()
  @Index()
  @Column({
    nullable: false,
    type: 'numeric',
  })
  // @Column({
  //   type: 'timestamp',
  //   transformer: {
  //     to(value: number): Date {
  //       return moment(value).toDate();
  //     },
  //     from(value: Date): number {
  //       return moment(value).valueOf();
  //     },
  //   },
  // })
  date: number;

  @ApiProperty()
  @Column({ nullable: false, type: 'numeric' })
  value: number;

  private constructor(partial: Partial<UserActivity>) {
    super();
    Object.assign(this as Partial<UserActivity>, partial);
  }

  static of(partial: Partial<UserActivity>): UserActivity {
    return new UserActivity(partial);
  }
}

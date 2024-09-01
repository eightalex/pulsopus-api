import { Exclude } from 'class-transformer';
import { Column, Entity, JoinTable, ManyToOne } from 'typeorm';
import { User } from '@app/entities';
import { IdTimestampEntity } from '@app/entities/abstracts/id-timestamp.entity';
import { EAccessRequestStatus } from './constants/enums';

@Entity('user_access_requests')
export class UserAccessRequest extends IdTimestampEntity {
  @Exclude({ toClassOnly: true })
  @ManyToOne(() => User, (user) => user.sentAccessRequests, {
    nullable: false,
  })
  @JoinTable({ name: 'requester_user_id' })
  public readonly requester: User;

  @Exclude({ toClassOnly: true })
  @ManyToOne(() => User, (user) => user.receivedAccessRequests, {
    nullable: false,
  })
  @JoinTable({ name: 'requested_user_id' })
  public readonly requestedUser: User;

  @Exclude({ toClassOnly: true })
  @Column({
    type: 'enum',
    enum: EAccessRequestStatus,
    default: EAccessRequestStatus.PENDING,
  })
  public status: EAccessRequestStatus;

  private constructor(partial: Partial<UserAccessRequest>) {
    super();
    Object.assign(this as Partial<UserAccessRequest>, partial);
  }

  static create(partial: Partial<UserAccessRequest>) {
    return new UserAccessRequest(partial);
  }
}

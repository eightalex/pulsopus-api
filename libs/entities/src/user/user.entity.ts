import * as bcrypt from 'bcrypt';
import { Exclude, Expose } from 'class-transformer';
import * as moment from 'moment';
import { Column, Entity, OneToMany } from 'typeorm';
import { UserResponseDto } from '@app/dto';
import {
  EAccessRequestStatus,
  EDepartment,
  UserAccessRequest,
} from '@app/entities';
import { UuidTimestampEntity } from '@app/entities/abstracts/uuid-timestamp.entity';
import { USER_GROUP } from '@app/entities/constants/groupsNames';
import { UserActivity } from '@app/entities/user-activity/user-activity.entity';
import { ApiProperty } from '@nestjs/swagger';
import { EUserRole } from '../constants';

@Entity('users')
export class User extends UuidTimestampEntity {
  @ApiProperty({ type: () => String, required: true })
  @Expose()
  @Column({ unique: true, nullable: false })
  public readonly email: string;

  @ApiProperty({ type: () => String, required: true })
  @Expose()
  @Column({ nullable: false })
  public readonly username: string;

  @Exclude()
  @Column({ nullable: false })
  public password?: string;

  @ApiProperty({ type: () => String, required: false })
  @Expose()
  @Column()
  public readonly avatar?: string = '';

  @Exclude()
  public readonly refreshToken?: string;

  @ApiProperty({
    type: () => String,
    required: true,
    enum: EUserRole,
  })
  @Expose()
  @Column({ type: 'enum', enum: EUserRole, default: EUserRole.VIEWER })
  public readonly role: EUserRole = EUserRole.VIEWER;

  @Exclude()
  @OneToMany(
    () => UserAccessRequest,
    (accessRequest) => accessRequest.requester,
    {
      eager: true,
      cascade: ['remove', 'soft-remove'],
    },
  )
  public readonly sentAccessRequests: UserAccessRequest[];

  @Exclude()
  @OneToMany(
    () => UserAccessRequest,
    (accessRequest) => accessRequest.requestedUser,
    {
      eager: true,
      cascade: ['remove', 'soft-remove'],
    },
  )
  public readonly receivedAccessRequests: UserAccessRequest[];

  @Expose({
    groups: [USER_GROUP.AUTH, USER_GROUP.PROFILE, USER_GROUP.LIST_ADMIN],
  })
  @Column({ default: false, name: 'is_active', type: 'boolean' })
  public isActive: boolean = false;

  @Expose({ groups: [USER_GROUP.LIST] })
  @OneToMany(() => UserActivity, (activity) => activity.user, {
    cascade: ['remove', 'soft-remove'],
  })
  activities: UserActivity[];

  @Expose()
  @Column({ nullable: true })
  public department?: EDepartment;

  @Expose()
  @Column({ nullable: true })
  public position?: string;

  constructor(partial: Partial<User>) {
    super();
    Object.assign(this as Partial<User>, partial);
  }

  @ApiProperty({ type: () => Number })
  @Expose({ groups: [USER_GROUP.LIST] })
  public get createdAt(): number {
    return moment(this.created_at).valueOf();
  }

  @ApiProperty({ type: () => Number })
  @Expose({ groups: [USER_GROUP.LIST] })
  public get updatedAt(): number {
    return moment(this.updated_at).valueOf();
  }

  public isRole(role: EUserRole): boolean {
    return this.role === role;
  }

  @Expose({
    groups: [USER_GROUP.PROFILE, USER_GROUP.AUTH, USER_GROUP.LIST_ADMIN],
  })
  public get isAdmin(): boolean {
    return this.isRole(EUserRole.ADMIN);
  }

  public response(): UserResponseDto {
    return User.response(this);
  }

  static response(user: User): UserResponseDto {
    return UserResponseDto.of(user);
  }

  // TODO: remove | quick fix for app frontend
  @Expose({ groups: [USER_GROUP.LIST] })
  public get activity(): UserActivity[] {
    return this.activities;
  }

  @Expose({
    name: 'isPending',
    groups: [USER_GROUP.PROFILE, USER_GROUP.AUTH, USER_GROUP.LIST_ADMIN],
  })
  public get hasPendingUserAccessRequest(): boolean {
    return (
      this.sentAccessRequests?.some(
        (request) => request.status === EAccessRequestStatus.PENDING,
      ) ?? false
    );
  }

  public async comparePassword(password: string): Promise<boolean> {
    return bcrypt.compare(password, this.password);
  }

  private async hashingPassword() {
    const saltRounds = 10;
    const salt = await bcrypt.genSalt(saltRounds);
    this.password = await bcrypt.hash(this.password, salt);
  }

  static async create(partial: Partial<User>): Promise<User> {
    const user = new User(partial);
    await user.hashingPassword();
    return user;
  }
}

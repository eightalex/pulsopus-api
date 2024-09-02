import * as bcrypt from 'bcrypt';
import { Exclude, Expose } from 'class-transformer';
import * as moment from 'moment';
import { Column, Entity, OneToMany, VirtualColumn } from 'typeorm';
import { UserResponseDto } from '@app/dto';
import { EAccessRequestStatus, UserAccessRequest } from '@app/entities';
import { UuidTimestampEntity } from '@app/entities/abstracts/uuid-timestamp.entity';
import { USER_GROUP } from '@app/entities/constants/groupsNames';
import { UserActivity } from '@app/entities/user-activity/user-activity.entity';
import { ApiProperty } from '@nestjs/swagger';
import { EUserRole, EUserStatus } from '../constants';

@Entity('users')
export class User extends UuidTimestampEntity {
  @Column({ unique: true, nullable: false })
  public readonly email: string;

  @Column({ nullable: false })
  public readonly username: string;

  @Exclude()
  @Column({ nullable: false })
  public readonly password?: string;

  @Column()
  public readonly avatar?: string = '';

  @Exclude()
  public readonly refreshToken?: string;

  @Expose({ groups: [USER_GROUP.LIST, USER_GROUP.AUTH] })
  @Column({ type: 'enum', enum: EUserRole, default: EUserRole.VIEWER })
  public readonly role: EUserRole = EUserRole.VIEWER;

  @Exclude()
  @OneToMany(
    () => UserAccessRequest,
    (accessRequest) => accessRequest.requester,
    {
      eager: true,
    },
  )
  public readonly sentAccessRequests: UserAccessRequest[];

  @Exclude()
  @OneToMany(
    () => UserAccessRequest,
    (accessRequest) => accessRequest.requestedUser,
    { eager: true },
  )
  public readonly receivedAccessRequests: UserAccessRequest[];

  @Expose({ groups: [USER_GROUP.LIST] })
  @Column({ default: false, name: 'is_active', type: 'boolean' })
  public isActive: boolean = false;

  @OneToMany(() => UserActivity, (activity) => activity.user, {
    cascade: ['remove', 'soft-remove'],
  })
  activities: UserActivity[];

  // @Prop({ type: String, enum: EUserStatus, default: EUserStatus.INACTIVE })
  public status: EUserStatus = EUserStatus.INACTIVE;

  // @Transform(({ value: department }: { value?: Department }) => {
  //   if (!department) return null;
  //   return {
  //     id: department?.id,
  //     value: department?.value,
  //     label: department?.label,
  //   };
  // })
  // @Prop({ type: Types.ObjectId, ref: Department.name })
  // department?: Department;

  @Expose({ groups: [USER_GROUP.LIST, USER_GROUP.AUTH] })
  public position?: string;

  @Exclude()
  accessRequestAdminId: User['id'];

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

  public isStatus(status: EUserStatus): boolean {
    return this.status === status;
  }

  @Expose({ groups: [USER_GROUP.LIST] })
  public get isPending(): boolean {
    return this.isStatus(EUserStatus.PENDING);
  }

  @Expose({ groups: [USER_GROUP.AUTH, USER_GROUP.LIST] })
  public get isAdmin(): boolean {
    return this.isRole(EUserRole.ADMIN);
  }

  public response(): UserResponseDto {
    return User.response(this);
  }

  static response(user: User): UserResponseDto {
    return UserResponseDto.of(user);
  }
  // static response(userDocument: UserDocument): UserResponseDto {
  //   return UserResponseDto.of(userDocument);
  //   // console.log('userDocument.toObject()', userDocument.toObject());
  //   // return plainToInstance(User, userDocument.toObject());
  // }

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
    return bcrypt.hash(this.password, salt);
  }

  static async create(partial: Partial<User>): Promise<User> {
    const user = new User(partial);
    await user.hashingPassword();
    return user;
  }
}

// export type UserDocument = HydratedDocument<User>;
// export const UserSchema = SchemaFactory.createForClass(User);
// UserSchema.loadClass(User);
// UserSchema.pre(/^find/, function (this: any, next) {
//   this.populate('department', ['value', 'label']);
//   next();
// });

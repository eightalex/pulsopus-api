import * as bcrypt from 'bcrypt';
import { Exclude, Expose } from 'class-transformer';
import * as moment from 'moment';
import { HydratedDocument, Types } from 'mongoose';
import { Column, Entity, OneToMany } from 'typeorm';
import { UserResponseDto } from '@app/dto';
import { UuidTimestampEntity } from '@app/entities/abstracts/uuid-timestamp.entity';
import { USER_GROUP } from '@app/entities/constants/groupsNames';
import {
  Department,
  EAccessRequestStatus,
  UserAccessRequest,
} from '@app/entities/index';
import { UserActivity } from '@app/entities/user-activity.entity';
import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { ApiProperty } from '@nestjs/swagger';
import { EUserRole, EUserStatus } from './constants';

@Entity('users')
@Schema({
  collection: 'users',
  timestamps: { createdAt: 'created_at', updatedAt: 'updated_at' },
  versionKey: false,
  toJSON: { getters: true, virtuals: true },
  toObject: { getters: true, virtuals: true },
})
export class User extends UuidTimestampEntity {
  @Prop()
  @Column({ unique: true, nullable: false })
  public readonly email: string;

  @Prop()
  @Column({ nullable: false })
  public readonly username: string;

  @Exclude({ toClassOnly: true })
  @Column({ nullable: false })
  @Prop({ required: false })
  public readonly password?: string;

  @Column()
  @Prop({ required: false })
  public readonly avatar?: string = '';

  @Exclude({ toClassOnly: true })
  @Prop({ required: false })
  public readonly refreshToken?: string;

  @Expose({ groups: [USER_GROUP.LIST, USER_GROUP.AUTH] })
  @Column({ type: 'enum', enum: EUserRole, default: EUserRole.VIEWER })
  @Prop({ type: String, enum: EUserRole, default: EUserRole.VIEWER })
  public readonly role: EUserRole = EUserRole.VIEWER;

  @Exclude({ toClassOnly: true })
  @OneToMany(
    () => UserAccessRequest,
    (accessRequest) => accessRequest.requester,
    {
      eager: true,
    },
  )
  public readonly sentAccessRequests: UserAccessRequest[];

  @Exclude({ toClassOnly: true })
  @OneToMany(
    () => UserAccessRequest,
    (accessRequest) => accessRequest.requestedUser,
    { eager: true },
  )
  public readonly receivedAccessRequests: UserAccessRequest[];

  @Expose({ groups: [USER_GROUP.LIST] })
  @Column({ default: false, name: 'is_active', type: 'boolean' })
  public isActive: boolean = false;

  // @Prop({ type: Map, of: Object, default: {} })
  // activities: Map<number, Activity>;
  @OneToMany(() => UserActivity, (activity) => activity.user)
  activities: UserActivity[];

  //
  @Exclude({ toPlainOnly: true })
  _id!: Types.ObjectId;

  @Prop({ type: String, enum: EUserStatus, default: EUserStatus.INACTIVE })
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
  department?: Department;

  @Prop()
  public position?: string;

  @Exclude()
  @Prop({ type: String })
  accessRequestAdminId: User['_id'];

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

  static response(user: User): UserResponseDto;
  static response(userDocument: UserDocument): UserResponseDto {
    return UserResponseDto.of(userDocument);
    // console.log('userDocument.toObject()', userDocument.toObject());
    // return plainToInstance(User, userDocument.toObject());
  }

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

export type UserDocument = HydratedDocument<User>;
export const UserSchema = SchemaFactory.createForClass(User);
UserSchema.loadClass(User);
UserSchema.pre(/^find/, function (this: any, next) {
  this.populate('department', ['value', 'label']);
  next();
});

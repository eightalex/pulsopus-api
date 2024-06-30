import { Exclude, Expose, Transform } from 'class-transformer';
import * as moment from 'moment';
import { HydratedDocument, Types } from 'mongoose';
import { UserResponseDto } from '@app/dto';
import { AccessRequest, Activity, Department } from '@app/entities';
import { USER_GROUP } from '@app/entities/constants/groupsNames';
import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { ApiProperty } from '@nestjs/swagger';
import { EUserRole, EUserStatus } from './constants';

@Schema({
  collection: 'users',
  timestamps: { createdAt: 'created_at', updatedAt: 'updated_at' },
  versionKey: false,
  toJSON: { getters: true, virtuals: true },
  toObject: { getters: true, virtuals: true },
})
export class User {
  @Exclude()
  private created_at: string;

  @Exclude()
  private updated_at: string;

  @Exclude()
  __v: number;

  @Exclude({ toPlainOnly: true })
  _id!: Types.ObjectId;
  id!: string;

  @Prop()
  public username: string;

  @Prop()
  public email: string;

  @Exclude({ toPlainOnly: true })
  @Prop({ required: false })
  public password?: string;

  @Exclude({ toPlainOnly: true })
  @Prop({ required: false })
  public refreshToken?: string;

  @Prop({ required: false })
  public avatar?: string;

  @Expose({ groups: [USER_GROUP.LIST, USER_GROUP.AUTH] })
  @Prop({ type: String, enum: EUserRole, default: EUserRole.VIEWER })
  public role: EUserRole = EUserRole.VIEWER;

  @Prop({ type: String, enum: EUserStatus, default: EUserStatus.INACTIVE })
  public status: EUserStatus = EUserStatus.INACTIVE;

  @Transform(({ value: department }: { value?: Department }) => {
    if (!department) return null;
    return {
      id: department?.id,
      value: department?.value,
      label: department?.label,
    };
  })
  @Prop({ type: Types.ObjectId, ref: Department.name })
  department?: Department;

  @Prop()
  public position?: string;

  @Prop({ type: Map, of: Object, default: {} })
  activities: Map<number, Activity>;

  @Exclude({ toPlainOnly: true })
  @Prop({ type: [Types.ObjectId], ref: AccessRequest.name })
  public accessRequestIds: AccessRequest['_id'][] = [];

  @Exclude({ toPlainOnly: true })
  public accessRequests: AccessRequest[] = [];

  constructor(partial: Partial<User>) {
    Object.assign(this, partial);
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

  public async validatePassword(password: string): Promise<boolean> {
    return password === this.password;
  }

  public isRole(role: EUserRole): boolean {
    return this.role === role;
  }

  public isStatus(status: EUserStatus): boolean {
    return this.status === status;
  }

  @Expose({ groups: [USER_GROUP.LIST] })
  public get isActive(): boolean {
    return this.isStatus(EUserStatus.ACTIVE);
  }

  @Expose({ groups: [USER_GROUP.LIST], name: 'isPending' })
  public get hasActiveAccessRequest(): boolean {
    const activeRequest = this.accessRequests.find(
      (request) => request.isActive,
    );
    return Boolean(activeRequest);
  }

  @Expose({ groups: [USER_GROUP.AUTH, USER_GROUP.LIST] })
  public get isAdmin(): boolean {
    return this.isRole(EUserRole.ADMIN);
  }

  static response(user: User): UserResponseDto;
  static response(userDocument: UserDocument): UserResponseDto {
    return UserResponseDto.of(userDocument);
    // console.log('userDocument.toObject()', userDocument.toObject());
    // return plainToInstance(User, userDocument.toObject());
  }
}

export type UserDocument = HydratedDocument<User>;
export const UserSchema = SchemaFactory.createForClass(User);
UserSchema.loadClass(User);

UserSchema.virtual('accessRequests', {
  ref: AccessRequest.name,
  localField: 'accessRequestIds',
  foreignField: '_id',
});

UserSchema.pre(/^find/, function (this: any, next) {
  this.populate('accessRequests').populate('department', ['value', 'label']);
  next();
});

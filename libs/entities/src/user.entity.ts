import { Exclude, Expose, Transform } from 'class-transformer';
import { Document, HydratedDocument, Types } from 'mongoose';
import { Activity, Department, Position } from '@app/entities';
import { USER_GROUP } from '@app/entities/constants/groupsNames';
import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { ApiProperty } from '@nestjs/swagger';
import { EUserRole, EUserStatus } from './constants';
import { UserStatus } from './user-status.entity';

@Schema({ timestamps: true, collection: 'users' })
export class User {
  @Exclude({ toPlainOnly: true })
  _id!: Types.ObjectId;
  id!: string;
  createdAt: number;
  updatedAt: number;

  @Prop()
  public username: string;

  @Prop()
  public email: string;

  @Exclude({ toPlainOnly: true })
  //
  @Prop({ required: false })
  public password?: string;

  @Exclude({ toPlainOnly: true })
  //
  @Prop({ required: false })
  public refreshToken?: string;

  @Prop({ required: false })
  public avatar?: string;

  @Expose({ groups: [USER_GROUP.LIST, USER_GROUP.AUTH] })
  //
  @Prop({ type: String, enum: EUserRole, default: EUserRole.VIEWER })
  public role: EUserRole = EUserRole.VIEWER;

  @ApiProperty({ type: () => UserStatus })
  @Expose({ groups: [USER_GROUP.LIST] })
  @Transform(({ value: status }: { value: UserStatus }) => status.value)
  public status: UserStatus;

  @ApiProperty({ type: () => Department })
  @Expose({ groups: [USER_GROUP.LIST, USER_GROUP.AUTH] })
  @Transform(({ value: department }: { value: Department }) => {
    if (!department) return undefined;
    return {
      value: department?.value,
      label: department?.label,
    };
  })
  public department?: Department;

  @ApiProperty({ type: () => Position })
  @Expose({ groups: [USER_GROUP.LIST, USER_GROUP.AUTH] })
  @Transform(({ value: position }: { value: Position }) => {
    if (!position) return undefined;
    return {
      value: position?.name,
      label: position?.label,
    };
  })
  public position?: Position;

  @Expose({ groups: [USER_GROUP.LIST, USER_GROUP.AUTH] })
  @ApiProperty({ type: () => [Activity] })
  @Transform(({ value: activity }) =>
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    activity.map(({ ...data }: Activity) => data),
  )
  public activity: Activity[] = [];

  constructor(partial: Partial<User>) {
    // super();
    Object.assign(this, partial);
  }

  public async validatePassword(password: string): Promise<boolean> {
    return password === this.password;
  }

  public isRole(role: EUserRole): boolean {
    return this.role === role;
  }

  public isStatus(status: EUserStatus): boolean {
    return this.status.value === status;
  }

  @Expose({ groups: [USER_GROUP.LIST] })
  public get isPending(): boolean {
    return this.isStatus(EUserStatus.PENDING);
  }

  @Expose({ groups: [USER_GROUP.LIST] })
  public get isAdmin(): boolean {
    return this.isRole(EUserRole.ADMIN);
  }

  @Expose({ groups: [USER_GROUP.LIST] })
  public get isDeleted(): boolean {
    return this.isStatus(EUserStatus.DELETED);
  }

  @Expose({ groups: [USER_GROUP.LIST] })
  public get isActive(): boolean {
    return this.isStatus(EUserStatus.ACTIVE);
  }

  public _filter(filter: Record<string, string[]>): boolean {
    return Object.entries(filter).every(([fk, fvs]) => {
      let uvs = [this[fk]];
      const classKeys = ['status', 'roles'];
      if (classKeys.includes(fk)) {
        if (Array.isArray(this[fk])) {
          uvs = this[fk].map(({ name }) => name);
        } else {
          uvs = [this[fk].name];
        }
      }

      return fvs.some((v) => uvs.includes(v));
    });
  }

  public _viewByRole(role: EUserRole): boolean {
    switch (role) {
      case EUserRole.VIEWER:
        return this.isActive;
      case EUserRole.ADMIN:
        return true;
      default:
        return false;
    }
  }
}

export type UserDocument = HydratedDocument<User>;
export const UserSchema = SchemaFactory.createForClass(User);
// UserSchema.virtual('id').get(function () {
//   return this._id.toHexString();
// });
UserSchema.set('toJSON', { getters: true, virtuals: true });
UserSchema.set('toObject', { getters: true, virtuals: true });

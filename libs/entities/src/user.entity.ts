import { Exclude, Expose, Transform } from 'class-transformer';
import { AbstractEntity } from '@app/entities/abstract.entity';
import { USER_GROUP } from '@app/entities/constants/groupsNames';
import { Department } from '@app/entities/department.entity';
import { Position } from '@app/entities/position.entity';
import { UserActivity } from '@app/entities/user-activity.entity';
import { ApiProperty } from '@nestjs/swagger';
import { EUserRole, EUserStatus } from './constants';
import { UserRole } from './role.entity';
import { UserStatus } from './user-status.entity';

export class User extends AbstractEntity {
  public id: string;

  public username: string;

  // @Expose({ groups: [USER_GROUP.AUTH] })
  public email: string;

  @Exclude({ toPlainOnly: true })
  public password: string;

  @Exclude({ toPlainOnly: true })
  public refreshToken: string;

  public avatar: string;

  @ApiProperty({ type: () => UserRole })
  @Transform(({ value: role }: { value: UserRole }) => role.value)
  public role: UserRole = UserRole.of(EUserRole.VIEWER);

  @ApiProperty({ type: () => UserStatus })
  @Expose({ groups: [USER_GROUP.FULL] })
  @Transform(({ value: status }: { value: UserStatus }) => status.value)
  public status: UserStatus;

  @ApiProperty({ type: () => Department })
  @Expose({ groups: [USER_GROUP.FULL] })
  @Transform(({ value: department }: { value: Department }) => {
    if (!department) return undefined;
    return {
      value: department?.value,
      label: department?.label,
    };
  })
  public department?: Department;

  @ApiProperty({ type: () => Position })
  @Expose({ groups: [USER_GROUP.FULL] })
  @Transform(({ value: position }: { value: Position }) => {
    if (!position) return undefined;
    return {
      value: position?.name,
      label: position?.label,
    };
  })
  public position?: Position;

  @Expose({ groups: [USER_GROUP.FULL] })
  @ApiProperty({ type: () => [UserActivity] })
  @Transform(({ value: activity }) =>
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    activity.map(({ ...data }: UserActivity) => data),
  )
  public activity: UserActivity[] = [];

  constructor(partial: Partial<User>) {
    super();
    Object.assign(this, partial);
  }

  public async validatePassword(password: string): Promise<boolean> {
    return password === this.password;
  }

  public isRole(role: EUserRole): boolean {
    return this.role.value === role;
  }

  @Expose({ groups: [USER_GROUP.FULL] })
  public get isActive(): boolean {
    return this.status.value === EUserStatus.ACTIVE;
  }

  @Expose({ groups: [USER_GROUP.FULL] })
  public get isPending(): boolean {
    return this.status.value === EUserStatus.PENDING;
  }

  @Expose({ groups: [USER_GROUP.FULL] })
  public get isAdmin(): boolean {
    return this.isRole(EUserRole.ADMIN);
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
      case EUserRole.MANAGER:
        return !this.isPending;
      case EUserRole.ADMIN:
        return true;
      default:
        return false;
    }
  }
}

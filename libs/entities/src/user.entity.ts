import { Exclude, Expose, Transform } from 'class-transformer';
import { AbstractEntity, Activity, Department, Position } from '@app/entities';
import { USER_GROUP } from '@app/entities/constants/groupsNames';
import { ApiProperty } from '@nestjs/swagger';
import { EUserRole, EUserStatus } from './constants';
import { Role } from './role.entity';
import { UserStatus } from './user-status.entity';

export class User extends AbstractEntity {
  public id: string;

  public username: string;

  public email: string;

  @Exclude({ toPlainOnly: true })
  public password: string;

  @Exclude({ toPlainOnly: true })
  public refreshToken: string;

  public avatar: string;

  @ApiProperty({ type: () => Role })
  @Transform(({ value: role }: { value: Role }) => role.value)
  @Expose({ groups: [USER_GROUP.LIST, USER_GROUP.AUTH] })
  public role: Role = Role.of(EUserRole.VIEWER);

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
    super();
    Object.assign(this, partial);
  }

  public async validatePassword(password: string): Promise<boolean> {
    return password === this.password;
  }

  public isRole(role: EUserRole): boolean {
    return this.role.value === role;
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
  public get isBlocked(): boolean {
    return this.isStatus(EUserStatus.BLOCKED);
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
      case EUserRole.MANAGER:
        return !this.isPending;
      case EUserRole.ADMIN:
        return true;
      default:
        return false;
    }
  }
}

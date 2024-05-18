import { Exclude, Expose, Transform } from 'class-transformer';
import { AbstractEntity } from '@app/entities/abstract.entity';
import { USER_GROUP } from '@app/entities/constants/groupsNames';
import { Department } from '@app/entities/department.entity';
import { Position } from '@app/entities/position.entity';
import { UserActivity } from '@app/entities/user-activity.entity';
import { ApiProperty } from '@nestjs/swagger';
import { EDepartment, EPosition, EUserRole, EUserStatus } from './constants';
import { UserRole } from './role.entity';
import { UserStatus } from './user-status.entity';

export class User extends AbstractEntity {
  public username: string;

  // @Expose({ groups: [USER_GROUP.AUTH] })
  public email: string;

  @Exclude({ toPlainOnly: true })
  public password: string;

  @Exclude({ toPlainOnly: true })
  public refreshToken: string;

  public avatar: string;

  @ApiProperty({ type: () => [UserRole] })
  @Transform(({ value: roles }) => roles.map((r) => r.name))
  public roles: UserRole[] = [UserRole.of(EUserRole.VIEWER)];

  @ApiProperty({ type: () => UserStatus })
  @Expose({ groups: [USER_GROUP.ALL] })
  @Transform(({ value: status }) => status.name)
  public status: UserStatus;

  @ApiProperty({ type: () => Department })
  @Expose({ groups: [USER_GROUP.ALL] })
  @Transform(({ value: department }: { value: Department }) => ({
    value: department.name,
    label: department.label,
  }))
  public department: Department = Department.of(EDepartment.UNKNOWN);

  @ApiProperty({ type: () => Position })
  @Expose({ groups: [USER_GROUP.ALL] })
  @Transform(({ value: position }: { value: Position }) => ({
    value: position.name,
    label: position.label,
  }))
  public position: Position = Position.of(EPosition.UNKNOWN);

  @ApiProperty({ type: () => [UserActivity] })
  @Expose({ groups: [USER_GROUP.ALL] })
  @Transform(({ value: activity }) =>
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    activity.map(({ userId, ...data }: UserActivity) => data),
  )
  public activity: UserActivity[] = [];

  constructor(partial: Partial<User>) {
    super();
    Object.assign(this, partial);
  }

  public async validatePassword(password: string): Promise<boolean> {
    return password === this.password;
  }

  public hasRole(role: EUserRole): boolean {
    return Boolean(this.roles.find(({ name }) => name === role));
  }

  @Expose({ groups: [USER_GROUP.ALL] })
  public get isActive(): boolean {
    return this.status.name === EUserStatus.ACTIVE;
  }

  @Expose({ groups: [USER_GROUP.ALL] })
  public get isPending(): boolean {
    return this.status.name === EUserStatus.PENDING;
  }

  @Expose({ groups: [USER_GROUP.ALL] })
  public get isAdmin(): boolean {
    return this.hasRole(EUserRole.ADMIN);
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
}

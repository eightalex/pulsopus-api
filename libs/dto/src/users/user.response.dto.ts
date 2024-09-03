import { Activity, Department, User } from '@app/entities';

export class UserResponseDto {
  public id: User['id'];
  public username: User['username'];
  public email: User['email'];
  public avatar: User['avatar'];
  public role: User['role'];
  public department: { value: Department['value']; label: Department['label'] };
  public position: User['position'];
  public activity: Activity[];
  public isPending: boolean;
  public isActive: boolean;
  public isAdmin: boolean;
  public createdAt: number;
  public updatedAt: number;
  private constructor(partial: Partial<UserResponseDto>) {
    Object.assign(this as Partial<UserResponseDto>, partial);
  }

  static of(user: User): UserResponseDto {
    // const activity = [...user.activities.values()].sort(
    //   (p, n) => p.date - n.date,
    // );

    return new UserResponseDto({
      id: user.id,
      username: user.username,
      email: user.email,
      avatar: user.avatar,
      role: user.role,
      // TODO: return department
      department: null,
      // department: user.department
      //   ? {
      //       value: user.department.value,
      //       label: user.department.label,
      //     }
      //   : null,
      // activity,
      activity: user.activities,
      position: user.position,
      isPending: user.hasPendingUserAccessRequest,
      isActive: user.isActive,
      isAdmin: user.isAdmin,
      createdAt: user.createdAt,
      updatedAt: user.updatedAt,
    });
  }
}

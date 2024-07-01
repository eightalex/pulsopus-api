import { Activity, Department, User, UserDocument } from '@app/entities';

export class UserResponseDto {
  public id: User['id'];
  public username: User['username'];
  public email: User['email'];
  public avatar: User['avatar'];
  public role: User['role'];
  public status: User['status'];
  public department: { value: Department['value']; label: Department['label'] };
  public position: User['position'];
  public activity: Activity[];
  public isPending: boolean;
  public isActive: boolean;
  public isAdmin: boolean;
  public createdAt: number;
  public updatedAt: number;
  constructor(partial: Partial<UserResponseDto>) {
    Object.assign(this, partial);
  }

  static of(userDocument: UserDocument): UserResponseDto {
    const activity = [...userDocument.activities.values()].sort(
      (p, n) => p.date - n.date,
    );

    return new UserResponseDto({
      id: userDocument._id.toHexString(),
      username: userDocument.username,
      email: userDocument.email,
      avatar: userDocument.avatar,
      role: userDocument.role,
      status: userDocument.status,
      department: userDocument.department
        ? {
            value: userDocument.department.value,
            label: userDocument.department.label,
          }
        : null,
      activity,
      position: userDocument.position,
      isPending: userDocument.isPending,
      isActive: userDocument.isActive,
      isAdmin: userDocument.isAdmin,
      createdAt: userDocument.createdAt,
      updatedAt: userDocument.updatedAt,
    });
  }
}

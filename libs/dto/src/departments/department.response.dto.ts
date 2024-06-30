import { UserResponseDto } from '@app/dto/users';
import { Activity, Department, DepartmentDocument, User } from '@app/entities';

export class DepartmentResponseDto {
  public id: Department['id'];
  public value: Department['value'];
  public label: Department['label'];
  public activity: Activity[];
  public users: UserResponseDto[];
  constructor(partial: Partial<DepartmentResponseDto>) {
    Object.assign(this, partial);
  }

  static of(departmentDocument: DepartmentDocument): DepartmentResponseDto {
    const activity = [...departmentDocument.activities.values()].sort(
      (p, n) => p.date - n.date,
    );
    return new DepartmentResponseDto({
      id: departmentDocument._id.toHexString(),
      value: departmentDocument.value,
      label: departmentDocument.label,
      users: departmentDocument.users.map((u) => User.response(u)),
      activity,
    });
  }
}

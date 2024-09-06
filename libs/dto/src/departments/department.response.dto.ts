import { Department, User } from '@app/entities';

export class DepartmentResponseDto {
  public id: Department['id'];
  public value: Department['value'];
  public label: Department['label'];
  // public activity: Activity[];
  public users: User[];
  constructor(partial: Partial<DepartmentResponseDto>) {
    Object.assign(this as DepartmentResponseDto, partial);
  }

  static of(department: Department): DepartmentResponseDto {
    // const activity = [...departmentDocument.activities.values()].sort(
    //   (p, n) => p.date - n.date,
    // );
    return new DepartmentResponseDto({
      id: department.id,
      value: department.value,
      label: department.label,
      users: department.users,
      // activity,
    });
  }
}

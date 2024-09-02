import { Exclude, Transform } from 'class-transformer';
import { HydratedDocument, Types } from 'mongoose';
import { DepartmentResponseDto } from '@app/dto/departments/department.response.dto';
import { Activity, EDepartment } from '@app/entities';
import { departmentNamesMap } from '@app/entities/constants/names';
import { User } from '@app/entities/user.entity';
import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { ApiProperty } from '@nestjs/swagger';

@Schema({
  collection: 'departments',
  timestamps: true,
  toJSON: { getters: true, virtuals: true },
  toObject: { getters: true, virtuals: true },
})
export class Department {
  @Exclude({ toPlainOnly: true })
  _id!: Types.ObjectId;
  id!: string;

  @ApiProperty({ enum: () => EDepartment })
  //
  @Prop({ unique: true, type: String, enum: EDepartment })
  public value: EDepartment;

  @Prop()
  public label: string;

  @Prop({ type: [Types.ObjectId], ref: 'User' })
  public userIds: User['id'][] = [];

  public users: User[] = [];

  @Prop({ type: Map, of: Object, default: {} })
  // activities: Record<number, Activity>;
  activities: Map<number, Activity>;

  constructor(partial: Partial<Department>) {
    Object.assign(this, partial);
  }
  static of(
    valueOrPartial:
      | EDepartment
      | ({ value: EDepartment } & Partial<Department>),
  ): Department {
    let res = {} as Partial<Department>;
    if (typeof valueOrPartial === 'string') {
      res.value = valueOrPartial;
    } else {
      res = {
        value: EDepartment.COMPANY,
        ...valueOrPartial,
      };
    }
    if (!res.label) {
      res.label = departmentNamesMap.get(res.value);
    }
    return new Department(res);
  }

  static response(
    departmentDocument: DepartmentDocument,
  ): DepartmentResponseDto {
    return DepartmentResponseDto.of(departmentDocument);
  }
}

export type DepartmentDocument = HydratedDocument<Department>;
export const DepartmentSchema = SchemaFactory.createForClass(Department);
DepartmentSchema.loadClass(Department);
DepartmentSchema.virtual('users', {
  ref: 'User',
  localField: 'userIds',
  foreignField: '_id',
});
DepartmentSchema.pre(/^find/, function (this: any, next) {
  this.populate('users');
  next();
});

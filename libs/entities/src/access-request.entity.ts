import { Exclude } from 'class-transformer';
import { HydratedDocument, Types } from 'mongoose';
import {
  EAccessRequestDecision,
  EAccessRequestStatus,
} from '@app/entities/constants';
import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { ApiProperty } from '@nestjs/swagger';

@Schema({
  collection: 'access-requests',
  timestamps: true,
  toJSON: { getters: true, virtuals: true },
  toObject: { getters: true, virtuals: true },
})
export class AccessRequest {
  @Exclude({ toPlainOnly: true })
  _id!: Types.ObjectId;
  id!: string;

  @Prop({ required: true, index: true, type: Types.ObjectId, ref: 'User' })
  public fromId: string;
  // public fromUser: User;

  @Prop({ required: true, index: true, type: Types.ObjectId, ref: 'User' })
  public toId: string;
  // public toUser: User;

  @ApiProperty({ enum: () => EAccessRequestStatus })
  @Prop({
    index: true,
    type: String,
    enum: EAccessRequestStatus,
    default: EAccessRequestStatus.ACTIVE,
  })
  public status: EAccessRequestStatus = EAccessRequestStatus.ACTIVE;

  @ApiProperty({ enum: () => EAccessRequestDecision })
  @Prop({
    index: true,
    type: String,
    enum: EAccessRequestDecision,
  })
  public decision: EAccessRequestDecision;

  constructor(partial: Partial<AccessRequest>) {
    Object.assign(this, partial);
  }

  public get isActive(): boolean {
    return this.status === EAccessRequestStatus.ACTIVE;
  }
}

export type AccessRequestDocument = HydratedDocument<AccessRequest>;
export const AccessRequestSchema = SchemaFactory.createForClass(AccessRequest);
AccessRequestSchema.loadClass(AccessRequest);

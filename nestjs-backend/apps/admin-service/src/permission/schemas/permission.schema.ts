import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument, Types } from 'mongoose';
import { buildEmptyPermissions } from '@app/common';

export type PermissionDocument = HydratedDocument<Permission>;

@Schema({ timestamps: true })
export class Permission {
  @Prop({ type: Types.ObjectId, ref: 'UserType', required: true, unique: true })
  userTypeId!: Types.ObjectId;

  @Prop({ type: Object, default: () => buildEmptyPermissions() })
  permissions!: Record<string, { create: boolean; read: boolean; update: boolean; delete: boolean }>;
}

export const PermissionSchema = SchemaFactory.createForClass(Permission);

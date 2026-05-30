import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument, Types } from 'mongoose';

export type AreaDocument = HydratedDocument<Area>;

@Schema({ timestamps: true })
export class Area {
  @Prop({ required: true, trim: true })
  name!: string;

  @Prop({ type: Types.ObjectId, ref: 'Pincode', required: true })
  pincodeId!: Types.ObjectId;

  @Prop({ type: Types.ObjectId, ref: 'City', required: true })
  cityId!: Types.ObjectId;

  @Prop({ type: Types.ObjectId, ref: 'State', required: true })
  stateId!: Types.ObjectId;

  @Prop({ default: true })
  isActive!: boolean;
}

export const AreaSchema = SchemaFactory.createForClass(Area);
AreaSchema.index({ name: 1, pincodeId: 1 }, { unique: true });

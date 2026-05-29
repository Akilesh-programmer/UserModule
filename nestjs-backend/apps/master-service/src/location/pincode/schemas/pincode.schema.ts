import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument, Types } from 'mongoose';

export type PincodeDocument = HydratedDocument<Pincode>;

@Schema({ timestamps: true })
export class Pincode {
  @Prop({ required: true, trim: true })
  code!: string;

  @Prop({ type: Types.ObjectId, ref: 'City', required: true })
  cityId!: Types.ObjectId;

  @Prop({ type: Types.ObjectId, ref: 'State', required: true })
  stateId!: Types.ObjectId;

  @Prop({ default: true })
  isActive!: boolean;
}

export const PincodeSchema = SchemaFactory.createForClass(Pincode);
PincodeSchema.index({ code: 1, cityId: 1 }, { unique: true });

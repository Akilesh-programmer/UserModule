import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument, Types } from 'mongoose';

export type MarketDocument = HydratedDocument<Market>;

@Schema({ timestamps: true })
export class Market {
  @Prop({ required: true, trim: true })
  name!: string;

  @Prop({ type: Types.ObjectId, ref: 'State', required: true })
  stateId!: Types.ObjectId;

  @Prop({ type: Types.ObjectId, ref: 'City', required: true })
  districtId!: Types.ObjectId;

  @Prop({ default: true })
  isActive!: boolean;
}

export const MarketSchema = SchemaFactory.createForClass(Market);

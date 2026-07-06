import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument, Types } from 'mongoose';

export type SchemeDocument = HydratedDocument<Scheme>;

@Schema({ timestamps: true })
export class Scheme {
  @Prop({ required: true, trim: true })
  schemeName!: string;

  @Prop({ type: Types.ObjectId, ref: 'Group', required: true })
  groupId!: Types.ObjectId;

  @Prop({ default: '', trim: true })
  hsnCode!: string;

  @Prop({ default: '', trim: true })
  partNo!: string;

  @Prop({ type: Types.ObjectId, ref: 'Item', required: true })
  itemId!: Types.ObjectId;

  @Prop({ required: true, min: 1 })
  boxQuantity!: number;

  @Prop({ default: '', trim: true })
  productImage!: string;

  @Prop({ default: true })
  isActive!: boolean;

  @Prop({ default: '', trim: true, maxlength: 200 })
  description!: string;

  @Prop({ required: true, trim: true })
  specialSchemeDealer!: string;
}

export const SchemeSchema = SchemaFactory.createForClass(Scheme);

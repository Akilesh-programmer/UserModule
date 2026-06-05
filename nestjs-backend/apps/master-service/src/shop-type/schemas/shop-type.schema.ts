import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument } from 'mongoose';

export type ShopTypeDocument = HydratedDocument<ShopType>;

@Schema({ timestamps: true })
export class ShopType {
  @Prop({ required: true, unique: true, trim: true })
  name!: string;

  @Prop({ default: '', trim: true })
  description!: string;

  @Prop({ default: true })
  isActive!: boolean;
}

export const ShopTypeSchema = SchemaFactory.createForClass(ShopType);

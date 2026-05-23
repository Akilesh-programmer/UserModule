import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument } from 'mongoose';

export type PackingTypeDocument = HydratedDocument<PackingType>;

@Schema({ timestamps: true })
export class PackingType {
  @Prop({ required: true, trim: true })
  name!: string;

  @Prop({ default: '', trim: true })
  description!: string;

  @Prop({ default: 1, min: 1 })
  unitsPerPack!: number;

  @Prop({ default: true })
  isActive!: boolean;
}

export const PackingTypeSchema = SchemaFactory.createForClass(PackingType);

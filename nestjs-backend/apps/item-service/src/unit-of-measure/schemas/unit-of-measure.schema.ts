import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument } from 'mongoose';

export type UnitOfMeasureDocument = HydratedDocument<UnitOfMeasure>;

@Schema({ timestamps: true })
export class UnitOfMeasure {
  @Prop({ required: true, unique: true, trim: true, uppercase: true })
  abbreviation!: string;

  @Prop({ default: '', trim: true })
  description!: string;

  @Prop({ default: true })
  isActive!: boolean;
}

export const UnitOfMeasureSchema = SchemaFactory.createForClass(UnitOfMeasure);

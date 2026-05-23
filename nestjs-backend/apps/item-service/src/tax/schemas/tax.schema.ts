import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument } from 'mongoose';

export type TaxDocument = HydratedDocument<Tax>;

@Schema({ timestamps: true })
export class Tax {
  @Prop({ required: true, trim: true })
  name!: string;

  @Prop({ required: true, min: 0, max: 100 })
  percentage!: number;

  @Prop({ required: true, enum: ['GST', 'IGST', 'CGST', 'SGST', 'VAT', 'CESS', 'OTHER'] })
  taxType!: string;

  @Prop({ default: '', trim: true })
  hsnCode!: string;

  @Prop({ default: '', trim: true })
  description!: string;

  @Prop({ default: true })
  isActive!: boolean;
}

export const TaxSchema = SchemaFactory.createForClass(Tax);

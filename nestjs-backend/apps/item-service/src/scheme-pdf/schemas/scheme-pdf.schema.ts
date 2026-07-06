import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument, Types } from 'mongoose';

export type SchemePdfDocument = HydratedDocument<SchemePdf>;

@Schema({ timestamps: true })
export class SchemePdf {
  @Prop({ required: true, trim: true })
  groupName!: string;

  @Prop({ type: Types.ObjectId, ref: 'Category' })
  categoryId!: Types.ObjectId;

  @Prop({ default: '', trim: true, maxlength: 200 })
  description!: string;

  @Prop({ required: true, trim: true })
  pdfFile!: string;

  @Prop({ default: true })
  isActive!: boolean;
}

export const SchemePdfSchema = SchemaFactory.createForClass(SchemePdf);

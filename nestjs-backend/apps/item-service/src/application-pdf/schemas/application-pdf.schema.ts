import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument } from 'mongoose';

export type ApplicationPdfDocument = HydratedDocument<ApplicationPdf>;

@Schema({ timestamps: true })
export class ApplicationPdf {
  @Prop({ required: true, trim: true })
  formType!: string;

  @Prop({ default: '', trim: true, maxlength: 200 })
  description!: string;

  @Prop({ required: true, trim: true })
  pdfFile!: string;

  @Prop({ default: true })
  isActive!: boolean;
}

export const ApplicationPdfSchema = SchemaFactory.createForClass(ApplicationPdf);

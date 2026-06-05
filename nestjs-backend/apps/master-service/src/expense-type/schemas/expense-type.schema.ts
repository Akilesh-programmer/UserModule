import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument } from 'mongoose';

export type ExpenseTypeDocument = HydratedDocument<ExpenseType>;

@Schema({ timestamps: true })
export class ExpenseType {
  @Prop({ required: true, unique: true, trim: true })
  name!: string;

  @Prop({ default: '', trim: true })
  description!: string;

  @Prop({ default: true })
  isActive!: boolean;
}

export const ExpenseTypeSchema = SchemaFactory.createForClass(ExpenseType);

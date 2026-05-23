import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument } from 'mongoose';

export type UserTypeDocument = HydratedDocument<UserType>;

@Schema({ timestamps: true })
export class UserType {
  @Prop({ required: true, trim: true })
  name!: string;

  @Prop({ default: '', trim: true })
  description!: string;

  @Prop({ default: true })
  isActive!: boolean;
}

export const UserTypeSchema = SchemaFactory.createForClass(UserType);

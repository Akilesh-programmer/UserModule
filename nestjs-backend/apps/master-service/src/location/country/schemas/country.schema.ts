import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument } from 'mongoose';

export type CountryDocument = HydratedDocument<Country>;

@Schema({ timestamps: true })
export class Country {
  @Prop({ required: true, unique: true, trim: true })
  name!: string;

  @Prop({ default: '', trim: true, uppercase: true })
  code!: string;

  @Prop({ default: true })
  isActive!: boolean;
}

export const CountrySchema = SchemaFactory.createForClass(Country);

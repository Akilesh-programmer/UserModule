import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument, Types } from 'mongoose';

export type StateDocument = HydratedDocument<State>;

@Schema({ timestamps: true })
export class State {
  @Prop({ type: Types.ObjectId, ref: 'Country', required: true })
  countryId!: Types.ObjectId;

  @Prop({ required: true, trim: true })
  name!: string;

  @Prop({ default: '', trim: true, uppercase: true })
  code!: string;

  @Prop({ default: true })
  isActive!: boolean;
}

export const StateSchema = SchemaFactory.createForClass(State);
StateSchema.index({ name: 1, countryId: 1 }, { unique: true });

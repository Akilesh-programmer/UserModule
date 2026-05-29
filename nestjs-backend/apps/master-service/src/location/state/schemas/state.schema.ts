import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument } from 'mongoose';

export type StateDocument = HydratedDocument<State>;

@Schema({ timestamps: true })
export class State {
  @Prop({ required: true, unique: true, trim: true })
  name!: string;

  @Prop({ default: true })
  isActive!: boolean;
}

export const StateSchema = SchemaFactory.createForClass(State);

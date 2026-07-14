import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument, Types } from 'mongoose';

export type StockEntryDocument = HydratedDocument<StockEntry>;

@Schema({ _id: false })
export class StockItem {
  @Prop({ type: Types.ObjectId, required: true })
  groupId!: Types.ObjectId;

  @Prop({ type: Types.ObjectId, required: true })
  itemId!: Types.ObjectId;

  @Prop({ required: true, min: 0 })
  boxes!: number;

  @Prop({ default: 0, min: 0 })
  loosePieces!: number;

  @Prop({ required: true, min: 1 })
  itemsPerBox!: number;

  @Prop({ required: true, min: 0 })
  totalPieces!: number;

  @Prop({ required: true, min: 0 })
  availableBoxes!: number;

  @Prop({ default: 0, min: 0 })
  availablePieces!: number;
}

const StockItemSchema = SchemaFactory.createForClass(StockItem);

@Schema({ timestamps: true })
export class StockEntry {
  @Prop({ required: true, unique: true, trim: true })
  stockNumber!: string;

  @Prop({ type: Date, required: true, default: Date.now })
  stockDate!: Date;

  @Prop({ type: Types.ObjectId, required: true })
  salesRepId!: Types.ObjectId;

  @Prop({ type: [Types.ObjectId], required: true, default: [] })
  dealerIds!: Types.ObjectId[];

  @Prop({ type: [StockItemSchema], required: true, default: [] })
  items!: StockItem[];

  @Prop({ type: String, enum: ['active', 'closed'], default: 'active' })
  status!: string;

  @Prop({ default: '', trim: true, maxlength: 200 })
  remarks!: string;
}

export const StockEntrySchema = SchemaFactory.createForClass(StockEntry);
StockEntrySchema.index({ salesRepId: 1, status: 1 });
StockEntrySchema.index({ dealerIds: 1, status: 1 });

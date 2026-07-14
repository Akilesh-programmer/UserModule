import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument, Types } from 'mongoose';

export type SecondarySaleDocument = HydratedDocument<SecondarySale>;

@Schema({ _id: false })
export class SaleItem {
  @Prop({ type: Types.ObjectId, required: true })
  groupId!: Types.ObjectId;

  @Prop({ type: Types.ObjectId, required: true })
  itemId!: Types.ObjectId;

  @Prop({ required: true, trim: true })
  itemName!: string;

  @Prop({ required: true, min: 0 })
  boxQuantity!: number;

  @Prop({ required: true, min: 0 })
  pieceQuantity!: number;

  @Prop({ required: true, min: 0 })
  boxPrice!: number;

  @Prop({ required: true, min: 0 })
  piecePrice!: number;

  @Prop({ required: true, min: 1 })
  itemsPerBox!: number;

  @Prop({ required: true, min: 0 })
  lineTotal!: number;
}

const SaleItemSchema = SchemaFactory.createForClass(SaleItem);

@Schema({ timestamps: true })
export class SecondarySale {
  @Prop({ required: true, unique: true, trim: true })
  saleNumber!: string;

  @Prop({ type: Date, required: true, default: Date.now })
  saleDate!: Date;

  @Prop({ type: Types.ObjectId, required: true })
  orderId!: Types.ObjectId;

  @Prop({ type: Types.ObjectId, required: true })
  dealerId!: Types.ObjectId;

  @Prop({ type: Types.ObjectId })
  salesRepId!: Types.ObjectId;

  @Prop({ type: Types.ObjectId })
  marketId!: Types.ObjectId;

  @Prop({ type: Types.ObjectId, default: null })
  stockEntryId!: Types.ObjectId | null;

  @Prop({ type: [SaleItemSchema], required: true, default: [] })
  items!: SaleItem[];

  @Prop({ required: true, min: 0 })
  totalAmount!: number;

  @Prop({
    type: String,
    enum: ['dispatched', 'delivered', 'returned'],
    default: 'dispatched',
  })
  status!: string;

  @Prop({ type: Types.ObjectId })
  dispatchedBy!: Types.ObjectId;

  @Prop({ type: Date, default: null })
  deliveredAt!: Date | null;

  @Prop({ default: '', trim: true, maxlength: 200 })
  remarks!: string;
}

export const SecondarySaleSchema = SchemaFactory.createForClass(SecondarySale);
SecondarySaleSchema.index({ status: 1 });
SecondarySaleSchema.index({ dealerId: 1 });
SecondarySaleSchema.index({ salesRepId: 1 });
SecondarySaleSchema.index({ marketId: 1 });
SecondarySaleSchema.index({ orderId: 1 });

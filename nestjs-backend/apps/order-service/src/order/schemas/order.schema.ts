import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument, Types } from 'mongoose';

export type OrderDocument = HydratedDocument<Order>;

@Schema({ _id: false })
export class OrderItem {
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

const OrderItemSchema = SchemaFactory.createForClass(OrderItem);

@Schema({ timestamps: true })
export class Order {
  @Prop({ required: true, unique: true, trim: true })
  orderNumber!: string;

  @Prop({ type: Date, required: true, default: Date.now })
  orderDate!: Date;

  @Prop({ type: Types.ObjectId, required: true })
  dealerId!: Types.ObjectId;

  @Prop({ type: Types.ObjectId })
  salesRepId!: Types.ObjectId;

  @Prop({ type: Types.ObjectId })
  marketId!: Types.ObjectId;

  @Prop({
    type: String,
    enum: ['pending', 'approved', 'rejected', 'dispatched', 'delivered'],
    default: 'pending',
  })
  status!: string;

  @Prop({ type: [OrderItemSchema], required: true, default: [] })
  items!: OrderItem[];

  @Prop({ required: true, min: 0 })
  totalBoxes!: number;

  @Prop({ required: true, min: 0 })
  totalPieces!: number;

  @Prop({ required: true, min: 0 })
  totalAmount!: number;

  @Prop({ type: Types.ObjectId, default: null })
  schemeId!: Types.ObjectId | null;

  @Prop({ default: '', trim: true, maxlength: 200 })
  remarks!: string;

  @Prop({ type: Date, default: null })
  approvedAt!: Date | null;

  @Prop({ type: Types.ObjectId, default: null })
  approvedBy!: Types.ObjectId | null;

  @Prop({ default: '', trim: true })
  rejectedReason!: string;
}

export const OrderSchema = SchemaFactory.createForClass(Order);
OrderSchema.index({ status: 1 });
OrderSchema.index({ dealerId: 1 });
OrderSchema.index({ salesRepId: 1 });
OrderSchema.index({ marketId: 1 });

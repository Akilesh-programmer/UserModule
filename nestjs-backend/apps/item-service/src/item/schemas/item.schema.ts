import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument, Types } from 'mongoose';

export type ItemDocument = HydratedDocument<Item>;

@Schema({ timestamps: true })
export class Item {
  @Prop({ required: true, trim: true })
  itemName!: string;

  @Prop({ required: true, unique: true, trim: true, uppercase: true })
  itemCode!: string;

  @Prop({ default: '', trim: true })
  description!: string;

  @Prop({ type: Types.ObjectId, ref: 'Category', required: true })
  categoryId!: Types.ObjectId;

  @Prop({ type: Types.ObjectId, ref: 'Group', required: true })
  groupId!: Types.ObjectId;

  @Prop({ type: Types.ObjectId, ref: 'Tax', required: true })
  taxId!: Types.ObjectId;

  @Prop({ type: Types.ObjectId, ref: 'UnitOfMeasure', required: true })
  uomId!: Types.ObjectId;

  @Prop({ type: Types.ObjectId, ref: 'PackingType', required: true })
  packingTypeId!: Types.ObjectId;

  @Prop({ required: true, min: 0 })
  itemPrice!: number;

  @Prop({ required: true, min: 1 })
  itemsPerBox!: number;

  @Prop({ required: true, min: 0 })
  boxRate!: number;

  @Prop({ required: true, min: 0 })
  pieceRate!: number;

  @Prop({ min: 0, default: 0 })
  mrp!: number;

  @Prop({ default: '', trim: true })
  hsnCode!: string;

  @Prop({ default: 0, min: 0 })
  minStockLevel!: number;

  @Prop({ default: 0, min: 0 })
  maxStockLevel!: number;

  @Prop({ default: true })
  isActive!: boolean;
}

export const ItemSchema = SchemaFactory.createForClass(Item);

import { Prop, Schema, SchemaFactory, raw } from '@nestjs/mongoose';
import { HydratedDocument, Types } from 'mongoose';

export type DealerDocument = HydratedDocument<Dealer>;

@Schema({ timestamps: true })
export class Dealer {
  @Prop({ required: true, trim: true })
  dealerName!: string;

  @Prop({ required: true, trim: true })
  phoneNumber!: string;

  @Prop({ default: '', trim: true })
  whatsappNumber!: string;

  @Prop({ default: '', trim: true, lowercase: true })
  email!: string;

  @Prop({ type: Types.ObjectId, ref: 'Manager', default: null })
  managerId!: Types.ObjectId | null;

  @Prop({ type: Types.ObjectId, ref: 'SalesRep', default: null })
  salesRepId!: Types.ObjectId | null;

  @Prop({ type: Types.ObjectId, ref: 'Market', required: true })
  marketId!: Types.ObjectId;

  @Prop(
    raw({
      stateId: { type: Types.ObjectId, ref: 'State', default: null },
      cityId: { type: Types.ObjectId, ref: 'City', default: null },
      pincodeId: { type: Types.ObjectId, ref: 'Pincode', default: null },
      areaId: { type: Types.ObjectId, ref: 'Area', default: null },
      street: { type: String, default: '', trim: true },
    }),
  )
  address!: {
    stateId: Types.ObjectId | null;
    cityId: Types.ObjectId | null;
    pincodeId: Types.ObjectId | null;
    areaId: Types.ObjectId | null;
    street: string;
  };

  @Prop({ default: '', trim: true, uppercase: true })
  panNo!: string;

  @Prop({ default: '', trim: true })
  panName!: string;

  @Prop({ default: '', trim: true })
  gstNo!: string;

  @Prop({ default: '', trim: true })
  aadhaarNo!: string;

  @Prop({ default: '', trim: true })
  drivingLicenseNo!: string;

  @Prop({ default: '', trim: true })
  securityChequeNo!: string;

  @Prop({ type: String, default: null })
  image!: string | null;

  @Prop({ default: true })
  isActive!: boolean;
}

export const DealerSchema = SchemaFactory.createForClass(Dealer);

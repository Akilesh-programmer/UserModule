import { Prop, Schema, SchemaFactory, raw } from '@nestjs/mongoose';
import { HydratedDocument, Types } from 'mongoose';

export type CompanyDocument = HydratedDocument<Company>;

@Schema({ timestamps: true })
export class Company {
  @Prop({ required: true, unique: true, trim: true })
  name!: string;

  @Prop({ default: '', trim: true, uppercase: true })
  code!: string;

  @Prop({ default: '', trim: true })
  contactPerson!: string;

  @Prop({ default: '', trim: true })
  phone!: string;

  @Prop({ default: '', trim: true, lowercase: true })
  email!: string;

  @Prop({ default: '', trim: true, uppercase: true })
  gstNo!: string;

  @Prop({ default: '', trim: true, uppercase: true })
  panNo!: string;

  @Prop(
    raw({
      countryId: { type: Types.ObjectId, ref: 'Country', default: null },
      stateId: { type: Types.ObjectId, ref: 'State', default: null },
      cityId: { type: Types.ObjectId, ref: 'City', default: null },
      pincodeId: { type: Types.ObjectId, ref: 'Pincode', default: null },
      areaId: { type: Types.ObjectId, ref: 'Area', default: null },
      street: { type: String, default: '', trim: true },
    }),
  )
  address!: {
    countryId: Types.ObjectId | null;
    stateId: Types.ObjectId | null;
    cityId: Types.ObjectId | null;
    pincodeId: Types.ObjectId | null;
    areaId: Types.ObjectId | null;
    street: string;
  };

  @Prop({ default: true })
  isActive!: boolean;
}

export const CompanySchema = SchemaFactory.createForClass(Company);

import { Prop, Schema, SchemaFactory, raw } from '@nestjs/mongoose';
import { HydratedDocument, Types } from 'mongoose';

export type ManagerDocument = HydratedDocument<Manager>;

@Schema({ timestamps: true })
export class Manager {
  @Prop({ required: true, trim: true })
  name!: string;

  @Prop({ type: String, default: null })
  profilePic!: string | null;

  @Prop({ default: '', trim: true })
  mobile!: string;

  @Prop({ default: '', trim: true, lowercase: true })
  email!: string;

  @Prop({ default: '', trim: true })
  aadhaarNo!: string;

  @Prop({ trim: true, default: '' })
  drivingLicenseNo!: string;

  @Prop({ default: '', trim: true, uppercase: true })
  panCardNo!: string;

  @Prop({ required: true, unique: true, trim: true })
  username!: string;

  @Prop({ required: true, select: false })
  passwordHash!: string;

  @Prop({ type: Types.ObjectId, required: true })
  userTypeId!: Types.ObjectId;

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

  @Prop({ default: true })
  isActive!: boolean;
}

export const ManagerSchema = SchemaFactory.createForClass(Manager);

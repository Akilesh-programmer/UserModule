import { Prop, Schema, SchemaFactory, raw } from "@nestjs/mongoose";
import { HydratedDocument, Types } from "mongoose";

export type SalesRepDocument = HydratedDocument<SalesRep>;

@Schema({ timestamps: true })
export class SalesRep {
  @Prop({ required: true, trim: true })
  name!: string;

  @Prop({ type: String, default: null })
  profilePic!: string | null;

  @Prop({ default: "", trim: true })
  mobile!: string;

  @Prop({ default: "", trim: true })
  aadhaarNo!: string;

  @Prop({ trim: true })
  drivingLicenseNo!: string;

  @Prop({ default: "", trim: true })
  panCardNo!: string;

  @Prop({ type: Types.ObjectId, ref: "Manager", default: null })
  managerId!: Types.ObjectId | null;

  @Prop({ required: true, unique: true, trim: true })
  username!: string;

  @Prop({ required: true, select: false })
  passwordHash!: string;

  @Prop({ type: Types.ObjectId, required: true })
  userTypeId!: Types.ObjectId;

  @Prop(
    raw({
      street: { type: String, default: "", trim: true },
      city: { type: String, default: "", trim: true },
      state: { type: String, default: "", trim: true },
      pincode: { type: String, default: "", trim: true },
    }),
  )
  address!: { street: string; city: string; state: string; pincode: string };

  @Prop({ default: true })
  isActive!: boolean;
}

export const SalesRepSchema = SchemaFactory.createForClass(SalesRep);

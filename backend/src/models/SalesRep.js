const mongoose = require("mongoose");

const addressSchema = {
  street: { type: String, trim: true },
  city: { type: String, trim: true },
  state: { type: String, trim: true },
  pincode: { type: String, trim: true },
};

const salesRepSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true },
    profilePic: { type: String, default: null },
    mobile: { type: String, trim: true, default: "" },
    aadhaarNo: { type: String, trim: true, default: "" },
    drivingLicenseNo: { type: String, trim: true },
    panCardNo: { type: String, trim: true, default: "" },
    managerId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Manager",
      default: null,
    },
    username: { type: String, required: true, unique: true, trim: true },
    passwordHash: { type: String, required: true },
    userTypeId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "UserType",
      required: true,
    },
    address: addressSchema,
    isActive: { type: Boolean, default: true },
  },
  { timestamps: true },
);

module.exports = mongoose.model("SalesRep", salesRepSchema);

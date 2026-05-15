const mongoose = require("mongoose");

const permissionSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      unique: true,
    },
    permissions: {
      dashboard: { type: Boolean, default: false },
      master: { type: Boolean, default: false },
      userType: { type: Boolean, default: false },
      userCreation: { type: Boolean, default: false },
      userPermission: { type: Boolean, default: false },
    },
  },
  { timestamps: true },
);

module.exports = mongoose.model("Permission", permissionSchema);

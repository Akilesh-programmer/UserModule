require("dotenv").config();
const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");
const connectDB = require("./src/config/db");
const UserType = require("./src/models/UserType");
const User = require("./src/models/User");

async function seed() {
  await connectDB();

  let adminType = await UserType.findOne({ name: "Admin" });
  if (!adminType) {
    adminType = await UserType.create({
      name: "Admin",
      description: "System administrator",
      isActive: true,
    });
    console.log("Created Admin user type");
  }

  const existing = await User.findOne({ username: "akilesh" });
  if (!existing) {
    const password = "Akilesh@123";
    const salt = await bcrypt.genSalt(12);
    const passwordHash = await bcrypt.hash(password, salt);
    await User.create({
      userTypeId: adminType._id,
      username: "akilesh",
      passwordHash,
      description: "Default admin account",
      isActive: true,
    });
    console.log("Created user — username: akilesh, password: Akilesh@123");
  } else {
    console.log("User akilesh already exists");
  }

  await mongoose.disconnect();
  process.exit(0);
}

seed().catch((err) => {
  console.error(err);
  process.exit(1);
});

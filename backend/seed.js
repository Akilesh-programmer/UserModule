require("dotenv").config();
const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");
const connectDB = require("./src/config/db");
const UserType = require("./src/models/UserType");
const User = require("./src/models/User");
const Manager = require("./src/models/Manager");
const SalesRep = require("./src/models/SalesRep");

async function seed() {
  await connectDB();

  const mCount = await Manager.countDocuments();
  const sCount = await SalesRep.countDocuments();
  if (mCount > 0 || sCount > 0) {
    await Manager.deleteMany({});
    await SalesRep.deleteMany({});
    console.log(
      `Cleared ${mCount} old manager(s) and ${sCount} old sales rep(s) — schema changed`,
    );
  }

  const adminType = await UserType.findOne({ name: "Admin" });
  if (adminType) {
    const deleted = await User.deleteMany({
      userTypeId: { $ne: adminType._id },
    });
    if (deleted.deletedCount > 0) {
      console.log(
        `Removed ${deleted.deletedCount} old non-admin user(s) from users collection`,
      );
    }
  }

  let adminTypeDoc = await UserType.findOne({ name: "Admin" });
  if (!adminTypeDoc) {
    adminTypeDoc = await UserType.create({
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
      userTypeId: adminTypeDoc._id,
      username: "akilesh",
      passwordHash,
      description: "Default admin account",
      isActive: true,
    });
    console.log("Created user — username: akilesh, password: Akilesh@123");
  } else {
    console.log("User akilesh already exists");
  }

  for (const { name, description } of [
    { name: "Manager", description: "Field area manager" },
    { name: "Sales Rep", description: "Sales representative" },
  ]) {
    if (!(await UserType.findOne({ name }))) {
      await UserType.create({ name, description, isActive: true });
      console.log(`Created ${name} user type`);
    }
  }

  await mongoose.disconnect();
  process.exit(0);
}

seed().catch((err) => {
  console.error(err);
  process.exit(1);
});

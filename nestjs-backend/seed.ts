import * as mongoose from "mongoose";
import * as bcrypt from "bcryptjs";
import * as dotenv from "dotenv";
import * as path from "path";

dotenv.config({ path: path.resolve(__dirname, ".env") });

// === Inline Schemas (standalone seeder, no NestJS) ===

const UserTypeSchema = new mongoose.Schema(
  {
    name: String,
    description: { type: String, default: "" },
    isActive: { type: Boolean, default: true },
  },
  { timestamps: true },
);

const UserSchema = new mongoose.Schema(
  {
    userTypeId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "UserType",
      required: true,
    },
    username: { type: String, required: true, unique: true },
    passwordHash: { type: String, required: true },
    description: { type: String, default: "" },
    isActive: { type: Boolean, default: true },
  },
  { timestamps: true },
);

const PermissionSchema = new mongoose.Schema(
  {
    userTypeId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "UserType",
      required: true,
      unique: true,
    },
    permissions: { type: Object, default: {} },
  },
  { timestamps: true },
);

// === Build full permissions (all 11 modules × 4 CRUD = 44 flags) ===

function buildFullPermissions() {
  const modules = [
    "userType",
    "userCreation",
    "userPermission",
    "manager",
    "salesRep",
    "category",
    "group",
    "tax",
    "unitOfMeasure",
    "packingType",
    "item",
  ];
  const perms: Record<string, any> = {};
  for (const m of modules) {
    perms[m] = { create: true, read: true, update: true, delete: true };
  }
  return perms;
}

// === Seed ===

async function seed() {
  const uri =
    process.env.MONGO_URI_ADMIN || "mongodb://localhost:27017/usermodule_admin";
  console.log(`\n🌱 Connecting to: ${uri}\n`);

  await mongoose.connect(uri);

  const UserType = mongoose.model("UserType", UserTypeSchema);
  const User = mongoose.model("User", UserSchema);
  const Permission = mongoose.model("Permission", PermissionSchema);

  // 1. Create User Types
  const typesToCreate = [
    { name: "Admin", description: "System administrator with full access" },
    { name: "Manager", description: "Manager user type for field managers" },
    { name: "Sales Rep", description: "Sales representative user type" },
  ];

  const createdTypes: Record<string, any> = {};
  for (const t of typesToCreate) {
    let doc = await UserType.findOne({ name: t.name });
    if (!doc) {
      doc = await UserType.create(t);
      console.log(`✅ Created UserType: ${t.name}`);
    } else {
      console.log(`⏭️  UserType already exists: ${t.name}`);
    }
    createdTypes[t.name] = doc;
  }

  // 2. Create Admin User
  const adminType = createdTypes["Admin"];
  let adminUser = await User.findOne({ username: "akilesh" });
  if (!adminUser) {
    const passwordHash = await bcrypt.hash("Akilesh@123", 12);
    adminUser = await User.create({
      userTypeId: adminType._id,
      username: "akilesh",
      passwordHash,
      description: "Primary admin user",
      isActive: true,
    });
    console.log(`✅ Created Admin user: akilesh (password: Akilesh@123)`);
  } else {
    console.log(`⏭️  Admin user already exists: akilesh`);
  }

  // 3. Set Admin Permissions (all 44 flags = true)
  const fullPermissions = buildFullPermissions();
  await Permission.findOneAndUpdate(
    { userTypeId: adminType._id },
    { permissions: fullPermissions },
    { upsert: true, new: true },
  );
  console.log(
    `✅ Admin permissions set (${Object.keys(fullPermissions).length} modules × 4 CRUD = ${Object.keys(fullPermissions).length * 4} flags)`,
  );

  // Done
  console.log("\n🎉 Seed completed successfully!\n");
  await mongoose.disconnect();
}

seed().catch((err) => {
  console.error("❌ Seed failed:", err);
  process.exit(1);
});

const bcrypt = require("bcryptjs");
const path = require("node:path");
const fs = require("node:fs");
const User = require("../models/User");
const UserType = require("../models/UserType");
const Manager = require("../models/Manager");
const SalesRep = require("../models/SalesRep");

const UPLOADS_DIR = path.join(__dirname, "../../uploads");

const deleteFile = (filename) => {
  if (!filename) return;
  const filePath = path.join(UPLOADS_DIR, filename);
  fs.unlink(filePath, () => {});
};

const getAllUsers = async (req, res) => {
  const [users, managers, salesReps] = await Promise.all([
    User.find().populate("userTypeId", "name").select("-passwordHash").lean(),
    Manager.find()
      .populate("userTypeId", "name")
      .select("-passwordHash")
      .lean(),
    SalesRep.find()
      .populate("userTypeId", "name")
      .select("-passwordHash")
      .lean(),
  ]);

  const result = [
    ...users.map((u) => ({ ...u, _type: "user" })),
    ...managers.map((m) => ({ ...m, _type: "manager" })),
    ...salesReps.map((s) => ({ ...s, _type: "salesRep" })),
  ].sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));

  res.json(result);
};

const getUserById = async (req, res) => {
  const id = req.params.id;
  const record =
    (await User.findById(id)
      .populate("userTypeId", "name")
      .select("-passwordHash")
      .lean()) ||
    (await Manager.findById(id)
      .populate("userTypeId", "name")
      .select("-passwordHash")
      .lean()) ||
    (await SalesRep.findById(id)
      .populate("userTypeId", "name")
      .select("-passwordHash")
      .lean());
  if (!record) return res.status(404).json({ message: "User not found" });
  res.json(record);
};

const createUser = async (req, res) => {
  const { userTypeId, username, password, description, isActive } = req.body;

  const selectedType = await UserType.findById(userTypeId);
  if (!selectedType)
    return res.status(400).json({ message: "Invalid user type" });
  if (selectedType.name === "Admin") {
    return res
      .status(403)
      .json({ message: "Admin user type cannot be assigned manually" });
  }

  const [existingUser, existingManager, existingSalesRep] = await Promise.all([
    User.findOne({ username }),
    Manager.findOne({ username }),
    SalesRep.findOne({ username }),
  ]);
  if (existingUser || existingManager || existingSalesRep) {
    return res.status(409).json({ message: "Username already exists" });
  }

  const passwordHash = await bcrypt.hash(password, 12);
  const activeFlag = isActive !== false && isActive !== "false";

  if (selectedType.name === "Manager") {
    const manager = await Manager.create({
      name: username,
      username,
      passwordHash,
      userTypeId,
      isActive: activeFlag,
    });
    const populated = await Manager.findById(manager._id)
      .populate("userTypeId", "name")
      .select("-passwordHash");
    return res.status(201).json({ ...populated.toObject(), _type: "manager" });
  }

  if (selectedType.name === "Sales Rep") {
    const salesRep = await SalesRep.create({
      name: username,
      username,
      passwordHash,
      userTypeId,
      isActive: activeFlag,
    });
    const populated = await SalesRep.findById(salesRep._id)
      .populate("userTypeId", "name")
      .select("-passwordHash");
    return res.status(201).json({ ...populated.toObject(), _type: "salesRep" });
  }

  const user = await User.create({
    userTypeId,
    username,
    passwordHash,
    description,
    isActive: activeFlag,
  });
  const populated = await User.findById(user._id)
    .populate("userTypeId", "name")
    .select("-passwordHash");
  return res.status(201).json({ ...populated.toObject(), _type: "user" });
};

const updateUser = async (req, res) => {
  const { username, password, description, isActive, userTypeId } = req.body;
  const id = req.params.id;
  const activeFlag = isActive !== false && isActive !== "false";

  const [u1, u2, u3] = await Promise.all([
    User.findOne({ username, _id: { $ne: id } }),
    Manager.findOne({ username, _id: { $ne: id } }),
    SalesRep.findOne({ username, _id: { $ne: id } }),
  ]);
  if (u1 || u2 || u3)
    return res.status(409).json({ message: "Username already exists" });

  const extraUpdate = {};
  if (password) {
    extraUpdate.passwordHash = await bcrypt.hash(password, 12);
  }

  const user = await User.findById(id);
  if (user) {
    const updated = await User.findByIdAndUpdate(
      id,
      {
        userTypeId,
        username,
        description,
        isActive: activeFlag,
        ...extraUpdate,
      },
      { new: true, runValidators: true },
    )
      .populate("userTypeId", "name")
      .select("-passwordHash");
    return res.json({ ...updated.toObject(), _type: "user" });
  }

  const manager = await Manager.findById(id);
  if (manager) {
    const updated = await Manager.findByIdAndUpdate(
      id,
      { username, isActive: activeFlag, ...extraUpdate },
      { new: true, runValidators: true },
    )
      .populate("userTypeId", "name")
      .select("-passwordHash");
    return res.json({ ...updated.toObject(), _type: "manager" });
  }

  const salesRep = await SalesRep.findById(id);
  if (salesRep) {
    const updated = await SalesRep.findByIdAndUpdate(
      id,
      { username, isActive: activeFlag, ...extraUpdate },
      { new: true, runValidators: true },
    )
      .populate("userTypeId", "name")
      .select("-passwordHash");
    return res.json({ ...updated.toObject(), _type: "salesRep" });
  }

  return res.status(404).json({ message: "User not found" });
};

const deleteUser = async (req, res) => {
  const id = req.params.id;

  const user = await User.findByIdAndDelete(id);
  if (user) return res.json({ message: "User deleted successfully" });

  const manager = await Manager.findByIdAndDelete(id);
  if (manager) {
    deleteFile(manager.profilePic);
    return res.json({ message: "User deleted successfully" });
  }

  const salesRep = await SalesRep.findByIdAndDelete(id);
  if (salesRep) {
    deleteFile(salesRep.profilePic);
    return res.json({ message: "User deleted successfully" });
  }

  return res.status(404).json({ message: "User not found" });
};

module.exports = {
  getAllUsers,
  getUserById,
  createUser,
  updateUser,
  deleteUser,
};

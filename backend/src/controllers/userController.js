const bcrypt = require("bcryptjs");
const path = require("node:path");
const fs = require("node:fs");
const User = require("../models/User");
const UserType = require("../models/UserType");
const Manager = require("../models/Manager");
const SalesRep = require("../models/SalesRep");
const catchAsync = require("../utils/catchAsync");
const AppError = require("../utils/appError");

const UPLOADS_DIR = path.join(__dirname, "../../uploads");

const deleteFile = (filename) => {
  if (!filename) return;
  fs.unlink(path.join(UPLOADS_DIR, filename), () => {});
};

const getAllUsers = catchAsync(async (req, res, next) => {
  const [users, managers, salesReps] = await Promise.all([
    User.find().populate("userTypeId", "name").select("-passwordHash").lean(),
    Manager.find().populate("userTypeId", "name").select("-passwordHash").lean(),
    SalesRep.find().populate("userTypeId", "name").select("-passwordHash").lean(),
  ]);

  const result = [
    ...users.map((u) => ({ ...u, _type: "user" })),
    ...managers.map((m) => ({ ...m, _type: "manager" })),
    ...salesReps.map((s) => ({ ...s, _type: "salesRep" })),
  ].sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));

  res.status(200).json({ status: "success", data: { data: result } });
});

const getUserById = catchAsync(async (req, res, next) => {
  const { id } = req.params;
  const record =
    (await User.findById(id).populate("userTypeId", "name").select("-passwordHash").lean()) ||
    (await Manager.findById(id).populate("userTypeId", "name").select("-passwordHash").lean()) ||
    (await SalesRep.findById(id).populate("userTypeId", "name").select("-passwordHash").lean());

  if (!record) return next(new AppError("User not found.", 404));
  res.status(200).json({ status: "success", data: { data: record } });
});

const createUser = catchAsync(async (req, res, next) => {
  const { userTypeId, username, password, description, isActive } = req.body;

  const selectedType = await UserType.findById(userTypeId);
  if (!selectedType) return next(new AppError("Invalid user type.", 400));
  if (selectedType.name === "Admin") {
    return next(new AppError("Admin user type cannot be assigned manually.", 403));
  }

  const [existingUser, existingManager, existingSalesRep] = await Promise.all([
    User.findOne({ username }),
    Manager.findOne({ username }),
    SalesRep.findOne({ username }),
  ]);
  if (existingUser || existingManager || existingSalesRep) {
    return next(new AppError("Username already exists.", 409));
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
    return res.status(201).json({
      status: "success",
      data: { data: { ...populated.toObject(), _type: "manager" } },
    });
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
    return res.status(201).json({
      status: "success",
      data: { data: { ...populated.toObject(), _type: "salesRep" } },
    });
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
  return res.status(201).json({
    status: "success",
    data: { data: { ...populated.toObject(), _type: "user" } },
  });
});

const updateUser = catchAsync(async (req, res, next) => {
  const { username, password, description, isActive, userTypeId } = req.body;
  const { id } = req.params;
  const activeFlag = isActive !== false && isActive !== "false";

  const [u1, u2, u3] = await Promise.all([
    User.findOne({ username, _id: { $ne: id } }),
    Manager.findOne({ username, _id: { $ne: id } }),
    SalesRep.findOne({ username, _id: { $ne: id } }),
  ]);
  if (u1 || u2 || u3) return next(new AppError("Username already exists.", 409));

  const extraUpdate = {};
  if (password) extraUpdate.passwordHash = await bcrypt.hash(password, 12);

  const userDoc = await User.findById(id);
  if (userDoc) {
    const updated = await User.findByIdAndUpdate(
      id,
      { userTypeId, username, description, isActive: activeFlag, ...extraUpdate },
      { new: true, runValidators: true },
    ).populate("userTypeId", "name").select("-passwordHash");
    return res.status(200).json({
      status: "success",
      data: { data: { ...updated.toObject(), _type: "user" } },
    });
  }

  const managerDoc = await Manager.findById(id);
  if (managerDoc) {
    const updated = await Manager.findByIdAndUpdate(
      id,
      { username, isActive: activeFlag, ...extraUpdate },
      { new: true, runValidators: true },
    ).populate("userTypeId", "name").select("-passwordHash");
    return res.status(200).json({
      status: "success",
      data: { data: { ...updated.toObject(), _type: "manager" } },
    });
  }

  const salesRepDoc = await SalesRep.findById(id);
  if (salesRepDoc) {
    const updated = await SalesRep.findByIdAndUpdate(
      id,
      { username, isActive: activeFlag, ...extraUpdate },
      { new: true, runValidators: true },
    ).populate("userTypeId", "name").select("-passwordHash");
    return res.status(200).json({
      status: "success",
      data: { data: { ...updated.toObject(), _type: "salesRep" } },
    });
  }

  return next(new AppError("User not found.", 404));
});

const deleteUser = catchAsync(async (req, res, next) => {
  const { id } = req.params;

  const user = await User.findByIdAndDelete(id);
  if (user) return res.status(204).json({ status: "success", data: null });

  const manager = await Manager.findByIdAndDelete(id);
  if (manager) {
    deleteFile(manager.profilePic);
    return res.status(204).json({ status: "success", data: null });
  }

  const salesRep = await SalesRep.findByIdAndDelete(id);
  if (salesRep) {
    deleteFile(salesRep.profilePic);
    return res.status(204).json({ status: "success", data: null });
  }

  return next(new AppError("User not found.", 404));
});

module.exports = { getAllUsers, getUserById, createUser, updateUser, deleteUser };

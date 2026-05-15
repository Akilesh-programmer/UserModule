const bcrypt = require("bcryptjs");
const User = require("../models/User");
const UserType = require("../models/UserType");
const Permission = require("../models/Permission");

const getAllUsers = async (req, res) => {
  const users = await User.find()
    .populate("userTypeId", "name")
    .select("-passwordHash");
  res.json(users);
};

const getUserById = async (req, res) => {
  const user = await User.findById(req.params.id)
    .populate("userTypeId", "name")
    .select("-passwordHash");
  if (!user) return res.status(404).json({ message: "User not found" });
  res.json(user);
};

const createUser = async (req, res) => {
  const { userTypeId, username, password, description, isActive } = req.body;

  const selectedType = await UserType.findById(userTypeId);
  if (selectedType?.name === "Admin") {
    return res
      .status(403)
      .json({ message: "Admin user type cannot be assigned manually" });
  }

  const existing = await User.findOne({ username });
  if (existing) {
    return res.status(409).json({ message: "Username already exists" });
  }

  const salt = await bcrypt.genSalt(12);
  const passwordHash = await bcrypt.hash(password, salt);

  const user = await User.create({
    userTypeId,
    username,
    passwordHash,
    description,
    isActive,
  });

  res.status(201).json({
    id: user._id,
    username: user.username,
    userTypeId: user.userTypeId,
    isActive: user.isActive,
    description: user.description,
  });
};

const updateUser = async (req, res) => {
  const { userTypeId, username, password, description, isActive } = req.body;

  const existing = await User.findOne({
    username,
    _id: { $ne: req.params.id },
  });
  if (existing) {
    return res.status(409).json({ message: "Username already exists" });
  }

  const updateData = { userTypeId, username, description, isActive };

  if (password) {
    const salt = await bcrypt.genSalt(12);
    updateData.passwordHash = await bcrypt.hash(password, salt);
  }

  const user = await User.findByIdAndUpdate(req.params.id, updateData, {
    new: true,
    runValidators: true,
  })
    .populate("userTypeId", "name")
    .select("-passwordHash");

  if (!user) return res.status(404).json({ message: "User not found" });
  res.json(user);
};

const deleteUser = async (req, res) => {
  const user = await User.findByIdAndDelete(req.params.id);
  if (!user) return res.status(404).json({ message: "User not found" });
  await Permission.findOneAndDelete({ userId: req.params.id });
  res.json({ message: "User deleted successfully" });
};

module.exports = {
  getAllUsers,
  getUserById,
  createUser,
  updateUser,
  deleteUser,
};

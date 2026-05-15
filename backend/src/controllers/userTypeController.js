const UserType = require("../models/UserType");

const getAllUserTypes = async (req, res) => {
  const filter = req.query.activeOnly === "true" ? { isActive: true } : {};
  const userTypes = await UserType.find(filter).sort({ createdAt: -1 });
  res.json(userTypes);
};

const getUserTypeById = async (req, res) => {
  const userType = await UserType.findById(req.params.id);
  if (!userType)
    return res.status(404).json({ message: "User type not found" });
  res.json(userType);
};

const createUserType = async (req, res) => {
  const { name, description, isActive } = req.body;

  const existing = await UserType.findOne({
    name: { $regex: `^${name}$`, $options: "i" },
  });
  if (existing) {
    return res
      .status(409)
      .json({ message: "User type with this name already exists" });
  }

  const userType = await UserType.create({ name, description, isActive });
  res.status(201).json(userType);
};

const updateUserType = async (req, res) => {
  const { name, description, isActive } = req.body;

  const existing = await UserType.findOne({
    name: { $regex: `^${name}$`, $options: "i" },
    _id: { $ne: req.params.id },
  });
  if (existing) {
    return res
      .status(409)
      .json({ message: "User type with this name already exists" });
  }

  const userType = await UserType.findByIdAndUpdate(
    req.params.id,
    { name, description, isActive },
    { new: true, runValidators: true },
  );
  if (!userType)
    return res.status(404).json({ message: "User type not found" });
  res.json(userType);
};

const deleteUserType = async (req, res) => {
  const userType = await UserType.findByIdAndDelete(req.params.id);
  if (!userType)
    return res.status(404).json({ message: "User type not found" });
  res.json({ message: "User type deleted successfully" });
};

module.exports = {
  getAllUserTypes,
  getUserTypeById,
  createUserType,
  updateUserType,
  deleteUserType,
};

const UserType = require("../models/UserType");
const catchAsync = require("../utils/catchAsync");
const AppError = require("../utils/appError");
const factory = require("../utils/handlerFactory");

const getAllUserTypes = catchAsync(async (req, res, next) => {
  const filter = req.query.activeOnly === "true" ? { isActive: true } : {};
  const userTypes = await UserType.find(filter).sort({ createdAt: -1 });
  res.status(200).json({ status: "success", data: { data: userTypes } });
});

const getUserTypeById = factory.getOne(UserType);

const createUserType = catchAsync(async (req, res, next) => {
  const { name, description, isActive } = req.body;

  const existing = await UserType.findOne({
    name: { $regex: `^${name}$`, $options: "i" },
  });
  if (existing) {
    return next(new AppError("User type with this name already exists.", 409));
  }

  const userType = await UserType.create({ name, description, isActive });
  res.status(201).json({ status: "success", data: { data: userType } });
});

const updateUserType = catchAsync(async (req, res, next) => {
  const { name, description, isActive } = req.body;

  const existing = await UserType.findOne({
    name: { $regex: `^${name}$`, $options: "i" },
    _id: { $ne: req.params.id },
  });
  if (existing) {
    return next(new AppError("User type with this name already exists.", 409));
  }

  const userType = await UserType.findByIdAndUpdate(
    req.params.id,
    { name, description, isActive },
    { new: true, runValidators: true },
  );
  if (!userType) return next(new AppError("User type not found.", 404));
  res.status(200).json({ status: "success", data: { data: userType } });
});

const deleteUserType = catchAsync(async (req, res, next) => {
  const userType = await UserType.findByIdAndDelete(req.params.id);
  if (!userType) return next(new AppError("User type not found.", 404));
  res.status(204).json({ status: "success", data: null });
});

module.exports = {
  getAllUserTypes,
  getUserTypeById,
  createUserType,
  updateUserType,
  deleteUserType,
};

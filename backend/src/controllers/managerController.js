const fs = require("node:fs");
const path = require("node:path");
const bcrypt = require("bcryptjs");
const Manager = require("../models/Manager");
const User = require("../models/User");
const SalesRep = require("../models/SalesRep");
const UserType = require("../models/UserType");
const catchAsync = require("../utils/catchAsync");
const AppError = require("../utils/appError");
const factory = require("../utils/handlerFactory");

const UPLOADS_DIR = path.join(__dirname, "../../uploads");

const deleteFile = (filename) => {
  if (!filename) return;
  fs.unlink(path.join(UPLOADS_DIR, filename), () => {});
};

const parseAddress = (raw) => {
  if (!raw) return {};
  try {
    return JSON.parse(raw);
  } catch {
    return null;
  }
};

const getAllManagers = catchAsync(async (req, res, next) => {
  const filter = {};
  if (req.query.activeOnly === "true") filter.isActive = true;
  if (req.query.area)
    filter.area = { $regex: `^${req.query.area}$`, $options: "i" };
  const managers = await Manager.find(filter).sort({ createdAt: -1 });
  res.status(200).json({ status: "success", data: { data: managers } });
});

const getManagerById = factory.getOne(Manager);

const createManager = catchAsync(async (req, res, next) => {
  const address = parseAddress(req.body.address);
  if (address === null) {
    if (req.file) deleteFile(req.file.filename);
    return next(new AppError("Invalid address data.", 400));
  }

  const {
    name,
    mobile,
    aadhaarNo,
    drivingLicenseNo,
    panCardNo,
    area,
    username,
    password,
  } = req.body;
  const isActive = req.body.isActive !== "false";
  const profilePic = req.file ? req.file.filename : null;

  const [existingUser, existingManager, existingSalesRep] = await Promise.all([
    User.findOne({ username }),
    Manager.findOne({ username }),
    SalesRep.findOne({ username }),
  ]);
  if (existingUser || existingManager || existingSalesRep) {
    if (req.file) deleteFile(req.file.filename);
    return next(new AppError("Username already taken.", 409));
  }

  const managerType = await UserType.findOne({ name: "Manager" });
  if (!managerType) {
    if (req.file) deleteFile(req.file.filename);
    return next(
      new AppError("Manager user type not found. Run seed.js first.", 500),
    );
  }
  if (!managerType.isActive) {
    if (req.file) deleteFile(req.file.filename);
    return next(
      new AppError(
        "Manager user type is currently inactive. Enable it in Master › User Type first.",
        403,
      ),
    );
  }

  const passwordHash = await bcrypt.hash(password, 12);
  const manager = await Manager.create({
    name,
    profilePic,
    mobile,
    aadhaarNo,
    drivingLicenseNo,
    panCardNo,
    area,
    username,
    passwordHash,
    userTypeId: managerType._id,
    address,
    isActive,
  });

  res.status(201).json({ status: "success", data: { data: manager } });
});

const updateManager = catchAsync(async (req, res, next) => {
  const manager = await Manager.findById(req.params.id);
  if (!manager) {
    if (req.file) deleteFile(req.file.filename);
    return next(new AppError("Manager not found.", 404));
  }

  const address = parseAddress(req.body.address);
  if (address === null) {
    if (req.file) deleteFile(req.file.filename);
    return next(new AppError("Invalid address data.", 400));
  }

  const { name, mobile, aadhaarNo, drivingLicenseNo, panCardNo, area } =
    req.body;
  const isActive = req.body.isActive !== "false";

  if (req.file) {
    deleteFile(manager.profilePic);
    manager.profilePic = req.file.filename;
  }

  Object.assign(manager, {
    name,
    mobile,
    aadhaarNo,
    drivingLicenseNo,
    panCardNo,
    area,
    address,
    isActive,
  });
  await manager.save();

  res.status(200).json({ status: "success", data: { data: manager } });
});

const deleteManager = catchAsync(async (req, res, next) => {
  const manager = await Manager.findByIdAndDelete(req.params.id);
  if (!manager) return next(new AppError("Manager not found.", 404));
  deleteFile(manager.profilePic);
  res.status(204).json({ status: "success", data: null });
});

module.exports = {
  getAllManagers,
  getManagerById,
  createManager,
  updateManager,
  deleteManager,
};

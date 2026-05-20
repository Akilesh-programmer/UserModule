const fs = require("node:fs");
const path = require("node:path");
const bcrypt = require("bcryptjs");
const SalesRep = require("../models/SalesRep");
const User = require("../models/User");
const Manager = require("../models/Manager");
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

const getAllSalesReps = catchAsync(async (req, res, next) => {
  const salesReps = await SalesRep.find()
    .populate("managerId", "name area")
    .sort({ createdAt: -1 });
  res.status(200).json({ status: "success", data: { data: salesReps } });
});

const getSalesRepById = factory.getOne(SalesRep, { path: "managerId", select: "name area" });

const createSalesRep = catchAsync(async (req, res, next) => {
  const address = parseAddress(req.body.address);
  if (address === null) {
    if (req.file) deleteFile(req.file.filename);
    return next(new AppError("Invalid address data.", 400));
  }

  const { name, mobile, aadhaarNo, drivingLicenseNo, panCardNo, managerId, username, password } = req.body;
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

  const salesRepType = await UserType.findOne({ name: "Sales Rep" });
  if (!salesRepType) {
    if (req.file) deleteFile(req.file.filename);
    return next(new AppError("Sales Rep user type not found. Run seed.js first.", 500));
  }
  if (!salesRepType.isActive) {
    if (req.file) deleteFile(req.file.filename);
    return next(
      new AppError(
        "Sales Rep user type is currently inactive. Enable it in Master â€º User Type first.",
        403,
      ),
    );
  }

  const passwordHash = await bcrypt.hash(password, 12);
  const salesRep = await SalesRep.create({
    name, profilePic, mobile, aadhaarNo, drivingLicenseNo, panCardNo,
    managerId, username, passwordHash, userTypeId: salesRepType._id, address, isActive,
  });

  const populated = await salesRep.populate("managerId", "name area");
  res.status(201).json({ status: "success", data: { data: populated } });
});

const updateSalesRep = catchAsync(async (req, res, next) => {
  const salesRep = await SalesRep.findById(req.params.id);
  if (!salesRep) {
    if (req.file) deleteFile(req.file.filename);
    return next(new AppError("Sales rep not found.", 404));
  }

  const address = parseAddress(req.body.address);
  if (address === null) {
    if (req.file) deleteFile(req.file.filename);
    return next(new AppError("Invalid address data.", 400));
  }

  const { name, mobile, aadhaarNo, drivingLicenseNo, panCardNo, managerId } = req.body;
  const isActive = req.body.isActive !== "false";

  if (req.file) {
    deleteFile(salesRep.profilePic);
    salesRep.profilePic = req.file.filename;
  }

  Object.assign(salesRep, { name, mobile, aadhaarNo, drivingLicenseNo, panCardNo, managerId, address, isActive });
  await salesRep.save();

  const populated = await salesRep.populate("managerId", "name area");
  res.status(200).json({ status: "success", data: { data: populated } });
});

const deleteSalesRep = catchAsync(async (req, res, next) => {
  const salesRep = await SalesRep.findByIdAndDelete(req.params.id);
  if (!salesRep) return next(new AppError("Sales rep not found.", 404));
  deleteFile(salesRep.profilePic);
  res.status(204).json({ status: "success", data: null });
});

module.exports = { getAllSalesReps, getSalesRepById, createSalesRep, updateSalesRep, deleteSalesRep };

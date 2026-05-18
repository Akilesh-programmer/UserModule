const fs = require("node:fs");
const path = require("node:path");
const bcrypt = require("bcryptjs");
const SalesRep = require("../models/SalesRep");
const User = require("../models/User");
const Manager = require("../models/Manager");
const UserType = require("../models/UserType");

const UPLOADS_DIR = path.join(__dirname, "../../uploads");

const deleteFile = (filename) => {
  if (!filename) return;
  const filePath = path.join(UPLOADS_DIR, filename);
  fs.unlink(filePath, () => {});
};

const parseAddress = (raw) => {
  if (!raw) return {};
  try {
    return JSON.parse(raw);
  } catch {
    return null;
  }
};

const getAllSalesReps = async (req, res) => {
  const salesReps = await SalesRep.find()
    .populate("managerId", "name area")
    .sort({ createdAt: -1 });
  res.json(salesReps);
};

const getSalesRepById = async (req, res) => {
  const salesRep = await SalesRep.findById(req.params.id).populate(
    "managerId",
    "name area",
  );
  if (!salesRep)
    return res.status(404).json({ message: "Sales rep not found" });
  res.json(salesRep);
};

const createSalesRep = async (req, res) => {
  const address = parseAddress(req.body.address);
  if (address === null) {
    if (req.file) deleteFile(req.file.filename);
    return res.status(400).json({ message: "Invalid address data" });
  }

  const {
    name,
    mobile,
    aadhaarNo,
    drivingLicenseNo,
    panCardNo,
    managerId,
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
    return res.status(409).json({ message: "Username already taken" });
  }

  const salesRepType = await UserType.findOne({ name: "Sales Rep" });
  if (!salesRepType) {
    if (req.file) deleteFile(req.file.filename);
    return res
      .status(500)
      .json({ message: "Sales Rep user type not found. Run seed.js first." });
  }
  if (!salesRepType.isActive) {
    if (req.file) deleteFile(req.file.filename);
    return res
      .status(403)
      .json({
        message:
          "Sales Rep user type is currently inactive. Enable it in Master › User Type first.",
      });
  }

  const passwordHash = await bcrypt.hash(password, 12);

  const salesRep = await SalesRep.create({
    name,
    profilePic,
    mobile,
    aadhaarNo,
    drivingLicenseNo,
    panCardNo,
    managerId,
    username,
    passwordHash,
    userTypeId: salesRepType._id,
    address,
    isActive,
  });

  const populated = await salesRep.populate("managerId", "name area");
  res.status(201).json(populated);
};

const updateSalesRep = async (req, res) => {
  const salesRep = await SalesRep.findById(req.params.id);
  if (!salesRep) {
    if (req.file) deleteFile(req.file.filename);
    return res.status(404).json({ message: "Sales rep not found" });
  }

  const address = parseAddress(req.body.address);
  if (address === null) {
    if (req.file) deleteFile(req.file.filename);
    return res.status(400).json({ message: "Invalid address data" });
  }

  const { name, mobile, aadhaarNo, drivingLicenseNo, panCardNo, managerId } =
    req.body;
  const isActive = req.body.isActive !== "false";

  if (req.file) {
    deleteFile(salesRep.profilePic);
    salesRep.profilePic = req.file.filename;
  }

  Object.assign(salesRep, {
    name,
    mobile,
    aadhaarNo,
    drivingLicenseNo,
    panCardNo,
    managerId,
    address,
    isActive,
  });
  await salesRep.save();

  const populated = await salesRep.populate("managerId", "name area");
  res.json(populated);
};

const deleteSalesRep = async (req, res) => {
  const salesRep = await SalesRep.findByIdAndDelete(req.params.id);
  if (!salesRep)
    return res.status(404).json({ message: "Sales rep not found" });
  deleteFile(salesRep.profilePic);
  res.json({ message: "Sales rep deleted successfully" });
};

module.exports = {
  getAllSalesReps,
  getSalesRepById,
  createSalesRep,
  updateSalesRep,
  deleteSalesRep,
};

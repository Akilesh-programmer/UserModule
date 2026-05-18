const fs = require("node:fs");
const path = require("node:path");
const bcrypt = require("bcryptjs");
const Manager = require("../models/Manager");
const User = require("../models/User");
const SalesRep = require("../models/SalesRep");
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

const getAllManagers = async (req, res) => {
  const filter = {};
  if (req.query.activeOnly === "true") filter.isActive = true;
  if (req.query.area)
    filter.area = { $regex: `^${req.query.area}$`, $options: "i" };
  const managers = await Manager.find(filter).sort({ createdAt: -1 });
  res.json(managers);
};

const getManagerById = async (req, res) => {
  const manager = await Manager.findById(req.params.id);
  if (!manager) return res.status(404).json({ message: "Manager not found" });
  res.json(manager);
};

const createManager = async (req, res) => {
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
    return res.status(409).json({ message: "Username already taken" });
  }

  const managerType = await UserType.findOne({ name: "Manager" });
  if (!managerType) {
    if (req.file) deleteFile(req.file.filename);
    return res
      .status(500)
      .json({ message: "Manager user type not found. Run seed.js first." });
  }
  if (!managerType.isActive) {
    if (req.file) deleteFile(req.file.filename);
    return res
      .status(403)
      .json({
        message:
          "Manager user type is currently inactive. Enable it in Master › User Type first.",
      });
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

  res.status(201).json(manager);
};

const updateManager = async (req, res) => {
  const manager = await Manager.findById(req.params.id);
  if (!manager) {
    if (req.file) deleteFile(req.file.filename);
    return res.status(404).json({ message: "Manager not found" });
  }

  const address = parseAddress(req.body.address);
  if (address === null) {
    if (req.file) deleteFile(req.file.filename);
    return res.status(400).json({ message: "Invalid address data" });
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

  res.json(manager);
};

const deleteManager = async (req, res) => {
  const manager = await Manager.findByIdAndDelete(req.params.id);
  if (!manager) return res.status(404).json({ message: "Manager not found" });
  deleteFile(manager.profilePic);
  res.json({ message: "Manager deleted successfully" });
};

module.exports = {
  getAllManagers,
  getManagerById,
  createManager,
  updateManager,
  deleteManager,
};

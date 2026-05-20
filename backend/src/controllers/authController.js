const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const User = require("../models/User");
const Manager = require("../models/Manager");
const SalesRep = require("../models/SalesRep");
const Permission = require("../models/Permission");
const catchAsync = require("../utils/catchAsync");
const AppError = require("../utils/appError");

const signToken = (payload) =>
  jwt.sign(payload, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRES_IN || "8h",
  });

const createSendToken = (
  record,
  source,
  permissions,
  isAdmin,
  statusCode,
  req,
  res,
) => {
  const payload = { id: record._id, username: record.username, source };
  const token = signToken(payload);

  const cookieOptions = {
    expires: new Date(
      Date.now() +
        (Number.parseInt(process.env.JWT_COOKIE_EXPIRES_IN, 10) || 1) *
          24 *
          60 *
          60 *
          1000,
    ),
    httpOnly: true,
    secure: req.secure || req.headers["x-forwarded-proto"] === "https",
    sameSite: "lax",
  };

  res.cookie("jwt", token, cookieOptions);

  res.status(statusCode).json({
    status: "success",
    token,
    user: {
      id: record._id,
      username: record.username,
      userType: record.userTypeId?.name,
      isActive: record.isActive,
      isAdmin,
    },
    permissions,
  });
};

// ─── Login ─────────────────────────────────────────────────────────────────
const login = catchAsync(async (req, res, next) => {
  const { username, password } = req.body;

  // Find user across all three collections in parallel
  const [userRecord, managerRecord, salesRepRecord] = await Promise.all([
    User.findOne({ username }).populate("userTypeId"),
    Manager.findOne({ username }).populate("userTypeId"),
    SalesRep.findOne({ username }).populate("userTypeId"),
  ]);

  let record = userRecord || managerRecord || salesRepRecord;
  let source;
  if (userRecord) source = "user";
  else if (managerRecord) source = "manager";
  else if (salesRepRecord) source = "salesRep";
  else source = null;

  if (!record) {
    return next(new AppError("Invalid username or password.", 401));
  }

  if (!record.isActive) {
    return next(
      new AppError(
        "Your account is inactive. Please contact the administrator.",
        403,
      ),
    );
  }

  const isMatch = await bcrypt.compare(password, record.passwordHash);
  if (!isMatch) {
    return next(new AppError("Invalid username or password.", 401));
  }

  const isAdmin = record.userTypeId?.name === "Admin";
  const allTrue = { create: true, read: true, update: true, delete: true };
  const allFalse = { create: false, read: false, update: false, delete: false };

  let permissions;
  if (isAdmin) {
    permissions = {
      userType: { ...allTrue },
      userCreation: { ...allTrue },
      userPermission: { ...allTrue },
      manager: { ...allTrue },
      salesRep: { ...allTrue },
    };
  } else {
    const permDoc = await Permission.findOne({
      userTypeId: record.userTypeId._id,
    });
    permissions = permDoc?.permissions || {
      userType: { ...allFalse },
      userCreation: { ...allFalse },
      userPermission: { ...allFalse },
      manager: { ...allFalse },
      salesRep: { ...allFalse },
    };
  }

  createSendToken(record, source, permissions, isAdmin, 200, req, res);
});

// ─── Logout ────────────────────────────────────────────────────────────────
const logout = (req, res) => {
  res.cookie("jwt", "loggedout", {
    expires: new Date(Date.now() + 10 * 1000),
    httpOnly: true,
  });
  res.status(200).json({ status: "success" });
};

module.exports = { login, logout };

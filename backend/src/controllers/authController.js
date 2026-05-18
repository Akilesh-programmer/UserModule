const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const User = require("../models/User");
const Manager = require("../models/Manager");
const SalesRep = require("../models/SalesRep");
const Permission = require("../models/Permission");

const login = async (req, res) => {
  const { username, password } = req.body;

  let record = null;
  let source = null;

  const userRecord = await User.findOne({ username }).populate("userTypeId");
  if (userRecord) {
    record = userRecord;
    source = "user";
  }

  if (!record) {
    const managerRecord = await Manager.findOne({ username }).populate(
      "userTypeId",
    );
    if (managerRecord) {
      record = managerRecord;
      source = "manager";
    }
  }

  if (!record) {
    const salesRepRecord = await SalesRep.findOne({ username }).populate(
      "userTypeId",
    );
    if (salesRepRecord) {
      record = salesRepRecord;
      source = "salesRep";
    }
  }

  if (!record) {
    return res.status(401).json({ message: "Invalid username or password" });
  }

  if (!record.isActive) {
    return res.status(403).json({
      message: "Your account is inactive. Please contact the administrator.",
    });
  }

  const isMatch = await bcrypt.compare(password, record.passwordHash);
  if (!isMatch) {
    return res.status(401).json({ message: "Invalid username or password" });
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

  const token = jwt.sign(
    { id: record._id, username: record.username, source },
    process.env.JWT_SECRET,
    { expiresIn: "8h" },
  );

  res.json({
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

module.exports = { login };

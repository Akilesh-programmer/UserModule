const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const User = require("../models/User");
const Permission = require("../models/Permission");

const login = async (req, res) => {
  const { username, password } = req.body;

  const user = await User.findOne({ username }).populate("userTypeId");
  if (!user) {
    return res.status(401).json({ message: "Invalid username or password" });
  }

  if (!user.isActive) {
    return res.status(403).json({
      message: "Your account is inactive. Please contact the administrator.",
    });
  }

  const isMatch = await bcrypt.compare(password, user.passwordHash);
  if (!isMatch) {
    return res.status(401).json({ message: "Invalid username or password" });
  }

  const isAdmin = user.userTypeId?.name === "Admin";

  const allTrue = { create: true, read: true, update: true, delete: true };
  const allFalse = { create: false, read: false, update: false, delete: false };

  let permissions;
  if (isAdmin) {
    permissions = {
      userType: { ...allTrue },
      userCreation: { ...allTrue },
      userPermission: { ...allTrue },
    };
  } else {
    const permDoc = await Permission.findOne({ userId: user._id });
    permissions = permDoc?.permissions || {
      userType: { ...allFalse },
      userCreation: { ...allFalse },
      userPermission: { ...allFalse },
    };
  }

  const token = jwt.sign(
    { id: user._id, username: user.username },
    process.env.JWT_SECRET,
    { expiresIn: "8h" },
  );

  res.json({
    token,
    user: {
      id: user._id,
      username: user.username,
      userType: user.userTypeId?.name,
      isActive: user.isActive,
      isAdmin,
    },
    permissions,
  });
};

module.exports = { login };

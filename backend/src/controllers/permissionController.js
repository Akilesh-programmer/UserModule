const Permission = require("../models/Permission");
const User = require("../models/User");

const getPermissionByUser = async (req, res) => {
  const permission = await Permission.findOne({
    userId: req.params.userId,
  }).populate("userId", "username");
  if (!permission) {
    return res.json({
      userId: req.params.userId,
      permissions: {
        dashboard: false,
        master: false,
        userType: false,
        userCreation: false,
        userPermission: false,
      },
    });
  }
  res.json(permission);
};

const savePermission = async (req, res) => {
  const { userId, permissions } = req.body;

  const user = await User.findById(userId);
  if (!user) return res.status(404).json({ message: "User not found" });

  const permission = await Permission.findOneAndUpdate(
    { userId },
    { userId, permissions },
    { new: true, upsert: true, runValidators: true },
  );

  res.json(permission);
};

const getAllPermissions = async (req, res) => {
  const permissions = await Permission.find().populate("userId", "username");
  res.json(permissions);
};

module.exports = { getPermissionByUser, savePermission, getAllPermissions };

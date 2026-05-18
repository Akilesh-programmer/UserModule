const Permission = require("../models/Permission");
const UserType = require("../models/UserType");

const getPermissionByUserType = async (req, res) => {
  const permission = await Permission.findOne({
    userTypeId: req.params.userTypeId,
  }).populate("userTypeId", "name");
  if (!permission) {
    const allFalse = {
      create: false,
      read: false,
      update: false,
      delete: false,
    };
    return res.json({
      userTypeId: req.params.userTypeId,
      permissions: {
        userType: { ...allFalse },
        userCreation: { ...allFalse },
        userPermission: { ...allFalse },
        manager: { ...allFalse },
        salesRep: { ...allFalse },
      },
    });
  }
  res.json(permission);
};

const savePermission = async (req, res) => {
  const { userTypeId, permissions } = req.body;

  const userType = await UserType.findById(userTypeId);
  if (!userType)
    return res.status(404).json({ message: "User type not found" });

  const permission = await Permission.findOneAndUpdate(
    { userTypeId },
    { userTypeId, permissions },
    { new: true, upsert: true, runValidators: true },
  );

  res.json(permission);
};

const getAllPermissions = async (req, res) => {
  const permissions = await Permission.find().populate("userTypeId", "name");
  res.json(permissions);
};

module.exports = { getPermissionByUserType, savePermission, getAllPermissions };

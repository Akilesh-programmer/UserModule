const Permission = require("../models/Permission");
const UserType = require("../models/UserType");
const catchAsync = require("../utils/catchAsync");
const AppError = require("../utils/appError");

const getPermissionByUserType = catchAsync(async (req, res, next) => {
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
    return res.status(200).json({
      status: "success",
      data: {
        data: {
          userTypeId: req.params.userTypeId,
          permissions: {
            userType: { ...allFalse },
            userCreation: { ...allFalse },
            userPermission: { ...allFalse },
            manager: { ...allFalse },
            salesRep: { ...allFalse },
          },
        },
      },
    });
  }

  res.status(200).json({ status: "success", data: { data: permission } });
});

const savePermission = catchAsync(async (req, res, next) => {
  const { userTypeId, permissions } = req.body;

  const userType = await UserType.findById(userTypeId);
  if (!userType) return next(new AppError("User type not found.", 404));

  const permission = await Permission.findOneAndUpdate(
    { userTypeId },
    { userTypeId, permissions },
    { new: true, upsert: true, runValidators: true },
  );

  res.status(200).json({ status: "success", data: { data: permission } });
});

const getAllPermissions = catchAsync(async (req, res, next) => {
  const permissions = await Permission.find().populate("userTypeId", "name");
  res.status(200).json({ status: "success", data: { data: permissions } });
});

module.exports = { getPermissionByUserType, savePermission, getAllPermissions };

const User = require("../models/User");
const Manager = require("../models/Manager");
const SalesRep = require("../models/SalesRep");
const Permission = require("../models/Permission");

const MODULE_LABELS = {
  userType: "User Types",
  userCreation: "User Creation",
  userPermission: "User Permission",
  manager: "Managers",
  salesRep: "Sales Reps",
};

const ACTION_LABELS = {
  read: "view",
  create: "create",
  update: "update",
  delete: "delete",
};

const resolveUser = (id, source) => {
  if (source === "manager")
    return Manager.findById(id).populate("userTypeId").lean();
  if (source === "salesRep")
    return SalesRep.findById(id).populate("userTypeId").lean();
  return User.findById(id).populate("userTypeId").lean();
};

const checkPermission =
  (module, action, { bypassIfActiveOnly = false } = {}) =>
  async (req, res, next) => {
    try {
      if (bypassIfActiveOnly && req.query.activeOnly === "true") return next();

      const userRecord = await resolveUser(req.user.id, req.user.source);
      if (!userRecord)
        return res.status(401).json({ message: "User not found" });

      if (userRecord.userTypeId?.name === "Admin") return next();

      const permDoc = await Permission.findOne({
        userTypeId: userRecord.userTypeId?._id,
      }).lean();

      const allowed = permDoc?.permissions?.[module]?.[action] === true;

      if (!allowed) {
        const moduleLabel = MODULE_LABELS[module] || module;
        const actionLabel = ACTION_LABELS[action] || action;
        return res.status(403).json({
          message: `You don't have permission to ${actionLabel} ${moduleLabel}`,
        });
      }
      next();
    } catch (err) {
      next(err);
    }
  };

module.exports = { checkPermission };

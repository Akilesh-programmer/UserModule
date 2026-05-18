const User = require("../models/User");
const Permission = require("../models/Permission");

const ACTION_MESSAGES = {
  read: "You are not allowed to access this page",
  create: "You are not allowed to create records",
  update: "You are not allowed to update records",
  delete: "You are not allowed to delete records",
};

const checkPermission = (module, action) => async (req, res, next) => {
  try {
    const user = await User.findById(req.user.id).populate("userTypeId").lean();
    if (!user) return res.status(401).json({ message: "User not found" });

    if (user.userTypeId?.name === "Admin") return next();

    const permDoc = await Permission.findOne({ userId: req.user.id }).lean();
    const allowed = permDoc?.permissions?.[module]?.[action] === true;

    if (!allowed) {
      return res.status(403).json({
        message:
          ACTION_MESSAGES[action] ||
          "You are not allowed to perform this action",
      });
    }
    next();
  } catch (err) {
    next(err);
  }
};

module.exports = { checkPermission };

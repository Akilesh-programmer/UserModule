const express = require("express");
const { body } = require("express-validator");
const {
  getAllUserTypes,
  getUserTypeById,
  createUserType,
  updateUserType,
  deleteUserType,
} = require("../controllers/userTypeController");
const { authenticateToken } = require("../middleware/auth");
const { checkPermission } = require("../middleware/permission");
const { validate } = require("../middleware/validate");

const router = express.Router();

const userTypeValidation = [
  body("name").trim().notEmpty().withMessage("Name is required"),
];

router.use(authenticateToken);

// the bypassIfActiveOnly is used for listing out the dropdown options for
// any user, for example userTypes dropdowns will be needed to shown to all 
// users regardless of their permission, so we bypass the permission rules.
// With the dropdown they are not going to do anything.
router.get(
  "/",
  checkPermission("userType", "read", { bypassIfActiveOnly: true }),
  getAllUserTypes,
);
router.get("/:id", checkPermission("userType", "read"), getUserTypeById);
router.post(
  "/",
  checkPermission("userType", "create"),
  userTypeValidation,
  validate,
  createUserType,
);
router.put(
  "/:id",
  checkPermission("userType", "update"),
  userTypeValidation,
  validate,
  updateUserType,
);
router.delete("/:id", checkPermission("userType", "delete"), deleteUserType);

module.exports = router;

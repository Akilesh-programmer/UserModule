const express = require("express");
const { body } = require("express-validator");
const {
  getPermissionByUser,
  savePermission,
  getAllPermissions,
} = require("../controllers/permissionController");
const { authenticateToken } = require("../middleware/auth");
const { checkPermission } = require("../middleware/permission");
const { validate } = require("../middleware/validate");

const router = express.Router();

router.use(authenticateToken);

router.get("/", checkPermission("userPermission", "read"), getAllPermissions);
router.get(
  "/:userId",
  checkPermission("userPermission", "read"),
  getPermissionByUser,
);
router.post(
  "/",
  checkPermission("userPermission", "update"),
  [body("userId").notEmpty().withMessage("User ID is required")],
  validate,
  savePermission,
);

module.exports = router;

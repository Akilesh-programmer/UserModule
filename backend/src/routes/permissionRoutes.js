const express = require("express");
const { body } = require("express-validator");
const {
  getPermissionByUserType,
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
  "/:userTypeId",
  checkPermission("userPermission", "read"),
  getPermissionByUserType,
);
router.post(
  "/",
  checkPermission("userPermission", "update"),
  [body("userTypeId").notEmpty().withMessage("userTypeId is required")],
  validate,
  savePermission,
);

module.exports = router;

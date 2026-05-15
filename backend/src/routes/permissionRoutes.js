const express = require("express");
const { body } = require("express-validator");
const {
  getPermissionByUser,
  savePermission,
  getAllPermissions,
} = require("../controllers/permissionController");
const { authenticateToken } = require("../middleware/auth");
const { validate } = require("../middleware/validate");

const router = express.Router();

router.use(authenticateToken);

router.get("/", getAllPermissions);
router.get("/:userId", getPermissionByUser);
router.post(
  "/",
  [body("userId").notEmpty().withMessage("User ID is required")],
  validate,
  savePermission,
);

module.exports = router;

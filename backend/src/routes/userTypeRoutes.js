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

router.get(
  "/",
  (req, res, next) => {
    if (req.query.activeOnly === "true") return next();
    checkPermission("userType", "read", [
      ["userPermission", "read"],
      ["userPermission", "update"],
    ])(req, res, next);
  },
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

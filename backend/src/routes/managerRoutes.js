const express = require("express");
const { body } = require("express-validator");
const {
  getAllManagers,
  getManagerById,
  createManager,
  updateManager,
  deleteManager,
} = require("../controllers/managerController");
const { authenticateToken } = require("../middleware/auth");
const { checkPermission } = require("../middleware/permission");
const { validate } = require("../middleware/validate");
const upload = require("../middleware/upload");

const router = express.Router();

const managerValidation = [
  body("name").trim().notEmpty().withMessage("Name is required"),
  body("mobile")
    .trim()
    .matches(/^\d{10}$/)
    .withMessage("Mobile must be 10 digits"),
  body("aadhaarNo")
    .trim()
    .matches(/^\d{12}$/)
    .withMessage("Aadhaar must be 12 digits"),
  body("panCardNo")
    .trim()
    .matches(/^[A-Z]{5}\d{4}[A-Z]$/)
    .withMessage("Invalid PAN card format"),
  body("area").trim().notEmpty().withMessage("Area is required"),
];

const createManagerValidation = [
  ...managerValidation,
  body("username").trim().notEmpty().withMessage("Username is required"),
  body("password")
    .notEmpty()
    .withMessage("Password is required")
    .isLength({ min: 8 })
    .withMessage("Password must be at least 8 characters")
    .matches(/[A-Z]/)
    .withMessage("Password must contain at least one uppercase letter")
    .matches(/\d/)
    .withMessage("Password must contain at least one number"),
];

router.use(authenticateToken);

router.get(
  "/",
  checkPermission("manager", "read", { bypassIfActiveOnly: true }),
  getAllManagers,
);
router.get("/:id", checkPermission("manager", "read"), getManagerById);
router.post(
  "/",
  checkPermission("manager", "create"),
  upload.single("profilePic"),
  createManagerValidation,
  validate,
  createManager,
);
router.put(
  "/:id",
  checkPermission("manager", "update"),
  upload.single("profilePic"),
  managerValidation,
  validate,
  updateManager,
);
router.delete("/:id", checkPermission("manager", "delete"), deleteManager);

module.exports = router;

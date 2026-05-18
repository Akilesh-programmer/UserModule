const express = require("express");
const { body } = require("express-validator");
const {
  getAllSalesReps,
  getSalesRepById,
  createSalesRep,
  updateSalesRep,
  deleteSalesRep,
} = require("../controllers/salesRepController");
const { authenticateToken } = require("../middleware/auth");
const { checkPermission } = require("../middleware/permission");
const { validate } = require("../middleware/validate");
const upload = require("../middleware/upload");

const router = express.Router();

const salesRepValidation = [
  body("name").trim().notEmpty().withMessage("Name is required"),
  body("mobile")
    .trim()
    .matches(/^[0-9]{10}$/)
    .withMessage("Mobile must be 10 digits"),
  body("aadhaarNo")
    .trim()
    .matches(/^[0-9]{12}$/)
    .withMessage("Aadhaar must be 12 digits"),
  body("panCardNo")
    .trim()
    .matches(/^[A-Z]{5}[0-9]{4}[A-Z]$/)
    .withMessage("Invalid PAN card format"),
  body("managerId").trim().notEmpty().withMessage("Manager is required"),
];

const createSalesRepValidation = [
  ...salesRepValidation,
  body("username").trim().notEmpty().withMessage("Username is required"),
  body("password")
    .notEmpty()
    .withMessage("Password is required")
    .isLength({ min: 8 })
    .withMessage("Password must be at least 8 characters")
    .matches(/[A-Z]/)
    .withMessage("Password must contain at least one uppercase letter")
    .matches(/[0-9]/)
    .withMessage("Password must contain at least one number"),
];

router.use(authenticateToken);

router.get("/", checkPermission("salesRep", "read"), getAllSalesReps);
router.get("/:id", checkPermission("salesRep", "read"), getSalesRepById);
router.post(
  "/",
  checkPermission("salesRep", "create"),
  upload.single("profilePic"),
  createSalesRepValidation,
  validate,
  createSalesRep,
);
router.put(
  "/:id",
  checkPermission("salesRep", "update"),
  upload.single("profilePic"),
  salesRepValidation,
  validate,
  updateSalesRep,
);
router.delete("/:id", checkPermission("salesRep", "delete"), deleteSalesRep);

module.exports = router;

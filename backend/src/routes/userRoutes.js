const express = require("express");
const { body } = require("express-validator");
const {
  getAllUsers,
  getUserById,
  createUser,
  updateUser,
  deleteUser,
} = require("../controllers/userController");
const { authenticateToken } = require("../middleware/auth");
const { checkPermission } = require("../middleware/permission");
const { validate } = require("../middleware/validate");

const router = express.Router();

const createUserValidation = [
  body("userTypeId").notEmpty().withMessage("User type is required"),
  body("username").trim().notEmpty().withMessage("Username is required"),
  body("password")
    .isLength({ min: 8 })
    .withMessage("Password must be at least 8 characters")
    .matches(/[A-Z]/)
    .withMessage("Password must contain at least one uppercase letter")
    .matches(/\d/)
    .withMessage("Password must contain at least one number"),
  body("confirmPassword").custom((value, { req }) => {
    if (value !== req.body.password) throw new Error("Passwords do not match");
    return true;
  }),
];

const updateUserValidation = [
  body("userTypeId").notEmpty().withMessage("User type is required"),
  body("username").trim().notEmpty().withMessage("Username is required"),
  body("password")
    .optional({ checkFalsy: true })
    .isLength({ min: 8 })
    .withMessage("Password must be at least 8 characters")
    .matches(/[A-Z]/)
    .withMessage("Password must contain at least one uppercase letter")
    .matches(/\d/)
    .withMessage("Password must contain at least one number"),
  body("confirmPassword").custom((value, { req }) => {
    if (req.body.password && value !== req.body.password)
      throw new Error("Passwords do not match");
    return true;
  }),
];

router.use(authenticateToken);

// permissionsView=true is used by UserPermissionPage which only needs userPermission.read
router.get(
  "/",
  (req, res, next) => {
    const permModule =
      req.query.permissionsView === "true" ? "userPermission" : "userCreation";
    checkPermission(permModule, "read")(req, res, next);
  },
  getAllUsers,
);
router.get("/:id", checkPermission("userCreation", "read"), getUserById);
router.post(
  "/",
  checkPermission("userCreation", "create"),
  createUserValidation,
  validate,
  createUser,
);
router.put(
  "/:id",
  checkPermission("userCreation", "update"),
  updateUserValidation,
  validate,
  updateUser,
);
router.delete("/:id", checkPermission("userCreation", "delete"), deleteUser);

module.exports = router;

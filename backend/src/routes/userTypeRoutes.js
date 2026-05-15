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
const { validate } = require("../middleware/validate");

const router = express.Router();

const userTypeValidation = [
  body("name").trim().notEmpty().withMessage("Name is required"),
];

router.use(authenticateToken);

router.get("/", getAllUserTypes);
router.get("/:id", getUserTypeById);
router.post("/", userTypeValidation, validate, createUserType);
router.put("/:id", userTypeValidation, validate, updateUserType);
router.delete("/:id", deleteUserType);

module.exports = router;

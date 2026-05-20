const express = require("express");
const { body } = require("express-validator");
const { login, logout } = require("../controllers/authController");
const { validate } = require("../middleware/validate");

const router = express.Router();

router.post(
  "/login",
  [
    body("username").trim().notEmpty().withMessage("Username is required"),
    body("password").notEmpty().withMessage("Password is required"),
  ],
  validate,
  login,
);

router.post("/logout", logout);

module.exports = router;

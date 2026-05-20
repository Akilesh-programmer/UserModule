const path = require("node:path");
const express = require("express");
const cors = require("cors");
const helmet = require("helmet");
const morgan = require("morgan");
const rateLimit = require("express-rate-limit");
const mongoSanitize = require("express-mongo-sanitize");
const cookieParser = require("cookie-parser");
const compression = require("compression");

const AppError = require("./utils/appError");
const globalErrorHandler = require("./controllers/errorController");

const authRoutes = require("./routes/authRoutes");
const userTypeRoutes = require("./routes/userTypeRoutes");
const userRoutes = require("./routes/userRoutes");
const permissionRoutes = require("./routes/permissionRoutes");
const managerRoutes = require("./routes/managerRoutes");
const salesRepRoutes = require("./routes/salesRepRoutes");

const app = express();

// ─── Security headers ──────────────────────────────────────────────────────
app.use(helmet());

// ─── CORS ──────────────────────────────────────────────────────────────────
app.use(
  cors({
    origin: process.env.CLIENT_ORIGIN || "http://localhost:5173",
    credentials: true, // allow cookies
  }),
);
app.options("*", cors());

// ─── Development logging ───────────────────────────────────────────────────
if (process.env.NODE_ENV === "development") {
  app.use(morgan("dev"));
}

// ─── Rate limiting ─────────────────────────────────────────────────────────
const limiter = rateLimit({
  max: 200,
  windowMs: 60 * 60 * 1000, // 1 hour
  message: "Too many requests from this IP, please try again in an hour.",
  standardHeaders: true,
  legacyHeaders: false,
});
app.use("/api", limiter);

// ─── Body parsing ──────────────────────────────────────────────────────────
app.use(express.json({ limit: "10kb" }));
app.use(express.urlencoded({ extended: true, limit: "10kb" }));
app.use(cookieParser());

// ─── Data sanitization against NoSQL injection ─────────────────────────────
app.use(mongoSanitize());

// ─── Compression ───────────────────────────────────────────────────────────
app.use(compression());

// ─── Static files (uploaded images) ───────────────────────────────────────
app.use("/uploads", express.static(path.join(__dirname, "../uploads")));

// ─── API routes (v1) ───────────────────────────────────────────────────────
app.use("/api/v1/auth", authRoutes);
app.use("/api/v1/user-types", userTypeRoutes);
app.use("/api/v1/users", userRoutes);
app.use("/api/v1/permissions", permissionRoutes);
app.use("/api/v1/managers", managerRoutes);
app.use("/api/v1/sales-reps", salesRepRoutes);

// ─── 404 handler ───────────────────────────────────────────────────────────
app.all("*", (req, res, next) => {
  next(new AppError(`Can't find ${req.originalUrl} on this server.`, 404));
});

// ─── Global error handler ──────────────────────────────────────────────────
app.use(globalErrorHandler);

module.exports = app;

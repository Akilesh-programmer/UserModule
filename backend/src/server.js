process.on("uncaughtException", (err) => {
  console.error("UNCAUGHT EXCEPTION! Shutting down...");
  console.error(err.name, err.message);
  process.exit(1);
});

require("dotenv").config();
const mongoose = require("mongoose");
const app = require("./app");

const DB = process.env.MONGO_URI || "mongodb://localhost:27017/usermodule";

mongoose.connect(DB).then(() => console.log("MongoDB connected successfully."));

const PORT = process.env.PORT || 5000;
const server = app.listen(PORT, () =>
  console.log(
    `Server running on port ${PORT} in ${process.env.NODE_ENV || "development"} mode.`,
  ),
);

process.on("unhandledRejection", (err) => {
  console.error("UNHANDLED REJECTION! Shutting down...");
  console.error(err.name, err.message);
  server.close(() => process.exit(1));
});

process.on("SIGTERM", () => {
  console.log("SIGTERM received. Shutting down gracefully.");
  server.close(() => console.log("Process terminated."));
});

const express = require("express");
const cors = require("cors");
const rateLimit = require("express-rate-limit");
require("dotenv").config();

const profileRoutes = require("./routes/profileRoutes");
const { errorHandler, notFoundHandler } = require("./middleware/errorHandler");

const app = express();

app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

const limiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 100,
  message: {
    success: false,
    message: "Too many requests from this IP. Try again after 15 minutes.",
  },
  standardHeaders: true,
  legacyHeaders: false,
});
app.use("/api/", limiter);

app.get("/health", (req, res) => {
  res.status(200).json({
    success: true,
    message: "GitHub Profile Analyzer API is running!",
    version: "1.0.0",
    timestamp: new Date().toISOString(),
    environment: process.env.NODE_ENV || "development",
  });
});

app.get("/", (req, res) => {
  res.status(200).json({
    success: true,
    message: "Welcome to GitHub Profile Analyzer API",
    documentation: {
      analyze_profile: "POST /api/analyze/:username",
      get_all_profiles: "GET /api/profiles",
      get_single_profile: "GET /api/profiles/:username",
      delete_profile: "DELETE /api/profiles/:username",
      compare_profiles: "GET /api/compare?users=user1,user2",
      database_stats: "GET /api/stats",
      health_check: "GET /health",
    },
  });
});

app.use("/api", profileRoutes);
app.use(notFoundHandler);
app.use(errorHandler);

module.exports = app;
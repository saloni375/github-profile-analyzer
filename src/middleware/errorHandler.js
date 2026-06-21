const errorHandler = (err, req, res, next) => {
  console.error("🔴 Unhandled Error:", err.stack);

  let statusCode = err.statusCode || 500;
  let message = err.message || "Internal Server Error";

  if (err.code === "ER_DUP_ENTRY") {
    statusCode = 409;
    message = "Duplicate entry — this data already exists";
  }

  if (err.code === "ECONNREFUSED") {
    statusCode = 503;
    message = "Database connection failed. Is MySQL running?";
  }

  res.status(statusCode).json({
    success: false,
    message,
    ...(process.env.NODE_ENV === "development" && { stack: err.stack }),
  });
};

const notFoundHandler = (req, res) => {
  res.status(404).json({
    success: false,
    message: `Route '${req.method} ${req.originalUrl}' not found`,
    available_routes: [
      "POST   /api/analyze/:username",
      "GET    /api/profiles",
      "GET    /api/profiles/:username",
      "DELETE /api/profiles/:username",
      "GET    /api/compare?users=u1,u2",
      "GET    /api/stats",
      "GET    /health",
    ],
  });
};

module.exports = { errorHandler, notFoundHandler };
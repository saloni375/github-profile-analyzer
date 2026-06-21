const app = require("./app");
const initializeDatabase = require("./config/initDb");
require("dotenv").config();

const PORT = process.env.PORT || 3000;

(async () => {
  try {
    console.log("🔧 Initializing database...");
    await initializeDatabase();

    app.listen(PORT, () => {
      console.log("================================================");
      console.log(`🚀 Server running on port ${PORT}`);
      console.log(`📡 Local URL: http://localhost:${PORT}`);
      console.log(`🏥 Health: http://localhost:${PORT}/health`);
      console.log(`📊 Stats:  http://localhost:${PORT}/api/stats`);
      console.log("================================================");
      console.log("Available API Endpoints:");
      console.log(`  POST   /api/analyze/:username`);
      console.log(`  GET    /api/profiles`);
      console.log(`  GET    /api/profiles/:username`);
      console.log(`  DELETE /api/profiles/:username`);
      console.log(`  GET    /api/compare?users=u1,u2`);
      console.log(`  GET    /api/stats`);
      console.log("================================================");
    });
  } catch (error) {
    console.error("❌ Failed to start server:", error.message);
    console.error("💡 Tip: Check your .env file and MySQL connection");
    process.exit(1);
  }
})();
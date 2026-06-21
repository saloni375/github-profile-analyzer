const db = require("./db");

const initializeDatabase = async () => {
  try {
    await db.query(`
      CREATE TABLE IF NOT EXISTS github_profiles (
        id              INT AUTO_INCREMENT PRIMARY KEY,
        username        VARCHAR(100) NOT NULL UNIQUE,
        name            VARCHAR(200),
        bio             TEXT,
        avatar_url      VARCHAR(500),
        github_url      VARCHAR(500),
        location        VARCHAR(200),
        company         VARCHAR(200),
        blog            VARCHAR(500),
        email           VARCHAR(200),
        twitter_handle  VARCHAR(100),
        public_repos    INT DEFAULT 0,
        public_gists    INT DEFAULT 0,
        followers       INT DEFAULT 0,
        following       INT DEFAULT 0,
        total_stars     INT DEFAULT 0,
        github_created_at  DATETIME,
        account_age_days   INT DEFAULT 0,
        is_hireable        BOOLEAN DEFAULT FALSE,
        analyzed_at     DATETIME DEFAULT CURRENT_TIMESTAMP,
        updated_at      DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
      )
    `);

    await db.query(`
      CREATE TABLE IF NOT EXISTS github_repos (
        id            INT AUTO_INCREMENT PRIMARY KEY,
        profile_id    INT NOT NULL,
        repo_name     VARCHAR(200) NOT NULL,
        description   TEXT,
        language      VARCHAR(100),
        stars         INT DEFAULT 0,
        forks         INT DEFAULT 0,
        watchers      INT DEFAULT 0,
        is_fork       BOOLEAN DEFAULT FALSE,
        repo_url      VARCHAR(500),
        created_at    DATETIME,
        updated_at    DATETIME,
        FOREIGN KEY (profile_id) REFERENCES github_profiles(id) ON DELETE CASCADE
      )
    `);

    await db.query(`
      CREATE TABLE IF NOT EXISTS language_stats (
        id           INT AUTO_INCREMENT PRIMARY KEY,
        profile_id   INT NOT NULL,
        language     VARCHAR(100) NOT NULL,
        repo_count   INT DEFAULT 0,
        FOREIGN KEY (profile_id) REFERENCES github_profiles(id) ON DELETE CASCADE
      )
    `);

    console.log("✅ Database tables ready!");
  } catch (error) {
    console.error("❌ Database initialization failed:", error.message);
    process.exit(1);
  }
};

module.exports = initializeDatabase;
const db = require("../config/db");
const {
  fetchUserProfile,
  fetchUserRepos,
  calculateInsights,
} = require("../utils/githubService");

// GitHub date format fix karne ke liye
const formatDate = (dateStr) => {
  if (!dateStr) return null;
  return new Date(dateStr).toISOString().slice(0, 19).replace('T', ' ');
};

const analyzeProfile = async (req, res) => {
  const { username } = req.params;
  try {
    console.log(`🔍 Fetching GitHub data for: ${username}`);
    const [profileData, reposData] = await Promise.all([
      fetchUserProfile(username),
      fetchUserRepos(username),
    ]);

    const { totalStars, languageStats, accountAgeDays, topRepos } =
      calculateInsights(profileData, reposData);

    const [existingRows] = await db.query(
      "SELECT id FROM github_profiles WHERE username = ?",
      [username.toLowerCase()]
    );

    let profileId;
    let isNewProfile = false;

    if (existingRows.length === 0) {
      isNewProfile = true;
      const [insertResult] = await db.query(
        `INSERT INTO github_profiles 
          (username, name, bio, avatar_url, github_url, location, company, 
           blog, email, twitter_handle, public_repos, public_gists, 
           followers, following, total_stars, github_created_at, 
           account_age_days, is_hireable)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
        [
          profileData.login?.toLowerCase(),
          profileData.name,
          profileData.bio,
          profileData.avatar_url,
          profileData.html_url,
          profileData.location,
          profileData.company,
          profileData.blog,
          profileData.email,
          profileData.twitter_username,
          profileData.public_repos,
          profileData.public_gists,
          profileData.followers,
          profileData.following,
          totalStars,
          formatDate(profileData.created_at),
          accountAgeDays,
          profileData.hireable || false,
        ]
      );
      profileId = insertResult.insertId;
      console.log(`✅ New profile saved with ID: ${profileId}`);
    } else {
      profileId = existingRows[0].id;
      await db.query(
        `UPDATE github_profiles SET
          name = ?, bio = ?, avatar_url = ?, location = ?, company = ?,
          blog = ?, email = ?, twitter_handle = ?, public_repos = ?,
          public_gists = ?, followers = ?, following = ?, total_stars = ?,
          account_age_days = ?, is_hireable = ?, analyzed_at = NOW()
         WHERE id = ?`,
        [
          profileData.name,
          profileData.bio,
          profileData.avatar_url,
          profileData.location,
          profileData.company,
          profileData.blog,
          profileData.email,
          profileData.twitter_username,
          profileData.public_repos,
          profileData.public_gists,
          profileData.followers,
          profileData.following,
          totalStars,
          accountAgeDays,
          profileData.hireable || false,
          profileId,
        ]
      );
      await db.query("DELETE FROM github_repos WHERE profile_id = ?", [profileId]);
      await db.query("DELETE FROM language_stats WHERE profile_id = ?", [profileId]);
      console.log(`🔄 Profile updated for: ${username}`);
    }

    if (topRepos.length > 0) {
      const repoValues = topRepos.map((repo) => [
        profileId, repo.repo_name, repo.description, repo.language,
        repo.stars, repo.forks, repo.watchers, repo.is_fork,
        repo.repo_url,  formatDate(repo.created_at),
formatDate(repo.updated_at),
      ]);
      await db.query(
        `INSERT INTO github_repos 
          (profile_id, repo_name, description, language, stars, forks, 
           watchers, is_fork, repo_url, created_at, updated_at)
         VALUES ?`,
        [repoValues]
      );
    }

    if (languageStats.length > 0) {
      const langValues = languageStats.map((l) => [
        profileId, l.language, l.repo_count,
      ]);
      await db.query(
        "INSERT INTO language_stats (profile_id, language, repo_count) VALUES ?",
        [langValues]
      );
    }

    return res.status(isNewProfile ? 201 : 200).json({
      success: true,
      message: isNewProfile
        ? `Profile analyzed and saved for '${username}'`
        : `Profile re-analyzed and updated for '${username}'`,
      data: {
        profile_id: profileId,
        username: profileData.login,
        name: profileData.name,
        followers: profileData.followers,
        public_repos: profileData.public_repos,
        total_stars: totalStars,
        top_language: languageStats[0]?.language || "N/A",
        account_age_days: accountAgeDays,
        analyzed_at: new Date().toISOString(),
      },
    });
  } catch (error) {
    console.error(`❌ Error analyzing ${username}:`, error.message);
    const statusCode = error.message.includes("not found")
      ? 404
      : error.message.includes("rate limit")
      ? 429
      : 500;
    return res.status(statusCode).json({
      success: false,
      message: error.message,
    });
  }
};

const getAllProfiles = async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const search = req.query.search || "";
    const offset = (page - 1) * limit;

    const [countResult] = await db.query(
      `SELECT COUNT(*) as total FROM github_profiles 
       WHERE username LIKE ? OR name LIKE ?`,
      [`%${search}%`, `%${search}%`]
    );
    const total = countResult[0].total;

    const [profiles] = await db.query(
      `SELECT id, username, name, bio, avatar_url, github_url, location,
        public_repos, followers, following, total_stars,
        account_age_days, is_hireable, analyzed_at
       FROM github_profiles
       WHERE username LIKE ? OR name LIKE ?
       ORDER BY analyzed_at DESC
       LIMIT ? OFFSET ?`,
      [`%${search}%`, `%${search}%`, limit, offset]
    );

    return res.status(200).json({
      success: true,
      message: `Found ${profiles.length} profiles`,
      pagination: {
        total,
        page,
        limit,
        total_pages: Math.ceil(total / limit),
        has_next: page < Math.ceil(total / limit),
        has_prev: page > 1,
      },
      data: profiles,
    });
  } catch (error) {
    console.error("❌ Error fetching profiles:", error.message);
    return res.status(500).json({ success: false, message: error.message });
  }
};

const getProfileByUsername = async (req, res) => {
  const { username } = req.params;
  try {
    const [profiles] = await db.query(
      "SELECT * FROM github_profiles WHERE username = ?",
      [username.toLowerCase()]
    );

    if (profiles.length === 0) {
      return res.status(404).json({
        success: false,
        message: `Profile '${username}' not found. Analyze it first using POST /api/analyze/${username}`,
      });
    }

    const profile = profiles[0];

    const [repos] = await db.query(
      "SELECT * FROM github_repos WHERE profile_id = ? ORDER BY stars DESC",
      [profile.id]
    );

    const [languages] = await db.query(
      "SELECT language, repo_count FROM language_stats WHERE profile_id = ? ORDER BY repo_count DESC",
      [profile.id]
    );

    return res.status(200).json({
      success: true,
      data: {
        ...profile,
        top_repos: repos,
        language_stats: languages,
      },
    });
  } catch (error) {
    console.error(`❌ Error fetching ${username}:`, error.message);
    return res.status(500).json({ success: false, message: error.message });
  }
};

const deleteProfile = async (req, res) => {
  const { username } = req.params;
  try {
    const [result] = await db.query(
      "DELETE FROM github_profiles WHERE username = ?",
      [username.toLowerCase()]
    );

    if (result.affectedRows === 0) {
      return res.status(404).json({
        success: false,
        message: `Profile '${username}' not found`,
      });
    }

    return res.status(200).json({
      success: true,
      message: `Profile '${username}' deleted successfully`,
    });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

const compareProfiles = async (req, res) => {
  const { users } = req.query;

  if (!users) {
    return res.status(400).json({
      success: false,
      message: "Provide users query param. Example: ?users=user1,user2",
    });
  }

  const usernameList = users.split(",").map((u) => u.trim().toLowerCase());

  if (usernameList.length < 2) {
    return res.status(400).json({
      success: false,
      message: "Provide at least 2 usernames to compare",
    });
  }

  try {
    const placeholders = usernameList.map(() => "?").join(",");
    const [profiles] = await db.query(
      `SELECT username, name, avatar_url, public_repos, followers, 
              following, total_stars, account_age_days, is_hireable
       FROM github_profiles 
       WHERE username IN (${placeholders})`,
      usernameList
    );

    const foundUsers = profiles.map((p) => p.username);
    const missingUsers = usernameList.filter((u) => !foundUsers.includes(u));

    return res.status(200).json({
      success: true,
      message:
        missingUsers.length > 0
          ? `Comparison done. Missing users: ${missingUsers.join(", ")}`
          : "Comparison done",
      data: profiles,
      ...(missingUsers.length > 0 && { missing_users: missingUsers }),
    });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

const getStats = async (req, res) => {
  try {
    const [[summary]] = await db.query(`
      SELECT
        COUNT(*) as total_profiles,
        SUM(followers) as total_followers_tracked,
        SUM(public_repos) as total_repos_tracked,
        SUM(total_stars) as total_stars_tracked,
        AVG(followers) as avg_followers,
        MAX(followers) as max_followers,
        MIN(followers) as min_followers
      FROM github_profiles
    `);

    const [topByStars] = await db.query(
      `SELECT username, name, total_stars, followers 
       FROM github_profiles ORDER BY total_stars DESC LIMIT 5`
    );

    const [topByFollowers] = await db.query(
      `SELECT username, name, followers, total_stars 
       FROM github_profiles ORDER BY followers DESC LIMIT 5`
    );

    const [popularLanguages] = await db.query(`
      SELECT language, SUM(repo_count) as total_usage
      FROM language_stats
      GROUP BY language
      ORDER BY total_usage DESC
      LIMIT 10
    `);

    return res.status(200).json({
      success: true,
      data: {
        summary,
        top_by_stars: topByStars,
        top_by_followers: topByFollowers,
        popular_languages: popularLanguages,
      },
    });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

module.exports = {
  analyzeProfile,
  getAllProfiles,
  getProfileByUsername,
  deleteProfile,
  compareProfiles,
  getStats,
};
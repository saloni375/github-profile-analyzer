# 🔍 GitHub Profile Analyzer API

**Made by:** Saloni
**GitHub:** https://github.com/saloni375/github-profile-analyzer
**Live API:** github-profile-analyzer-production-4e11.up.railway.app

A backend REST API that fetches GitHub user profile data, calculates insights, and stores them in a MySQL database.

**Built with:** Node.js · Express.js · MySQL · GitHub REST API

---

## 📁 Project Structure

    github-analyzer/
    ├── src/
    │   ├── index.js
    │   ├── app.js
    │   ├── config/
    │   │   ├── db.js
    │   │   └── initDb.js
    │   ├── controllers/
    │   │   └── profileController.js
    │   ├── routes/
    │   │   └── profileRoutes.js
    │   ├── middleware/
    │   │   └── errorHandler.js
    │   └── utils/
    │       └── githubService.js
    ├── postman/
    │   └── GitHub_Analyzer.postman_collection.json
    ├── schema.sql
    ├── .env.example
    ├── package.json
    └── README.md

---

## ⚙️ Local Setup

### Step 1 — Clone the Repository

    git clone https://github.com/saloni375/github-profile-analyzer.git
    cd github-profile-analyzer

### Step 2 — Install Dependencies

    npm install

### Step 3 — Setup MySQL Database

Open MySQL Workbench and run:

    CREATE DATABASE github_analyzer;

### Step 4 — Setup Environment Variables

    cp .env.example .env

Edit .env file:

    PORT=3000
    DB_HOST=localhost
    DB_PORT=3306
    DB_USER=root
    DB_PASSWORD=your_mysql_password
    DB_NAME=github_analyzer
    GITHUB_TOKEN=your_github_token

### Step 5 — Start Server

    npm run dev

Server starts at: http://localhost:3000

---

## 🌐 API Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | /health | Server health check |
| GET | / | API welcome and endpoints list |
| POST | /api/analyze/:username | Analyze and store GitHub profile |
| GET | /api/profiles | Get all stored profiles |
| GET | /api/profiles/:username | Get single profile with repos and languages |
| DELETE | /api/profiles/:username | Delete a stored profile |
| GET | /api/compare?users=u1,u2 | Compare multiple profiles |
| GET | /api/stats | Database statistics |

---

## 📋 Example Response

### POST /api/analyze/torvalds

    {
      "success": true,
      "message": "Profile analyzed and saved for 'torvalds'",
      "data": {
        "profile_id": 1,
        "username": "torvalds",
        "name": "Linus Torvalds",
        "followers": 308291,
        "public_repos": 12,
        "total_stars": 249587,
        "top_language": "C",
        "account_age_days": 5405
      }
    }

---

## 🗄️ Database Schema

3 tables:

**github_profiles** — Main profile data
Stores: username, name, bio, location, followers, following, public_repos, total_stars, account_age_days, is_hireable

**github_repos** — Top 10 repositories per user
Stores: repo_name, language, stars, forks, watchers, is_fork, repo_url

**language_stats** — Language usage per user
Stores: language, repo_count

See schema.sql for complete schema.

---

## 🚀 Railway Deployment

1. Push code to GitHub
2. Go to railway.app and create new project
3. Deploy from GitHub repo
4. Add MySQL database service
5. Set environment variables from Railway MySQL
6. Generate domain to get live URL

---

## ✨ Extra Features

- Rate Limiting — 100 requests per 15 minutes per IP
- Auto Re-analysis — POST same username for fresh data
- Pagination and Search — /api/profiles?page=1&limit=5&search=john
- Profile Comparison — /api/compare?users=torvalds,gaearon
- Database Stats — /api/stats
- CORS Enabled
- Global Error Handling with proper HTTP status codes
- SQL Injection Protection

---

## 🛠️ Tech Stack

| Technology | Purpose |
|------------|---------|
| Node.js | Runtime |
| Express.js | Web framework |
| mysql2 | MySQL driver |
| axios | GitHub API calls |
| cors | Cross-Origin support |
| express-rate-limit | Rate limiting |
| dotenv | Environment variables |

---

## 📮 Postman Collection

Import postman/GitHub_Analyzer.postman_collection.json into Postman.
Set base_url variable to your server URL.
All 14 test cases included.

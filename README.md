# 🔍 GitHub Profile Analyzer API

**Made by:** Your Name Here
**GitHub:** https://github.com/YOUR_USERNAME/github-profile-analyzer
**Live API:** https://your-app.railway.app (Update after Railway deployment)

A backend REST API that fetches GitHub user profile data, calculates insights, and stores them in a MySQL database.

**Built with:** Node.js · Express.js · MySQL · GitHub REST API

---

## 📁 Project Structure

    github-analyzer/
    ├── src/
    │   ├── index.js                   → Entry point, server start
    │   ├── app.js                     → Express setup, middlewares, routes
    │   ├── config/
    │   │   ├── db.js                  → MySQL connection pool
    │   │   └── initDb.js              → Auto table creation on startup
    │   ├── controllers/
    │   │   └── profileController.js   → All request handling logic
    │   ├── routes/
    │   │   └── profileRoutes.js       → URL to controller mapping
    │   ├── middleware/
    │   │   └── errorHandler.js        → Global error handling
    │   └── utils/
    │       └── githubService.js       → GitHub API calls and calculations
    ├── postman/
    │   └── GitHub_Analyzer.postman_collection.json
    ├── schema.sql                     → Database schema for manual setup
    ├── .env.example                   → Environment variables template
    ├── package.json
    └── README.md

---

## ⚙️ Local Setup (Step by Step)

### Step 1 — Clone the Repository

    git clone https://github.com/YOUR_USERNAME/github-profile-analyzer.git
    cd github-profile-analyzer

### Step 2 — Install Dependencies

    npm install

### Step 3 — Setup MySQL Database

Open MySQL Workbench and run:

    CREATE DATABASE github_analyzer;

Or run the schema file directly:

    mysql -u root -p < schema.sql

### Step 4 — Setup Environment Variables

Copy the example file:

    cp .env.example .env

Edit .env file with your details:

    PORT=3000
    DB_HOST=localhost
    DB_PORT=3306
    DB_USER=root
    DB_PASSWORD=your_mysql_password
    DB_NAME=github_analyzer
    GITHUB_TOKEN=your_github_token_here

Note: Get free GitHub token from https://github.com/settings/tokens
Generate new token (classic) with no scopes needed.
This avoids GitHub rate limiting (60 req/hr without token, 5000 with token)

### Step 5 — Start the Server

    npm run dev

Server starts at: http://localhost:3000

---

## 🌐 API Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | /health | Server health check |
| GET | / | API welcome and all endpoints list |
| POST | /api/analyze/:username | Analyze and store GitHub profile |
| GET | /api/profiles | Get all stored profiles |
| GET | /api/profiles/:username | Get single profile with repos and languages |
| DELETE | /api/profiles/:username | Delete a stored profile |
| GET | /api/compare?users=u1,u2 | Compare multiple profiles side by side |
| GET | /api/stats | Database wide statistics |

### Query Parameters for GET /api/profiles

| Parameter | Example | Description |
|-----------|---------|-------------|
| page | ?page=2 | Page number, default is 1 |
| limit | ?limit=5 | Results per page, default is 10 |
| search | ?search=john | Search by username or name |

---

## 📋 Example API Responses

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
        "account_age_days": 5405,
        "analyzed_at": "2026-06-21T08:57:50.993Z"
      }
    }

### GET /api/profiles/torvalds

    {
      "success": true,
      "data": {
        "username": "torvalds",
        "name": "Linus Torvalds",
        "followers": 308291,
        "top_repos": [
          { "repo_name": "linux", "stars": 185000, "language": "C" }
        ],
        "language_stats": [
          { "language": "C", "repo_count": 5 }
        ]
      }
    }

### GET /api/compare?users=torvalds,gaearon

    {
      "success": true,
      "message": "Comparison done",
      "data": [
        { "username": "torvalds", "followers": 308291, "total_stars": 249587 },
        { "username": "gaearon", "followers": 85000, "total_stars": 120000 }
      ]
    }

---

## 🗄️ Database Schema

3 tables are used:

**github_profiles** — Main profile data
Stores: username, name, bio, location, company, email, followers, following, public_repos, total_stars, account_age_days, is_hireable

**github_repos** — Top 10 repositories per user
Stores: repo_name, description, language, stars, forks, watchers, is_fork, repo_url

**language_stats** — Programming language usage per user
Stores: language name, repo_count (how many repos use this language)

See schema.sql file for complete SQL with all columns.

---

## 🚀 Railway Deployment Guide

### Step 1 — Push to GitHub

    git init
    git add .
    git commit -m "Initial commit"
    git remote add origin https://github.com/YOUR_USERNAME/github-profile-analyzer.git
    git push -u origin main

### Step 2 — Deploy on Railway

1. Go to https://railway.app
2. Click "New Project"
3. Select "Deploy from GitHub repo"
4. Choose your github-profile-analyzer repo

### Step 3 — Add MySQL Database

1. In your project click "+ New"
2. Select "Database"
3. Select "MySQL"
4. Railway will auto-setup MySQL

### Step 4 — Set Environment Variables

Go to your Node.js service, click "Variables" tab, add these:

    DB_HOST     = (copy from Railway MySQL Variables tab)
    DB_PORT     = (copy from Railway MySQL Variables tab)
    DB_USER     = (copy from Railway MySQL Variables tab)
    DB_PASSWORD = (copy from Railway MySQL Variables tab)
    DB_NAME     = railway
    NODE_ENV    = production
    GITHUB_TOKEN = your_github_token

### Step 5 — Get Live URL

Go to Settings tab, click "Generate Domain"
Your live URL will look like: https://github-profile-analyzer-production.railway.app

---

## ✨ Extra Features Added

- **Rate Limiting** — 100 requests per 15 minutes per IP for abuse protection
- **Auto Re-analysis** — POST same username again to get fresh updated data
- **Pagination and Search** — /api/profiles?page=1&limit=5&search=john
- **Profile Comparison** — /api/compare?users=torvalds,gaearon
- **Database Statistics** — /api/stats for aggregated insights across all profiles
- **CORS Enabled** — Any frontend can consume this API
- **Global Error Handling** — Proper HTTP status codes with helpful messages
- **SQL Injection Protection** — All queries use parameterized placeholders

---

## 🛠️ Tech Stack

| Technology | Version | Purpose |
|------------|---------|---------|
| Node.js | v18+ | Server runtime |
| Express.js | v4.18 | Web framework |
| mysql2 | v3.9 | MySQL driver with Promise support |
| axios | v1.6 | HTTP client for GitHub API calls |
| cors | v2.8 | Cross-Origin Resource Sharing |
| express-rate-limit | v7.1 | API rate limiting |
| dotenv | v16.4 | Environment variable management |
| nodemon | v3.0 | Auto-restart during development |

---

## 📮 Postman Collection

Import the file postman/GitHub_Analyzer.postman_collection.json into Postman.
Set the base_url variable to your server URL.

Local testing: http://localhost:3000
Live testing: https://your-railway-url.railway.app

All 14 test cases are included covering all endpoints and edge cases.
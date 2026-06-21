const axios = require("axios");
require("dotenv").config();

const githubApi = axios.create({
  baseURL: "https://api.github.com",
  headers: {
    ...(process.env.GITHUB_TOKEN && {
      Authorization: `Bearer ${process.env.GITHUB_TOKEN}`,
    }),
    Accept: "application/vnd.github.v3+json",
  },
  timeout: 10000,
});

const fetchUserProfile = async (username) => {
  try {
    const response = await githubApi.get(`/users/${username}`);
    return response.data;
  } catch (error) {
    if (error.response?.status === 404) {
      throw new Error(`GitHub user '${username}' not found`);
    }
    if (error.response?.status === 403) {
      throw new Error("GitHub API rate limit exceeded. Add GITHUB_TOKEN in .env");
    }
    throw new Error(`GitHub API error: ${error.message}`);
  }
};

const fetchUserRepos = async (username) => {
  try {
    const response = await githubApi.get(`/users/${username}/repos`, {
      params: {
        sort: "stars",
        per_page: 100,
        type: "public",
      },
    });
    return response.data;
  } catch (error) {
    if (error.response?.status === 404) {
      throw new Error(`Repos not found for user '${username}'`);
    }
    throw new Error(`GitHub API error: ${error.message}`);
  }
};

const calculateInsights = (profileData, reposData) => {
  const totalStars = reposData.reduce(
    (acc, repo) => acc + repo.stargazers_count, 0
  );

  const languageMap = {};
  reposData.forEach((repo) => {
    if (repo.language) {
      languageMap[repo.language] = (languageMap[repo.language] || 0) + 1;
    }
  });

  const languageStats = Object.entries(languageMap)
    .map(([language, repo_count]) => ({ language, repo_count }))
    .sort((a, b) => b.repo_count - a.repo_count)
    .slice(0, 10);

  const createdAt = new Date(profileData.created_at);
  const now = new Date();
  const diffTime = Math.abs(now - createdAt);
  const accountAgeDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

  const topRepos = reposData
    .sort((a, b) => b.stargazers_count - a.stargazers_count)
    .slice(0, 10)
    .map((repo) => ({
      repo_name: repo.name,
      description: repo.description,
      language: repo.language,
      stars: repo.stargazers_count,
      forks: repo.forks_count,
      watchers: repo.watchers_count,
      is_fork: repo.fork,
      repo_url: repo.html_url,
      created_at: repo.created_at,
      updated_at: repo.updated_at,
    }));

  return { totalStars, languageStats, accountAgeDays, topRepos };
};

module.exports = { fetchUserProfile, fetchUserRepos, calculateInsights };
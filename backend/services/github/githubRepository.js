const { validateGitHubRepoUrl } = require("./githubValidation");

const getRepositoryDetails = async (repositoryUrl) => {
  const { owner, repo } = validateGitHubRepoUrl(repositoryUrl);

  const apiUrl = `https://api.github.com/repos/${owner}/${repo}`;

  const response = await fetch(apiUrl, {
    headers: {
      Accept: "application/vnd.github+json",
      "X-GitHub-Api-Version": "2022-11-28",
      "User-Agent": "CollabSphere",
      ...(process.env.GITHUB_TOKEN
        ? { Authorization: `Bearer ${process.env.GITHUB_TOKEN}` }
        : {})
    },
    signal: AbortSignal.timeout(10000)
  });

  if (response.status === 404) {
    throw new Error("Repository not found or it is private");
  }

  if (response.status === 401) {
    throw new Error("GITHUB_TOKEN is invalid or expired. Check the token in the backend environment.");
  }

  if (response.status === 403 || response.status === 429) {
    throw new Error("GitHub API rate limit or access restriction. Configure GITHUB_TOKEN in the backend environment and restart the server.");
  }

  if (!response.ok) {
    throw new Error("Failed to fetch repository details");
  }

  const data = await response.json();

  if (data.private) {
    throw new Error("Private repositories are not supported");
  }

  return {
    name: data.name,
    fullName: data.full_name,
    description: data.description,
    defaultBranch: data.default_branch,
    url: data.html_url
  };
};

module.exports = { getRepositoryDetails };
const validateGitHubRepoUrl = (repositoryUrl) => {
  if (!repositoryUrl || typeof repositoryUrl !== "string") {
    throw new Error("Please provide a GitHub repository URL");
  }

  let url;

  try {
    url = new URL(repositoryUrl);
  } catch (error) {
    throw new Error("Invalid repository URL");
  }

  if (
    url.protocol !== "https:" ||
    url.hostname !== "github.com" ||
    url.port ||
    url.username ||
    url.password
  ) {
    throw new Error("Only valid GitHub HTTPS URLs are allowed");
  }

  if (url.search || url.hash) {
    throw new Error("Please provide the repository root URL");
  }

  const parts = url.pathname.split("/").filter(Boolean);

  if (parts.length !== 2) {
    throw new Error("Please provide a repository root URL");
  }

  const [owner, repo] = parts;

  const validName = /^[a-zA-Z0-9_.-]+$/;

  if (
    !validName.test(owner) ||
    !validName.test(repo) ||
    owner === "." ||
    owner === ".." ||
    repo === "." ||
    repo === ".."
  ) {
    throw new Error("Invalid GitHub repository URL");
  }

  return { owner, repo };
};

module.exports = { validateGitHubRepoUrl };
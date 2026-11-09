const { validateGitHubRepoUrl } = require("./githubValidation");
const { getRepositoryDetails } = require("./githubRepository");

const getRepositoryFileTree = async (repositoryUrl) => {
  const { owner, repo } = validateGitHubRepoUrl(repositoryUrl);

  // Step 2: Get repository details
  const repository = await getRepositoryDetails(repositoryUrl);

  // Step 3: Create GitHub API URL
  const apiUrl = `https://api.github.com/repos/${owner}/${repo}/git/trees/${encodeURIComponent(repository.defaultBranch)}?recursive=1`;

  // Step 4: Fetch repository file tree
  const response = await fetch(apiUrl, {
    headers: {
      Accept: "application/vnd.github+json",
      "X-GitHub-Api-Version": "2022-11-28",
      "User-Agent": "CollabSphere"
    },
    signal: AbortSignal.timeout(10000)
  });

  if (response.status === 403 || response.status === 429) {
    throw new Error("GitHub API rate limit or access restriction");
  }

  if (!response.ok) {
    throw new Error("Failed to fetch repository file tree");
  }

  const data = await response.json();

  // Step 5: Check whether GitHub returned complete file tree
  if (data.truncated) {
    throw new Error("Repository is too large to analyze");
  }

  // Step 6: Folders we don't want to analyze
  const ignoredFolders = [
    "node_modules",
    ".git",
    "dist",
    "build",
    "coverage",
    "vendor",
    "__pycache__"
  ];

  // Step 7: Allowed file extensions
  const allowedExtensions = [
    ".js",
    ".jsx",
    ".ts",
    ".tsx",
    ".py",
    ".html",
    ".css",
    ".json",
    ".md"
  ];

  // Step 8: Filter useful source files
  const sourceFiles = data.tree.filter((file) => {
    if (file.type !== "blob") {
      return false;
    }

    const fileName = file.path.split("/").pop().toLowerCase();

    const isIgnoredFolder = ignoredFolders.some((folder) =>
      file.path.split("/").includes(folder)
    );

    const hasAllowedExtension = allowedExtensions.some((extension) =>
      fileName.endsWith(extension)
    );

    const isSensitiveFile =
      fileName.startsWith(".env") ||
      fileName.endsWith(".lock") ||
      fileName.includes("secret");

    const hasValidSize =
      typeof file.size === "number" &&
      file.size > 0 &&
      file.size <= 50 * 1024;

    return (
      !isIgnoredFolder &&
      hasAllowedExtension &&
      !isSensitiveFile &&
      hasValidSize
    );
  });

  // Step 9: Give priority to important files
  const priorityFiles = [
    "readme.md",
    "package.json",
    "server.js",
    "app.js",
    "main.js",
    "index.js",
    "app.py",
    "main.py"
  ];

  sourceFiles.sort((a, b) => {
    const aName = a.path.split("/").pop().toLowerCase();
    const bName = b.path.split("/").pop().toLowerCase();

    const aPriority = priorityFiles.indexOf(aName);
    const bPriority = priorityFiles.indexOf(bName);

    const aRank = aPriority === -1 ? 999 : aPriority;
    const bRank = bPriority === -1 ? 999 : bPriority;

    return aRank - bRank;
  });

  // Step 10: Select maximum 20 files and 200 KB total
  const selectedFiles = [];
  let totalSize = 0;

  for (const file of sourceFiles) {
    if (selectedFiles.length >= 20) {
      break;
    }

    if (totalSize + file.size > 200 * 1024) {
      continue;
    }

    selectedFiles.push({
      path: file.path,
      sha: file.sha,
      size: file.size
    });

    totalSize += file.size;
  }

  return {
    repository,
    files: selectedFiles,
    totalFiles: selectedFiles.length,
    totalSize
  };
};

module.exports = { getRepositoryFileTree };

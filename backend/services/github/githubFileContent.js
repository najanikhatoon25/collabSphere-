const { validateGitHubRepoUrl } = require("./githubValidation");
const { getRepositoryFileTree } = require("./githubFileTree");

const getRepositoryFileContents = async (repositoryUrl) => {
  const result = await getRepositoryFileTree(repositoryUrl);

  const { owner, repo } = validateGitHubRepoUrl(repositoryUrl);

  const files = [];

  // Step 4: Fetch each selected file
  for (const file of result.files) {
    const apiUrl = `https://api.github.com/repos/${owner}/${repo}/git/blobs/${file.sha}`;

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
      throw new Error(`Failed to fetch file: ${file.path}`);
    }

    const data = await response.json();

    if (data.encoding !== "base64" || !data.content) {
      continue;
    }

    const content = Buffer.from(data.content, "base64").toString("utf8");

    // Skip content that appears to be binary
    if (content.includes("\0")) {
      continue;
    }

    // Step 7: Store file path and its content
    files.push({
      path: file.path,
      content
    });
  }

  return {
    repository: result.repository,
    files,
    totalFiles: files.length
  };
};

module.exports = { getRepositoryFileContents };

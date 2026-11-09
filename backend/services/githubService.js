// const validateGitHubRepoUrl = (repositoryUrl) => {
//   if (!repositoryUrl || typeof repositoryUrl !== "string") {
//     throw new Error("Please provide a GitHub repository URL");
//   }

//   let url;

//   try {
//     url = new URL(repositoryUrl);
//   } catch (error) {
//     throw new Error("Invalid repository URL");
//   }

//   // Allow only GitHub HTTPS URLs
//   if (
//     url.protocol !== "https:" ||
//     url.hostname !== "github.com" ||
//     url.port ||
//     url.username ||
//     url.password
//   ) {
//     throw new Error("Only valid GitHub HTTPS URLs are allowed");
//   }

//   // Reject query parameters and fragments
//   if (url.search || url.hash) {
//     throw new Error("Please provide the repository root URL");
//   }

//   const parts = url.pathname.split("/").filter(Boolean);

//   // URL must contain only owner and repository name
//   if (parts.length !== 2) {
//     throw new Error("Please provide a repository root URL");
//   }

//   const [owner, repo] = parts;

//   const validName = /^[a-zA-Z0-9_.-]+$/;

//   if (
//     !validName.test(owner) ||
//     !validName.test(repo) ||
//     owner === "." ||
//     owner === ".." ||
//     repo === "." ||
//     repo === ".."
//   ) {
//     throw new Error("Invalid GitHub repository URL");
//   }

//   return { owner, repo };
// };


// // Fetch repository details from GitHub
// const getRepositoryDetails = async (repositoryUrl) => {
//   const { owner, repo } = validateGitHubRepoUrl(repositoryUrl);

//   const apiUrl = `https://api.github.com/repos/${owner}/${repo}`;

//   const response = await fetch(apiUrl, {
//     headers: {
//       Accept: "application/vnd.github+json",
//       "X-GitHub-Api-Version": "2022-11-28",
//       "User-Agent": "CollabSphere"
//     },
//     signal: AbortSignal.timeout(10000)
//   });

//   if (response.status === 404) {
//     throw new Error("Repository not found or it is private");
//   }

//   if (response.status === 403 || response.status === 429) {
//     throw new Error("GitHub API rate limit or access restriction");
//   }

//   if (!response.ok) {
//     throw new Error("Failed to fetch repository details");
//   }

//   const data = await response.json();

//   // Reject private repositories
//   if (data.private) {
//     throw new Error("Private repositories are not supported");
//   }

//   return {
//     name: data.name,
//     fullName: data.full_name,
//     description: data.description,
//     defaultBranch: data.default_branch,
//     url: data.html_url
//   };
// };


// const getRepositoryFileTree = async (repositoryUrl) => {
//   // Validate URL and get repository owner/name
// const { owner, repo } = validateGitHubRepoUrl(repositoryUrl);
//   // Get repository details and default branch
//   const repository = await getRepositoryDetails(repositoryUrl);

//   const apiUrl = `https://api.github.com/repos/${owner}/${repo}/git/trees/${encodeURIComponent(repository.defaultBranch)}?recursive=1`;

//   const response = await fetch(apiUrl, {
//     headers: {
//       Accept: "application/vnd.github+json",
//       "X-GitHub-Api-Version": "2022-11-28",
//       "User-Agent": "CollabSphere"
//     },
//     signal: AbortSignal.timeout(10000)
//   });

//   if (response.status === 403 || response.status === 429) {
//     throw new Error("GitHub API rate limit exceeded");
//   }

//   if (!response.ok) {
//     throw new Error("Failed to fetch repository file tree");
//   }

//   const data = await response.json();

//   // Reject incomplete file trees
//   if (data.truncated) {
//     throw new Error("Repository is too large to analyze");
//   }

//   // Folders that should be skipped
//   const ignoredFolders = [
//     "node_modules",
//     ".git",
//     "dist",
//     "build",
//     "coverage",
//     "vendor",
//     "__pycache__"
//   ];

//   // File extensions we want to analyze
//   const allowedExtensions = [
//     ".js",
//     ".jsx",
//     ".ts",
//     ".tsx",
//     ".py",
//     ".html",
//     ".css",
//     ".json",
//     ".md"
//   ];

//   const filteredFiles = data.tree.filter((file) => {
//     if (file.type !== "blob") return false;

//     const pathParts = file.path.split("/");
//     const fileName = pathParts[pathParts.length - 1].toLowerCase();

//     // Skip ignored folders
//     if (pathParts.some((part) => ignoredFolders.includes(part))) {
//       return false;
//     }

//     // Skip environment and lock files
//     if (
//       fileName.startsWith(".env") ||
//       fileName.endsWith(".lock") ||
//       fileName.includes("secret")
//     ) {
//       return false;
//     }

//     // Skip files without an allowed extension
//     if (!allowedExtensions.some((ext) => fileName.endsWith(ext))) {
//       return false;
//     }

//     // Skip files larger than 50 KB
//     if (!file.size || file.size > 50 * 1024) {
//       return false;
//     }

//     return true;
//   });

//   // Prioritize important project files
//   filteredFiles.sort((a, b) => {
//     const priority = (file) => {
//       const name = file.path.split("/").pop().toLowerCase();

//       if (name === "readme.md") return 1;
//       if (name === "package.json") return 2;
//       if (["server.js", "app.js", "main.js", "index.js", "app.py", "main.py"].includes(name)) {
//         return 3;
//       }

//       return 4;
//     };

//     return priority(a) - priority(b);
//   });

//   // Apply maximum file and total size limits
//   const selectedFiles = [];
//   let totalSize = 0;

//   for (const file of filteredFiles) {
//     if (selectedFiles.length >= 20) break;

//     if (totalSize + file.size > 200 * 1024) {
//       continue;
//     }

//     selectedFiles.push({
//       path: file.path,
//       sha: file.sha,
//       size: file.size
//     });

//     totalSize += file.size;
//   }

//   return {
//     repository,
//     files: selectedFiles,
//     totalFiles: selectedFiles.length,
//     totalSize
//   };
// };


// const getRepositoryFileContents = async (repositoryUrl) => {
//   // First get selected files
//   const result = await getRepositoryFileTree(repositoryUrl);

//   const { owner, repo } = result.repository;

//   const files = [];

//   // Fetch content of each selected file
//   for (const file of result.files) {
//     const apiUrl = `https://api.github.com/repos/${owner}/${repo}/git/blobs/${file.sha}`;

//     const response = await fetch(apiUrl, {
//       headers: {
//         Accept: "application/vnd.github+json",
//         "X-GitHub-Api-Version": "2022-11-28",
//         "User-Agent": "CollabSphere"
//       },
//       signal: AbortSignal.timeout(10000)
//     });

//     if (response.status === 403 || response.status === 429) {
//       throw new Error("GitHub API rate limit exceeded");
//     }

//     if (!response.ok) {
//       throw new Error(`Failed to fetch file: ${file.path}`);
//     }

//     const data = await response.json();

//     if (data.encoding !== "base64" || !data.content) {
//       continue;
//     }

//     // Decode Base64 into readable text
//     const content = Buffer.from(data.content, "base64").toString("utf8");

//     files.push({
//       path: file.path,
//       content
//     });
//   }

//   return {
//     repository: result.repository,
//     files,
//     totalFiles: files.length
//   };
// };


// module.exports = {
//   validateGitHubRepoUrl,
//   getRepositoryDetails,
//   getRepositoryFileTree,
//   getRepositoryFileContents
// };
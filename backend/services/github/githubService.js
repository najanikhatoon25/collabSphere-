const { getRepositoryDetails } = require("./githubRepository");
const { getRepositoryFileTree } = require("./githubFileTree");

const fileContentService = require("./githubFileContent");

const { validateGitHubRepoUrl } = require("./githubValidation");

console.log(
  "Exported GitHub function:",
  typeof fileContentService.getRepositoryFileContents
);

module.exports = {
  getRepositoryDetails,
  getRepositoryFileTree,
  getRepositoryFileContents: fileContentService.getRepositoryFileContents,
  validateGitHubRepoUrl
};
import { apiRequest } from "./api";

export const explainContent = (content) =>
  apiRequest("/ai/explain", {
    method: "POST",
    body: JSON.stringify({ content }),
  });

export const reviewCode = (code, language) =>
  apiRequest("/ai/review-code", {
    method: "POST",
    body: JSON.stringify({ code, language }),
  });

export const generateReadme = (projectDetails) =>
  apiRequest("/ai/generate-readme", {
    method: "POST",
    body: JSON.stringify(projectDetails),
  });

export const explainRepository = (repositoryUrl) =>
  apiRequest("/ai/explain-repository", {
    method: "POST",
    body: JSON.stringify({ repositoryUrl }),
  });
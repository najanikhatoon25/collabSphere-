import { apiRequest } from "./api";

export const getProjects = () => apiRequest("/projects");

export const getProject = (projectId) =>
  apiRequest(`/projects/${projectId}`);

export const createProject = (projectDetails) =>
  apiRequest("/projects", {
    method: "POST",
    body: JSON.stringify(projectDetails),
  });

export const updateProject = (projectId, projectDetails) =>
  apiRequest(`/projects/${projectId}`, {
    method: "PUT",
    body: JSON.stringify(projectDetails),
  });

export const deleteProject = (projectId) =>
  apiRequest(`/projects/${projectId}`, {
    method: "DELETE",
  });

export const inviteMember = (projectId, memberDetails) =>
  apiRequest(`/projects/${projectId}/members`, {
    method: "POST",
    body: JSON.stringify(memberDetails),
  });

export const removeMember = (projectId, memberId) =>
  apiRequest(`/projects/${projectId}/members/${memberId}`, {
    method: "DELETE",
  });

export const acceptInvitation = (projectId, token) =>
  apiRequest(`/projects/${projectId}/accept-invitation`, {
    method: "POST",
    body: JSON.stringify({ token }),
  });
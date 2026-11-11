import { apiDownload, apiRequest } from "./api";

export const getProjectFiles = (projectId) =>
  apiRequest(`/projects/${projectId}/files`);

export const uploadProjectFile = (projectId, file) => {
  const formData = new FormData();
  formData.append("file", file);

  return apiRequest(`/projects/${projectId}/files`, {
    method: "POST",
    body: formData,
  });
};

export const downloadProjectFile = (projectId, fileId) =>
  apiDownload(`/projects/${projectId}/files/${fileId}`);

export const deleteProjectFile = (projectId, fileId) =>
  apiRequest(`/projects/${projectId}/files/${fileId}`, {
    method: "DELETE",
  });

import { apiRequest } from "./api";

export const getNotes = (projectId) =>
  apiRequest(`/projects/${projectId}/notes`);

export const createNote = (projectId, noteDetails) =>
  apiRequest(`/projects/${projectId}/notes`, {
    method: "POST",
    body: JSON.stringify(noteDetails),
  });

export const updateNote = (projectId, noteId, noteDetails) =>
  apiRequest(`/projects/${projectId}/notes/${noteId}`, {
    method: "PUT",
    body: JSON.stringify(noteDetails),
  });

export const deleteNote = (projectId, noteId) =>
  apiRequest(`/projects/${projectId}/notes/${noteId}`, {
    method: "DELETE",
  });
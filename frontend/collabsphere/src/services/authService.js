import { apiRequest } from "./api";

export const register = (userDetails) =>
  apiRequest("/auth/register", {
    method: "POST",
    body: JSON.stringify(userDetails),
  });

export const login = (credentials) =>
  apiRequest("/auth/login", {
    method: "POST",
    body: JSON.stringify(credentials),
  });

export const getCurrentUser = () => apiRequest("/auth/me");

export const logout = () =>
  apiRequest("/auth/logout", {
    method: "POST",
  });
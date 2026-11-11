const configuredApiUrl =
  import.meta.env.VITE_API_URL || "http://localhost:5000/api";

export const API_URL = configuredApiUrl.replace(/\/+$/, "");

const readResponse = async (response) => {
  const responseText = await response.text();

  if (!responseText) {
    return {};
  }

  try {
    return JSON.parse(responseText);
  } catch {
    throw new Error("Backend returned an invalid JSON response");
  }
};

const createRequestError = (data, status) => {
  const error = new Error(data.message || `Request failed: ${status}`);
  error.status = status;
  return error;
};

export const apiRequest = async (endpoint, options = {}) => {
  const isFormData = options.body instanceof FormData;
  const response = await fetch(`${API_URL}${endpoint}`, {
    ...options,
    credentials: "include",
    headers: {
      ...(isFormData ? {} : { "Content-Type": "application/json" }),
      ...options.headers,
    },
  });
  const data = await readResponse(response);

  if (!response.ok) {
    throw createRequestError(data, response.status);
  }

  return data;
};

export const apiDownload = async (endpoint) => {
  const response = await fetch(`${API_URL}${endpoint}`, {
    credentials: "include",
  });

  if (!response.ok) {
    let data = {};
    try {
      data = await response.json();
    } catch {
      data.message = "Unable to download this file";
    }
    throw createRequestError(data, response.status);
  }

  return response.blob();
};

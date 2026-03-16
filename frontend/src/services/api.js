import axios from "axios";

const rawApiUrl = import.meta.env.VITE_API_URL || "http://localhost:5000/api";
const normalizedApiUrl = rawApiUrl.replace(/\/+$/, "");
const apiBaseUrl = normalizedApiUrl.endsWith("/api")
  ? normalizedApiUrl
  : `${normalizedApiUrl}/api`;

const api = axios.create({
  baseURL: apiBaseUrl
});

// Add token to requests if available
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem("token");
    if (token) {
      config.headers.Authorization = token;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

export default api;

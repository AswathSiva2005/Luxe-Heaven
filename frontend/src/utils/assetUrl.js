const rawApiUrl = import.meta.env.VITE_API_URL || "http://13.51.86.174:5000/api";
const normalizedApiUrl = rawApiUrl.replace(/\/+$/, "");

export const backendBaseUrl = normalizedApiUrl.endsWith("/api")
  ? normalizedApiUrl.slice(0, -4)
  : normalizedApiUrl;

export function buildUploadUrl(relativePath) {
  if (!relativePath) return "";
  const cleanPath = String(relativePath).replace(/^\/+/, "");
  return `${backendBaseUrl}/${cleanPath}`;
}
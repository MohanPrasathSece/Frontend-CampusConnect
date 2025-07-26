import api from "@/services/api";

/**
 * Convert a relative "/uploads/xyz.jpg" (or whatever backend returns) into absolute URL that the browser can fetch.
 * If the string already starts with http(s), returns as-is.
 */
export const toAbsoluteUrl = (path?: string) => {
  if (!path) return "";
  if (path.startsWith("http")) return path;
  // strip trailing /api from baseURL
  const root = api.defaults.baseURL?.replace(/\/api$/, "") ?? "";
  return `${root}${path}`;
};

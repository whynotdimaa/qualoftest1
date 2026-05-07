const DEFAULT_API = "http://localhost:8000/api/v1";

export const API_BASE_URL =
  import.meta.env.VITE_API_BASE_URL?.replace(/\/$/, "") ?? DEFAULT_API;

/** Origin без суфікса /api/v1 — для статичних медіа, якщо шлях відносний */
export function mediaUrl(path) {
  if (!path) return "";
  if (typeof path !== "string") return "";
  if (path.startsWith("http://") || path.startsWith("https://")) return path;
  const normalizedPath = path.startsWith("/") ? path : `/${path}`;
  const mediaPath = normalizedPath.startsWith("/media/")
    ? normalizedPath
    : `/media${normalizedPath}`;
  const origin = API_BASE_URL.replace(/\/api\/v1\/?$/, "") || "";
  return `${origin}${mediaPath}`;
}

/**
 * Centralized API configuration.
 * Uses VITE_API_URL if defined, or falls back to http://localhost:8000 when running locally.
 */
export const API_BASE_URL =
  import.meta.env.VITE_API_URL ||
  (typeof window !== "undefined" &&
  (window.location.hostname === "localhost" || window.location.hostname === "127.0.0.1")
    ? "http://localhost:8000"
    : "");

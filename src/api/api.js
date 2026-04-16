// src/api/api.js
// =====================================================
// CENTRAL AXIOS INSTANCE
// All API calls go through here — token is auto-attached
// Usage: import api from "../api/api";
// =====================================================
import axios from "axios";

const api = axios.create({
  baseURL: "https://scos-backend.onrender.com",
  headers: { "Content-Type": "application/json" },
});

// ─── REQUEST INTERCEPTOR ──────────────────────────────
// Auto-attach token to every request
api.interceptors.request.use((config) => {
  // Use access_token after context selection
  // Use pre_context_token before that
  const token =
    localStorage.getItem("access_token") ||
    localStorage.getItem("pre_context_token");

  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// ─── RESPONSE INTERCEPTOR ─────────────────────────────
// On 401, clear tokens and redirect to login
api.interceptors.response.use(
  (res) => res,
  (err) => {
    if (err.response?.status === 401 && window.location.pathname !== "/") {
      localStorage.removeItem("access_token");
      window.location.href = "/";
    }
    return Promise.reject(err);
  }
);

export default api;

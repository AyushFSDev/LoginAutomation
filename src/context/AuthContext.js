// src/context/AuthContext.js
import { createContext, useContext, useState, useEffect } from "react";
import api from "../api/api";

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser]                           = useState(null);
  const [institutes, setInstitutes]               = useState([]);
  const [selectedInstitute, setSelectedInstitute] = useState(null);
  const [selectedRole, setSelectedRole]           = useState(null);
  const [loading, setLoading]                     = useState(true);

  // ─── THEME: initialize from localStorage so it persists across reloads ────
  const [isDark, setIsDark] = useState(() => {
    return localStorage.getItem("theme") === "dark";
  });

  // ─── APPLY SAVED THEME ON FIRST RENDER ───────────────────────────────────
  useEffect(() => {
    const saved = localStorage.getItem("theme") || "light";
    document.documentElement.setAttribute("data-theme", saved);
  }, []);

  // ─── AUTO LOGIN ON REFRESH ────────────────────────────────────────────────
  // Restore session only when access_token exists (fully authenticated).
  // Do NOT restore on pre_context_token alone — that token is only valid
  // during the institute/role selection flow, not for session persistence.
  // Restoring on pre_context_token caused a /auth/me call → 401 → token clear
  // → re-render that looked like a page reload on failed login attempts.
  useEffect(() => {
    const restoreSession = async () => {
      const accessToken = localStorage.getItem("access_token");

      if (!accessToken) {
        // No valid session — clear any stale pre_context_token and stop
        localStorage.removeItem("pre_context_token");
        setLoading(false);
        return;
      }

      try {
        const res = await api.get("/auth/me");
        setUser(res.data.data);
      } catch {
        // access_token expired or invalid — clear everything
        localStorage.removeItem("access_token");
        localStorage.removeItem("pre_context_token");
      } finally {
        setLoading(false);
      }
    };

    restoreSession();
  }, []);

  // ─── THEME TOGGLE ─────────────────────────────────────────────────────────
  // Save to localStorage so theme persists across page reloads
  const toggleTheme = () => {
    const next = !isDark;
    setIsDark(next);
    const value = next ? "dark" : "light";
    document.documentElement.setAttribute("data-theme", value);
    localStorage.setItem("theme", value);
  };

  // ─── LOGOUT ───────────────────────────────────────────────────────────────
  const logout = () => {
    setUser(null);
    setInstitutes([]);
    setSelectedInstitute(null);
    setSelectedRole(null);
    localStorage.removeItem("access_token");
    localStorage.removeItem("pre_context_token");
  };

  return (
    <AuthContext.Provider
      value={{
        user, setUser,
        institutes, setInstitutes,
        selectedInstitute, setSelectedInstitute,
        selectedRole, setSelectedRole,
        logout,
        isDark, toggleTheme,
        loading,
      }}
    >
      {!loading && children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used inside <AuthProvider>");
  return ctx;
};

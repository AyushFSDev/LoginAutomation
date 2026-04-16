// src/routes/AppRoutes.js
import { Routes, Route, Navigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

import Login from "../pages/Login";
import InstituteSelect from "../pages/InstituteSelect";
import RoleSelect from "../pages/RoleSelect";
import Dashboard from "../pages/Dashboard";

// ─── Protected Route Guard ────────────────────────────────────────────────────
// Requires user state to be present (AuthContext restores it on page refresh).
// If no user is found, redirect to the login page.
const ProtectedRoute = ({ children }) => {
  const { user } = useAuth();
  if (!user) return <Navigate to="/" replace />;
  return children;
};

// ─── Auth Route Guard ─────────────────────────────────────────────────────────
// Prevents already-authenticated users from accessing the login page.
// If both access_token and user state exist, redirect to dashboard.
const AuthRoute = ({ children }) => {
  const { user } = useAuth();
  const hasAccessToken = !!localStorage.getItem("access_token");
  if (user && hasAccessToken) return <Navigate to="/dashboard" replace />;
  return children;
};

// ─── Dashboard Route Guard ────────────────────────────────────────────────────
// Dashboard is only accessible when a valid access_token exists.
// If access_token is missing (e.g. session expired or not logged in),
// redirect to login.
//
// This guard also makes /institute and /role inaccessible after login,
// because Login, InstituteSelect, and RoleSelect all use navigate({ replace: true }),
// so those pages are removed from the browser history stack.
// If someone tries to reach /institute or /role directly via URL after login,
// the FlowRoute guard below handles that redirect.
const DashboardRoute = ({ children }) => {
  const { user } = useAuth();
  const hasAccessToken = !!localStorage.getItem("access_token");

  // No valid session — send to login
  if (!hasAccessToken || !user) return <Navigate to="/" replace />;

  return children;
};

// ─── Flow Route Guard ─────────────────────────────────────────────────────────
// Guards the institute and role selection pages (/institute, /role).
// These pages are only accessible during the login flow — i.e. when the user
// has a pre_context_token but has not yet completed context selection.
//
// Rules:
//   1. If access_token exists (fully logged in) → redirect to dashboard.
//      This blocks the browser back button from returning to these pages
//      after the user has already reached the dashboard.
//   2. If neither pre_context_token nor user exists → redirect to login.
//      (Handles direct URL access without any active session.)
const FlowRoute = ({ children }) => {
  const { user } = useAuth();
  const hasAccessToken     = !!localStorage.getItem("access_token");
  const hasPreContextToken = !!localStorage.getItem("pre_context_token");

  // Fully authenticated — send to dashboard
  if (hasAccessToken && user) return <Navigate to="/dashboard" replace />;

  // No active session at all — send to login
  if (!hasPreContextToken && !user) return <Navigate to="/" replace />;

  return children;
};

const AppRoutes = () => {
  return (
    <Routes>

      {/* ── Public: Login ──────────────────────────────────────────────────── */}
      <Route
        path="/"
        element={
          <AuthRoute>
            <Login />
          </AuthRoute>
        }
      />

      {/* ── Flow pages: institute & role selection ─────────────────────────── */}
      {/* FlowRoute ensures fully logged-in users cannot back-navigate here   */}
      <Route
        path="/institute"
        element={
          <FlowRoute>
            <InstituteSelect />
          </FlowRoute>
        }
      />

      <Route
        path="/role"
        element={
          <FlowRoute>
            <RoleSelect />
          </FlowRoute>
        }
      />

      {/* ── Dashboard: only accessible with a valid access_token ───────────── */}
      <Route
        path="/dashboard"
        element={
          <DashboardRoute>
            <Dashboard />
          </DashboardRoute>
        }
      />

      {/* ── Fallback: unknown routes → login ───────────────────────────────── */}
      <Route path="*" element={<Navigate to="/" replace />} />

    </Routes>
  );
};

export default AppRoutes;
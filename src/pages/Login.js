// src/pages/Login.js
import { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import api from "../api/api";
import STRINGS from "../constants/strings";

import Button from "../components/common/Button";
import Input from "../components/common/Input";
import styles from "../style/Login.module.css";
const whiteLogo = "../assets/image/white-logo.png";
// import whiteLogo from "../assets/image/white-logo.png";
// import blackLogo from "../assets/image/black-logo.png";
const blackLogo = "../assets/image/black-logo.png";

const Login = () => {
  const navigate = useNavigate();
  const { setUser, setInstitutes, setSelectedInstitute, isDark, toggleTheme } =
    useAuth();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  // ─── Progress bar ──────────────────────────────────────────────────────────
  const [progress, setProgress] = useState(0);
  const progressIntervalRef = useRef(null);

  const startProgress = () => {
    setProgress(0);
    progressIntervalRef.current = setInterval(() => {
      setProgress((prev) => {
        if (prev >= 85) {
          clearInterval(progressIntervalRef.current);
          return 85;
        }
        const increment = prev < 40 ? 4 : prev < 70 ? 2 : 0.5;
        return Math.min(prev + increment, 85);
      });
    }, 80);
  };

  const completeProgress = () => {
    clearInterval(progressIntervalRef.current);
    setProgress(100);
    setTimeout(() => setProgress(0), 500);
  };

  const resetProgress = () => {
    clearInterval(progressIntervalRef.current);
    setProgress(0);
  };

  useEffect(() => () => clearInterval(progressIntervalRef.current), []);
  // ──────────────────────────────────────────────────────────────────────────

  const handleLogin = async () => {
    setError("");

    // Security: block login when offline
    if (!navigator.onLine) {
      setError(STRINGS.login.offlineError);
      return;
    }

    setLoading(true);
    startProgress();

    try {
      const res = await api.post("/auth/login", { email, password });

      if (!res.data || !res.data.pre_context_token) {
        throw new Error(res.data?.message || STRINGS.login.errorFallback);
      }

      const { pre_context_token, user } = res.data;
      localStorage.setItem("pre_context_token", pre_context_token);
      setUser(user);

      const instRes = await api.get("/auth/my-institutes-roles", {
        headers: { Authorization: `Bearer ${pre_context_token}` },
      });

      const institutesData = instRes.data.data;
      setInstitutes(institutesData);
      completeProgress();

      if (institutesData.length === 1 && institutesData[0].roles.length === 1) {
        const only = institutesData[0];
        await selectContextAndGo(
          only.tenant_id,
          only.institute_id,
          only.roles[0].role_id,
          pre_context_token,
        );
      } else if (institutesData.length === 1) {
        setSelectedInstitute(institutesData[0]);
        navigate("/role", { replace: true });
      } else {
        navigate("/institute", { replace: true });
      }
    } catch (err) {
      resetProgress();
      const message =
        err?.response?.data?.message ||
        err?.message ||
        STRINGS.login.errorFallback;
      setError(message);
      setEmail("");
      setPassword("");
    } finally {
      setLoading(false);
    }
  };

  const selectContextAndGo = async (
    tenant_id,
    institute_id,
    role_id,
    pre_context_token,
  ) => {
    const res = await api.post(
      "/auth/select-context",
      { tenant_id, institute_id, role_id },
      { headers: { Authorization: `Bearer ${pre_context_token}` } },
    );
    localStorage.setItem("access_token", res.data.access_token);
    localStorage.removeItem("pre_context_token");
    navigate("/dashboard", { replace: true });
  };

  // Shorthand aliases for cleaner JSX
  const { tagline, taglineSub } = STRINGS.login;

  return (
    <div className={styles.page}>
      {/* ── Top action buttons ─────────────────────────────────────────────── */}
      <div className={styles.topActions}>
        <button
          type="button"
          className={styles.iconBtn}
          title={STRINGS.login.reportTitle}
        >
          <span className="material-symbols-rounded">warning</span>
        </button>
        <button
          type="button"
          className={styles.iconBtn}
          onClick={toggleTheme}
          title={STRINGS.login.toggleThemeTitle}
        >
          <span className="material-symbols-rounded">
            {isDark ? "light_mode" : "dark_mode"}
          </span>
        </button>
      </div>

      {/* ── Card ──────────────────────────────────────────────────────────── */}
      <div className={styles.card}>
        {/* Logo + name + tagline */}
        <div className={styles.logoArea}>
          <div className={styles.logoWrap}>
            <img
              src={isDark ? whiteLogo : blackLogo}
              alt={STRINGS.app.logoAlt}
              className={styles.logoImg}
            />
          </div>

          {/* "MentrixOS" — prefix plain, suffix accented */}
          <h1 className={styles.appName}>
            {STRINGS.app.namePrefix}
            <span className={styles.accent}>{STRINGS.app.nameSuffix}</span>
          </h1>

          {/* "MentrixOS = Mentor + Matrix + Metrics" */}
          <p className={styles.tagline}>
            {tagline.prefix}
            <span className={styles.tagMentor}>{tagline.mentor}</span>
            {tagline.plus1}
            <span className={styles.tagMetrics}>{tagline.metrics}</span>
          </p>

          {/* "combined into one Operating System for your institute" */}
          <p className={styles.taglineSub}>
            {taglineSub.before}
            <strong>{taglineSub.bold}</strong>
            {taglineSub.after}
          </p>
        </div>

        {/* Input fields */}
        <div className={styles.fields}>
          <Input
            placeholder={STRINGS.login.emailPlaceholder}
            value={email}
            onChange={(e) => setEmail(e.target.value.trim())}
          />

          <div className={styles.passwordWrapper}>
            <Input
              type={showPassword ? "text" : "password"}
              placeholder={STRINGS.login.passwordPlaceholder}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && handleLogin()} // ← add this
              className={styles.passwordInput}
            />
            <button
              type="button"
              className={styles.eyeBtn}
              onClick={() => setShowPassword((p) => !p)}
              tabIndex={-1}
              title={showPassword ? "Hide password" : "Show password"}
            >
              <span className="material-symbols-rounded">
                {showPassword ? "visibility_off" : "visibility"}
              </span>
            </button>
          </div>
        </div>

        {/* Error banner */}
        {error && (
          <div className={styles.errorBanner}>
            <div className={styles.errorIcon}>
              <span className="material-symbols-rounded">warning</span>
            </div>
            <div className={styles.errorContent}>
              <p className={styles.errorText}>{error}</p>
            </div>
          </div>
        )}

        {/* Submit */}
        <Button
          variant="primary"
          size="lg"
          onClick={handleLogin}
          disabled={loading}
          className={styles.submitBtn}
        >
          {loading ? STRINGS.login.submittingBtn : STRINGS.login.submitBtn}
        </Button>
      </div>

      {/* ── Loader bar (below card) ────────────────────────────────────────── */}
      {loading && (
        <div className={styles.loaderWrapper}>
          <div className={styles.loaderTrack}>
            <div
              className={styles.loaderFill}
              style={{ width: `${progress}%` }}
            />
          </div>
          <span className={styles.loaderPercent}>{Math.round(progress)}%</span>
        </div>
      )}

      {/* ── Footer ────────────────────────────────────────────────────────── */}
      <p className={styles.footer}>
        {STRINGS.login.footerText}{" "}
        <span className={styles.link}>{STRINGS.login.footerLink}</span>
      </p>
    </div>
  );
};

export default Login;

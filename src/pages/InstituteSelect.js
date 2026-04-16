// src/pages/InstituteSelect.js
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import api from "../api/api";
import STRINGS from "../constants/strings";

import InstituteCard from "../components/institute/InstituteCard";
import styles from "../style/InstituteSelect.module.css";
// import whiteLogo from "../assets/image/white-logo.png";
// import blackLogo from "../assets/image/black-logo.png";
const whiteLogo = "../assets/image/white-logo.png";
const blackLogo = "../assets/image/black-logo.png";
const InstituteSelect = () => {
  // FIX: use replace:true on navigate so this page is replaced in history,
  // preventing the browser back button from returning here after login.
  const navigate = useNavigate();
  const {
    user, institutes,
    setSelectedInstitute, setSelectedRole,
    isDark,
  } = useAuth();

  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  // Show search bar only when institutes count exceeds 5
  const showSearch = institutes.length > 5;

  // Normalize backend fields to match InstituteCard props
  const normalized = institutes.map((i) => ({
    ...i,
    name: i.institute_name,
    logo: i.institute_logo || null,
    city: i.institute_city || "",
    state: i.institute_state || "",
    type: i.institute_type || STRINGS.instituteSelect.defaultType,
  }));

  // Apply search filter only when search bar is visible
  const filtered = showSearch
    ? normalized.filter((i) =>
      i.name.toLowerCase().includes(search.toLowerCase()) ||
      i.city.toLowerCase().includes(search.toLowerCase()) ||
      i.state.toLowerCase().includes(search.toLowerCase())
    )
    : normalized;

  // Words to highlight — only when search is active and has value
  const searchWords = showSearch && search.trim() ? [search.trim()] : [];

  const handleClick = async (institute) => {
    setSelectedInstitute(institute);
    setError("");

    if (institute.roles.length > 1) {
      // FIX: replace history so back button won't return here
      navigate("/role", { replace: true });
    } else {
      setLoading(true);
      try {
        const role = institute.roles[0];
        const res = await api.post("/auth/select-context", {
          tenant_id: institute.tenant_id,
          institute_id: institute.institute_id,
          role_id: role.role_id,
        });
        localStorage.setItem("access_token", res.data.access_token);
        localStorage.removeItem("pre_context_token");
        setSelectedRole(role);
        // FIX: replace history so back button won't return here
        navigate("/dashboard", { replace: true });
      } catch (err) {
        setError(err.response?.data?.message || STRINGS.common.errorFallback);
      } finally {
        setLoading(false);
      }
    }
  };

  return (
    <div className={styles.page}>

      <header className={styles.header}>
        <div className={styles.brand}>
          <img
            src={isDark ? whiteLogo : blackLogo}
            alt={STRINGS.app.logoAlt}
            className={styles.logo}
          />
          <span className={styles.brandName}>{STRINGS.app.name}</span>
        </div>
        <div className={styles.avatar}>
          {user?.full_name?.[0] || user?.initials || "A"}
        </div>
      </header>

      <main className={styles.main}>

        <div className={styles.greeting}>
          <h1 className={styles.greetTitle}>
            {STRINGS.instituteSelect.greeting(
              user?.full_name?.split(" ")[0] || user?.name?.split(" ")[0]
            )}
          </h1>
          <p className={styles.greetSub}>{STRINGS.instituteSelect.subTitle}</p>
        </div>

        {/* Show search bar only when institutes count > 5 */}
        {showSearch && (
          <div className={styles.searchWrap}>
            <div className={styles.searchInner}>
              <span className="material-symbols-rounded">search</span>
              <input
                placeholder={STRINGS.instituteSelect.searchPlaceholder}
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className={styles.searchInput}
              />
            </div>
          </div>
        )}

        {error && (
          <p style={{ color: "red", textAlign: "center", marginBottom: 8 }}>
            {error}
          </p>
        )}

        <div className={styles.list}>
          {filtered.length === 0 ? (
            <p style={{ textAlign: "center", color: "#94a3b8", marginTop: 24 }}>
              {STRINGS.instituteSelect.notFound}
            </p>
          ) : (
            filtered.map((inst) => (
              <InstituteCard
                key={inst.institute_id}
                institute={inst}
                onClick={handleClick}
                disabled={loading}
                searchWords={searchWords}
              />
            ))
          )}
        </div>

      </main>

      <footer className={styles.footer}>
        {STRINGS.instituteSelect.footerText}{" "}
        <span
          className={styles.link}
          onClick={() => window.open(`mailto:${STRINGS.instituteSelect.footerEmail}`)}
        >
          {STRINGS.instituteSelect.footerEmail}
        </span>
      </footer>

    </div>
  );
};

export default InstituteSelect;
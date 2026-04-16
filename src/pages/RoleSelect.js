// src/pages/RoleSelect.js
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import api from "../api/api";
import STRINGS from "../constants/strings";

import RoleCard from "../components/role/RoleCard";
import SelectedInstituteCard from "../components/institute/SelectedInstituteCard";
import styles from "../style/RoleSelect.module.css";
// import whiteLogo from "../assets/image/white-logo.png";
// import blackLogo from "../assets/image/black-logo.png";
const whiteLogo = "../assets/image/white-logo.png";
const blackLogo = "../assets/image/black-logo.png";

const RoleSelect = () => {
  const navigate = useNavigate();
  const {
    user, institutes,
    selectedInstitute, setSelectedRole,
    isDark,
  } = useAuth();

  const [selected, setSelected] = useState(null);
  const [loading, setLoading]   = useState(false);
  const [error, setError]       = useState("");

  // Backend roles shape: { role_id, role_name, role_code, role_icon, role_description }
  const roles = selectedInstitute?.roles || [];
  const hasMultiInstitute = institutes.length > 1;

  const handleSelect = async (role) => {
    setSelected(role.role_id);
    setLoading(true);
    setError("");

    try {
      const res = await api.post("/auth/select-context", {
        tenant_id:    selectedInstitute.tenant_id,
        institute_id: selectedInstitute.institute_id,
        role_id:      role.role_id,
      });

      // Replace pre_context_token with full access_token
      localStorage.setItem("access_token", res.data.access_token);
      localStorage.removeItem("pre_context_token");

      setSelectedRole(role);
      navigate("/dashboard");
    } catch (err) {
      setError(err.response?.data?.message || STRINGS.common.errorFallback);
      setSelected(null);
    } finally {
      setLoading(false);
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

        {/* Back button — shown only when user has multiple institutes */}
        {hasMultiInstitute && (
          <div className={styles.backRow}>
            <button type="button" className={styles.backBtn} onClick={() => navigate("/institute")}>
              <span className="material-symbols-rounded">arrow_back</span>
              {STRINGS.roleSelect.changeInstitute}
            </button>
          </div>
        )}

        {/* Currently selected institute card */}
        {selectedInstitute && (
          <div className={styles.activeSection}>
            <div className={styles.activeCardWrapper}>
              <SelectedInstituteCard institute={{
                name:  selectedInstitute.institute_name,
                logo:  selectedInstitute.institute_logo,
                city:  selectedInstitute.institute_city,
                state: selectedInstitute.institute_state,
              }} />
            </div>
          </div>
        )}

        <div className={styles.greeting}>
          <h1 className={styles.greetTitle}>{STRINGS.roleSelect.title}</h1>
          <p className={styles.greetSub}>{STRINGS.roleSelect.subTitle}</p>
        </div>

        {error && (
          <p style={{ color: "red", textAlign: "center", marginBottom: 8 }}>
            {error}
          </p>
        )}

        <div className={styles.list}>
          {roles.map((role) => (
            <RoleCard
              key={role.role_id}
              role={role}
              isSelected={selected === role.role_id}
              onClick={handleSelect}
            />
          ))}
        </div>

      </main>

      <footer className={styles.footer}>
        {STRINGS.roleSelect.footerText}{" "}
        <span
          className={styles.link}
          onClick={() => window.open(`mailto:${STRINGS.roleSelect.footerEmail}`)}
        >
          {STRINGS.roleSelect.footerEmail}
        </span>
      </footer>

    </div>
  );
};

export default RoleSelect;

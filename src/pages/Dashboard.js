// src/pages/Dashboard.js
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import STRINGS from "../constants/strings";
import styles from "../style/Dashboard.module.css";

// import whiteLogo from "../assets/image/white-logo.png";
// import blackLogo from "../assets/image/black-logo.png";
const whiteLogo = "../assets/image/white-logo.png";
const blackLogo = "../assets/image/black-logo.png";

const Dashboard = () => {
  const navigate = useNavigate();
  const { user, logout, isDark } = useAuth();

  // ─── Logout: clear auth state and redirect to login ──────────────────────
  const handleLogout = () => {
    logout();
    navigate("/");
  };

  return (
    <div className={styles.page}>

      {/* Top navigation bar */}
      <nav className={styles.nav}>

        {/* Left section — menu button + logo + title */}
        <div className={styles.navLeft}>
          <button type="button" className={styles.menuBtn}>
            <span className="material-symbols-rounded">menu</span>
          </button>
          <div className={styles.logoWrap}>
            {/* Logo switches between white and black based on theme */}
            <img
              src={isDark ? whiteLogo : blackLogo}
              alt={STRINGS.dashboard.logoAlt}
              className={styles.dashboardLogo}
            />
          </div>
          <span className={styles.navTitle}>{STRINGS.dashboard.navTitle}</span>
        </div>

        {/* Right section — user avatar (click to logout) */}
        <div className={styles.navRight}>
          <div className={styles.avatarWrap} onClick={handleLogout}>
            <img
              src={`https://api.dicebear.com/7.x/avataaars/svg?seed=${user?.name || "Felix"}`}
              alt={STRINGS.dashboard.userAvatarAlt}
              className={styles.avatarImg}
            />
          </div>
        </div>

      </nav>

      {/* Main content area */}
      <main className={styles.content}>

        {/* Welcome hero section */}
        <div className={styles.hero}>
          <h1 className={styles.heroTitle}>{STRINGS.dashboard.heroTitle}</h1>
          <h2 className={styles.heroSub}>{STRINGS.dashboard.heroSub}</h2>
        </div>

        {/* Stat cards grid — data comes from STRINGS */}
        <div className={styles.statsGrid}>
          {STRINGS.dashboardStats.map((stat) => (
            <div key={stat.id} className={`${styles.statCard} ${styles[stat.id]}`}>
              <div className={styles.statValue}>{stat.value}</div>
              <div className={styles.statLabel}>{stat.label}</div>
              <p className={styles.statDesc}>{stat.desc}</p>
              <div className={styles.cardGlow}></div>
            </div>
          ))}
        </div>

      </main>
    </div>
  );
};

export default Dashboard;

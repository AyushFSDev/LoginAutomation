// src/components/institute/InstituteCard.js
import Highlighter from "react-highlight-words";
import styles from "../../style/InstituteCard.module.css";

const InstituteCard = ({ institute, onClick, disabled, searchWords = [] }) => {

  // Location: combine city + state whichever is available
  const location = [institute.city, institute.state].filter(Boolean).join(", ");

  return (
    <div
      className={styles.card}
      onClick={() => !disabled && onClick(institute)}
      style={{ opacity: disabled ? 0.6 : 1, cursor: disabled ? "not-allowed" : "pointer" }}
    >
      <div className={styles.left}>

        {/* Logo box — show image or initials as fallback */}
        <div className={styles.iconBox}>
          {institute.logo ? (
            <img
              src={institute.logo}
              alt={institute.name}
              onError={(e) => {
                // If image fails to load, show initials instead
                e.target.style.display = "none";
                e.target.nextSibling.style.display = "flex";
              }}
            />
          ) : null}
          {/* Fallback initials — shown when no logo or image load fails */}
          <span
            className={styles.initials}
            style={{ display: institute.logo ? "none" : "flex" }}
          >
            {institute.name?.[0]?.toUpperCase() || "I"}
          </span>
        </div>

        <div className={styles.info}>
          <h3 className={styles.name}>
            <Highlighter
              highlightClassName={styles.highlight}
              searchWords={searchWords}
              autoEscape={true}
              textToHighlight={institute.name || ""}
            />
          </h3>
          {location ? (
            <p className={styles.location}>
              <span className={`material-symbols-rounded ${styles.locationIcon}`}>
                location_on
              </span>
              <Highlighter
                highlightClassName={styles.highlight}
                searchWords={searchWords}
                autoEscape={true}
                textToHighlight={location}
              />
            </p>
          ) : null}
        </div>
      </div>

      <div className={styles.right}>
        <span className={styles.type}>{institute.type || "School"}</span>
        <div className={styles.arrowBox}>
          <span className="material-symbols-rounded">chevron_right</span>
        </div>
      </div>
    </div>
  );
};

export default InstituteCard;
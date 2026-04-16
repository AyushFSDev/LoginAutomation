// src/components/role/RoleCard.js
import Card from "../common/Card";
import styles from "../../style/RoleCard.module.css";

const RoleCard = ({ role, onClick, isSelected }) => {
  const iconName    = role.role_icon        || role.icon        || "person";
  const iconColor   = role.role_icon_color  || role.icon_color  || "#888780";
  const displayName = role.role_name        || role.name        || "";
  const description = role.role_description || role.description || role.desc || "";

  return (
    <Card selected={isSelected} onClick={() => onClick(role)}>
      <div className={styles.row}>

        {/* Only icon color — no background */}
        <div className={styles.iconBox}>
          <span
            className="material-symbols-rounded"
            style={{ color: iconColor }}
          >
            {iconName}
          </span>
        </div>

        <div className={styles.info}>
          <div className={styles.name}>{displayName}</div>
          {description ? (
            <div className={styles.desc}>{description}</div>
          ) : null}
        </div>

        <div className={`${styles.arrow} ${isSelected ? styles.arrowActive : ""}`}>
          <span className="material-symbols-rounded">chevron_right</span>
        </div>

      </div>
    </Card>
  );
};

export default RoleCard;

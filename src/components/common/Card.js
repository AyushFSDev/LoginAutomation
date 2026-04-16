// src/components/common/Card.js
import styles from "../../style/Card.module.css";

const Card = ({ children, onClick, selected = false, padding = "16px", className = "" }) => {
  const cls = [
    styles.card,
    onClick  ? styles.clickable : "",
    selected ? styles.selected  : "",
    className,
  ].filter(Boolean).join(" ");

  return (
    <div className={cls} onClick={onClick} style={{ padding }}>
      {children}
    </div>
  );
};

export default Card;

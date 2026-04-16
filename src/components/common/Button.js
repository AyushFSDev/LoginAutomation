// src/components/common/Button.js
import styles from "../../style/Button.module.css";

const Button = ({
  children,
  onClick,
  variant = "primary",
  size = "md",
  disabled = false,
  type = "button",
  className = "",
  ...rest
}) => {
  const cls = [styles.btn, styles[variant], styles[size], className]
    .filter(Boolean).join(" ");

  return (
    <button type={type} className={cls} onClick={onClick} disabled={disabled} {...rest}>
      {children}
    </button>
  );
};

export default Button;

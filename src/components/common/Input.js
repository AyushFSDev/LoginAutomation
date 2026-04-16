// src/components/common/Input.js
import styles from "../../style/Input.module.css";

const Input = ({
  label,
  type = "text",
  placeholder,
  value,
  onChange,
  icon,
  error,
  className = "",
  ...rest
}) => {
  const inputCls = [
    styles.input,
    icon ? styles.withIcon : "",
    error ? styles.hasError : "",
    className,
  ]
    .filter(Boolean)
    .join(" ");

  return (
    <div className={styles.wrapper}>
      {label && <label className={styles.label}>{label}</label>}
      <div className={styles.inputWrap}>
        {icon && <span className={styles.icon}>{icon}</span>}
        <input
          type={type}
          placeholder={placeholder}
          value={value}
          onChange={onChange}
          className={inputCls}
          {...rest}
        />
      </div>
      {error && <span className={styles.errorMsg}>{error}</span>}
    </div>
  );
};

export default Input;

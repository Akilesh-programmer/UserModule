import styles from "./InputField.module.css";

export default function InputField({
  label,
  error,
  wrapperClassName,
  ...props
}) {
  return (
    <div
      className={`${styles.group}${wrapperClassName ? ` ${wrapperClassName}` : ""}`}
    >
      {label && <label className={styles.label}>{label}</label>}
      <input
        className={`${styles.input} ${error ? styles.hasError : ""}`}
        {...props}
      />
      {error && <span className={styles.error}>{error}</span>}
    </div>
  );
}

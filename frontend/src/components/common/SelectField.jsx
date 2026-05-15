import styles from "./SelectField.module.css";

export default function SelectField({
  label,
  error,
  options = [],
  placeholder = "Select...",
  ...props
}) {
  return (
    <div className={styles.group}>
      {label && <label className={styles.label}>{label}</label>}
      <select
        className={`${styles.select} ${error ? styles.hasError : ""}`}
        {...props}
      >
        {placeholder && <option value="">{placeholder}</option>}
        {options.map((opt) => (
          <option key={opt.value} value={opt.value}>
            {opt.label}
          </option>
        ))}
      </select>
      {error && <span className={styles.error}>{error}</span>}
    </div>
  );
}

import styles from "./ConfirmDialog.module.css";
import Button from "./Button";

export default function ConfirmDialog({
  message,
  onConfirm,
  onCancel,
  loading,
}) {
  return (
    <div className={styles.backdrop}>
      <div className={styles.dialog}>
        <p className={styles.message}>{message}</p>
        <div className={styles.actions}>
          <Button variant="secondary" onClick={onCancel} disabled={loading}>
            Cancel
          </Button>
          <Button variant="danger" onClick={onConfirm} loading={loading}>
            Delete
          </Button>
        </div>
      </div>
    </div>
  );
}

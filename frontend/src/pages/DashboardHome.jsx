import { useAuth } from "../context/AuthContext";
import styles from "./DashboardHome.module.css";

export default function DashboardHome() {
  const { user } = useAuth();

  return (
    <div className={styles.page}>
      <h2 className={styles.heading}>Welcome back, {user?.username}!</h2>
      <p className={styles.sub}>
        You are logged in as <strong>{user?.userType || "User"}</strong>.
      </p>
    </div>
  );
}

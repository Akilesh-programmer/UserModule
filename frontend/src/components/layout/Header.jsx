import { useNavigate } from "react-router-dom";
import { MdMenu, MdLogout } from "react-icons/md";
import { useAuth } from "../../context/AuthContext";
import toast from "react-hot-toast";
import styles from "./Header.module.css";

export default function Header({ onMenuClick }) {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    toast.success("Logged out successfully");
    navigate("/login");
  };

  return (
    <header className={styles.header}>
      <button className={styles.menuBtn} onClick={onMenuClick}>
        <MdMenu />
      </button>
      <div className={styles.right}>
        <span className={styles.username}>{user?.username}</span>
        <button
          className={styles.logoutBtn}
          onClick={handleLogout}
          title="Logout"
        >
          <MdLogout />
          <span>Logout</span>
        </button>
      </div>
    </header>
  );
}

import { useNavigate } from "react-router-dom";
import { MdMenu, MdLogout } from "react-icons/md";
import { useAuth } from "../../context/AuthContext";
import toast from "react-hot-toast";

export default function Header({ onMenuClick }) {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    toast.success("Logged out successfully");
    navigate("/login");
  };

  return (
    <header className="flex h-16 flex-shrink-0 items-center justify-between border-b border-gray-200 bg-white px-4 lg:px-6">
      <button
        onClick={onMenuClick}
        className="rounded-lg p-2 text-gray-500 hover:bg-gray-100 hover:text-gray-700 transition-colors lg:hidden"
      >
        <MdMenu size={22} />
      </button>

      <div className="flex items-center gap-3 ml-auto">
        <span className="hidden text-sm font-medium text-gray-700 sm:block">
          {user?.username}
        </span>
        <button
          onClick={handleLogout}
          title="Logout"
          className="flex items-center gap-1.5 rounded-lg px-3 py-2 text-sm text-gray-600 hover:bg-gray-100 hover:text-gray-900 transition-colors"
        >
          <MdLogout size={18} />
          <span>Logout</span>
        </button>
      </div>
    </header>
  );
}

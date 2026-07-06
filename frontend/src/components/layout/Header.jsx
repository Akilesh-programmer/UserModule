import { useNavigate, useLocation } from "react-router-dom";
import { MdMenu, MdLogout, MdPerson, MdNotifications } from "react-icons/md";
import { useAuth } from "../../context/AuthContext";
import toast from "react-hot-toast";

function getBreadcrumb(pathname) {
  const parts = pathname.split("/").filter(Boolean);
  return parts.map((p) =>
    p
      .split("-")
      .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
      .join(" "),
  );
}

export default function Header({ onMenuClick }) {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const crumbs = getBreadcrumb(location.pathname);

  const handleLogout = () => {
    logout();
    toast.success("Logged out successfully");
    navigate("/login");
  };

  const initials = user?.username
    ? user.username.slice(0, 2).toUpperCase()
    : "SF";

  return (
    <header className="header-glass flex h-16 flex-shrink-0 items-center justify-between px-4 lg:px-6 z-10">
      {/* Left — hamburger + breadcrumbs */}
      <div className="flex items-center gap-3">
        <button
          onClick={onMenuClick}
          className="lg:hidden flex items-center justify-center w-9 h-9 rounded-lg text-gray-500 hover:bg-gray-100 hover:text-gray-700 transition-colors"
        >
          <MdMenu size={22} />
        </button>

        {crumbs.length > 0 && (
          <nav className="hidden sm:flex items-center gap-1.5 text-sm">
            <span className="text-gray-400">Home</span>
            {crumbs.map((crumb, i) => (
              <span key={i} className="flex items-center gap-1.5">
                <span className="text-gray-300">/</span>
                <span
                  className={
                    i === crumbs.length - 1
                      ? "font-semibold text-gray-700"
                      : "text-gray-400"
                  }
                >
                  {crumb}
                </span>
              </span>
            ))}
          </nav>
        )}
      </div>

      {/* Right — user info + logout */}
      <div className="flex items-center gap-2">
        {/* User pill */}
        <div className="flex items-center gap-2.5 px-3 py-1.5 rounded-xl bg-gray-50 border border-gray-100">
          <div className="w-7 h-7 rounded-full bg-gradient-primary flex items-center justify-center text-white text-xs font-bold">
            {initials}
          </div>
          <div className="hidden sm:flex flex-col leading-none">
            <span className="text-xs font-semibold text-gray-800">
              {user?.username}
            </span>
            <span className="text-[10px] text-gray-400">{user?.userType || "User"}</span>
          </div>
        </div>

        {/* Logout button */}
        <button
          onClick={handleLogout}
          title="Sign Out"
          className="flex items-center gap-1.5 px-3 py-2 rounded-lg text-sm text-gray-500 hover:bg-red-50 hover:text-danger transition-all duration-150"
        >
          <MdLogout size={18} />
          <span className="hidden sm:inline font-medium">Logout</span>
        </button>
      </div>
    </header>
  );
}

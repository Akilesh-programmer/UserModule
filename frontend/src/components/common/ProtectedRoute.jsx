import { Navigate } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";

/**
 * ProtectedRoute — Guards routes by authentication and (optionally) module permissions.
 *
 * Props:
 *   module  – (optional) permission module key, e.g. "dealer", "userType"
 *   action  – (optional) required action, defaults to "read"
 *
 * If `module` is provided, the component checks `permissions[module][action]`.
 * If the user lacks access, they are redirected to "/" (dashboard).
 * If `module` is omitted, only authentication is checked.
 */
export default function ProtectedRoute({ children, module, action = "read" }) {
  const { user, permissions } = useAuth();

  // Must be logged in
  if (!user) return <Navigate to="/login" replace />;

  // If a module guard is specified, enforce it
  if (module && permissions) {
    const hasAccess = permissions[module]?.[action] === true;
    if (!hasAccess) return <Navigate to="/" replace />;
  }

  return children;
}

import {
  createContext,
  useContext,
  useState,
  useCallback,
  useMemo,
} from "react";
import { loginUser, logoutUser } from "../api/authApi";

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(() => {
    const stored = localStorage.getItem("user");
    return stored ? JSON.parse(stored) : null;
  });

  const [permissions, setPermissions] = useState(() => {
    const stored = localStorage.getItem("permissions");
    return stored ? JSON.parse(stored) : null;
  });

  const login = useCallback(async (credentials) => {
    const { data } = await loginUser(credentials);
    localStorage.setItem("user", JSON.stringify(data.user));
    localStorage.setItem("permissions", JSON.stringify(data.permissions));
    setUser(data.user);
    setPermissions(data.permissions);
    return data;
  }, []);

  const logout = useCallback(async () => {
    try {
      await logoutUser();
    } catch {
      // ignore — clear state regardless
    } finally {
      localStorage.removeItem("user");
      localStorage.removeItem("permissions");
      setUser(null);
      setPermissions(null);
    }
  }, []);

  const value = useMemo(
    () => ({ user, permissions, login, logout }),
    [user, permissions, login, logout],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  return useContext(AuthContext);
}

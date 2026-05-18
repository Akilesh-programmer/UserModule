import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { AuthProvider } from "./context/AuthContext";
import ProtectedRoute from "./components/common/ProtectedRoute";
import LoginPage from "./pages/LoginPage";
import DashboardLayout from "./components/layout/DashboardLayout";
import DashboardHome from "./pages/DashboardHome";
import UserTypePage from "./pages/master/UserTypePage";
import UserCreationPage from "./pages/master/UserCreationPage";
import UserPermissionPage from "./pages/master/UserPermissionPage";
import ManagerPage from "./pages/staff/ManagerPage";
import SalesRepPage from "./pages/staff/SalesRepPage";

export default function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <Routes>
          <Route path="/login" element={<LoginPage />} />
          <Route
            path="/"
            element={
              <ProtectedRoute>
                <DashboardLayout />
              </ProtectedRoute>
            }
          >
            <Route index element={<DashboardHome />} />
            <Route path="master/user-type" element={<UserTypePage />} />
            <Route path="master/user-creation" element={<UserCreationPage />} />
            <Route
              path="master/user-permission"
              element={<UserPermissionPage />}
            />
            <Route path="staff/manager" element={<ManagerPage />} />
            <Route path="staff/sales-rep" element={<SalesRepPage />} />
          </Route>
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </AuthProvider>
    </BrowserRouter>
  );
}

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
import StatePage from "./pages/master/StatePage";
import CityPage from "./pages/master/CityPage";
import PincodePage from "./pages/master/PincodePage";
import AreaPage from "./pages/master/AreaPage";
import MarketPage from "./pages/master/MarketPage";
import DealerPage from "./pages/master/DealerPage";
import CategoryPage from "./pages/item-category/CategoryPage";
import GroupPage from "./pages/item-category/GroupPage";
import TaxPage from "./pages/item-category/TaxPage";
import UnitOfMeasurePage from "./pages/item-category/UnitOfMeasurePage";
import PackingTypePage from "./pages/item-category/PackingTypePage";
import ItemPage from "./pages/item-category/ItemPage";

export default function App() {
  return (
    <BrowserRouter
      future={{ v7_startTransition: true, v7_relativeSplatPath: true }}
    >
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
            <Route path="admin/user-type" element={<UserTypePage />} />
            <Route path="admin/user-creation" element={<UserCreationPage />} />
            <Route path="admin/user-permission" element={<UserPermissionPage />} />
            <Route path="master/manager" element={<ManagerPage />} />
            <Route path="master/sales-rep" element={<SalesRepPage />} />
            <Route path="master/state" element={<StatePage />} />
            <Route path="master/city" element={<CityPage />} />
            <Route path="master/pincode" element={<PincodePage />} />
            <Route path="master/area" element={<AreaPage />} />
            <Route path="master/market" element={<MarketPage />} />
            <Route path="master/dealer" element={<DealerPage />} />
            <Route path="item-category/category" element={<CategoryPage />} />
            <Route path="item-category/group" element={<GroupPage />} />
            <Route path="item-category/tax" element={<TaxPage />} />
            <Route path="item-category/unit-of-measure" element={<UnitOfMeasurePage />} />
            <Route path="item-category/packing-type" element={<PackingTypePage />} />
            <Route path="item-category/item" element={<ItemPage />} />
          </Route>
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </AuthProvider>
    </BrowserRouter>
  );
}

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
import CountryPage from "./pages/master/CountryPage";
import StatePage from "./pages/master/StatePage";
import CityPage from "./pages/master/CityPage";
import PincodePage from "./pages/master/PincodePage";
import AreaPage from "./pages/master/AreaPage";
import MarketPage from "./pages/master/MarketPage";
import DealerPage from "./pages/master/DealerPage";
import ExpenseTypePage from "./pages/master/ExpenseTypePage";
import CompanyPage from "./pages/master/CompanyPage";
import ShopTypePage from "./pages/master/ShopTypePage";
import CategoryPage from "./pages/item-category/CategoryPage";
import GroupPage from "./pages/item-category/GroupPage";
import TaxPage from "./pages/item-category/TaxPage";
import UnitOfMeasurePage from "./pages/item-category/UnitOfMeasurePage";
import PackingTypePage from "./pages/item-category/PackingTypePage";
import ItemPage from "./pages/item-category/ItemPage";
import SchemePage from "./pages/item-category/SchemePage";
import SchemePdfPage from "./pages/item-category/SchemePdfPage";
import ApplicationPdfPage from "./pages/item-category/ApplicationPdfPage";

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
            <Route path="admin/user-type" element={<ProtectedRoute module="userType"><UserTypePage /></ProtectedRoute>} />
            <Route path="admin/user-creation" element={<ProtectedRoute module="userCreation"><UserCreationPage /></ProtectedRoute>} />
            <Route path="admin/user-permission" element={<ProtectedRoute module="userPermission"><UserPermissionPage /></ProtectedRoute>} />
            <Route path="master/manager" element={<ProtectedRoute module="manager"><ManagerPage /></ProtectedRoute>} />
            <Route path="master/sales-rep" element={<ProtectedRoute module="salesRep"><SalesRepPage /></ProtectedRoute>} />
            <Route path="master/country" element={<ProtectedRoute module="country"><CountryPage /></ProtectedRoute>} />
            <Route path="master/state" element={<ProtectedRoute module="state"><StatePage /></ProtectedRoute>} />
            <Route path="master/city" element={<ProtectedRoute module="city"><CityPage /></ProtectedRoute>} />
            <Route path="master/pincode" element={<ProtectedRoute module="pincode"><PincodePage /></ProtectedRoute>} />
            <Route path="master/area" element={<ProtectedRoute module="area"><AreaPage /></ProtectedRoute>} />
            <Route path="master/market" element={<ProtectedRoute module="market"><MarketPage /></ProtectedRoute>} />
            <Route path="master/dealer" element={<ProtectedRoute module="dealer"><DealerPage /></ProtectedRoute>} />
            <Route path="master/expense-type" element={<ProtectedRoute module="expenseType"><ExpenseTypePage /></ProtectedRoute>} />
            <Route path="master/company" element={<ProtectedRoute module="company"><CompanyPage /></ProtectedRoute>} />
            <Route path="master/shop-type" element={<ProtectedRoute module="shopType"><ShopTypePage /></ProtectedRoute>} />
            <Route path="item-category/category" element={<ProtectedRoute module="category"><CategoryPage /></ProtectedRoute>} />
            <Route path="item-category/group" element={<ProtectedRoute module="group"><GroupPage /></ProtectedRoute>} />
            <Route path="item-category/tax" element={<ProtectedRoute module="tax"><TaxPage /></ProtectedRoute>} />
            <Route path="item-category/unit-of-measure" element={<ProtectedRoute module="unitOfMeasure"><UnitOfMeasurePage /></ProtectedRoute>} />
            <Route path="item-category/packing-type" element={<ProtectedRoute module="packingType"><PackingTypePage /></ProtectedRoute>} />
            <Route path="item-category/item" element={<ProtectedRoute module="item"><ItemPage /></ProtectedRoute>} />
            <Route path="item-category/scheme" element={<ProtectedRoute module="scheme"><SchemePage /></ProtectedRoute>} />
            <Route path="item-category/scheme-pdf" element={<ProtectedRoute module="schemePdf"><SchemePdfPage /></ProtectedRoute>} />
            <Route path="item-category/application-pdf" element={<ProtectedRoute module="applicationPdf"><ApplicationPdfPage /></ProtectedRoute>} />
          </Route>
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </AuthProvider>
    </BrowserRouter>
  );
}

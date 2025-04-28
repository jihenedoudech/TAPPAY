import React from "react";
import { BrowserRouter, Route, Routes, Navigate } from "react-router-dom";
import HomePage from "./components/homePage/HomePage";
import OrdersPage from "./components/ordersPage/OrdersPage";
import ProductsPage from "./components/productsPage/ProductsPage";
import ProductForm from "./components/productsPage/ProductForm";
import PaymentPage from "./components/paymentPage/PaymentPage";
import CustomersPage from "./components/customersPage/CustomersPage";
import CustomerForm from "./components/customersPage/CustomerForm";
import ShiftsHistoryPage from "./components/shiftsPage/ShiftsHistoryPage";
import PurchasePage from "./components/inventoryMenu/purchasePage/PurchasePage";
import PurchaseForm from "./components/inventoryMenu/purchasePage/PurchaseForm/PurchaseForm";
import SettingsPage from "./components/settingsPage/SettingsPage";
import OrderDetails from "./components/ordersPage/OrderDetails";
import LoginPage from "./components/loginPage/LoginPage";
import PurchaseDetailsPage from "./components/inventoryMenu/purchasePage/PurchaseDetailsPage";
import CurrentShiftPage from "./components/shiftsPage/CurrentShiftPage";
import CategoriesPage from "./components/productsPage/CategoriesPage";
import ProfileSettingsPage from "./components/settingsPage/profileManagement/ProfileSettingsPage";
import ProductDetails from "./components/productsPage/ProductDetails";
import StoreSelectionPage from "./components/storesPage/StoreSelectionPage";
import UsersPage from "./components/settingsPage/usersManagement/UsersPage";
import UserForm from "./components/settingsPage/usersManagement/UserForm";
import StoresPage from "./components/settingsPage/storesManagement/StoresPage";
import StoreForm from "./components/settingsPage/storesManagement/StoreForm";
import SalesSummaryPage from "./components/reportsPages/SalesSummaryPage";
import ProductsReports from "./components/reportsPages/ProductsReports";
import UsersReports from "./components/reportsPages/UsersReports";
import StockMovementPage from "./components/inventoryMenu/stockMovementPage/stockMovementPage";
import StockMovementForm from "./components/inventoryMenu/stockMovementPage/StockMovementForm";
import ExpensePage from "./components/inventoryMenu/expensePage/ExpensePage";
import ExpenseForm from "./components/inventoryMenu/expensePage/ExpenseForm";
import ProductSelectionPage from "./components/inventoryMenu/ProductSelectionPage";
import StockMovementDetails from "./components/inventoryMenu/stockMovementPage/StockMovementDetails";
import CategoryForm from "./components/productsPage/CategoryForm";
import CategoryDetails from "./components/productsPage/CategoryDetails";
import PurchaseEdit from "./components/inventoryMenu/purchasePage/PurchaseEdit/PurchaseEdit";
import InventoryPage from "./components/inventoryMenu/inventoryPage/InventoryPage";
import InventoryForm from "./components/inventoryMenu/inventoryPage/InventoryForm";
import ShiftDetails from "./components/shiftsPage/ShiftDetails";
import DayDetails from "./components/shiftsPage/DayDetails";

// Define the ProtectedRoute component
const ProtectedRoute = ({ element }) => {
  const isAuthenticated = !!localStorage.getItem("token");
  return isAuthenticated ? element : <Navigate to="/login" />;
};

const App = () => {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/login" element={<LoginPage />} />
        <Route
          path="/store-selection"
          element={<ProtectedRoute element={<StoreSelectionPage />} />}
        />
        <Route path="/" element={<ProtectedRoute element={<HomePage />} />} />
        <Route
          path="/orders"
          element={<ProtectedRoute element={<OrdersPage />} />}
        />
        <Route
          path="/orders/order-details/:mode/:id"
          element={<ProtectedRoute element={<OrderDetails />} />}
        />
        <Route
          path="/products"
          element={<ProtectedRoute element={<ProductsPage />} />}
        />
        <Route
          path="/products/add-new-product"
          element={<ProtectedRoute element={<ProductForm />} />}
        />
        <Route
          path="/products/product-details/:id"
          element={<ProtectedRoute element={<ProductDetails />} />}
        />
        <Route
          path="/products/edit-product/:id"
          element={<ProtectedRoute element={<ProductForm />} />}
        />
        <Route
          path="/products/categories"
          element={<ProtectedRoute element={<CategoriesPage />} />}
        />
        <Route
          path="/products/categories/add-category"
          element={<ProtectedRoute element={<CategoryForm />} />}
        />
        <Route
          path="/products/categories/category-details/:id"
          element={<ProtectedRoute element={<CategoryDetails />} />}
        />
        <Route
          path="/products/categories/update-category/:id"
          element={<ProtectedRoute element={<CategoryForm />} />}
        />
        <Route
          path="/payment"
          element={<ProtectedRoute element={<PaymentPage />} />}
        />
        <Route
          path="/customers"
          element={<ProtectedRoute element={<CustomersPage />} />}
        />
        <Route
          path="/customers/add-new-customer"
          element={<ProtectedRoute element={<CustomerForm />} />}
        />
        <Route
          path="/shifts/current-shift"
          element={<ProtectedRoute element={<CurrentShiftPage />} />}
        />
        <Route
          path="/shifts/shifts-history"
          element={<ProtectedRoute element={<ShiftsHistoryPage />} />}
        />
        <Route
          path="/shifts/day-details"
          element={<ProtectedRoute element={<DayDetails />} />}
        />
        <Route
          path="/shifts/shift-details/:shiftId"
          element={<ProtectedRoute element={<ShiftDetails />} />}
        />
        <Route
          path="/inventory/purchases-invoices"
          element={<ProtectedRoute element={<PurchasePage />} />}
        />
        <Route
          path="/inventory/purchases-invoices/add-purchase-record"
          element={<ProtectedRoute element={<PurchaseForm />} />}
        />
        <Route
          path="/inventory/purchases-invoices/purchase-edit/:id"
          element={<ProtectedRoute element={<PurchaseEdit />} />}
        />
        <Route
          path="/inventory/purchases-invoices/purchase-details/:id"
          element={<ProtectedRoute element={<PurchaseDetailsPage />} />}
        />
        <Route
          path="/inventory/select-products"
          element={<ProtectedRoute element={<ProductSelectionPage />} />}
        />
        <Route
          path="/inventory/stock-movements"
          element={<ProtectedRoute element={<StockMovementPage />} />}
        />
        <Route
          path="/inventory/stock-movements/stock-movement-details"
          element={<ProtectedRoute element={<StockMovementDetails />} />}
        />
        <Route
          path="/inventory/stock-movements/add-stock-movement"
          element={<ProtectedRoute element={<StockMovementForm />} />}
        />
        <Route
          path="/inventory/expenses"
          element={<ProtectedRoute element={<ExpensePage />} />}
        />
        <Route
          path="/inventory/expenses/add-expense"
          element={<ProtectedRoute element={<ExpenseForm />} />}
        />
        <Route
          path="/inventory/inventories"
          element={<ProtectedRoute element={<InventoryPage />} />}
        />
        <Route
          path="/inventory/inventories/add-inventory/:inventoryId?"
          element={<ProtectedRoute element={<InventoryForm />} />}
        />
        <Route
          path="/settings"
          element={<ProtectedRoute element={<SettingsPage />} />}
        />
        <Route
          path="/settings/profile-settings"
          element={<ProtectedRoute element={<ProfileSettingsPage />} />}
        />
        <Route
          path="/settings/profile-settings/edit-profile"
          element={<ProtectedRoute element={<UserForm />} />}
        />
        <Route
          path="/settings/users-management"
          element={<ProtectedRoute element={<UsersPage />} />}
        />
        <Route
          path="/settings/users-management/add-user"
          element={<ProtectedRoute element={<UserForm />} />}
        />
        <Route
          path="/settings/users-management/edit-user"
          element={<ProtectedRoute element={<UserForm />} />}
        />
        <Route
          path="/settings/stores-management"
          element={<ProtectedRoute element={<StoresPage />} />}
        />
        <Route
          path="/settings/stores-management/add-store"
          element={<ProtectedRoute element={<StoreForm />} />}
        />
        <Route
          path="/reports/sales-summary"
          element={<ProtectedRoute element={<SalesSummaryPage />} />}
        />
        <Route
          path="/reports/products-reports"
          element={<ProtectedRoute element={<ProductsReports />} />}
        />
        <Route
          path="/reports/users-reports"
          element={<ProtectedRoute element={<UsersReports />} />}
        />
      </Routes>
    </BrowserRouter>
  );
};

export default App;

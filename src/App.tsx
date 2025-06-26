import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import {
  BrowserRouter,
  Routes,
  Route,
  Navigate,
  useLocation,
  useNavigate,
  Outlet,
} from "react-router-dom";
import LoginPage from "@/components/auth/LoginPage";
import NotFound from "./pages/NotFound";
import { Dashboard } from "@/components/dashboard/Dashboard";
import { CustomerManagement } from "@/components/customers/CustomerManagement";
import { VendorManagement } from "@/components/vendors/VendorManagement";
import { ProductManagement } from "@/components/products/ProductManagement";
import AddProductManagement from "@/components/addproducts/AddProductManagement";
import { OrderManagement } from "@/components/orders/OrderManagement";
import { CategoryManagement } from "@/components/categories/CategoryManagement";
import { SubCategoryManagement } from "@/components/subcategoies/SubCategoryManagement";
import { BannerManagement } from "@/components/banners/BannerManagement";
import { TransactionManagement } from "@/components/transactions/TransactionManagement";
import { StaticPagesManagement } from "@/components/pages/StaticPagesManagement";
import { SettingsManagement } from "@/components/settings/SettingsManagement";
import { Sidebar } from "@/components/layout/Sidebar";
import { Header } from "@/components/layout/Header";
import UserProfile from "./components/pages/userprofile";
import VendorProfile from "./components/pages/vendorprofile";
import ProductdetailsPage from "./components/pages/productdetailspage";
import OrderDetails from "./components/pages/orderdetails";
import { PendingVendors } from "./components/vendors/PendingVendors";
import AboutUsPage from "./components/pages/aboutus";
import PrivacyPolicyPage from "./components/pages/PrivacyPolicyPage";
import TermsOfServicePage from "./components/pages/TermsOfServicePage";
import RefundPolicy from "./components/pages/refundpolicy";
import React from "react";
import Cookies from "js-cookie";
import { SubSubCategoryManagement } from "./components/sub-subcategoies/SubSubCategoryManagement";
import UpdateProductManagement from "./components/pages/UpdateProductManagement";


const queryClient = new QueryClient();

// Auth components
const AuthRoute = () => {
  const token = Cookies.get("admin_token") || Cookies.get("vendor_token");
  return token ? <Outlet /> : <Navigate to="/login" replace />;
};

const AdminRoute = () => {
  const token = Cookies.get("admin_token");
  const role = Cookies.get("user_role");
  return token && role === "admin" ? <Outlet /> : <Navigate to="/login" replace />;
};

const VendorRoute = () => {
  const token = Cookies.get("vendor_token");
  const role = Cookies.get("user_role");
  return token && role === "vendor" ? <Outlet /> : <Navigate to="/login" replace />;
};

// Section titles and routes
const adminSectionTitles = {
  dashboard: { title: "Admin Dashboard", subtitle: "Overview of your eCommerce platform" },
  customers: { title: "Customer Management", subtitle: "Manage customer accounts and data" },
  vendors: { title: "Vendor Management", subtitle: "Oversee vendor applications and stores" },
  PendingVendors: { title: "Pending Vendors", subtitle: "Manage pending vendor applications" },
  products: { title: "Product Management", subtitle: "Manage product inventory and listings" },
  addproducts: { title: "Add Product", subtitle: "Add new products to your inventory" },
  orders: { title: "Order Management", subtitle: "Track and manage customer orders" },
  categories: { title: "Category Management", subtitle: "Organize product categories" },
  subcategories: { title: "SubCategory Management", subtitle: "Manage product subcategories" },
  banners: { title: "Banner Management", subtitle: "Manage homepage banners and promotions" },
  transactions: { title: "Transactions", subtitle: "View transaction history and wallet logs" },
  pages: { title: "Static Pages", subtitle: "Manage website content pages" },
  settings: { title: "Settings", subtitle: "Configure platform settings" },
};

const vendorSectionTitles = {
  dashboard: { title: "Vendor Dashboard", subtitle: "Overview of your store" },
  products: { title: "My Products", subtitle: "Manage your product listings" },
  addproducts: { title: "Add Product", subtitle: "Add new products to your store" },
  orders: { title: "My Orders", subtitle: "Track and manage your orders" },
};

const adminSectionRoutes = [
  { path: "/admin/dashboard", key: "dashboard", element: <Dashboard /> },
  { path: "/admin/customers", key: "customers", element: <CustomerManagement /> },
  { path: "/admin/vendors", key: "vendors", element: <VendorManagement /> },
  { path: "/admin/products", key: "products", element: <ProductManagement /> },
  { path: "/admin/addproducts", key: "addproducts", element: <AddProductManagement /> },
  { path: "/admin/orders", key: "orders", element: <OrderManagement /> },
  { path: "/admin/categories", key: "categories", element: <CategoryManagement /> },
  { path: "/admin/subcategories", key: "subcategories", element: <SubCategoryManagement /> },
  { path: "/admin/sub-sub-categories", key: "subsubcategories", element: <SubSubCategoryManagement/> },
  { path: "/admin/banners", key: "banners", element: <BannerManagement /> },
  { path: "/admin/transactions", key: "transactions", element: <TransactionManagement /> },
  { path: "/admin/pages", key: "pages", element: <StaticPagesManagement /> },
  { path: "/admin/settings", key: "settings", element: <SettingsManagement /> },
  { path: "/admin/userprofile/:userId", key: "userprofile", element: <UserProfile /> },
  { path: "/admin/vendorprofile/:vendorId", key: "vendorprofile", element: <VendorProfile /> },
  { path: "/admin/productdetails/:productId", key: "productdetails", element: <ProductdetailsPage /> },
  { path: "/admin/product-update/:productId", key: "productUpdate", element: <UpdateProductManagement /> },
  { path: "/admin/orderdetails/:orderId", key: "orderdetails", element: <OrderDetails /> },
  { path: "/admin/pendingvendors", key: "pendingvendors", element: <PendingVendors /> },
  { path: "/admin/aboutus", key: "aboutus", element: <AboutUsPage /> },
  { path: "/admin/privacypolicy", key: "privacypolicy", element: <PrivacyPolicyPage /> },
  { path: "/admin/refundpolicy", key: "refundpolicy", element: <RefundPolicy /> },
  { path: "/admin/termsofservice", key: "termsofservice", element: <TermsOfServicePage /> },
];

const vendorSectionRoutes = [
  { path: "/vendor/dashboard", key: "dashboard", element: <Dashboard /> },
  { path: "/vendor/products", key: "products", element: <ProductManagement /> },
  { path: "/vendor/addproducts", key: "addproducts", element: <AddProductManagement /> },
  { path: "/vendor/orders", key: "orders", element: <OrderManagement /> },
  { path: "/vendor/productdetails/:productId", key: "productdetails", element: <ProductdetailsPage /> },
   { path: "/vendor/product-update/:productId", key: "productUpdate", element: <UpdateProductManagement /> },
  { path: "/vendor/orderdetails/:orderId", key: "orderdetails", element: <OrderDetails /> },
];

// Layout components
function AdminLayout() {
  const location = useLocation();
  const navigate = useNavigate();
  const activeSection = adminSectionRoutes.find((r) => r.path === location.pathname)?.key || "dashboard";
  const currentSection = adminSectionTitles[activeSection] || adminSectionTitles.dashboard;
  
  return (
    <div className="min-h-screen bg-gray-50 flex">
      <Sidebar
        activeSection={activeSection}
        onSectionChange={(section) => navigate(`/admin/${section}`)}
        isAdmin={true}
      />
      <div className="flex-1 flex flex-col">
        <Header
          title={currentSection.title}
          subtitle={currentSection.subtitle}
        />
        <main className="flex-1 p-6">
          <Outlet />
        </main>
      </div>
    </div>
  );
}

function VendorLayout() {
  const location = useLocation();
  const navigate = useNavigate();
  const activeSection = vendorSectionRoutes.find((r) => r.path === location.pathname)?.key || "dashboard";
  const currentSection = vendorSectionTitles[activeSection] || vendorSectionTitles.dashboard;
  
  return (
    <div className="min-h-screen bg-gray-50 flex">
      <Sidebar
        activeSection={activeSection}
        onSectionChange={(section) => navigate(`/vendor/${section}`)}
        isAdmin={false}
      />
      <div className="flex-1 flex flex-col">
        <Header
          title={currentSection.title}
          subtitle={currentSection.subtitle}
        />
        <main className="flex-1 p-6">
          <Outlet />
        </main>
      </div>
    </div>
  );
}

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <Routes>
          <Route path="/login" element={<LoginPage />} />
          
          {/* Admin Routes */}
          <Route element={<AuthRoute />}>
            <Route element={<AdminRoute />}>
              <Route element={<AdminLayout />}>
                {adminSectionRoutes.map(({ path, element }) => (
                  <Route key={path} path={path} element={element} />
                ))}
                <Route path="/admin" element={<Navigate to="/admin/dashboard" replace />} />
              </Route>
            </Route>
            
            {/* Vendor Routes */}
            <Route element={<VendorRoute />}>
              <Route element={<VendorLayout />}>
                {vendorSectionRoutes.map(({ path, element }) => (
                  <Route key={path} path={path} element={element} />
                ))}
                <Route path="/vendor" element={<Navigate to="/vendor/dashboard" replace />} />
              </Route>
            </Route>
          </Route>
          
          {/* Default redirects */}
          <Route path="/" element={<Navigate to="/login" replace />} />
          <Route path="*" element={<NotFound />} />
        </Routes>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
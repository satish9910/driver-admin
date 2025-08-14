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
import { CustomerManagement, DriverManagement } from "@/components/customers/CustomerManagement";
import { SubAdminManagement} from "@/components/subAdmin/SubAdminManagement";
import { MealManagement, ProductManagement } from "@/components/products/ProductManagement";
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
import { PendingVendors } from "./components/subAdmin/PendingVendors";
import AboutUsPage from "./components/pages/aboutus";
import PrivacyPolicyPage from "./components/pages/PrivacyPolicyPage";
import TermsOfServicePage from "./components/pages/TermsOfServicePage";
import RefundPolicy from "./components/pages/refundpolicy";
import React, { useEffect, useState } from "react";
import Cookies from "js-cookie";
import { SubSubCategoryManagement } from "./components/sub-subcategoies/SubSubCategoryManagement";
import UpdateProductManagement from "./components/pages/UpdateProductManagement";
import { ContactQueriesManagement } from "./pages/ContactQueriesManagement";
import Invoice from "./components/Invoice";
import './App.css';
import { cn } from "./lib/utils";
import { DeliveryManagement } from "./components/delivery/DeliveryManagement";
import { PendingDelivery } from "./components/delivery/PendingDelivery";
import PartnerProfile from "./components/pages/Partnerprofile";
import VendorMenuPage from "./components/pages/VendorMenuPage";
import { NotificationManagement } from "./pages/NotificationManagement";
import DriverProfile from "./components/pages/userprofile";
import { BookingManagement } from "./components/bookings/BookingManagement";

const queryClient = new QueryClient();

// Auth components
const AuthRoute = () => {
  const token = Cookies.get("admin_token");
  return token ? <Outlet /> : <Navigate to="/login" replace />;
};

const AdminRoute = () => {
  const token = Cookies.get("admin_token");
  const role = Cookies.get("user_role");
  return token && role === "admin" ? <Outlet /> : <Navigate to="/login" replace />;
};

// Section titles and routes
const adminSectionTitles = {
  dashboard: { title: "Admin Dashboard", subtitle: "Overview of your eCommerce platform" },
  customers: { title: "Driver Management", subtitle: "Manage Driver accounts and data" },
  vendors: { title: "Sub Admin Management", subtitle: "Manage sub-admin accounts and data" },
  deliveryPartners: { title: "Delivery Partners", subtitle: "Manage delivery partner applications and stores" },
  pendingPartners: { title: "Pending Partners", subtitle: "Manage pending delivery partner applications" },
  PendingVendors: { title: "Pending Vendors", subtitle: "Manage pending vendor applications" },
  products: { title: "Meals Management", subtitle: "Manage meal inventory and listings" },
  addproducts: { title: "Add Meal", subtitle: "Add new meals to your inventory" },
  orders: { title: "Order Management", subtitle: "Track and manage customer orders" },
  categories: { title: "Category Management", subtitle: "Organize product categories" },
  subcategories: { title: "SubCategory Management", subtitle: "Manage product subcategories" },
  banners: { title: "Banner Management", subtitle: "Manage homepage banners and promotions" },
  transactions: { title: "Transactions", subtitle: "View transaction history and wallet logs" },
  pages: { title: "Static Pages", subtitle: "Manage website content pages" },
  settings: { title: "Settings", subtitle: "Configure platform settings" },
  notifications: { title: "Notifications", subtitle: "Manage user notifications" },
};

const adminSectionRoutes = [
  { path: "/dashboard", key: "dashboard", element: <Dashboard /> },
  { path: "/drivers", key: "customers", element: <DriverManagement /> },
  { path: "/sub-admin", key: "vendors", element: <SubAdminManagement /> },
  { path: "/bookings", key: "bookings", element: <BookingManagement /> },
  { path: "/deliveryPartners", key: "deliveryPartners", element: <DeliveryManagement /> },
  { path: "/pendingPartners", key: "pendingPartners", element: <PendingDelivery /> },
  { path: "/meals", key: "products", element: <MealManagement /> },
  { path: "/addproducts", key: "addproducts", element: <AddProductManagement /> },
  { path: "/orders", key: "orders", element: <OrderManagement /> },
  { path: "/categories", key: "categories", element: <CategoryManagement /> },
  { path: "/subcategories", key: "subcategories", element: <SubCategoryManagement /> },
  { path: "/sub-sub-categories", key: "subsubcategories", element: <SubSubCategoryManagement/> },
  { path: "/banners", key: "banners", element: <BannerManagement /> },
  { path: "/transactions", key: "transactions", element: <TransactionManagement /> },
  { path: "/pages", key: "pages", element: <StaticPagesManagement /> },
  { path: "/settings", key: "settings", element: <SettingsManagement /> },
  { path: "/userprofile/:userId", key: "userprofile", element: <UserProfile /> },
  { path: "/driverprofile/:driverId", key: "driverprofile", element: <DriverProfile /> },
  { path: "/mealdetails/:productId", key: "productdetails", element: <ProductdetailsPage /> },
  { path: "/product-update/:productId", key: "productUpdate", element: <UpdateProductManagement /> },
  { path: "/orderdetails/:orderId", key: "orderdetails", element: <OrderDetails /> },
  { path: "/pendingvendors", key: "pendingvendors", element: <PendingVendors /> },
  { path: "/aboutus", key: "aboutus", element: <AboutUsPage /> },
  { path: "/privacypolicy", key: "privacypolicy", element: <PrivacyPolicyPage /> },
  { path: "/refundpolicy", key: "refundpolicy", element: <RefundPolicy /> },
  { path: "/termsofservice", key: "termsofservice", element: <TermsOfServicePage /> },
  { path: "/contact-us", key: "contactus", element: <ContactQueriesManagement /> },
  { path: "/invoice", key: "invoice", element: <Invoice /> },
  { path: "/partnerprofile/:partnerId", key: "partnerprofile", element: <PartnerProfile /> },
  { path: "/VendorMenu/:vendorId", key: "vendorMenu", element: <VendorMenuPage /> },
  { path: "/notification", key: "notification", element: <NotificationManagement /> },
];

// AdminLayout component
function AdminLayout() {
  const location = useLocation();
  const navigate = useNavigate();
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const handleResize = () => {
      setIsMobile(window.innerWidth < 768);
    };

    handleResize();
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const activeSection = adminSectionRoutes.find((r) => r.path === location.pathname)?.key || "dashboard";
  const currentSection = adminSectionTitles[activeSection] || adminSectionTitles.dashboard;
  
  return (
    <div className="min-h-screen bg-gray-50">
      <Sidebar
        activeSection={activeSection}
        onSectionChange={(section) => navigate(`/${section}`)}
        isAdmin={true}
      />
      <div className={cn(
        "flex-1 flex flex-col transition-all duration-300",
        isMobile ? "ml-0" : "ml-16 md:ml-64"
      )}>
        <Header
          title={currentSection.title}
          subtitle={currentSection.subtitle}
        />
        <main className="flex-1 p-4 md:p-6 mt-16">
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
      <BrowserRouter basename="/admin">
        <Routes>
          <Route path="/login" element={<LoginPage />} />
          
          {/* Admin Routes */}
          <Route element={<AuthRoute />}>
            <Route element={<AdminRoute />}>
              <Route element={<AdminLayout />}>
                {adminSectionRoutes.map(({ path, element }) => (
                  <Route key={path} path={path} element={element} />
                ))}
                <Route path="/admin" element={<Navigate to="/dashboard" replace />} />
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
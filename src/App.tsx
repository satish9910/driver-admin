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
// import ContactUsPage from "./components/pages/ContactUsPage";
import PrivacyPolicyPage from "./components/pages/PrivacyPolicyPage";
import TermsOfServicePage from "./components/pages/TermsOfServicePage";
import React from "react";

const queryClient = new QueryClient();

const sectionTitles = {
  dashboard: {
    title: "Dashboard",
    subtitle: "Overview of your eCommerce platform",
  },
  customers: {
    title: "Customer Management",
    subtitle: "Manage customer accounts and data",
  },
  vendors: {
    title: "Vendor Management",
    subtitle: "Oversee vendor applications and stores",
  },
  PendingVendors: {
    title: "Pending Vendors",
    subtitle: "Manage pending vendor applications",
  },
  products: {
    title: "Product Management",
    subtitle: "Manage product inventory and listings",
  },
  addproducts: {
    title: "Add Product",
    subtitle: "Add new products to your inventory",
  },
  orders: {
    title: "Order Management",
    subtitle: "Track and manage customer orders",
  },
  categories: {
    title: "Category Management",
    subtitle: "Organize product categories",
  },
  subcategories: {
    title: "SubCategory Management",
    subtitle: "Manage product subcategories",
  },
  banners: {
    title: "Banner Management",
    subtitle: "Manage homepage banners and promotions",
  },
  transactions: {
    title: "Transactions",
    subtitle: "View transaction history and wallet logs",
  },
  pages: { title: "Static Pages", subtitle: "Manage website content pages" },
  settings: { title: "Settings", subtitle: "Configure platform settings" },
};

const sectionRoutes = [
  { path: "/dashboard", key: "dashboard", element: <Dashboard /> },
  { path: "/customers", key: "customers", element: <CustomerManagement /> },
  { path: "/vendors", key: "vendors", element: <VendorManagement /> },
  { path: "/products", key: "products", element: <ProductManagement /> },
  {
    path: "/addproducts",
    key: "addproducts",
    element: <AddProductManagement />,
  },
  { path: "/orders", key: "orders", element: <OrderManagement /> },
  { path: "/categories", key: "categories", element: <CategoryManagement /> },
  {
    path: "/subcategories",
    key: "subcategories",
    element: <SubCategoryManagement />,
  },
  { path: "/banners", key: "banners", element: <BannerManagement /> },
  {
    path: "/transactions",
    key: "transactions",
    element: <TransactionManagement />,
  },
  { path: "/pages", key: "pages", element: <StaticPagesManagement /> },
  { path: "/settings", key: "settings", element: <SettingsManagement /> },
  {
    path: "/userprofile/:userId",
    key: "userprofile",
    element: <UserProfile />,
  },
  {
    path: "/vendorprofile/:vendorId",
    key: "vendorprofile",
    element: <VendorProfile />,
  },
  {
    path: "/productdetails/:productId",
    key: "productdetails",
    element: <ProductdetailsPage />,
  },
  {
    path: "/orderdetails/:orderId",
    key: "orderdetails",
    element: <OrderDetails />,
  },
  {
    path: "/pendingvendors",
    key: "pendingvendors",
    element: <PendingVendors />,
  },

  {
    path: "/aboutus",
    key: "aboutus",
    element: <AboutUsPage />,
  },
  {
    path: "/privacypolicy",
    key: "privacypolicy",
    element: <PrivacyPolicyPage />,
  },

  // {
  //   path: "/contactus",
  //   key: "contactus",
  //   element: <ContactUsPage />,
  // },

  {
    path: "/termsofservice",
    key: "termsofservice",
    element: <TermsOfServicePage />,
  },
];

function AdminLayout({ children }) {
  const location = useLocation();
  const navigate = useNavigate();
  const activeSection =
    sectionRoutes.find((r) => r.path === location.pathname)?.key || "dashboard";
  const currentSection =
    sectionTitles[activeSection] || sectionTitles.dashboard;
  return (
    <div className="min-h-screen bg-gray-50 flex">
      <Sidebar
        activeSection={activeSection}
        onSectionChange={(section) => navigate(`/${section}`)}
      />
      <div className="flex-1 flex flex-col">
        <Header
          title={currentSection.title}
          subtitle={currentSection.subtitle}
        />
        <main className="flex-1 p-6">{children}</main>
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
          <Route path="/" element={<LoginPage />} />
          {sectionRoutes.map(({ path, element, key }) => (
            <Route
              key={path}
              path={path}
              element={<AdminLayout>{element}</AdminLayout>}
            />
          ))}
          <Route path="/index" element={<Navigate to="/dashboard" replace />} />
          <Route path="*" element={<NotFound />} />
        </Routes>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;

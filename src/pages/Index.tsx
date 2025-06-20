import { useState } from "react";
import { Sidebar } from "@/components/layout/Sidebar";
import { Header } from "@/components/layout/Header";
import { Dashboard } from "@/components/dashboard/Dashboard";
import { CustomerManagement } from "@/components/customers/CustomerManagement";
import { VendorManagement } from "@/components/vendors/VendorManagement";
import { ProductManagement } from "@/components/products/ProductManagement";
import { OrderManagement } from "@/components/orders/OrderManagement";
import { CategoryManagement } from "@/components/categories/CategoryManagement";
import { SubCategoryManagement } from "@/components/subcategoies/SubCategoryManagement";
import { BannerManagement } from "@/components/banners/BannerManagement";
import { TransactionManagement } from "@/components/transactions/TransactionManagement";
import { StaticPagesManagement } from "@/components/pages/StaticPagesManagement";
import { SettingsManagement } from "@/components/settings/SettingsManagement";
import AddProductManagement from "@/components/addproducts/AddProductManagement";

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
  products: {
    title: "Product Management",
    subtitle: "Manage product inventory and listings",
  },
  addProduct: {
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

const Index = () => {
  const [activeSection, setActiveSection] = useState("dashboard");

  const renderContent = () => {
    switch (activeSection) {
      case "dashboard":
        return <Dashboard />;
      case "customers":
        return <CustomerManagement />;
      case "vendors":
        return <VendorManagement />;
      case "products":
        return <ProductManagement />;
      case "addproducts":
        return <AddProductManagement />;
      case "orders":
        return <OrderManagement />;
      case "categories":
        return <CategoryManagement />;
      case "subcategories":
        return <SubCategoryManagement />;
      case "banners":
        return <BannerManagement />;
      case "transactions":
        return <TransactionManagement />;
      case "pages":
        return <StaticPagesManagement />;
      case "settings":
        return <SettingsManagement />;
      default:
        return <Dashboard />;
    }
  };

  const currentSection =
    sectionTitles[activeSection as keyof typeof sectionTitles];

  return (
    <div className="min-h-screen bg-gray-50 flex">
      <Sidebar
        activeSection={activeSection}
        onSectionChange={setActiveSection}
      />
      <div className="flex-1 flex flex-col">
        <Header
          title={currentSection?.title}
          subtitle={currentSection?.subtitle}
        />
        <main className="flex-1 p-6">{renderContent()}</main>
      </div>
    </div>
  );
};

export default Index;

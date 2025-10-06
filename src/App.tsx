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

import { Sidebar } from "@/components/layout/Sidebar";
import { Header } from "@/components/layout/Header";

import React, { useEffect, useState } from "react";
import Cookies from "js-cookie";

import "./App.css";
import { cn } from "./lib/utils";
import { AdminDashboard } from "./components/dashboard/Dashboard";
import { JobSeekerManagement } from "./components/jobseekers/JobSeekerManagement";
import { JobSeekerDetail } from "./components/jobseekers/JobSeekerDetail";
import { EmployerManagement } from "./components/employers/EmployerManagement";
import { IndustryManagement } from "./components/industries/IndustryManagement";
// Admin Components

const queryClient = new QueryClient();

// Auth components
const AuthRoute = () => {
  const token = Cookies.get("admin_token");
  return token ? <Outlet /> : <Navigate to="/login" replace />;
};

const AdminRoute = () => {
  const token = Cookies.get("admin_token");
  const role = Cookies.get("user_role");
  // Allow both superadmin and admin roles
  return token && (role === "admin" || role === "superadmin") ? (
    <Outlet />
  ) : (
    <Navigate to="/login" replace />
  );
};

// Section titles and routes

const adminSectionTitles = {
  dashboard: {
    title: "Admin Dashboard",
    subtitle: "Overview of your platform",
  },
  "job-seekers": {
    title: "Job Seeker Management",
    subtitle: "Manage job seeker accounts and data",
  },
  employers: {
    title: "Employer Management",
    subtitle: "Manage employer accounts and data",
  },
  industries: {
    title: "Industry Management",
    subtitle: "Manage industry categories",
  },
};

const adminSectionRoutes = [
  // Admin specific routes
  {
    path: "/dashboard",
    key: "admin-dashboard",
    element: <AdminDashboard />,
  },
  {
    path: "/job-seekers",
    key: "job-seekers",
    element: <JobSeekerManagement />,
  },
  {
    path: "/job-seekers/:id",
    key: "job-seeker-detail",
    element: <JobSeekerDetail />,
  },
  { path: "/employers", key: "employers", element: <EmployerManagement /> },
  { path: "/industries", key: "industries", element: <IndustryManagement /> },
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
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  const activeSection =
    adminSectionRoutes.find((r) => r.path === location.pathname)?.key ||
    "dashboard";
  const currentSection =
    adminSectionTitles[activeSection] || adminSectionTitles.dashboard;

  return (
    <div className="min-h-screen bg-gray-50">
      <Sidebar
        activeSection={activeSection}
        onSectionChange={(section) => navigate(`/${section}`)}
      />
      <div
        className={cn(
          "flex-1 flex flex-col transition-all duration-300",
          isMobile ? "ml-0" : "ml-16 md:ml-64"
        )}
      >
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
                <Route
                  path="/admin"
                  element={<Navigate to="/dashboard" replace />}
                />
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

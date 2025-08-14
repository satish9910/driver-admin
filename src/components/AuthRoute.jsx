import { Navigate, Outlet } from "react-router-dom";
import Cookies from "js-cookie";

export const AuthRoute = () => {
  const token = Cookies.get("admin_token");
  return token ? <Outlet /> : <Navigate to="/login" replace />;
};

export const AdminRoute = () => {
  const token = Cookies.get("admin_token");
  const userData = Cookies.get("user_data");
  
  if (!token) return <Navigate to="/login" replace />;
  
  try {
    const user = userData ? JSON.parse(decodeURIComponent(userData)) : null;
    if (user && (user.role === "admin" || user.role === "subadmin")) {
      return <Outlet />;
    }
  } catch (e) {
    console.error("Error parsing user data", e);
  }
  
  return <Navigate to="/unauthorized" replace />;
};

export const PermissionRoute = ({ requiredPermission, children }) => {
  const token = Cookies.get("admin_token");
  const userData = Cookies.get("user_data");
  
  if (!token) return <Navigate to="/login" replace />;
  
  try {
    const user = userData ? JSON.parse(decodeURIComponent(userData)) : null;
    
    if (user?.role === "admin") return <Outlet />;
    if (user?.role === "subadmin" && user.permissions?.includes(requiredPermission)) {
      return <Outlet />;
    }
  } catch (e) {
    console.error("Error parsing user data", e);
  }
  
  return <Navigate to="/unauthorized" replace />;
};
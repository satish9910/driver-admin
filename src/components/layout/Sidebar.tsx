import { useState } from "react";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { cn } from "@/lib/utils";
import logo from "../../../public/images/logo.png"
import {
  BarChart3,
  Users,
  Store,
  Package,
  ShoppingCart,
  Grid2x2,
  Image,
  Wallet,
  Settings,
  FileText,
  Menu,
  X,
  LogOut,
  User,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import Cookies from "js-cookie";
import { useNavigate } from "react-router-dom";

interface SidebarProps {
  activeSection: string;
  onSectionChange: (section: string) => void;
  isAdmin: boolean;
}

const adminSidebarItems = [
  { id: "dashboard", label: "Dashboard", icon: BarChart3 },
  { id: "customers", label: "Customers", icon: Users },
  { id: "vendors", label: "Vendors", icon: Store, badge: "3" },
  { id: "pendingvendors", label: "Pending Vendors", icon: Store, badge: "3" },
  { id: "categories", label: "Categories", icon: Grid2x2 },
  { id: "subcategories", label: "Sub Categories", icon: Grid2x2 },
  { id: "sub-sub-categories", label: "Sub Sub Categories", icon: Grid2x2 },
  { id: "addproducts", label: "Add Products", icon: Package },
  { id: "products", label: "Products", icon: Package },
  { id: "orders", label: "Orders", icon: ShoppingCart, badge: "12" },
  { id: "banners", label: "Banners", icon: Image },
  { id: "transactions", label: "Transactions", icon: Wallet },
  { id: "pages", label: "Static Pages", icon: FileText },
  { id: "settings", label: "Settings", icon: Settings },
];

const vendorSidebarItems = [
  { id: "dashboard", label: "Dashboard", icon: BarChart3 },
  { id: "products", label: "My Products", icon: Package },
  { id: "addproducts", label: "Add Products", icon: Package },
  { id: "orders", label: "My Orders", icon: ShoppingCart, badge: "5" },
];

export function Sidebar({ activeSection, onSectionChange, isAdmin }: SidebarProps) {
  const [isCollapsed, setIsCollapsed] = useState(false);
  const sidebarItems = isAdmin ? adminSidebarItems : vendorSidebarItems;

  const navigate = useNavigate();

    const handleLogout = () => {
    // Remove all auth-related cookies
    Cookies.remove("admin_token");
    Cookies.remove("vendor_token");
    Cookies.remove("user_role");
    Cookies.remove("user_data");
  


    // Redirect to login
    navigate("/login");
  };

  return (
    <div
      className={cn(
        "h-screen bg-white border-r border-gray-200 transition-all duration-300 flex flex-col fixed left-0 top-0 z-50",
        isCollapsed ? "w-16" : "w-64"
      )}
    >
      {/* Header */}
      <div className="p-4 border-b border-gray-200">
        <div className="flex items-center justify-between">
          {!isCollapsed && (
            <div className="flex flex-col items-center space-x-2">
               <img src={logo} alt="Shopinger Logo" className="mx-auto h-10 w-auto mb-2" />
              {/* <span className="font-semibold text-gray-900">
                {isAdmin ? " Admin" : " Vendor"}
              </span> */}
            </div>
          )}
          <Button
            variant="ghost"
            size="icon"
            onClick={() => setIsCollapsed(!isCollapsed)}
            className="h-8 w-8"
          >
            {isCollapsed ? (
              <Menu className="h-4 w-4" />
            ) : (
              <X className="h-4 w-4" />
            )}
          </Button>
        </div>
      </div>

      {/* Navigation */}
      <ScrollArea className="flex-1 p-2">
        <nav className="space-y-1">
          {sidebarItems.map((item) => {
            const Icon = item.icon;
            const isActive = activeSection === item.id;

            return (
              <Button
                key={item.id}
                variant={isActive ? "secondary" : "ghost"}
                className={cn(
                  "w-full justify-start h-10 px-3",
                  isCollapsed ? "px-2" : "px-3",
                  isActive && "bg-blue-50 text-blue-700 border-r-2 border-blue-700"
                )}
                onClick={() => onSectionChange(item.id)}
              >
                <Icon className={cn("h-4 w-4", !isCollapsed && "mr-3")} />
                {!isCollapsed && (
                  <span className="flex-1 text-left">{item.label}</span>
                )}
                {!isCollapsed && item.badge && (
                  <Badge variant="secondary" className="ml-auto">
                    {item.badge}
                  </Badge>
                )}
              </Button>
            );
          })}
        </nav>
      </ScrollArea>

      {/* Footer */}
      <div className="p-4 border-t border-gray-200">
        {!isCollapsed ? (
          <div className="flex items-center space-x-3">
            <div className="w-8 h-8 bg-gray-300 rounded-full ">
              <User className="h-8 w-8 text-gray-500" />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-gray-900 truncate">
                {isAdmin ? "Admin User" : "Vendor Account"}
              </p>
              <p className="text-xs text-gray-500 truncate">
                {isAdmin ? "Super Admin" : "Verified Vendor"}
              </p>
            </div>
            <Button 
              variant="ghost" 
              size="icon" 
              className="h-8 w-8"
              onClick={() => {
                // Add logout logic here
                localStorage.clear();
                window.location.href = "/login";
              }}
            >
              <LogOut className="h-4 w-4" />
            </Button>
          </div>
        ) : (
          <Button 
            variant="ghost" 
            size="icon" 
            className="w-full h-10"
            onClick={() => handleLogout}
          >
            <LogOut className="h-4 w-4" />
          </Button>
        )}
      </div>
    </div>
  );
}
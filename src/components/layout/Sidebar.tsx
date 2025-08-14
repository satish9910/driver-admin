import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { cn } from "@/lib/utils";
import {
  BarChart3,
  Users,
  Store,
  Package,
  ShoppingCart,
  Image,
  Settings,
  Menu,
  X,
  LogOut,
  User,
  Car,
} from "lucide-react";
import Cookies from "js-cookie";
import { useNavigate } from "react-router-dom";

interface SidebarProps {
  activeSection: string;
  onSectionChange: (section: string) => void;
}

const allSidebarItems = [
  { id: "dashboard", label: "Dashboard", icon: BarChart3, permission: null },
  { id: "drivers", label: "Drivers", icon: Users, permission: "manage_drivers" },
  { id: "sub-admin", label: "Sub Admin", icon: Store, permission: "manage_subadmins" },
  { id: "bookings", label: "Bookings", icon: ShoppingCart, permission: "manage_bookings" },
  // { id: "deliveryPartners", label: "Delivery Partners", icon: Users, permission: "manage_delivery" },
  // { id: "pendingPartners", label: "Pending Partners", icon: Users, permission: "manage_delivery" },
  // { id: "meals", label: "Meals", icon: Package, permission: "manage_meals" },
  // { id: "addproducts", label: "Add Meal", icon: Package, permission: "manage_meals" },
  // { id: "orders", label: "Orders", icon: ShoppingCart, permission: "manage_orders" },
  // { id: "categories", label: "Categories", icon: Image, permission: "manage_categories" },
  // { id: "subcategories", label: "Sub Categories", icon: Image, permission: "manage_categories" },
  // { id: "sub-sub-categories", label: "Sub Sub Categories", icon: Image, permission: "manage_categories" },
  // { id: "banners", label: "Banners", icon: Image, permission: "manage_banners" },
  { id: "transactions", label: "Account", icon: ShoppingCart, permission: null },
  // { id: "pages", label: "Static Pages", icon: Image, permission: "manage_pages" },
  // { id: "settings", label: "Settings", icon: Settings, permission: "manage_settings" },
  // { id: "notification", label: "Notifications", icon: Settings, permission: "manage_notifications" },
];

export function Sidebar({ activeSection, onSectionChange }: SidebarProps) {
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [isMobile, setIsMobile] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [filteredItems, setFilteredItems] = useState([]);
  const [user, setUser] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    const handleResize = () => {
      setIsMobile(window.innerWidth < 768);
      if (window.innerWidth >= 768) setMobileMenuOpen(false);
    };

    // Get user data and filter sidebar items
    const userData = Cookies.get("user_data");
    if (userData) {
      try {
        const parsedUser = JSON.parse(decodeURIComponent(userData));
        setUser(parsedUser);
        
        if (parsedUser.role === "admin") {
          setFilteredItems(allSidebarItems);
        } else {
          setFilteredItems(allSidebarItems.filter(item => 
            !item.permission || parsedUser.permissions?.includes(item.permission)
          ));
        }
      } catch (e) {
        console.error("Error parsing user data", e);
      }
    }

    handleResize();
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const handleLogout = () => {
    Cookies.remove("admin_token");
    Cookies.remove("user_role");
    Cookies.remove("user_data");
    navigate("/login");
  };

  return (
    <>
      {isMobile && (
        <div className="fixed top-4 left-4 z-50 md:hidden">
          <Button
            variant="outline"
            size="icon"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="h-10 w-10"
          >
            {mobileMenuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </Button>
        </div>
      )}
      
      <div className={cn(
        "h-screen bg-white border-r border-gray-200 transition-all duration-300 flex flex-col fixed left-0 top-0 z-40",
        isMobile ? (mobileMenuOpen ? "w-64" : "-translate-x-full") : 
        (isCollapsed ? "w-16" : "w-64")
      )}>
        <div className="p-4 border-b border-gray-200">
          <div className="flex items-center justify-between">
            {(!isCollapsed || isMobile) && (
              <div className="flex items-center justify-center space-x-2">
                <Car className="h-6 w-6 text-gray-500" />
                <h1 className="text-lg font-semibold text-gray-900">Drivero</h1>
              </div>
            )}
            {!isMobile && (
              <Button
                variant="ghost"
                size="icon"
                onClick={() => setIsCollapsed(!isCollapsed)}
                className="h-8 w-8"
              >
                {isCollapsed ? <Menu className="h-4 w-4" /> : <X className="h-4 w-4" />}
              </Button>
            )}
          </div>
        </div>

        <ScrollArea className="flex-1 p-2">
          <nav className="space-y-1">
            {filteredItems.map((item) => {
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
                  onClick={() => {
                    onSectionChange(item.id);
                    if (isMobile) setMobileMenuOpen(false);
                  }}
                >
                  <Icon className={cn("h-4 w-4", (!isCollapsed || isMobile) && "mr-3")} />
                  {(!isCollapsed || isMobile) && (
                    <span className="flex-1 text-left">{item.label}</span>
                  )}
                </Button>
              );
            })}
          </nav>
        </ScrollArea>

        <div className="p-4 border-t border-gray-200">
          {(!isCollapsed || isMobile) ? (
            <div className="flex items-center space-x-3">
              <div className="w-8 h-8 bg-gray-300 rounded-full">
                <User className="h-8 w-8 text-gray-500" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-gray-900 truncate">
                  {user?.name || "User"}
                </p>
                <p className="text-xs text-gray-500 truncate">
                  {user?.role === "admin" ? "Super Admin" : "Sub Admin"}
                </p>
              </div>
              <Button 
                variant="ghost" 
                size="icon" 
                className="h-8 w-8"
                onClick={handleLogout}
              >
                <LogOut className="h-4 w-4" />
              </Button>
            </div>
          ) : (
            <Button 
              variant="ghost" 
              size="icon" 
              className="w-full h-10"
              onClick={handleLogout}
            >
              <LogOut className="h-4 w-4" />
            </Button>
          )}
        </div>
      </div>
    </>
  );
}
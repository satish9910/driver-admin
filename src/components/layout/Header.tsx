import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { useNavigate } from "react-router-dom";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Bell, Search, Settings, User } from "lucide-react";
import { Link } from "react-router-dom";
import { useEffect, useState } from "react";
import Cookies from "js-cookie"; // Make sure to install js-cookie if not already
import { cn } from "@/lib/utils";



interface HeaderProps {
  title: string;
  subtitle?: string;
}

export function Header({ title, subtitle }: HeaderProps) {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
   const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const handleResize = () => {
      setIsMobile(window.innerWidth < 768);
    };

    handleResize();
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);
  const role = Cookies.get("user_role");
   
  const isAdmin = role === "admin";
 

  const navigate = useNavigate();
  // const [showLogoutConfirm, setShowLogoutConfirm] = useState(false);

  const handleLogout = () => {
    // Remove all auth-related cookies
    Cookies.remove("admin_token");
    Cookies.remove("vendor_token");
    Cookies.remove("user_role");
    Cookies.remove("user_data");
    setIsLoggedIn(false);


    // Redirect to login
    navigate("/login");
  };

  // const handleLogoutClick = () => {
  //   setShowLogoutConfirm(true);
  // };

  // const handleConfirmLogout = () => {
  //   setShowLogoutConfirm(false);
  //   handleLogout();
  // };

  // const handleCancelLogout = () => {
  //   setShowLogoutConfirm(false);
  // };


  useEffect(() => {
    // Check for token in cookies when component mounts
    const token = isAdmin ? Cookies.get("admin_token"): Cookies.get("vendor_token");
    setIsLoggedIn(!!token);
  }, [ ]);

  return (
 <div className={cn(
      "bg-white border-b border-gray-200 px-4 md:px-6 flex items-center justify-between z-40",
      isMobile ? "fixed top-0 left-0 right-0 h-16" : "fixed top-0 left-64 right-0 h-16"
    )}>
      <div
        className={cn(
          "flex flex-col space-x-4",
          isMobile ? "items-center justify-center flex-1 text-center" : "items-start justify-center"
        )}
        style={isMobile ? { width: "100%" } : {}}
      >
        <h1 className={cn(
          "font-semibold text-gray-900",
          isMobile ? "text-sm" : "text-xl"
        )}>
          {title}
        </h1>
        {subtitle && (
          <p className={cn(
        "text-gray-600",
        isMobile ? "text-xs" : "text-sm"
          )}>
        {subtitle}
          </p>
        )}
      </div>
      <div className="flex items-center space-x-4">
        {/* Search */}
        {/* <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
          <Input placeholder="Search..." className="w-64 pl-10" />
        </div> */}

        {/* Notifications - Only show if logged in */}
        {isLoggedIn && !isMobile && (
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              {/* <Button variant="ghost" size="icon" className="relative">
                <Bell className="h-5 w-5" />
                <Badge className="absolute -top-1 -right-1 h-5 w-5 flex items-center justify-center p-0 text-xs">
                  3
                </Badge>
              </Button> */}
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-80">
              <DropdownMenuLabel>Notifications</DropdownMenuLabel>
              <DropdownMenuSeparator />
              <DropdownMenuItem>
                <div className="flex flex-col space-y-1">
                  <p className="text-sm font-medium">New vendor application</p>
                  <p className="text-xs text-gray-500">
                    TechStore wants to join the platform
                  </p>
                </div>
              </DropdownMenuItem>
              <DropdownMenuItem>
                <div className="flex flex-col space-y-1">
                  <p className="text-sm font-medium">
                    Order requires attention
                  </p>
                  <p className="text-xs text-gray-500">
                    Order #1234 has payment issues
                  </p>
                </div>
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        )}

        {/* Profile dropdown or Login button */}
        {isLoggedIn ? (
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="icon">
                <User className="h-5 w-5" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuLabel>My Account</DropdownMenuLabel>
              <DropdownMenuSeparator />
              <Link to="/profile" >
              <DropdownMenuItem>
               
                Profile
              </DropdownMenuItem>
              </Link>

              <DropdownMenuItem
                onClick={handleLogout}
              >
                Logout
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        ) : (
          <Button variant="default" asChild>
            <Link to="/">Login</Link>
          </Button>
        )}
      </div>
    </div>
  );
}

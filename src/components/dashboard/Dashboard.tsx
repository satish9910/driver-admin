import { StatsCard } from "./StatsCard";
import { RecentOrders } from "./RecentOrders";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Users,
  Package,
  ShoppingCart,
  UserCheck,
  IndianRupee,
} from "lucide-react";
import { useEffect, useState } from "react";
import axios from "axios";
import Cookies from "js-cookie";

interface DashboardData {
  totalUsers: number;
  totalBookings: number;
  totalSubAdmins: number;
  totalTransactions: number;
}

interface Notification {
  id: number;
  type: string;
  message: string;
  time: string;
  urgent: boolean;
}

export function Dashboard() {
  const [data, setData] = useState<DashboardData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const role = Cookies.get("user_role");
  
  const token = role === "admin" ? Cookies.get("admin_token") : Cookies.get("vendor_token");

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        const baseUrl = import.meta.env.VITE_BASE_UR;
        const response = await axios.get(
          `${baseUrl}admin/dashboard`,
          {
            headers: {
              Authorization: `Bearer ${token}`,
              "Content-Type": "application/json",
            },
          }
        );

        if (response.data) {
          setData(response.data);
        } else {
          setError("Failed to fetch dashboard data");
        }
      } catch (err) {
        setError("Error fetching dashboard data");
        console.error("Error fetching dashboard data:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchDashboardData();
  }, [role, token]);

  const generateNotifications = (): Notification[] => {
    if (!data) return [];

    const notifications: Notification[] = [];

    if (data.totalBookings === 0) {
      notifications.push({
        id: 1,
        type: "order",
        message: "No bookings yet",
        time: "Just now",
        urgent: false,
      });
    }

    if (data.totalUsers === 0) {
      notifications.push({
        id: 2,
        type: "user",
        message: "No users registered yet",
        time: "Today",
        urgent: true,
      });
    }

    return notifications.length > 0
      ? notifications
      : [
          {
            id: 1,
            type: "system",
            message: "All systems operational",
            time: "Just now",
            urgent: false,
          },
        ];
  };

  const notifications = generateNotifications();

  if (loading) {
    return (
      <div className="ml-64 mt-14 flex items-center justify-center h-screen">
        <div className="text-center">
          <p className="text-lg">Loading dashboard...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="ml-64 mt-14 flex items-center justify-center h-screen">
        <div className="text-center text-red-500">
          <p className="text-lg">{error}</p>
          <Button
            variant="outline"
            className="mt-4"
            onClick={() => window.location.reload()}
          >
            Retry
          </Button>
        </div>
      </div>
    );
  }

  if (!data) {
    return (
      <div className="ml-64 mt-14 flex items-center justify-center h-screen">
        <div className="text-center">
          <p className="text-lg">No data available</p>
        </div>
      </div>
    );
  }

  const dashboardStats = [
    {
      title: "Total Revenue",
      value: `₹${data.totalTransactions}`,
      change: `${data.totalBookings} total bookings`,
      changeType: "positive" as const,
      icon: IndianRupee,
      iconColor: "text-green-600",
    },
    {
      title: "Total Users",
      value: data.totalUsers.toString(),
      change: `${data.totalSubAdmins} sub-admins`,
      changeType: "positive" as const,
      icon: Users,
      iconColor: "text-blue-600",
    },
    {
      title: "Total Bookings",
      value: data.totalBookings.toString(),
      changeType: data.totalBookings > 0 ? "positive" : "neutral",
      icon: ShoppingCart,
      iconColor: "text-orange-600",
    },
    {
      title: "Sub-Admins",
      value: data.totalSubAdmins.toString(),
      changeType: "neutral" as const,
      icon: UserCheck,
      iconColor: "text-purple-600",
    },
  ];

  return (
    <div className="space-y-6 p-6">
      {/* Stats Grid */}
      <div className="grid gap-4 md:grid-cols-1 lg:grid-cols-4">
        {dashboardStats.map((stat, index) => (
          <StatsCard key={index} {...stat} />
        ))}
      </div>

      {/* Additional Cards */}
      {role === "admin" && (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">User Statistics</CardTitle>
              <Users className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="flex justify-between py-1">
                <span className="text-sm">Total Users</span>
                <span className="font-medium">{data.totalUsers}</span>
              </div>
              <div className="flex justify-between py-1">
                <span className="text-sm">Sub-Admins</span>
                <span className="font-medium">{data.totalSubAdmins}</span>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Booking Statistics</CardTitle>
              <ShoppingCart className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="flex justify-between py-1">
                <span className="text-sm">Total Bookings</span>
                <span className="font-medium">{data.totalBookings}</span>
              </div>
              <div className="flex justify-between py-1">
                <span className="text-sm">Total Revenue</span>
                <span className="font-medium">₹{data.totalTransactions}</span>
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Notifications */}
      <Card>
        <CardHeader>
          <CardTitle>Notifications</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {notifications.map((notification) => (
              <div
                key={notification.id}
                className={`flex items-start pb-4 last:pb-0 ${
                  notification.urgent ? "border-l-4 border-red-500 pl-4" : "pl-2"
                }`}
              >
                <div className="space-y-1">
                  <p className="text-sm font-medium leading-none">
                    {notification.message}
                  </p>
                  <p className="text-sm text-muted-foreground">
                    {notification.time}
                  </p>
                </div>
                {notification.urgent && (
                  <Badge variant="destructive" className="ml-auto">
                    Alert
                  </Badge>
                )}
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
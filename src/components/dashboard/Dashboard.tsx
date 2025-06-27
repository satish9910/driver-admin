import { StatsCard } from "./StatsCard";
import { RecentOrders } from "./RecentOrders";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  DollarSign,
  Users,
  Package,
  ShoppingCart,
  TrendingUp,
  AlertTriangle,
  CheckCircle,
  UserCheck,
  List,
  Layers,
  IndianRupee,
} from "lucide-react";
import { useEffect, useState } from "react";
import axios from "axios";
import Cookies from "js-cookie";

interface DashboardStats {
  products: number;
  orders: number;
  users: number;
  pendingVendors: number;
  approvedVendors: number;
  categories: number;
  subCategories: number;
  last5Orders: any[];
  last5MonthSales: any[];
}

interface Notification {
  id: number;
  type: string;
  message: string;
  time: string;
  urgent: boolean;
}

export function Dashboard() {
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const token = Cookies.get("admin_token");

  useEffect(() => {
    const fetchDashboardStats = async () => {
      try {
        const response = await axios.get(
          `${import.meta.env.VITE_BASE_UR}admin/dashboard-stats`,
          {
            headers: {
              Authorization: `Bearer ${token}`,
              "Content-Type": "application/x-www-form-urlencoded",
            },
            params: {
              status: "Under Review",
            },
          }
        );

        if (response.data.success) {
          setStats(response.data.data);
        } else {
          setError("Failed to fetch dashboard stats");
        }
      } catch (err) {
        setError("Error fetching dashboard data");
        console.error("Error fetching dashboard data:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchDashboardStats();
  }, []);

  // Generate notifications based on stats
  const generateNotifications = (): Notification[] => {
    if (!stats) return [];

    const notifications: Notification[] = [];

    if (stats.pendingVendors > 0) {
      notifications.push({
        id: 1,
        type: "vendor",
        message: `${stats.pendingVendors} vendor applications pending approval`,
        time: "Just now",
        urgent: true,
      });
    }

    if (stats.orders > 0) {
      notifications.push({
        id: 2,
        type: "order",
        message: `${stats.orders} orders need processing`,
        time: "Today",
        urgent: stats.orders > 5,
      });
    }

    if (stats.products < 10) {
      notifications.push({
        id: 3,
        type: "product",
        message: "Low product count - consider adding more",
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

  if (!stats) {
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
      value: `₹${stats.last5MonthSales.reduce(
        (total, month) => total + month.totalSales,
        0
      )}`,
      change: `${stats.last5MonthSales.length} months of sales data`,
      changeType: "positive" as const,
      icon: IndianRupee,
      iconColor: "text-green-600",
    },
    {
      title: "Active Users",
      value: stats.users.toString(),
      change: `${stats.approvedVendors} approved vendors`,
      changeType: "positive" as const,
      icon: Users,
      iconColor: "text-blue-600",
    },
    {
      title: "Total Products",
      value: stats.products.toString(),
      change: `₹{stats.categories} categories, ${stats.subCategories} sub-categories`,
      changeType: "neutral" as const,
      icon: Package,
      iconColor: "text-purple-600",
    },
    {
      title: "Total Orders",
      value: stats.orders.toString(),
      change: `${stats.pendingVendors} vendors pending approval`,
      changeType: stats.pendingVendors > 0 ? "negative" : "positive",
      icon: ShoppingCart,
      iconColor: "text-orange-600",
    },
  ];

  return (
    <div className="space-y-6 ml-64 mt-14 p-6">
      {/* Stats Grid */}
      <div className="grid gap-4 md:grid-cols-1 lg:grid-cols-4">
        {dashboardStats.map((stat, index) => (
          <StatsCard key={index} {...stat} />
        ))}
      </div>
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Vendors</CardTitle>
            <UserCheck className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.approvedVendors}</div>
            <p className="text-xs text-muted-foreground">
              {stats.pendingVendors} pending approval
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Categories</CardTitle>
            <List className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.categories}</div>
            <p className="text-xs text-muted-foreground">
              {stats.subCategories} sub-categories
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Latest Order</CardTitle>
            <ShoppingCart className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {stats.last5Orders.length > 0
                ? `${stats.last5Orders[0].id}`
                : "N/A"}
            </div>
            <p className="text-xs text-muted-foreground">
              {stats.last5Orders.length > 0
                ? `₹${stats.last5Orders[0].totalAmount}`
                : "No orders"}
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Latest Month</CardTitle>
            <Layers className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {stats.last5MonthSales.length > 0
                ? `₹${stats.last5MonthSales[0].totalSales}`
                : "N/A"}
            </div>
            <p className="text-xs text-muted-foreground">
              {stats.last5MonthSales.length > 0
                ? new Date(stats.last5MonthSales[0].month).toLocaleString(
                    "default",
                    { month: "long", year: "numeric" }
                  )
                : "No data"}
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Content Grid */}
      <div className="grid gap-6 md:grid-cols-1 lg:grid-cols-3">
        {/* Recent Orders */}
        <div className="lg:col-span-3">
          <Card>
            <CardHeader>
              <CardTitle>Recent Orders</CardTitle>
            </CardHeader>
            <CardContent>
              <RecentOrders last5Orders={stats.last5Orders} />
            </CardContent>
          </Card>
        </div>

        {/* Notifications Panel */}
        {/* <Card>
          <CardHeader>
            <CardTitle className="flex items-center justify-between">
              Recent Notifications
              <Badge variant="secondary">{notifications.length} new</Badge>
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {notifications.map((notification) => (
              <div
                key={notification.id}
                className="flex items-start space-x-3 p-3 rounded-lg bg-gray-50 hover:bg-gray-100 transition-colors"
              >
                {notification.urgent ? (
                  <AlertTriangle className="h-4 w-4 text-orange-600 mt-0.5 flex-shrink-0" />
                ) : (
                  <CheckCircle className="h-4 w-4 text-green-600 mt-0.5 flex-shrink-0" />
                )}
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-gray-900">
                    {notification.message}
                  </p>
                  <p className="text-xs text-gray-500">{notification.time}</p>
                </div>
              </div>
            ))}
            <Button variant="outline" className="w-full mt-4">
              View All Notifications
            </Button>
          </CardContent>
        </Card> */}
      </div>

      {/* Performance Chart */}
      {/* <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <TrendingUp className="h-5 w-5" />
            <span>Sales Performance</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          {stats.last5MonthSales.length > 0 ? (
            <div className="h-64">
              <div className="flex items-center justify-between mb-4">
                {stats.last5MonthSales.map((monthData) => (
                  <div key={monthData.month} className="text-center">
                    <p className="text-sm text-gray-500">
                      {new Date(monthData.month).toLocaleString("default", {
                        month: "short",
                        year: "numeric",
                      })}
                    </p>
                    <p className="font-medium">₹{monthData.totalSales}</p>
                  </div>
                ))}
              </div>
              <div className="h-48 bg-gradient-to-br from-blue-50 to-indigo-50 rounded-lg flex items-center justify-center">
                <TrendingUp className="h-12 w-12 text-blue-600" />
              </div>
            </div>
          ) : (
            <div className="h-64 bg-gradient-to-br from-blue-50 to-indigo-50 rounded-lg flex items-center justify-center">
              <div className="text-center">
                <TrendingUp className="h-12 w-12 text-blue-600 mx-auto mb-4" />
                <p className="text-gray-600">No sales data available</p>
              </div>
            </div>
          )}
        </CardContent>
      </Card> */}

      {/* Additional Stats */}
    </div>
  );
}

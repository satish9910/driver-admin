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
} from "lucide-react";

export function Dashboard() {
  const stats = [
    {
      title: "Total Revenue",
      value: "$45,231.89",
      change: "+20.1% from last month",
      changeType: "positive" as const,
      icon: DollarSign,
      iconColor: "text-green-600",
    },
    {
      title: "Active Customers",
      value: "2,350",
      change: "+180 new customers",
      changeType: "positive" as const,
      icon: Users,
      iconColor: "text-blue-600",
    },
    {
      title: "Total Products",
      value: "12,234",
      change: "+48 products added",
      changeType: "positive" as const,
      icon: Package,
      iconColor: "text-purple-600",
    },
    {
      title: "Pending Orders",
      value: "573",
      change: "+12% from yesterday",
      changeType: "neutral" as const,
      icon: ShoppingCart,
      iconColor: "text-orange-600",
    },
  ];

  const notifications = [
    {
      id: 1,
      type: "vendor",
      message: "New vendor application from TechStore",
      time: "2 minutes ago",
      urgent: true,
    },
    {
      id: 2,
      type: "order",
      message: "Order #12345 requires manual review",
      time: "15 minutes ago",
      urgent: false,
    },
    {
      id: 3,
      type: "product",
      message: "Low stock alert for iPhone 15 Pro",
      time: "1 hour ago",
      urgent: true,
    },
  ];

  return (
    <div className="space-y-6 ml-64 mt-14">
      {/* Stats Grid */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {stats.map((stat, index) => (
          <StatsCard key={index} {...stat} />
        ))}
      </div>

      {/* Content Grid */}
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {/* Recent Orders */}
        <div className="lg:col-span-2">
          <RecentOrders />
        </div>

        {/* Notifications Panel */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center justify-between">
              Recent Notifications
              <Badge variant="secondary">3 new</Badge>
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {notifications.map((notification) => (
              <div
                key={notification.id}
                className="flex items-start space-x-3 p-3 rounded-lg bg-gray-50 hover:bg-gray-100 transition-colors"
              >
                {notification.urgent && (
                  <AlertTriangle className="h-4 w-4 text-orange-600 mt-0.5 flex-shrink-0" />
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
        </Card>
      </div>

      {/* Performance Chart Placeholder */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <TrendingUp className="h-5 w-5" />
            <span>Sales Performance</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="h-64 bg-gradient-to-br from-blue-50 to-indigo-50 rounded-lg flex items-center justify-center">
            <div className="text-center">
              <TrendingUp className="h-12 w-12 text-blue-600 mx-auto mb-4" />
              <p className="text-gray-600">
                Sales chart would be rendered here
              </p>
              <p className="text-sm text-gray-500">
                Integration with charting library needed
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

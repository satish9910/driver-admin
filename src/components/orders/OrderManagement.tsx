import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import Cookies from "js-cookie";

import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Search,
  Filter,
  MoreHorizontal,
  Eye,
  Package,
  Truck,
  CheckCircle,
  Cookie,
} from "lucide-react";
import { StatsCard } from "@/components/dashboard/StatsCard";
import { TrendingUp, ShoppingCart, Users, DollarSign } from "lucide-react";

interface Order {
  id: number;
  userId: number;
  addressId: number;
  totalAmount: string;
  gst: string;
  discount: string;
  couponCode: string;
  status: string;
  orderStatus: string;
  paymentMode: string;
  paymentOrderId: string;
  notes: string;
  createdAt: string;
  updatedAt: string;
  user: {
    id: number;
    name: string;
    email: string;
    phone: string;
  };
  orderItems: {
    id: number;
    orderId: number;
    productId: number;
    variantId: number;
    quantity: number;
    price: string;
    vendorId: number;
    orderItemStatus: string;
    variant: {
      id: number;
      productId: number;
      sku: string;
      price: string;
      stock: number;
      images: string[];
      product: {
        id: number;
        name: string;
        slug: string;
        description: string;
      };
    };
  }[];
}

export function OrderManagement() {
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [paymentFilter, setPaymentFilter] = useState("all");
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);

  const token = Cookies.get("admin_token");

  useEffect(() => {
    const fetchOrders = async () => {
      try {
        const response = await fetch(
          "http://103.189.173.127:3000/api/admin/get-all-orders",
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        );
        const data = await response.json();
        setOrders(data);
        setLoading(false);
      } catch (error) {
        console.error("Error fetching orders:", error);
        setLoading(false);
      }
    };

    fetchOrders();
  }, []);

  const getStatusColor = (status: string) => {
    switch (status) {
      case "DELIVERED":
        return "bg-green-100 text-green-800";
      case "SHIPPED":
        return "bg-blue-100 text-blue-800";
      case "PROCESSING":
        return "bg-yellow-100 text-yellow-800";
      case "CONFIRMED":
        return "bg-purple-100 text-purple-800";
      case "CANCELLED":
        return "bg-red-100 text-red-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  const getPaymentMethodName = (method: string) => {
    switch (method) {
      case "razorpay":
        return "Razorpay";
      case "cod":
        return "Cash on Delivery";
      case "paypal":
        return "PayPal";
      default:
        return method;
    }
  };

  const filteredOrders = orders.filter((order) => {
    const matchesSearch =
      order.id.toString().includes(searchTerm) ||
      order.user.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      order.paymentOrderId.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesStatus =
      statusFilter === "all" ||
      (statusFilter === "order"
        ? order.status
        : statusFilter === "item"
        ? order.orderItems.some((item) => item.orderItemStatus === statusFilter)
        : false);

    const matchesPayment =
      paymentFilter === "all" || order.paymentMode === paymentFilter;

    return matchesSearch && matchesStatus && matchesPayment;
  });

  const totalRevenue = orders.reduce(
    (sum, order) => sum + parseFloat(order.totalAmount),
    0
  );
  const pendingOrders = orders.filter((order) =>
    order.orderItems.some((item) => item.orderItemStatus === "PROCESSING")
  ).length;

  if (loading) {
    return <div>Loading orders...</div>;
  }

  return (
    <div className="space-y-6">
      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <StatsCard
          title="Total Orders"
          value={orders.length.toString()}
          change="+12% from last month"
          changeType="positive"
          icon={ShoppingCart}
          iconColor="text-blue-600"
        />
        <StatsCard
          title="Revenue"
          value={`$${totalRevenue.toFixed(2)}`}
          change="+8% from last month"
          changeType="positive"
          icon={DollarSign}
          iconColor="text-green-600"
        />
        <StatsCard
          title="Pending Orders"
          value={pendingOrders.toString()}
          change="-5% from last month"
          changeType="positive"
          icon={Package}
          iconColor="text-yellow-600"
        />
        <StatsCard
          title="Unique Customers"
          value={new Set(orders.map((o) => o.userId)).size.toString()}
          change="+18% from last month"
          changeType="positive"
          icon={Users}
          iconColor="text-purple-600"
        />
      </div>

      {/* Header with Search and Filters */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between space-y-4 sm:space-y-0">
        <div className="flex items-center space-x-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
            <Input
              placeholder="Search orders..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-64 pl-10"
            />
          </div>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" size="sm">
                <Filter className="h-4 w-4 mr-2" />
                Status: {statusFilter === "all" ? "All" : statusFilter}
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent>
              <DropdownMenuItem onClick={() => setStatusFilter("all")}>
                All
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => setStatusFilter("CONFIRMED")}>
                Confirmed
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => setStatusFilter("PROCESSING")}>
                Processing
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => setStatusFilter("SHIPPED")}>
                Shipped
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => setStatusFilter("DELIVERED")}>
                Delivered
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => setStatusFilter("CANCELLED")}>
                Cancelled
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" size="sm">
                <Filter className="h-4 w-4 mr-2" />
                Payment:{" "}
                {paymentFilter === "all"
                  ? "All"
                  : getPaymentMethodName(paymentFilter)}
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent>
              <DropdownMenuItem onClick={() => setPaymentFilter("all")}>
                All
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => setPaymentFilter("razorpay")}>
                Razorpay
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => setPaymentFilter("cod")}>
                Cash on Delivery
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
        <div className="flex space-x-2">
          <Button variant="outline">Export</Button>
          <Button variant="outline">Bulk Actions</Button>
        </div>
      </div>

      {/* Orders Table */}
      <Card>
        <CardHeader>
          <CardTitle>Order Management ({filteredOrders.length})</CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Order ID</TableHead>
                <TableHead>Customer</TableHead>
                <TableHead>Amount</TableHead>
                <TableHead>Items</TableHead>
                <TableHead>Payment</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Date</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredOrders.map((order) => {
                const totalItems = order.orderItems.reduce(
                  (sum, item) => sum + item.quantity,
                  0
                );
                const orderDate = new Date(
                  order.createdAt
                ).toLocaleDateString();

                return (
                  <TableRow key={order.id} className="hover:bg-gray-50">
                    <TableCell className="font-medium">{order.id}</TableCell>
                    <TableCell>
                      <div className="font-medium">{order.user.name}</div>
                      <div className="text-sm text-gray-500">
                        {order.user.email}
                      </div>
                    </TableCell>
                    <TableCell>${order.totalAmount}</TableCell>
                    <TableCell>{totalItems}</TableCell>
                    <TableCell>
                      {getPaymentMethodName(order.paymentMode)}
                    </TableCell>
                    <TableCell>
                      <Badge className={getStatusColor(order.status)}>
                        {order.status}
                      </Badge>
                    </TableCell>
                    <TableCell>{orderDate}</TableCell>
                    <TableCell className="text-right">
                      <div className="flex items-center justify-end space-x-2">
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="icon">
                              <MoreHorizontal className="h-4 w-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuItem>
                              <Eye className="mr-2 h-4 w-4" />
                              View Details
                            </DropdownMenuItem>
                            <DropdownMenuItem>Track Order</DropdownMenuItem>
                            <DropdownMenuItem>
                              Contact Customer
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </div>
                    </TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}

import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import Cookies from "js-cookie";
import { useNavigate } from "react-router-dom";
import { toast, Toaster } from "sonner";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
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
  Clock,
  CheckCircle,
  Download,
} from "lucide-react";
import { StatsCard } from "@/components/dashboard/StatsCard";
import { TrendingUp, ShoppingCart, Users, DollarSign } from "lucide-react";

interface Order {
  id: number;
  userId: number;
  vendorId: number;
  orderType: string;
  status: string;
  subtotal: number;
  deliveryCharges: number;
  taxes: number;
  discount: number;
  totalAmount: number;
  paymentType: string;
  paymentStatus: string;
  deliveryAddress: string;
  deliveryCity: string;
  deliveryState: string;
  deliveryZipCode: string;
  deliveryPhone: string;
  orderNotes: string;
  createdAt: string;
  updatedAt: string;
  user: {
    id: number;
    name: string;
    email: string;
    phoneNumber: string | null;
  };
  vendor: {
    id: number;
    name: string;
    businessName: string;
  };
  orderItems: {
    id: number;
    mealId: number;
    mealTitle: string;
    mealDescription: string;
    mealImage: string;
    mealType: string;
    mealCuisine: string;
    isVeg: boolean;
    quantity: number;
    unitPrice: number;
    totalPrice: number;
    meal: {
      id: number;
      title: string;
      image: string;
      type: string;
      cuisine: string;
      isVeg: boolean;
    };
    selectedOptions: any[];
  }[];
  mealSchedules: {
    id: number;
    scheduledDate: string;
    scheduledTimeSlot: string;
    mealType: string;
    mealTitle: string;
    mealImage: string;
    quantity: number;
    status: string;
  }[];
  _count: {
    mealSchedules: number;
  };
}

interface OrdersResponse {
  success: boolean;
  data: {
    orders: Order[];
    pagination: {
      currentPage: number;
      totalPages: number;
      totalOrders: number;
      hasNextPage: boolean;
      hasPrevPage: boolean;
    };
    statistics: {
      totalOrders: number;
      statusBreakdown: {
        [key: string]: {
          count: number;
          totalAmount: number;
        };
      };
      totalRevenue: number;
    };
  };
}

export function OrderManagement() {
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [paymentFilter, setPaymentFilter] = useState("all");
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({
    totalOrders: 0,
    totalRevenue: 0,
    pendingOrders: 0,
    uniqueCustomers: 0,
  });

  const role = Cookies.get("user_role");
  const isAdmin = role === "admin";
  const isVendor = role === "vendor";
  const navigate = useNavigate();

  const token = isAdmin ? Cookies.get("admin_token") : Cookies.get("vendor_token");

  const [error, setError] = useState<string | null>(null);

  const handleOrderDetails = (orderId: number) => {
    if (isAdmin) {
      navigate(`/orderdetails/${orderId}`);
    } else if (isVendor) {
      navigate(`/vendor/orderdetails/${orderId}`);
    }
  };

  useEffect(() => {
    const fetchOrders = async () => {
      try {
        setLoading(true);

        const apiUrl = `${import.meta.env.VITE_BASE_UR}admin/orders`;

        const response = await fetch(apiUrl, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

        if (!response.ok) {
          throw new Error(`Failed to fetch orders: ${response.statusText}`);
        }

        const data: OrdersResponse = await response.json();
        setOrders(data.data.orders);
        
        // Set statistics
        setStats({
          totalOrders: data.data.statistics.totalOrders,
          totalRevenue: data.data.statistics.totalRevenue,
          pendingOrders: data.data.statistics.statusBreakdown.PENDING?.count || 0,
          uniqueCustomers: new Set(data.data.orders.map(o => o.userId)).size
        });
        
        toast.success("Orders loaded successfully");
      } catch (error: unknown) {
        console.error("Error fetching orders:", error);
        if (error instanceof Error) {
          setError(error.message);
          toast.error(error.message);
        } else if (typeof error === "string") {
          setError(error);
          toast.error(error);
        } else {
          setError("An unknown error occurred while fetching orders.");
          toast.error("An unknown error occurred while fetching orders.");
        }
      } finally {
        setLoading(false);
      }
    };

    fetchOrders();
  }, [token]);

  const getStatusColor = (status: string) => {
    switch (status) {
      case "DELIVERED":
        return "bg-green-100 text-green-800";
      case "COMPLETED":
        return "bg-green-100 text-green-800";
      case "SHIPPED":
        return "bg-blue-100 text-blue-800";
      case "PROCESSING":
        return "bg-yellow-100 text-yellow-800";
      case "PENDING":
        return "bg-orange-100 text-orange-800";
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
      case "CASH_ON_DELIVERY":
        return "Cash on Delivery";
      case "ONLINE":
        return "Online Payment";
      case "WALLET":
        return "Wallet";
      default:
        return method;
    }
  };

  const getOrderTypeName = (type: string) => {
    switch (type) {
      case "ONETIME":
        return "One-time";
      case "SUBSCRIPTION":
        return "Subscription";
      default:
        return type;
    }
  };

  const filteredOrders = orders.filter((order) => {
    const matchesSearch =
      order.id.toString().includes(searchTerm) ||
      order.user.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      order.vendor.businessName.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesStatus =
      statusFilter === "all" || order.status === statusFilter;

    const matchesPayment =
      paymentFilter === "all" || order.paymentType === paymentFilter;

    return matchesSearch && matchesStatus && matchesPayment;
  });

  if (loading) {
    return <div>Loading orders...</div>;
  }

  return (
    <>
      <div className="space-y-6">
        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <StatsCard
            title="Total Orders"
            value={stats.totalOrders.toString()}
            change="+12% from last month"
            changeType="positive"
            icon={ShoppingCart}
            iconColor="text-blue-600"
          />
          <StatsCard
            title="Revenue"
            value={`₹${stats.totalRevenue.toFixed(2)}`}
            change="+8% from last month"
            changeType="positive"
            icon={DollarSign}
            iconColor="text-green-600"
          />
          <StatsCard
            title="Pending Orders"
            value={stats.pendingOrders.toString()}
            change="-5% from last month"
            changeType="positive"
            icon={Clock}
            iconColor="text-yellow-600"
          />
          <StatsCard
            title="Unique Customers"
            value={stats.uniqueCustomers.toString()}
            change="+18% from last month"
            changeType="positive"
            icon={Users}
            iconColor="text-purple-600"
          />
        </div>

        {/* Header with Search and Filters */}
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:gap-4 w-full">
            <div className="relative w-full sm:w-64">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
              <Input
                placeholder="Search orders..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10"
              />
            </div>
            <div className="flex flex-col gap-2 sm:flex-row sm:gap-4 w-full sm:w-auto">
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="outline" size="sm" className="w-full sm:w-auto">
                    <Filter className="h-4 w-4 mr-2" />
                    Status: {statusFilter === "all" ? "All" : statusFilter}
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent>
                  <DropdownMenuItem onClick={() => setStatusFilter("all")}>
                    All
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => setStatusFilter("PENDING")}>
                    Pending
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => setStatusFilter("CONFIRMED")}>
                    Confirmed
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => setStatusFilter("PROCESSING")}>
                    Processing
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => setStatusFilter("COMPLETED")}>
                    Completed
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => setStatusFilter("CANCELLED")}>
                    Cancelled
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="outline" size="sm" className="w-full sm:w-auto">
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
                  <DropdownMenuItem onClick={() => setPaymentFilter("CASH_ON_DELIVERY")}>
                    Cash on Delivery
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => setPaymentFilter("ONLINE")}>
                    Online Payment
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
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
                  <TableHead>Vendor</TableHead>
                  <TableHead>Amount</TableHead>
                  <TableHead>Items</TableHead>
                  <TableHead>Type</TableHead>
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
                  const orderDate = new Date(order.createdAt).toLocaleDateString();

                  return (
                    <TableRow key={order.id} className="hover:bg-gray-50">
                      <TableCell className="font-medium">{order.id}</TableCell>
                      <TableCell>
                        <div className="font-medium">{order.user.name}</div>
                        <div className="text-sm text-gray-500">
                          {order.user.email || order.deliveryPhone}
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="font-medium">{order.vendor.businessName}</div>
                      </TableCell>
                      <TableCell>₹{order.totalAmount.toFixed(2)}</TableCell>
                      <TableCell>{totalItems}</TableCell>
                      <TableCell>
                        {getOrderTypeName(order.orderType)}
                      </TableCell>
                      <TableCell>
                        {getPaymentMethodName(order.paymentType)}
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
                              <DropdownMenuItem
                                onClick={() => handleOrderDetails(order.id)}
                              >
                                <Eye className="mr-2 h-4 w-4" />
                                Order Details
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
      <Toaster position="top-right" richColors closeButton />
    </>
  );
}

import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
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
import { Search, Filter, MoreHorizontal, Eye, Package, Truck, CheckCircle } from "lucide-react";
import { StatsCard } from "@/components/dashboard/StatsCard";
import { TrendingUp, ShoppingCart, Users, DollarSign } from "lucide-react";

const orders = [
  {
    id: "#12345",
    customer: "John Doe",
    vendor: "TechStore Pro",
    amount: "$299.00",
    status: "placed",
    date: "2024-01-15",
    items: 2,
    paymentMethod: "Credit Card",
  },
  {
    id: "#12346",
    customer: "Jane Smith",
    vendor: "Fashion Hub",
    amount: "$159.99",
    status: "shipped",
    date: "2024-01-15",
    items: 1,
    paymentMethod: "PayPal",
  },
  {
    id: "#12347",
    customer: "Bob Johnson",
    vendor: "Home Decor",
    amount: "$89.50",
    status: "delivered",
    date: "2024-01-14",
    items: 3,
    paymentMethod: "Credit Card",
  },
  {
    id: "#12348",
    customer: "Alice Brown",
    vendor: "Sports World",
    amount: "$249.99",
    status: "processing",
    date: "2024-01-14",
    items: 1,
    paymentMethod: "Cash on Delivery",
  },
];

export function OrderManagement() {
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [paymentFilter, setPaymentFilter] = useState("all");

  const getStatusColor = (status: string) => {
    switch (status) {
      case "delivered":
        return "bg-green-100 text-green-800";
      case "shipped":
        return "bg-blue-100 text-blue-800";
      case "processing":
        return "bg-yellow-100 text-yellow-800";
      case "placed":
        return "bg-purple-100 text-purple-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  const filteredOrders = orders.filter(order => {
    const matchesSearch = order.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         order.customer.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         order.vendor.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === "all" || order.status === statusFilter;
    const matchesPayment = paymentFilter === "all" || order.paymentMethod === paymentFilter;
    return matchesSearch && matchesStatus && matchesPayment;
  });

  const paymentMethods = [...new Set(orders.map(o => o.paymentMethod))];

  return (
    <div className="space-y-6">
      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <StatsCard
          title="Total Orders"
          value="1,234"
          change="+12% from last month"
          changeType="positive"
          icon={ShoppingCart}
          iconColor="text-blue-600"
        />
        <StatsCard
          title="Revenue"
          value="$45,231"
          change="+8% from last month"
          changeType="positive"
          icon={DollarSign}
          iconColor="text-green-600"
        />
        <StatsCard
          title="Pending Orders"
          value="23"
          change="-5% from last month"
          changeType="positive"
          icon={Package}
          iconColor="text-yellow-600"
        />
        <StatsCard
          title="Customers"
          value="8,942"
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
              <DropdownMenuItem onClick={() => setStatusFilter("placed")}>
                Placed
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => setStatusFilter("processing")}>
                Processing
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => setStatusFilter("shipped")}>
                Shipped
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => setStatusFilter("delivered")}>
                Delivered
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" size="sm">
                <Filter className="h-4 w-4 mr-2" />
                Payment: {paymentFilter === "all" ? "All" : paymentFilter}
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent>
              <DropdownMenuItem onClick={() => setPaymentFilter("all")}>
                All
              </DropdownMenuItem>
              {paymentMethods.map(method => (
                <DropdownMenuItem key={method} onClick={() => setPaymentFilter(method)}>
                  {method}
                </DropdownMenuItem>
              ))}
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
                <TableHead>Vendor</TableHead>
                <TableHead>Amount</TableHead>
                <TableHead>Items</TableHead>
                <TableHead>Payment</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredOrders.map((order) => (
                <TableRow key={order.id} className="hover:bg-gray-50">
                  <TableCell className="font-medium">{order.id}</TableCell>
                  <TableCell>{order.customer}</TableCell>
                  <TableCell>{order.vendor}</TableCell>
                  <TableCell>{order.amount}</TableCell>
                  <TableCell>{order.items}</TableCell>
                  <TableCell>{order.paymentMethod}</TableCell>
                  <TableCell>
                    <Badge className={getStatusColor(order.status)}>
                      {order.status}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-right">
                    <div className="flex items-center justify-end space-x-2">
                      {order.status === "placed" && (
                        <Button size="sm" variant="outline" className="text-blue-600 border-blue-600">
                          <Package className="h-4 w-4 mr-1" />
                          Process
                        </Button>
                      )}
                      {order.status === "processing" && (
                        <Button size="sm" variant="outline" className="text-green-600 border-green-600">
                          <Truck className="h-4 w-4 mr-1" />
                          Ship
                        </Button>
                      )}
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
                          <DropdownMenuItem>
                            Track Order
                          </DropdownMenuItem>
                          <DropdownMenuItem>
                            Contact Customer
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}

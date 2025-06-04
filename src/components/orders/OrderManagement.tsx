
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
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Search, Filter, MoreHorizontal, Eye, Package } from "lucide-react";

const orders = [
  {
    id: "#12345",
    customer: "John Doe",
    vendor: "TechStore Pro",
    items: 2,
    amount: "$299.00",
    status: "processing",
    paymentStatus: "paid",
    date: "2024-01-15",
    address: "123 Main St, NYC",
    phone: "+1 234 567 8900",
  },
  {
    id: "#12346",
    customer: "Jane Smith",
    vendor: "Fashion Hub",
    items: 1,
    amount: "$159.99",
    status: "shipped",
    paymentStatus: "paid",
    date: "2024-01-15",
    address: "456 Oak Ave, LA",
    phone: "+1 234 567 8901",
  },
  {
    id: "#12347",
    customer: "Bob Johnson",
    vendor: "Home Decor Plus",
    items: 3,
    amount: "$89.50",
    status: "delivered",
    paymentStatus: "paid",
    date: "2024-01-14",
    address: "789 Pine St, Chicago",
    phone: "+1 234 567 8902",
  },
  {
    id: "#12348",
    customer: "Alice Brown",
    vendor: "Sports World",
    items: 1,
    amount: "$249.99",
    status: "pending",
    paymentStatus: "pending",
    date: "2024-01-14",
    address: "321 Elm St, Boston",
    phone: "+1 234 567 8903",
  },
];

export function OrderManagement() {
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedOrder, setSelectedOrder] = useState<any>(null);

  const getStatusColor = (status: string) => {
    switch (status) {
      case "delivered":
        return "bg-green-100 text-green-800";
      case "shipped":
        return "bg-blue-100 text-blue-800";
      case "processing":
        return "bg-yellow-100 text-yellow-800";
      case "pending":
        return "bg-gray-100 text-gray-800";
      case "cancelled":
        return "bg-red-100 text-red-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  const getPaymentStatusColor = (status: string) => {
    return status === "paid" 
      ? "bg-green-100 text-green-800" 
      : "bg-yellow-100 text-yellow-800";
  };

  const filteredOrders = orders.filter(order =>
    order.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
    order.customer.toLowerCase().includes(searchTerm.toLowerCase()) ||
    order.vendor.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const orderStatuses = ["pending", "processing", "shipped", "delivered", "cancelled"];

  return (
    <div className="space-y-6">
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
          <Button variant="outline" size="sm">
            <Filter className="h-4 w-4 mr-2" />
            Filter
          </Button>
        </div>
        <div className="flex space-x-2">
          <Button variant="outline">Export</Button>
          <Button variant="outline">
            <Package className="h-4 w-4 mr-2" />
            Bulk Ship
          </Button>
        </div>
      </div>

      {/* Order Stats */}
      <div className="grid gap-4 md:grid-cols-4">
        <Card>
          <CardContent className="pt-6">
            <div className="text-2xl font-bold">127</div>
            <p className="text-xs text-muted-foreground">Pending Orders</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="text-2xl font-bold">64</div>
            <p className="text-xs text-muted-foreground">Processing</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="text-2xl font-bold">89</div>
            <p className="text-xs text-muted-foreground">Shipped</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="text-2xl font-bold">1,234</div>
            <p className="text-xs text-muted-foreground">Delivered</p>
          </CardContent>
        </Card>
      </div>

      {/* Orders Table */}
      <Card>
        <CardHeader>
          <CardTitle>Order Management</CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Order ID</TableHead>
                <TableHead>Customer</TableHead>
                <TableHead>Vendor</TableHead>
                <TableHead>Items</TableHead>
                <TableHead>Amount</TableHead>
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
                  <TableCell>{order.items}</TableCell>
                  <TableCell>{order.amount}</TableCell>
                  <TableCell>
                    <Badge className={getPaymentStatusColor(order.paymentStatus)}>
                      {order.paymentStatus}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Badge className={getStatusColor(order.status)} variant="secondary">
                          {order.status}
                        </Badge>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent>
                        {orderStatuses.map((status) => (
                          <DropdownMenuItem key={status}>
                            Update to {status}
                          </DropdownMenuItem>
                        ))}
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </TableCell>
                  <TableCell className="text-right">
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="icon">
                          <MoreHorizontal className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <Dialog>
                          <DialogTrigger asChild>
                            <DropdownMenuItem onSelect={(e) => {
                              e.preventDefault();
                              setSelectedOrder(order);
                            }}>
                              <Eye className="mr-2 h-4 w-4" />
                              View Details
                            </DropdownMenuItem>
                          </DialogTrigger>
                          <DialogContent className="max-w-2xl">
                            <DialogHeader>
                              <DialogTitle>Order Details - {selectedOrder?.id}</DialogTitle>
                            </DialogHeader>
                            {selectedOrder && (
                              <div className="space-y-6">
                                <div className="grid grid-cols-2 gap-4">
                                  <div>
                                    <h3 className="font-medium mb-2">Customer Information</h3>
                                    <div className="space-y-1 text-sm">
                                      <p><strong>Name:</strong> {selectedOrder.customer}</p>
                                      <p><strong>Phone:</strong> {selectedOrder.phone}</p>
                                      <p><strong>Address:</strong> {selectedOrder.address}</p>
                                    </div>
                                  </div>
                                  <div>
                                    <h3 className="font-medium mb-2">Order Information</h3>
                                    <div className="space-y-1 text-sm">
                                      <p><strong>Vendor:</strong> {selectedOrder.vendor}</p>
                                      <p><strong>Date:</strong> {selectedOrder.date}</p>
                                      <p><strong>Amount:</strong> {selectedOrder.amount}</p>
                                    </div>
                                  </div>
                                </div>
                                
                                <div>
                                  <h3 className="font-medium mb-2">Order Timeline</h3>
                                  <div className="space-y-2">
                                    <div className="flex items-center space-x-2">
                                      <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                                      <span className="text-sm">Order Placed - {selectedOrder.date}</span>
                                    </div>
                                    <div className="flex items-center space-x-2">
                                      <div className="w-2 h-2 bg-gray-300 rounded-full"></div>
                                      <span className="text-sm text-gray-500">Order Confirmed</span>
                                    </div>
                                    <div className="flex items-center space-x-2">
                                      <div className="w-2 h-2 bg-gray-300 rounded-full"></div>
                                      <span className="text-sm text-gray-500">Shipped</span>
                                    </div>
                                    <div className="flex items-center space-x-2">
                                      <div className="w-2 h-2 bg-gray-300 rounded-full"></div>
                                      <span className="text-sm text-gray-500">Delivered</span>
                                    </div>
                                  </div>
                                </div>
                              </div>
                            )}
                          </DialogContent>
                        </Dialog>
                        <DropdownMenuItem>
                          Print Label
                        </DropdownMenuItem>
                        <DropdownMenuItem>
                          Send Update
                        </DropdownMenuItem>
                        <DropdownMenuItem className="text-red-600">
                          Cancel Order
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
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

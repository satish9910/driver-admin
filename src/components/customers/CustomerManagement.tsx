
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
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Search, Filter, MoreHorizontal, Eye, Ban, Mail } from "lucide-react";

const customers = [
  {
    id: 1,
    name: "John Doe",
    email: "john@example.com",
    orders: 24,
    totalSpent: "$2,400",
    lastSeen: "2 hours ago",
    status: "active",
    joinDate: "2023-06-15",
    phone: "+1 234 567 8900",
    address: "123 Main St, NYC",
  },
  {
    id: 2,
    name: "Jane Smith",
    email: "jane@example.com",
    orders: 18,
    totalSpent: "$1,800",
    lastSeen: "1 day ago",
    status: "active",
    joinDate: "2023-08-22",
    phone: "+1 234 567 8901",
    address: "456 Oak Ave, LA",
  },
  {
    id: 3,
    name: "Bob Johnson",
    email: "bob@example.com",
    orders: 5,
    totalSpent: "$250",
    lastSeen: "1 week ago",
    status: "inactive",
    joinDate: "2024-01-10",
    phone: "+1 234 567 8902",
    address: "789 Pine St, Chicago",
  },
];

export function CustomerManagement() {
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCustomer, setSelectedCustomer] = useState<any>(null);

  const getStatusColor = (status: string) => {
    return status === "active" 
      ? "bg-green-100 text-green-800" 
      : "bg-gray-100 text-gray-800";
  };

  const filteredCustomers = customers.filter(customer =>
    customer.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    customer.email.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="space-y-6">
      {/* Header with Search and Filters */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between space-y-4 sm:space-y-0">
        <div className="flex items-center space-x-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
            <Input
              placeholder="Search customers..."
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
        <Button>Add Customer</Button>
      </div>

      {/* Customers Table */}
      <Card>
        <CardHeader>
          <CardTitle>Customer List</CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Customer</TableHead>
                <TableHead>Orders</TableHead>
                <TableHead>Total Spent</TableHead>
                <TableHead>Last Seen</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredCustomers.map((customer) => (
                <TableRow key={customer.id} className="hover:bg-gray-50">
                  <TableCell>
                    <div>
                      <div className="font-medium">{customer.name}</div>
                      <div className="text-sm text-gray-500">{customer.email}</div>
                    </div>
                  </TableCell>
                  <TableCell>{customer.orders}</TableCell>
                  <TableCell>{customer.totalSpent}</TableCell>
                  <TableCell>{customer.lastSeen}</TableCell>
                  <TableCell>
                    <Badge className={getStatusColor(customer.status)}>
                      {customer.status}
                    </Badge>
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
                              setSelectedCustomer(customer);
                            }}>
                              <Eye className="mr-2 h-4 w-4" />
                              View Profile
                            </DropdownMenuItem>
                          </DialogTrigger>
                          <DialogContent className="max-w-2xl">
                            <DialogHeader>
                              <DialogTitle>Customer Profile</DialogTitle>
                            </DialogHeader>
                            {selectedCustomer && (
                              <Tabs defaultValue="details" className="w-full">
                                <TabsList className="grid w-full grid-cols-4">
                                  <TabsTrigger value="details">Details</TabsTrigger>
                                  <TabsTrigger value="orders">Orders</TabsTrigger>
                                  <TabsTrigger value="address">Address</TabsTrigger>
                                  <TabsTrigger value="wallet">Wallet</TabsTrigger>
                                </TabsList>
                                <TabsContent value="details" className="space-y-4">
                                  <div className="grid grid-cols-2 gap-4">
                                    <div>
                                      <label className="text-sm font-medium">Name</label>
                                      <p className="text-sm text-gray-600">{selectedCustomer.name}</p>
                                    </div>
                                    <div>
                                      <label className="text-sm font-medium">Email</label>
                                      <p className="text-sm text-gray-600">{selectedCustomer.email}</p>
                                    </div>
                                    <div>
                                      <label className="text-sm font-medium">Phone</label>
                                      <p className="text-sm text-gray-600">{selectedCustomer.phone}</p>
                                    </div>
                                    <div>
                                      <label className="text-sm font-medium">Join Date</label>
                                      <p className="text-sm text-gray-600">{selectedCustomer.joinDate}</p>
                                    </div>
                                  </div>
                                </TabsContent>
                                <TabsContent value="orders">
                                  <p className="text-sm text-gray-600">Order history would be displayed here</p>
                                </TabsContent>
                                <TabsContent value="address">
                                  <p className="text-sm text-gray-600">{selectedCustomer.address}</p>
                                </TabsContent>
                                <TabsContent value="wallet">
                                  <p className="text-sm text-gray-600">Wallet information would be displayed here</p>
                                </TabsContent>
                              </Tabs>
                            )}
                          </DialogContent>
                        </Dialog>
                        <DropdownMenuItem>
                          <Mail className="mr-2 h-4 w-4" />
                          Send Email
                        </DropdownMenuItem>
                        <DropdownMenuItem className="text-red-600">
                          <Ban className="mr-2 h-4 w-4" />
                          Ban Customer
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


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
import { Search, Filter, MoreHorizontal, Eye, Check, X } from "lucide-react";

const vendors = [
  {
    id: 1,
    storeName: "TechStore Pro",
    owner: "Michael Chen",
    email: "michael@techstore.com",
    status: "approved",
    products: 145,
    totalSales: "$12,450",
    joinDate: "2023-05-10",
    commission: "15%",
  },
  {
    id: 2,
    storeName: "Fashion Hub",
    owner: "Sarah Wilson",
    email: "sarah@fashionhub.com",
    status: "pending",
    products: 0,
    totalSales: "$0",
    joinDate: "2024-01-15",
    commission: "12%",
  },
  {
    id: 3,
    storeName: "Home Decor Plus",
    owner: "David Brown",
    email: "david@homedecor.com",
    status: "approved",
    products: 89,
    totalSales: "$8,920",
    joinDate: "2023-09-22",
    commission: "18%",
  },
  {
    id: 4,
    storeName: "Sports World",
    owner: "Jennifer Lee",
    email: "jennifer@sportsworld.com",
    status: "rejected",
    products: 0,
    totalSales: "$0",
    joinDate: "2024-01-12",
    commission: "0%",
  },
];

export function VendorManagement() {
  const [searchTerm, setSearchTerm] = useState("");

  const getStatusColor = (status: string) => {
    switch (status) {
      case "approved":
        return "bg-green-100 text-green-800";
      case "pending":
        return "bg-yellow-100 text-yellow-800";
      case "rejected":
        return "bg-red-100 text-red-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  const filteredVendors = vendors.filter(vendor =>
    vendor.storeName.toLowerCase().includes(searchTerm.toLowerCase()) ||
    vendor.owner.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="space-y-6">
      {/* Header with Search and Filters */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between space-y-4 sm:space-y-0">
        <div className="flex items-center space-x-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
            <Input
              placeholder="Search vendors..."
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
          <Button>Invite Vendor</Button>
        </div>
      </div>

      {/* Pending Applications Alert */}
      <Card className="border-yellow-200 bg-yellow-50">
        <CardContent className="pt-6">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="font-medium text-yellow-800">Pending Vendor Applications</h3>
              <p className="text-sm text-yellow-700">You have 1 vendor application waiting for approval</p>
            </div>
            <Button size="sm" className="bg-yellow-600 hover:bg-yellow-700">
              Review Applications
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Vendors Table */}
      <Card>
        <CardHeader>
          <CardTitle>Vendor Management</CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Store</TableHead>
                <TableHead>Owner</TableHead>
                <TableHead>Products</TableHead>
                <TableHead>Total Sales</TableHead>
                <TableHead>Commission</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredVendors.map((vendor) => (
                <TableRow key={vendor.id} className="hover:bg-gray-50">
                  <TableCell>
                    <div>
                      <div className="font-medium">{vendor.storeName}</div>
                      <div className="text-sm text-gray-500">{vendor.email}</div>
                    </div>
                  </TableCell>
                  <TableCell>{vendor.owner}</TableCell>
                  <TableCell>{vendor.products}</TableCell>
                  <TableCell>{vendor.totalSales}</TableCell>
                  <TableCell>{vendor.commission}</TableCell>
                  <TableCell>
                    <Badge className={getStatusColor(vendor.status)}>
                      {vendor.status}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-right">
                    <div className="flex items-center justify-end space-x-2">
                      {vendor.status === "pending" && (
                        <>
                          <Button size="sm" variant="outline" className="text-green-600 border-green-600 hover:bg-green-50">
                            <Check className="h-4 w-4 mr-1" />
                            Approve
                          </Button>
                          <Button size="sm" variant="outline" className="text-red-600 border-red-600 hover:bg-red-50">
                            <X className="h-4 w-4 mr-1" />
                            Reject
                          </Button>
                        </>
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
                            View Store
                          </DropdownMenuItem>
                          <DropdownMenuItem>
                            Edit Commission
                          </DropdownMenuItem>
                          <DropdownMenuItem>
                            View Wallet
                          </DropdownMenuItem>
                          {vendor.status === "approved" && (
                            <DropdownMenuItem className="text-red-600">
                              Suspend Vendor
                            </DropdownMenuItem>
                          )}
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

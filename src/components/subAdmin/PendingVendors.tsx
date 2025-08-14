import { useState, useEffect } from "react";
import axios from "axios";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { toast } from "@/components/ui/use-toast";
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
  DialogDescription,
} from "@/components/ui/dialog";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import {
  Search,
  Filter,
  MoreHorizontal,
  Eye,
  Check,
  X,
  Trash2,
  Edit,
} from "lucide-react";
import Cookies from "js-cookie";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";

// Updated form schema to match the API response fields
const formSchema = z.object({
  name: z.string().min(2, {
    message: "Name must be at least 2 characters.",
  }),
  email: z.string().email({
    message: "Please enter a valid email.",
  }),
  businessName: z.string().min(2, {
    message: "Business name must be at least 2 characters.",
  }),
  phoneNumber: z.string().optional(),
  phoneNumber2: z.string().optional(),
  address: z.string().optional(),
  city: z.string().optional(),
  state: z.string().optional(),
  description: z.string().optional(),
  breakfastStart: z.string().optional(),
  breakfastEnd: z.string().optional(),
  lunchStart: z.string().optional(),
  lunchEnd: z.string().optional(),
  eveningStart: z.string().optional(),
  eveningEnd: z.string().optional(),
  dinnerStart: z.string().optional(),
  dinnerEnd: z.string().optional(),
});

const getStatusColor = (status) => {
  switch (status.toLowerCase()) {
    case "active":
      return "bg-green-100 text-green-800";
    case "pending":
      return "bg-yellow-100 text-yellow-800";
    case "rejected":
      return "bg-red-100 text-red-800";
    default:
      return "bg-gray-100 text-gray-800";
  }
};

export function PendingVendors() {
  const [vendors, setVendors] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [isAddVendorOpen, setIsAddVendorOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [currentVendor, setCurrentVendor] = useState(null);
  const token = Cookies.get("admin_token");

  const form = useForm({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: "",
      email: "",
      businessName: "",
      phoneNumber: "",
      phoneNumber2: "",
      address: "",
      city: "",
      state: "",
      description: "",
      breakfastStart: "",
      breakfastEnd: "",
      lunchStart: "",
      lunchEnd: "",
      eveningStart: "",
      eveningEnd: "",
      dinnerStart: "",
      dinnerEnd: "",
    },
  });

  const fetchVendors = async () => {
    try {
      const response = await axios.get(
        `${import.meta.env.VITE_BASE_UR}admin/get-pending-vendors`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );
      if (response.data) {
        setVendors(response.data.data);
      }
    } catch (error) {
      console.error("Failed to fetch vendors:", error);
    }
  };

  useEffect(() => {
    fetchVendors();
  }, []);

  const handleEditVendor = (vendor) => {
    setCurrentVendor(vendor);
    form.reset({
      name: vendor.name || "",
      email: vendor.email || "",
      businessName: vendor.businessName || "",
      phoneNumber: vendor.phoneNumber || "",
      phoneNumber2: vendor.phoneNumber2 || "",
      address: vendor.address || "",
      city: vendor.city || "",
      state: vendor.state || "",
      description: vendor.description || "",
      breakfastStart: vendor.breakfastStart || "",
      breakfastEnd: vendor.breakfastEnd || "",
      lunchStart: vendor.lunchStart || "",
      lunchEnd: vendor.lunchEnd || "",
      eveningStart: vendor.eveningStart || "",
      eveningEnd: vendor.eveningEnd || "",
      dinnerStart: vendor.dinnerStart || "",
      dinnerEnd: vendor.dinnerEnd || "",
    });
    setIsAddVendorOpen(true);
  };

  const filteredVendors = vendors.filter((vendor) =>
    vendor?.name?.toLowerCase()?.includes(searchTerm?.toLowerCase())
  );

  const onSubmit = async (values) => {
    setIsLoading(true);
    try {
      const payload = {
        ...values,
        id: currentVendor ? currentVendor.id : undefined,
      };

      const response = await axios.put(
        `${import.meta.env.VITE_BASE_UR}admin/update-vendor/${currentVendor ? currentVendor.id : ""}`,
        payload,
        {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        }
      );

      if (response.data) {
        toast({
          title: "Vendor Updated",
          description: "The vendor was updated successfully.",
        });
        await fetchVendors();
        setIsAddVendorOpen(false);
        setCurrentVendor(null);
        form.reset();
      }
    } catch (error) {
      console.error("Failed to update vendor:", error);
      toast({
        title: "Error",
        description: error.response?.data?.message || "An error occurred",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleDeleteVendor = async (vendorId) => {
    if (!window.confirm("Are you sure you want to delete this vendor?")) {
      return;
    }
    try {
      const response = await axios.delete(
        `${import.meta.env.VITE_BASE_UR}admin/hard-delete-vendor/${vendorId}`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      if (response.data) {
        toast({
          title: "Vendor Deleted",
          description: "The vendor was deleted successfully.",
        });
        await fetchVendors();
      }
    } catch (error) {
      console.error("Failed to delete vendor:", error);
      toast({
        title: "Error",
        description: error.response?.data?.message || "Failed to delete vendor",
        variant: "destructive",
      });
    }
  };

  return (
    <div className="space-y-6 p-6">
      {/* Header with Search */}
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
        </div>
      </div>

      {/* Edit Vendor Modal */}
      <Dialog open={isAddVendorOpen} onOpenChange={setIsAddVendorOpen}>
        <DialogContent className="sm:max-w-[700px] max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Edit Vendor</DialogTitle>
            <DialogDescription>
              Update the vendor details below.
            </DialogDescription>
          </DialogHeader>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* Basic Information */}
                <div className="space-y-4">
                  <FormField
                    control={form.control}
                    name="name"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Vendor Name</FormLabel>
                        <FormControl>
                          <Input placeholder="Enter vendor name" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="email"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Email</FormLabel>
                        <FormControl>
                          <Input
                            placeholder="Enter email"
                            {...field}
                            disabled
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="businessName"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Business Name</FormLabel>
                        <FormControl>
                          <Input placeholder="Enter business name" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="phoneNumber"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Phone Number</FormLabel>
                        <FormControl>
                          <Input placeholder="Enter phone number" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="phoneNumber2"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Secondary Phone</FormLabel>
                        <FormControl>
                          <Input placeholder="Enter secondary phone" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                {/* Location Information */}
                <div className="space-y-4">
                  <FormField
                    control={form.control}
                    name="address"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Address</FormLabel>
                        <FormControl>
                          <Input placeholder="Enter address" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="city"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>City</FormLabel>
                        <FormControl>
                          <Input placeholder="Enter city" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="state"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>State</FormLabel>
                        <FormControl>
                          <Input placeholder="Enter state" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="description"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Description</FormLabel>
                        <FormControl>
                          <Input placeholder="Enter description" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
              </div>

              {/* Business Hours */}
              <div className="space-y-4">
                <h3 className="text-lg font-medium">Business Hours</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <h4 className="text-sm font-medium">Breakfast</h4>
                    <div className="grid grid-cols-2 gap-2">
                      <FormField
                        control={form.control}
                        name="breakfastStart"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel className="sr-only">Start</FormLabel>
                            <FormControl>
                              <Input type="time" {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      <FormField
                        control={form.control}
                        name="breakfastEnd"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel className="sr-only">End</FormLabel>
                            <FormControl>
                              <Input type="time" {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <h4 className="text-sm font-medium">Lunch</h4>
                    <div className="grid grid-cols-2 gap-2">
                      <FormField
                        control={form.control}
                        name="lunchStart"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel className="sr-only">Start</FormLabel>
                            <FormControl>
                              <Input type="time" {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      <FormField
                        control={form.control}
                        name="lunchEnd"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel className="sr-only">End</FormLabel>
                            <FormControl>
                              <Input type="time" {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <h4 className="text-sm font-medium">Evening</h4>
                    <div className="grid grid-cols-2 gap-2">
                      <FormField
                        control={form.control}
                        name="eveningStart"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel className="sr-only">Start</FormLabel>
                            <FormControl>
                              <Input type="time" {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      <FormField
                        control={form.control}
                        name="eveningEnd"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel className="sr-only">End</FormLabel>
                            <FormControl>
                              <Input type="time" {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <h4 className="text-sm font-medium">Dinner</h4>
                    <div className="grid grid-cols-2 gap-2">
                      <FormField
                        control={form.control}
                        name="dinnerStart"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel className="sr-only">Start</FormLabel>
                            <FormControl>
                              <Input type="time" {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      <FormField
                        control={form.control}
                        name="dinnerEnd"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel className="sr-only">End</FormLabel>
                            <FormControl>
                              <Input type="time" {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>
                  </div>
                </div>
              </div>

              <div className="flex justify-end space-x-2 pt-4">
                <Button
                  variant="outline"
                  type="button"
                  onClick={() => {
                    setIsAddVendorOpen(false);
                    setCurrentVendor(null);
                  }}
                >
                  Cancel
                </Button>
                <Button type="submit" disabled={isLoading}>
                  {isLoading ? "Updating..." : "Update Vendor"}
                </Button>
              </div>
            </form>
          </Form>
        </DialogContent>
      </Dialog>

      {/* Vendors Table */}
      <Card>
        <CardHeader>
          <CardTitle>Pending Vendor Approvals</CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Vendor Name</TableHead>
                <TableHead>Email</TableHead>
                <TableHead>Mobile</TableHead>
                <TableHead>Business Name</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Join Date</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredVendors?.map((vendor) => (
                <TableRow key={vendor.id} className="hover:bg-gray-50">
                  <TableCell className="font-medium">{vendor.name}</TableCell>
                  <TableCell>{vendor.email}</TableCell>
                  <TableCell>{vendor.phoneNumber}</TableCell>
                  <TableCell>{vendor.businessName}</TableCell>
                  <TableCell>
                    <Badge className={getStatusColor(vendor.status)}>
                      {vendor.status}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    {new Date(vendor.createdAt).toLocaleDateString()}
                  </TableCell>
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
                            onClick={() =>
                              (window.location.href = `/admin/vendorprofile/${vendor.id}`)
                            }
                          >
                            <Eye className="mr-2 h-4 w-4" />
                            View Profile
                          </DropdownMenuItem>
                          <DropdownMenuItem
                            onClick={() => handleEditVendor(vendor)}
                          >
                            <Edit className="mr-2 h-4 w-4" />
                            Edit Vendor
                          </DropdownMenuItem>
                          <DropdownMenuItem
                            className="text-red-600"
                            onClick={() => handleDeleteVendor(vendor.id)}
                          >
                            <Trash2 className="mr-2 h-4 w-4" />
                            Delete
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
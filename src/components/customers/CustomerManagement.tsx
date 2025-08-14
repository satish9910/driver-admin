import { useState, useEffect } from "react";
import axios from "axios";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { toast } from "@/components/ui/use-toast";
import { useNavigate } from "react-router-dom";
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
  MoreHorizontal,
  Eye,
  Check,
  X,
  Edit,
  Trash2,
} from "lucide-react";
import Cookies from "js-cookie";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";

const formSchema = z.object({
  name: z.string().min(2, {
    message: "Name must be at least 2 characters.",
  }),
  email: z.string().email({
    message: "Please enter a valid email.",
  }),
  mobile: z.string().min(10, {
    message: "Mobile number must be at least 10 digits.",
  }),
  password: z.string().min(6, {
    message: "Password must be at least 6 characters.",
  }).optional(), // Make password optional
  vehicleNumber: z.string().optional(),
  licenseNumber: z.string().optional(),
});

const getStatusBadge = (isActive) => {
  return isActive ? (
    <Badge className="bg-green-100 text-green-800">Active</Badge>
  ) : (
    <Badge className="bg-red-100 text-red-800">Inactive</Badge>
  );
};

export function DriverManagement() {
  const [drivers, setDrivers] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [currentDriver, setCurrentDriver] = useState(null);
  const token = Cookies.get("admin_token");
  const navigation = useNavigate();
  const form = useForm({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: "",
      email: "",
      mobile: "",
      password: "",
      vehicleNumber: "",
      licenseNumber: "",
    },
  });

  const fetchDrivers = async () => {
    try {
      const response = await axios.get(
        `${import.meta.env.VITE_BASE_UR}admin/drivers`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      if (response.data) {
        setDrivers(response.data.drivers);
      } else {
        toast({
          title: "Error",
          description: response.data.message || "Failed to fetch drivers.",
          variant: "destructive",
        });
      }
    } catch (error) {
      console.error("Failed to fetch drivers:", error);
      let errorMessage = "Failed to fetch drivers. Please try again.";
      if (axios.isAxiosError(error)) {
        errorMessage =
          error.response?.data?.message || error.message || errorMessage;
      }
      toast({
        title: "Error",
        description: errorMessage,
        variant: "destructive",
      });
    }
  };

  useEffect(() => {
    fetchDrivers();
  }, []);

  const handleEditDriver = (driver) => {
    setCurrentDriver(driver);
    form.reset({
      name: driver.name || "",
      email: driver.email || "",
      mobile: driver.mobile || "",
      vehicleNumber: driver.vehicleNumber || "",
      licenseNumber: driver.licenseNumber || "",
    });
    setIsEditDialogOpen(true);
  };

  const handleCreateDriver = () => {
    setCurrentDriver(null);
    form.reset({
      name: "",
      email: "",
      mobile: "",
      password: "",
      vehicleNumber: "",
      licenseNumber: "",
    });
    setIsEditDialogOpen(true);
  };

  const filteredDrivers = drivers?.filter((driver) =>
    driver?.name?.toLowerCase()?.includes(searchTerm?.toLowerCase())
  );

  const onSubmit = async (values) => {
    setIsLoading(true);
    try {
      if (currentDriver) {
        // Update existing driver
        const response = await axios.put(
          `${import.meta.env.VITE_BASE_UR}admin/update-drivers/${currentDriver._id}`,
          values,
          {
            headers: {
              Authorization: `Bearer ${token}`,
              "Content-Type": "application/json",
            },
          }
        );

        if (response.data) {
          toast({
            title: "Driver Updated",
            description: "The driver was updated successfully.",
          });
        }
      } else {
        // Create new driver
        const response = await axios.post(
          `${import.meta.env.VITE_BASE_UR}public/user-signup`,
          values,
          {
            headers: {
              "Content-Type": "application/json",
              Authorization: `Bearer ${token}`,
            },
          }
        );

        if (response.data) {
          toast({
            title: "Driver Created",
            description: "The driver was created successfully.",
          });
        }
      }

      await fetchDrivers();
      setIsEditDialogOpen(false);
      setCurrentDriver(null);
      form.reset();
    } catch (error) {
      console.error("Failed to save driver:", error);
      toast({
        title: "Error",
        description: error.response?.data?.message || "An error occurred",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  // const handleToggleStatus = async (driverId, currentStatus) => {
  //   try {
  //     const response = await axios.put(
  //       `${import.meta.env.VITE_BASE_UR}admin/toggle-driver-status/${driverId}`,
  //       { isActive: !currentStatus },
  //       {
  //         headers: {
  //           Authorization: `Bearer ${token}`,
  //         },
  //       }
  //     );

  //     if (response.data.success) {
  //       toast({
  //         title: "Status Updated",
  //         description: `Driver has been ${!currentStatus ? "activated" : "deactivated"}`,
  //       });
  //       await fetchDrivers();
  //     }
  //   } catch (error) {
  //     console.error("Failed to update driver status:", error);
  //     toast({
  //       title: "Error",
  //       description: error.response?.data?.message || "Failed to update status",
  //       variant: "destructive",
  //     });
  //   }
  // };

  const handleDeleteDriver = async (driverId) => {
    try {
      const response = await axios.delete(
        `${import.meta.env.VITE_BASE_UR}admin/delete-driver/${driverId}`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      if (response.data.success) {
        toast({
          title: "Driver Deleted",
          description: "The driver has been deleted successfully.",
        });
        await fetchDrivers();
      }
    } catch (error) {
      console.error("Failed to delete driver:", error);
      toast({
        title: "Error",
        description: error.response?.data?.message || "Failed to delete driver",
        variant: "destructive",
      });
    }
  };

  const handleViewDriver = (driver) => {
    // Navigate to the driver profile page
    navigation(`/driverprofile/${driver._id}`);
  };

  return (
    <div className="space-y-6 p-6">
      {/* Header with Search */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between space-y-4 sm:space-y-0">
        <div className="flex items-center space-x-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
            <Input
              placeholder="Search drivers..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-64 pl-10"
            />
          </div>
        </div>
        <Button onClick={handleCreateDriver}>
          Add New Driver
        </Button>
      </div>

      {/* Edit/Add Driver Modal */}
      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent className="sm:max-w-[600px]">
          <DialogHeader>
            <DialogTitle>
              {currentDriver ? "Edit Driver" : "Add New Driver"}
            </DialogTitle>
            <DialogDescription>
              {currentDriver ? "Update" : "Enter"} the driver details below.
            </DialogDescription>
          </DialogHeader>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
              <div className="grid grid-cols-1 gap-4">
                <FormField
                  control={form.control}
                  name="name"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Driver Name</FormLabel>
                      <FormControl>
                        <Input placeholder="Enter driver name" {...field} />
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
                          type="email"
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="mobile"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Mobile Number</FormLabel>
                      <FormControl>
                        <Input placeholder="Enter mobile number" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                {!currentDriver && (
                  <FormField
                    control={form.control}
                    name="password"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Password</FormLabel>
                        <FormControl>
                          <Input
                            placeholder="Enter password"
                            {...field}
                            type="password"
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                )}
                <FormField
                  control={form.control}
                  name="vehicleNumber"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Vehicle Number</FormLabel>
                      <FormControl>
                        <Input placeholder="Enter vehicle number" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="licenseNumber"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>License Number</FormLabel>
                      <FormControl>
                        <Input placeholder="Enter license number" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <div className="flex justify-end space-x-2 pt-4">
                <Button
                  variant="outline"
                  type="button"
                  onClick={() => {
                    setIsEditDialogOpen(false);
                    setCurrentDriver(null);
                    form.reset();
                  }}
                >
                  Cancel
                </Button>
                <Button type="submit" disabled={isLoading}>
                  {isLoading
                    ? currentDriver
                      ? "Updating..."
                      : "Creating..."
                    : currentDriver
                    ? "Update Driver"
                    : "Create Driver"}
                </Button>
              </div>
            </form>
          </Form>
        </DialogContent>
      </Dialog>

      {/* Drivers Table */}
      <Card>
        <CardHeader>
          <CardTitle>Driver Management</CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>#</TableHead>
                <TableHead>Driver Name</TableHead>
                <TableHead>Email</TableHead>
                <TableHead>Mobile</TableHead>
                <TableHead>Vehicle Number</TableHead>
                <TableHead>License Number</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Join Date</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredDrivers?.map((driver, index) => (
                <TableRow key={driver._id} className="hover:bg-gray-50">
                  <TableCell>{index + 1}</TableCell>
                  <TableCell className="font-medium">{driver.name}</TableCell>
                  <TableCell>{driver.email}</TableCell>
                  <TableCell>{driver.mobile}</TableCell>
                  <TableCell>{driver.vehicleNumber || "-"}</TableCell>
                  <TableCell>{driver.licenseNumber || "-"}</TableCell>
                  <TableCell>{getStatusBadge(driver.isActive)}</TableCell>
                  <TableCell>
                    {new Date(driver.createdAt).toLocaleDateString()}
                  </TableCell>
                  <TableCell className="text-right">
                    <div className="flex items-center justify-end space-x-2">
                      {/* <Button
                        size="sm"
                        variant="outline"
                        className={
                          driver.isActive
                            ? "text-red-600 border-red-600 hover:bg-red-50"
                            : "text-green-600 border-green-600 hover:bg-green-50"
                        }
                        onClick={() =>
                          handleToggleStatus(driver._id, driver.isActive)
                        }
                      >
                        {driver.isActive ? (
                          <X className="h-4 w-4 mr-1" />
                        ) : (
                          <Check className="h-4 w-4 mr-1" />
                        )}
                        {driver.isActive ? "Deactivate" : "Activate"}
                      </Button> */}
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="icon">
                            <MoreHorizontal className="h-4 w-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuItem
                            onClick={() => handleViewDriver(driver)}
                          >
                            <Eye className="mr-2 h-4 w-4" />
                            View
                          </DropdownMenuItem>
                          <DropdownMenuItem
                            onClick={() => handleEditDriver(driver)}
                          >
                            <Edit className="mr-2 h-4 w-4" />
                            Edit
                          </DropdownMenuItem>
                          <DropdownMenuItem
                            onClick={() => handleDeleteDriver(driver._id)}
                            className="text-red-600"
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
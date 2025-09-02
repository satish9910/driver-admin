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
  Upload,
  Wallet,
  Calendar,
} from "lucide-react";
import Cookies from "js-cookie";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";

const formSchema = z.object({
  name: z.string().min(2, {
    message: "Name must be at least 2 characters.",
  }),
  drivercode: z.string().min(2, {
    message: "Driver code must be at least 2 characters.",
  }),
  email: z.string().email({
    message: "Please enter a valid email.",
  }),
  mobile: z.string().min(10, {
    message: "Mobile number must be at least 10 digits.",
  }),
  password: z.string().min(6, {
    message: "Password must be at least 6 characters.",
  }).optional(),
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
  const [profilePicture, setProfilePicture] = useState(null);
  const token = Cookies.get("admin_token");
  const navigation = useNavigate();
  const form = useForm({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: "",
      drivercode: "",
      email: "",
      mobile: "",
      password: "",
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
      drivercode: driver.drivercode || "",
      email: driver.email || "",
      mobile: driver.mobile || "",
    });
    setIsEditDialogOpen(true);
  };

  const handleCreateDriver = () => {
    setCurrentDriver(null);
    setProfilePicture(null);
    form.reset({
      name: "",
      drivercode: "",
      email: "",
      mobile: "",
      password: "",
    });
    setIsEditDialogOpen(true);
  };

  const filteredDrivers = drivers?.filter((driver) =>
    driver?.name?.toLowerCase()?.includes(searchTerm?.toLowerCase())
  );

  const onSubmit = async (values) => {
    setIsLoading(true);
    try {
      const formData = new FormData();
      
      // Append all form values
      Object.keys(values).forEach(key => {
        if (values[key]) {
          formData.append(key, values[key]);
        }
      });
      
      // Append profile picture if selected
      if (profilePicture) {
        formData.append("profilePicture", profilePicture);
      }

      if (currentDriver) {
        // Update existing driver
        const response = await axios.put(
          `${import.meta.env.VITE_BASE_UR}admin/update-drivers/${currentDriver._id}`,
          formData,
          {
            headers: {
              Authorization: `Bearer ${token}`,
              "Content-Type": "multipart/form-data",
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
          formData,
          {
            headers: {
              "Content-Type": "multipart/form-data",
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
      setProfilePicture(null);
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

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setProfilePicture(file);
    }
  };

  const handleDriverWallet = (driverId) => {
    // Navigate to the driver wallet page
    navigation(`/driverwallet/${driverId}`);
  };

  const handleDriverBookings = (driverId) => {
    // Navigate to the driver bookings page
    navigation(`/driver-bookings/${driverId}`);
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
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
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
                  name="drivercode"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Driver Code</FormLabel>
                      <FormControl>
                        <Input placeholder="Enter driver code" {...field} />
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
                <FormItem>
                  <FormLabel>Profile Picture</FormLabel>
                  <div className="flex items-center space-x-2">
                    <label
                      htmlFor="profilePicture"
                      className="flex items-center justify-center px-4 py-2 border border-gray-300 rounded-md cursor-pointer hover:bg-gray-50"
                    >
                      <Upload className="h-4 w-4 mr-2" />
                      Upload
                    </label>
                    <input
                      id="profilePicture"
                      type="file"
                      accept="image/*"
                      onChange={handleFileChange}
                      className="hidden"
                    />
                    {profilePicture && (
                      <span className="text-sm text-gray-500">
                        {profilePicture.name}
                      </span>
                    )}
                    {currentDriver?.profilePicture && !profilePicture && (
                      <span className="text-sm text-gray-500">
                        Current image exists
                      </span>
                    )}
                  </div>
                </FormItem>
              </div>

              <div className="flex justify-end space-x-2 pt-4">
                <Button
                  variant="outline"
                  type="button"
                  onClick={() => {
                    setIsEditDialogOpen(false);
                    setCurrentDriver(null);
                    setProfilePicture(null);
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
                <TableHead>Profile Picture</TableHead>
                <TableHead>Driver Code</TableHead>
                <TableHead>Driver Name</TableHead>
                <TableHead>Email</TableHead>
                <TableHead>Mobile</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Join Date</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredDrivers?.map((driver, index) => (
                <TableRow key={driver._id} className="hover:bg-gray-50">
                  <TableCell>{index + 1}</TableCell>
                  <TableCell>
                    {driver.profilePicture ? (
                      <img
                        src={`${import.meta.env.VITE_BASE_URL_IMG}${driver.profilePicture}`}
                        alt={driver.name}
                        className="h-10 w-10 rounded-full"
                      />
                    ) : (
                      "-"
                    )}
                  </TableCell>

                  <TableCell>{driver.drivercode || "-"}</TableCell>
                  <TableCell className="font-medium">{driver.name}</TableCell>
                  <TableCell>{driver.email}</TableCell>
                  <TableCell>{driver.mobile}</TableCell>
                  <TableCell>{getStatusBadge(driver.isActive)}</TableCell>
                  <TableCell>
                    {new Date(driver.createdAt).toLocaleDateString()}
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
                            onClick={() => handleViewDriver(driver)}
                          >
                            <Eye className="mr-2 h-4 w-4" />
                            View
                          </DropdownMenuItem>
                          <DropdownMenuItem
                            onClick={() => handleDriverBookings(driver._id)}
                          >
                            <Calendar className="mr-2 h-4 w-4" />
                            View Bookings
                          </DropdownMenuItem>
                          <DropdownMenuItem
                            onClick={() => handleDriverWallet(driver._id)}
                          >
                            <Wallet className="mr-2 h-4 w-4" />
                            View Wallet
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
import { useState, useEffect } from "react";
import axios from "axios";
import Cookies from "js-cookie";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";

import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
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
import { Checkbox } from "@/components/ui/checkbox";
import { toast } from "@/components/ui/use-toast";
import { Search, MoreHorizontal, Trash2, Plus, Wallet } from "lucide-react";
import { useNavigate } from "react-router-dom";

// Form schema for sub-admin creation
const formSchema = z.object({
  name: z.string().min(2, {
    message: "Name must be at least 2 characters.",
  }),
  email: z.string().email({
    message: "Please enter a valid email.",
  }),
  password: z.string().min(6, {
    message: "Password must be at least 6 characters.",
  }),
  permissions: z.array(z.string()).refine((value) => value.length > 0, {
    message: "You have to select at least one permission.",
  }),
});

// Available permissions (should match your backend)
const PERMISSIONS = [
  "manage_drivers",
  "manage_subadmins",
  "manage_bookings",
  // "manage_delivery",
  // "manage_meals",
  // "manage_orders",
  // "manage_categories",
  // "manage_banners",
  // "view_transactions",
  // "manage_pages",
  // "manage_settings",
  // "manage_notifications",
];

export function SubAdminManagement() {
  const [subAdmins, setSubAdmins] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const token = Cookies.get("admin_token");

  const navigate = useNavigate();

  const form = useForm({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: "",
      email: "",
      password: "",
      permissions: [],
    },
  });

  // Fetch all sub-admins
  const fetchSubAdmins = async () => {
    try {
      const response = await axios.get(
        `${import.meta.env.VITE_BASE_UR}admin/sub-admins`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      if (response.data) {
        setSubAdmins(response.data.subAdmins);
      } else {
        toast({
          title: "Error",
          description: response.data.message || "Failed to fetch sub-admins.",
          variant: "destructive",
        });
      }
    } catch (error) {
      console.error("Failed to fetch sub-admins:", error);
      let errorMessage = "Failed to fetch sub-admins. Please try again.";
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
    fetchSubAdmins();
  }, []);

  // Filter sub-admins based on search term
  const filteredSubAdmins = subAdmins.filter((subAdmin) =>
    subAdmin.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // Handle form submission (create new sub-admin)
  const onSubmit = async (values) => {
    setIsLoading(true);
    try {
      const payload = {
        ...values,
        role: "subadmin",
      };

      const response = await axios.post(
        `${import.meta.env.VITE_BASE_UR}public/admin-register`,
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
          title: "Sub-Admin Created",
          description: "The sub-admin was created successfully.",
        });
        await fetchSubAdmins();
        setIsDialogOpen(false);
        form.reset();
      }
    } catch (error) {
      console.error("Failed to create sub-admin:", error);
      toast({
        title: "Error",
        description: error.response?.data?.message || "An error occurred",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  // Delete a sub-admin
  const handleDeleteSubAdmin = async (subAdminId) => {
    try {
      const response = await axios.delete(
        `${import.meta.env.VITE_BASE_UR}admin/delete-sub-admins/${subAdminId}`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      if (response.data) {
        toast({
          title: "Sub-Admin Deleted",
          description: "The sub-admin has been deleted successfully.",
        });
        await fetchSubAdmins();
      }
    } catch (error) {
      console.error("Failed to delete sub-admin:", error);
      toast({
        title: "Error",
        description: error.response?.data?.message || "Failed to delete sub-admin",
        variant: "destructive",
      });
    }
  };

  // Format permission names for display
  const formatPermissionName = (permission) => {
    return permission
      .split('_')
      .map(word => word.charAt(0).toUpperCase() + word.slice(1))
      .join(' ');
  };

  const handleViewWallet = (subAdminId) => {
   navigate(`/subadmin-wallet/${subAdminId}`);
  };



  return (
    <div className="space-y-6 p-6">
      {/* Header with Search and Add Button */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between space-y-4 sm:space-y-0">
        <div className="flex items-center space-x-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
            <Input
              placeholder="Search sub-admins..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-64 pl-10"
            />
          </div>
        </div>
        <Button onClick={() => setIsDialogOpen(true)}>
          <Plus className="h-4 w-4 mr-2" />
          Add Sub-Admin
        </Button>
      </div>

      {/* Add Sub-Admin Dialog */}
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="sm:max-w-[600px] max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Add New Sub-Admin</DialogTitle>
            <DialogDescription>
              Create a new sub-admin with specific permissions.
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
                      <FormLabel>Name</FormLabel>
                      <FormControl>
                        <Input placeholder="Enter full name" {...field} />
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
                        <Input placeholder="Enter email" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="password"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Password</FormLabel>
                      <FormControl>
                        <Input 
                          type="password" 
                          placeholder="Enter password (min 6 characters)" 
                          {...field} 
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <div className="space-y-4">
                <FormLabel>Permissions</FormLabel>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {PERMISSIONS.map((permission) => (
                    <FormField
                      key={permission}
                      control={form.control}
                      name="permissions"
                      render={({ field }) => {
                        return (
                          <FormItem
                            key={permission}
                            className="flex flex-row items-start space-x-3 space-y-0"
                          >
                            <FormControl>
                              <Checkbox
                                checked={field.value?.includes(permission)}
                                onCheckedChange={(checked) => {
                                  return checked
                                    ? field.onChange([...field.value, permission])
                                    : field.onChange(
                                        field.value?.filter(
                                          (value) => value !== permission
                                        )
                                      );
                                }}
                              />
                            </FormControl>
                            <FormLabel className="font-normal">
                              {formatPermissionName(permission)}
                            </FormLabel>
                          </FormItem>
                        );
                      }}
                    />
                  ))}
                </div>
                <FormMessage>{form.formState.errors.permissions?.message}</FormMessage>
              </div>

              <div className="flex justify-end space-x-2 pt-4">
                <Button
                  variant="outline"
                  type="button"
                  onClick={() => setIsDialogOpen(false)}
                >
                  Cancel
                </Button>
                <Button type="submit" disabled={isLoading}>
                  {isLoading ? "Creating..." : "Create Sub-Admin"}
                </Button>
              </div>
            </form>
          </Form>
        </DialogContent>
      </Dialog>

      {/* Sub-Admins Table */}
      <Card>
        <CardHeader>
          <CardTitle>Sub-Admin Management</CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>#</TableHead>
                <TableHead>Name</TableHead>
                <TableHead>Email</TableHead>
                <TableHead>Role</TableHead>
                <TableHead>Permissions</TableHead>
                <TableHead>Join Date</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredSubAdmins.map((subAdmin, index) => (
                <TableRow key={subAdmin._id} className="hover:bg-gray-50">
                  <TableCell>{index + 1}</TableCell>
                  <TableCell className="font-medium">{subAdmin.name}</TableCell>
                  <TableCell>{subAdmin.email}</TableCell>
                  <TableCell>
                    <span className="px-2 py-1 bg-blue-100 text-blue-800 rounded-full text-xs">
                      {subAdmin.role}
                    </span>
                  </TableCell>
                  <TableCell>
                    <div className="flex flex-wrap gap-1 max-w-[200px]">
                      {subAdmin.permissions.map((permission) => (
                        <span 
                          key={permission}
                          className="px-2 py-1 bg-gray-100 text-gray-800 rounded-full text-xs"
                        >
                          {formatPermissionName(permission)}
                        </span>
                      ))}
                    </div>
                  </TableCell>
                  <TableCell>
                    {new Date(subAdmin.createdAt).toLocaleDateString()}
                  </TableCell>
                  <TableCell className="text-right">
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="icon">
                          <MoreHorizontal className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem
                          onClick={() => handleViewWallet(subAdmin._id)}
                        >
                          <Wallet className="mr-2 h-4 w-4" />
                          View Wallet
                        </DropdownMenuItem>

                        <DropdownMenuItem
                          className="text-red-600"
                          onClick={() => handleDeleteSubAdmin(subAdmin._id)}
                        >
                          <Trash2 className="mr-2 h-4 w-4" />
                          Delete
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
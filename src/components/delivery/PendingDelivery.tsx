import { useState, useEffect } from "react";
import axios from "axios";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import Cookies from "js-cookie";

import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
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
import { Search, MoreHorizontal, Eye, Edit, Trash2 } from "lucide-react";
import { Switch } from "@/components/ui/switch";

type DeliveryPartner = {
  id: string;
  name: string;
  phoneNumber: string;
  phoneNumber2?: string;
  longitude?: number;
  latitude?: number;
  address?: string;
  city: string;
  state: string;
  zipCode?: string;
  isActive: boolean;
  isVerified: boolean;
};

const formSchema = z.object({
  name: z.string().min(2, {
    message: "Name must be at least 2 characters.",
  }),
  phoneNumber: z.string().min(10, {
    message: "Phone number must be at least 10 digits.",
  }),
  phoneNumber2: z.string().optional(),
  longitude: z.string().optional(),
  latitude: z.string().optional(),
  address: z.string().min(5, {
    message: "Address must be at least 5 characters.",
  }),
  city: z.string().min(2, {
    message: "City must be at least 2 characters.",
  }),
  state: z.string().min(2, {
    message: "State must be at least 2 characters.",
  }),
  zipCode: z.string().min(3, {
    message: "Zip code must be at least 3 characters.",
  }),
  isActive: z.boolean(),
  isVerified: z.boolean(),
});

const getStatusColor = (status: string) => {
  switch (status) {
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

export function PendingDelivery() {
  const [deliveryPartners, setDeliveryPartners] = useState<DeliveryPartner[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [currentPartner, setCurrentPartner] = useState<DeliveryPartner | null>(null);
  const token = Cookies.get("admin_token");

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: "",
      phoneNumber: "",
      phoneNumber2: "",
      longitude: "",
      latitude: "",
      address: "",
      city: "",
      state: "",
      zipCode: "",
      isActive: false,
      isVerified: false,
    },
  });

  const fetchDeliveryPartners = async () => {
    try {
      const response = await axios.get(
        `${import.meta.env.VITE_BASE_UR}admin/get-all-delivery-partners`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );
      
      if (response.data?.unverified) {
        setDeliveryPartners(response.data.unverified);
      }
    } catch (error) {
      console.error("Failed to fetch delivery partners:", error);
      toast({
        title: "Error",
        description: "Failed to fetch pending delivery partners",
        variant: "destructive",
      });
    }
  };

  useEffect(() => {
    fetchDeliveryPartners();
  }, []);

  const handleEditPartner = (partner: DeliveryPartner) => {
    setCurrentPartner(partner);
    form.reset({
      name: partner.name,
      phoneNumber: partner.phoneNumber,
      phoneNumber2: partner.phoneNumber2 || "",
      longitude: partner.longitude?.toString() || "",
      latitude: partner.latitude?.toString() || "",
      address: partner.address || "",
      city: partner.city || "",
      state: partner.state || "",
      zipCode: partner.zipCode || "",
      isActive: partner.isActive,
      isVerified: partner.isVerified,
    });
    setIsEditDialogOpen(true);
  };

  const handleDeletePartner = async (partnerId: string) => {
    try {
      const response = await axios.delete(
        `${import.meta.env.VITE_BASE_UR}admin/hard-delete-delivery-partner/${partnerId}`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      if (response.data.success) {
        toast({
          title: "Partner Deleted",
          description: "The delivery partner was deleted successfully.",
        });
        await fetchDeliveryPartners();
      }
    } catch (error) {
      console.error("Failed to delete delivery partner:", error);
      toast({
        title: "Error",
        description: error.response?.data?.message || "Failed to delete partner",
        variant: "destructive",
      });
    }
  };

  const onSubmit = async (values) => {
    setIsLoading(true);
    try {
      const payload = {
        name: values.name,
        email: values.email,
        phoneNumber: values.phoneNumber,
        phoneNumber2: values.phoneNumber2,
        vehicleType: values.vehicleType,
        vehicleNumber: values.vehicleNumber,
        drivingLicense: values.drivingLicense,
        aadharNumber: values.aadharNumber,
        panNumber: values.panNumber,
        longitude: values.longitude ? parseFloat(values.longitude) : undefined,
        latitude: values.latitude ? parseFloat(values.latitude) : undefined,
        address: values.address,
        city: values.city,
        state: values.state,
        zipCode: values.zipCode,
        isActive: values.isActive,
        isVerified: values.isVerified,
      };

      const response = await axios.put(
        `${import.meta.env.VITE_BASE_UR}admin/update-delivery-partner/${currentPartner.id}`,
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
          title: "Success",
          description: "Delivery partner updated successfully",
        });
        await fetchDeliveryPartners();
        setIsEditDialogOpen(false);
      }
    } catch (error) {
      console.error("Failed to update delivery partner:", error);
      toast({
        title: "Error",
        description: error.response?.data?.message || "Failed to update delivery partner",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const filteredPartners = deliveryPartners.filter((partner) =>
    partner?.name?.toLowerCase()?.includes(searchTerm?.toLowerCase())
  );

  return (
    <div className="space-y-6 p-6">
      {/* Header with Search */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between space-y-4 sm:space-y-0">
        <div className="flex items-center space-x-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
            <Input
              placeholder="Search delivery partners..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-64 pl-10"
            />
          </div>
        </div>
      </div>

      {/* Edit Delivery Partner Modal */}
      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent className="sm:max-w-[700px]">
          <DialogHeader>
            <DialogTitle>Edit Delivery Partner</DialogTitle>
            <DialogDescription>
              Update the delivery partner details below.
            </DialogDescription>
          </DialogHeader>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* Column 1 */}
                <div className="space-y-4">
                  <FormField
                    control={form.control}
                    name="name"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Name</FormLabel>
                        <FormControl>
                          <Input placeholder="Enter name" {...field} />
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
                        <FormLabel>Primary Phone</FormLabel>
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
                          <Input placeholder="Enter alternate phone" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
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
                </div>

                {/* Column 2 */}
                <div className="space-y-4">
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
                    name="zipCode"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Zip Code</FormLabel>
                        <FormControl>
                          <Input placeholder="Enter zip code" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <div className="grid grid-cols-2 gap-4">
                    <FormField
                      control={form.control}
                      name="latitude"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Latitude</FormLabel>
                          <FormControl>
                            <Input placeholder="Enter latitude" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={form.control}
                      name="longitude"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Longitude</FormLabel>
                          <FormControl>
                            <Input placeholder="Enter longitude" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>
                </div>
              </div>

              {/* Status Switches */}
              <div className="flex space-x-4">
                <FormField
                  control={form.control}
                  name="isActive"
                  render={({ field }) => (
                    <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4 flex-1">
                      <div className="space-y-0.5">
                        <FormLabel className="text-base">Active Status</FormLabel>
                      </div>
                      <FormControl>
                        <Switch
                          checked={field.value}
                          onCheckedChange={field.onChange}
                        />
                      </FormControl>
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="isVerified"
                  render={({ field }) => (
                    <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4 flex-1">
                      <div className="space-y-0.5">
                        <FormLabel className="text-base">Verified</FormLabel>
                      </div>
                      <FormControl>
                        <Switch
                          checked={field.value}
                          onCheckedChange={field.onChange}
                        />
                      </FormControl>
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
                    setCurrentPartner(null);
                  }}
                >
                  Cancel
                </Button>
                <Button type="submit" disabled={isLoading}>
                  {isLoading ? "Updating..." : "Update Delivery Partner"}
                </Button>
              </div>
            </form>
          </Form>
        </DialogContent>
      </Dialog>

      {/* Delivery Partners Table */}
      <Card>
        <CardHeader>
          <CardTitle>Pending Delivery Partners</CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>#</TableHead>
                <TableHead>Name</TableHead>
                <TableHead>Email</TableHead>
                <TableHead>Phone</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Location</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredPartners.map((partner, index) => (
                <TableRow key={partner.id} className="hover:bg-gray-50">
                  <TableCell>{index + 1}</TableCell>
                  <TableCell className="font-medium">{partner.name}</TableCell>
                  <TableCell className="font-medium">{partner.email}</TableCell>
                  <TableCell>{partner.phoneNumber}</TableCell>
                  <TableCell>
                    <Badge className={getStatusColor(partner.isVerified ? "active" : "pending")}>
                      {partner.isVerified ? "Verified" : "Pending"}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    {partner.city}, {partner.state}
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
                              (window.location.href = `/admin/partnerprofile/${partner.id}`)
                            }
                          >
                            <Eye className="mr-2 h-4 w-4" />
                            View Profile
                          </DropdownMenuItem>
                          <DropdownMenuItem
                            onClick={() => handleEditPartner(partner)}
                          >
                            <Edit className="mr-2 h-4 w-4" />
                            Edit
                          </DropdownMenuItem>
                          <DropdownMenuItem
                            className="text-red-600"
                            onClick={() => handleDeletePartner(partner.id)}
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
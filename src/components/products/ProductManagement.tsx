import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import * as Switch from "@radix-ui/react-switch";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useNavigate } from "react-router-dom";
import axios from "axios";
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
import {
  Search,
  Filter,
  Plus,
  MoreHorizontal,
  Edit,
  Trash2,
  Eye,
  ChevronLeft,
  ChevronRight,
  Check,
  X,
} from "lucide-react";
import { Label } from "@/components/ui/label";
import { toast } from "@/components/ui/use-toast";
import Cookies from "js-cookie";

interface Meal {
  id: number;
  title: string;
  description: string;
  type: string;
  cuisine: string;
  isVeg: boolean;
  basePrice: number;
  isAvailable: boolean;
  isWeekly: boolean;
  isVerified: boolean;
  image: string | null;
  vendor: {
    name: string;
    businessName: string;
  };
  mealImages: {
    url: string;
  }[];
  dietaryTags: {
    tag: string;
  }[];
  availableDays: {
    day: string;
  }[];
  createdAt: string;
  updatedAt: string;
}

export function MealManagement() {
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [typeFilter, setTypeFilter] = useState("all");
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [meals, setMeals] = useState<Meal[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const role = Cookies.get("user_role");
  const isAdmin = role === "admin";
  const isVendor = role === "vendor";

  const navigate = useNavigate();

  const mealsPerPage = 10;

  // Get the appropriate token based on role
  const token = isAdmin
    ? Cookies.get("admin_token")
    : Cookies.get("vendor_token");

  useEffect(() => {
    fetchMeals();
  }, []);

  const fetchMeals = async () => {
    try {
      setLoading(true);

      if (!isAdmin) {
        throw new Error("Unauthorized access");
      }

      const apiUrl = `${import.meta.env.VITE_BASE_UR}admin/get-all-meals`;

      const response = await fetch(apiUrl, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (!response.ok) {
        throw new Error("Failed to fetch meals");
      }

      const data = await response.json();
      setMeals(data.meals || []);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleDetailClick = (mealId: number) => {
    if (isAdmin) {
      navigate(`/mealdetails/${mealId}`);
    } else if (isVendor) {
      navigate(`/vendor/mealdetails/${mealId}`);
    }
  };

  const handleDeleteMeal = async (mealId: number) => {
    if (!isAdmin) {
      toast({
        title: "Permission Denied",
        description: "You don't have permission to delete meals",
        variant: "destructive",
      });
      return;
    }

    try {
      const response = await fetch(
        `${import.meta.env.VITE_BASE_UR}admin/delete-meal/${mealId}`,
        {
          method: "DELETE",
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      const data = await response.json();

      if (!response.ok || data.status === false) {
        const errorMsg = data?.message || "Failed to delete meal";
        toast({
          title: "Delete Failed",
          description: errorMsg,
          variant: "destructive",
        });
        return;
      }

      toast({
        title: "Meal Deleted",
        description: "The meal was deleted successfully.",
      });

      await fetchMeals();
    } catch (err: any) {
      toast({
        title: "Error",
        description: err?.message || "An unexpected error occurred",
        variant: "destructive",
      });
    }
  };

  const handleVerifyMeal = async (mealId: number) => {
    if (!isAdmin) {
      toast({
        title: "Permission Denied",
        description: "You don't have permission to verify meals",
        variant: "destructive",
      });
      return;
    }

    try {
      const response = await fetch(
        `${import.meta.env.VITE_BASE_UR}admin/verify-vendor-meal/${mealId}`,
        {
          method: "PATCH",
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      const data = await response.json();

      if (!response.ok || data.status === false) {
        const errorMsg = data?.message || "Failed to verify meal";
        toast({
          title: "Verification Failed",
          description: errorMsg,
          variant: "destructive",
        });
        return;
      }

      toast({
        title: "Meal Verified",
        description: "The meal was verified successfully.",
      });

      await fetchMeals();
    } catch (err: any) {
      toast({
        title: "Error",
        description: err?.message || "An unexpected error occurred",
        variant: "destructive",
      });
    }
  };

  const ToggleDeleteUser = async (userId: number) => {
    if (window.confirm("Are you sure you want to soft delete this user?")) {
      try {
        await axios.patch(
          `${import.meta.env.VITE_BASE_UR}admin/toggle-meal-availability/${userId}`,
          {},
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        );
        toast({
          title: "User Soft Deleted",
          description: "The user was soft deleted successfully.",
        });
        await fetchMeals();
      } catch (error) {
        console.error("Failed to soft delete user:", error);
        toast({
          title: "Delete Failed",
          description: "An error occurred while trying to delete the user.",
          variant: "destructive",
        });
      }
    }
  };

  const getStatusColor = (isAvailable: boolean) => {
    return isAvailable
      ? "bg-green-100 text-green-800"
      : "bg-red-100 text-red-800";
  };

  const getStatusText = (isAvailable: boolean) => {
    return isAvailable ? "Available" : "Unavailable";
  };

  const getVegNonVegColor = (isVeg: boolean) => {
    return isVeg ? "bg-green-100 text-green-800" : "bg-red-100 text-red-800";
  };

  const getVegNonVegText = (isVeg: boolean) => {
    return isVeg ? "Veg" : "Non-Veg";
  };

  const filteredMeals = meals.filter((meal) => {
    const matchesSearch =
      meal.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      meal.vendor.name.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus =
      statusFilter === "all" ||
      (statusFilter === "available" && meal.isAvailable) ||
      (statusFilter === "unavailable" && !meal.isAvailable);
    const matchesType = typeFilter === "all" || meal.type === typeFilter;
    return matchesSearch && matchesStatus && matchesType;
  });

  // Split meals into verified and unverified
  const verifiedMeals = filteredMeals.filter((meal) => meal.isVerified);
  const unverifiedMeals = filteredMeals.filter((meal) => !meal.isVerified);

  // Get current meals for the active tab
  const activeTabMeals = (tab: string) =>
    tab === "verified" ? verifiedMeals : unverifiedMeals;
  const currentMeals = activeTabMeals("verified").slice(
    (currentPage - 1) * mealsPerPage,
    currentPage * mealsPerPage
  );
  const currentUnverifiedMeals = activeTabMeals("unverified").slice(
    (currentPage - 1) * mealsPerPage,
    currentPage * mealsPerPage
  );

  const totalPages = (tab: string) =>
    Math.ceil(activeTabMeals(tab).length / mealsPerPage);
  const types = [...new Set(meals.map((m) => m.type))];

  if (loading) {
    return <div>Loading meals...</div>;
  }

  if (error) {
    return <div>Error: {error}</div>;
  }

  const renderMealTable = (mealsToRender: Meal[]) => (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead>#</TableHead>
          <TableHead>Meal</TableHead>
          <TableHead>Type</TableHead>
          <TableHead>Cuisine</TableHead>
          <TableHead>Vendor</TableHead>
          <TableHead>Price</TableHead>
          <TableHead>Veg/Non-Veg</TableHead>
          <TableHead>Status</TableHead>
          <TableHead className="text-right">Actions</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {mealsToRender.map((meal) => (
          <TableRow key={meal.id} className="hover:bg-gray-50">
            <TableCell>{filteredMeals.indexOf(meal) + 1}</TableCell>
            <TableCell>
              <div className="flex items-center space-x-3">
                {(meal.image || meal.mealImages?.[0]?.url) && (
                  <img
                    src={`${import.meta.env.VITE_BASE_URL_IMG}${
                      meal.image || meal.mealImages[0].url
                    }`}
                    alt={meal.title}
                    className="w-10 h-10 rounded-md object-cover bg-gray-100"
                  />
                )}
                <div>
                  <div className="font-medium">{meal.title}</div>
                  <div className="text-sm text-gray-500 line-clamp-1">
                    {meal.description}
                  </div>
                </div>
              </div>
            </TableCell>
            <TableCell>{meal.type}</TableCell>
            <TableCell>{meal.cuisine}</TableCell>
            <TableCell>{meal.vendor.businessName}</TableCell>
            <TableCell>₹{meal.basePrice || "0.00"}</TableCell>
            <TableCell>
              <Badge className={getVegNonVegColor(meal.isVeg)}>
                {getVegNonVegText(meal.isVeg)}
              </Badge>
            </TableCell>
            <TableCell>
              <Badge className={getStatusColor(meal.isAvailable)}>
                {getStatusText(meal.isAvailable)}
              </Badge>

              <div className="mt-2">
                <div className="flex items-center space-x-3">
                  <Switch.Root
                    checked={meal.isAvailable}
                    onCheckedChange={() => ToggleDeleteUser(meal.id)}
                    className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                      meal.isAvailable ? "bg-green-500" : "bg-gray-300"
                    }`}
                  >
                    <Switch.Thumb
                      className={`inline-block h-4 w-4 transform rounded-full bg-white shadow transition-transform ${
                        meal.isAvailable ? "translate-x-6" : "translate-x-1"
                      }`}
                    />
                  </Switch.Root>

                  <span
                    className={`text-xs ${
                      meal.isAvailable ? "text-green-600" : "text-gray-600"
                    }`}
                  >
                    {meal.isAvailable ? "Available" : "Unavailable"}
                  </span>
                </div>
              </div>
            </TableCell>

            <TableCell className="text-right">
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" size="icon">
                    <MoreHorizontal className="h-4 w-4" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  <DropdownMenuItem onClick={() => handleDetailClick(meal.id)}>
                    <Eye className="mr-2 h-4 w-4" />
                    View Details
                  </DropdownMenuItem>
                  { isAdmin && (
                    <DropdownMenuItem onClick={() => handleVerifyMeal(meal.id)}>
                      <Check className="mr-2 h-4 w-4 text-green-600" />
                      Verify
                    </DropdownMenuItem>
                  )}
                  {/* <DropdownMenuItem
                    onClick={() =>
                      navigate(
                        isAdmin
                          ? `/meal-update/${meal.id}`
                          : `/vendor/meal-update/${meal.id}`
                      )
                    }
                  >
                    <Edit className="mr-2 h-4 w-4" />
                    Edit
                  </DropdownMenuItem> */}
                  {/* <DropdownMenuItem
                    className="text-red-600"
                    onClick={() => handleDeleteMeal(meal.id)}
                  >
                    <Trash2 className="mr-2 h-4 w-4" />
                    Delete
                  </DropdownMenuItem> */}
                </DropdownMenuContent>
              </DropdownMenu>
            </TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  );

  return (
    <div className="space-y-6">
      {/* Header with Search and Filters */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between space-y-4 sm:space-y-0">
        <div className="flex items-center space-x-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
            <Input
              placeholder="Search meals..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-64 pl-10"
            />
          </div>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" size="sm">
                <Filter className="h-4 w-4 mr-2" />
                Status:{" "}
                {statusFilter === "all"
                  ? "All"
                  : statusFilter === "available"
                  ? "Available"
                  : "Unavailable"}
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent>
              <DropdownMenuItem onClick={() => setStatusFilter("all")}>
                All
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => setStatusFilter("available")}>
                Available
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => setStatusFilter("unavailable")}>
                Unavailable
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" size="sm">
                <Filter className="h-4 w-4 mr-2" />
                Type: {typeFilter === "all" ? "All" : typeFilter}
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent>
              <DropdownMenuItem onClick={() => setTypeFilter("all")}>
                All
              </DropdownMenuItem>
              {types.map((type) => (
                <DropdownMenuItem
                  key={type}
                  onClick={() => setTypeFilter(type)}
                >
                  {type}
                </DropdownMenuItem>
              ))}
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
        <div className="flex space-x-2">
          <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
            {/* <DialogTrigger asChild>
              <Button>
                <Plus className="h-4 w-4 mr-2" />
                Add Meal
              </Button>
            </DialogTrigger> */}
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Add New Meal</DialogTitle>
              </DialogHeader>
              <div className="space-y-4">
                <div>
                  <Label htmlFor="mealTitle">Meal Title</Label>
                  <Input id="mealTitle" placeholder="Enter meal title" />
                </div>
                <div>
                  <Label htmlFor="type">Type</Label>
                  <Input id="type" placeholder="Enter meal type" />
                </div>
                <div>
                  <Label htmlFor="price">Price</Label>
                  <Input id="price" type="number" placeholder="0.00" />
                </div>
                <div className="flex justify-end space-x-2">
                  <Button
                    variant="outline"
                    onClick={() => setIsAddDialogOpen(false)}
                  >
                    Cancel
                  </Button>
                  <Button onClick={() => setIsAddDialogOpen(false)}>
                    Add Meal
                  </Button>
                </div>
              </div>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      {/* Tabs for Verified/Unverified Meals */}
      <Tabs defaultValue="verified" className="w-full">
        <TabsList>
          <TabsTrigger value="verified">
            <Check className="h-4 w-4 mr-2" />
            Verified Meals ({verifiedMeals.length})
          </TabsTrigger>
          {isAdmin && (
            <TabsTrigger value="unverified">
              <X className="h-4 w-4 mr-2" />
              Pending Verification ({unverifiedMeals.length})
            </TabsTrigger>
          )}
        </TabsList>

        <TabsContent value="verified">
          <Card>
            <CardContent className="pt-6">
              {renderMealTable(currentMeals)}
              {verifiedMeals.length > mealsPerPage && (
                <div className="flex items-center justify-between mt-4">
                  <div className="text-sm text-gray-500">
                    Showing {(currentPage - 1) * mealsPerPage + 1} to{" "}
                    {Math.min(currentPage * mealsPerPage, verifiedMeals.length)}{" "}
                    of {verifiedMeals.length} meals
                  </div>
                  <div className="flex items-center space-x-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setCurrentPage(currentPage - 1)}
                      disabled={currentPage === 1}
                    >
                      <ChevronLeft className="h-4 w-4" />
                    </Button>
                    {Array.from(
                      { length: totalPages("verified") },
                      (_, i) => i + 1
                    ).map((number) => (
                      <Button
                        key={number}
                        variant={currentPage === number ? "default" : "outline"}
                        size="sm"
                        onClick={() => setCurrentPage(number)}
                      >
                        {number}
                      </Button>
                    ))}
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setCurrentPage(currentPage + 1)}
                      disabled={currentPage === totalPages("verified")}
                    >
                      <ChevronRight className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {isAdmin && (
          <TabsContent value="unverified">
            <Card>
              <CardContent className="pt-6">
                {renderMealTable(currentUnverifiedMeals)}
                {unverifiedMeals.length > mealsPerPage && (
                  <div className="flex items-center justify-between mt-4">
                    <div className="text-sm text-gray-500">
                      Showing {(currentPage - 1) * mealsPerPage + 1} to{" "}
                      {Math.min(
                        currentPage * mealsPerPage,
                        unverifiedMeals.length
                      )}{" "}
                      of {unverifiedMeals.length} meals
                    </div>
                    <div className="flex items-center space-x-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => setCurrentPage(currentPage - 1)}
                        disabled={currentPage === 1}
                      >
                        <ChevronLeft className="h-4 w-4" />
                      </Button>
                      {Array.from(
                        { length: totalPages("unverified") },
                        (_, i) => i + 1
                      ).map((number) => (
                        <Button
                          key={number}
                          variant={
                            currentPage === number ? "default" : "outline"
                          }
                          size="sm"
                          onClick={() => setCurrentPage(number)}
                        >
                          {number}
                        </Button>
                      ))}
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => setCurrentPage(currentPage + 1)}
                        disabled={currentPage === totalPages("unverified")}
                      >
                        <ChevronRight className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>
        )}
      </Tabs>
    </div>
  );
}

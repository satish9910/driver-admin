import { useState, useEffect, useCallback } from "react";
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
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
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
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Search,
  MoreHorizontal,
  Plus,
  Check,
  X,
  Edit,
  Filter,
} from "lucide-react";
import Cookies from "js-cookie";

interface Industry {
  _id: string;
  name: string;
  slug: string;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export function IndustryManagement() {
  const [industries, setIndustries] = useState<Industry[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [limit, setLimit] = useState(20);
  const [total, setTotal] = useState(0);
  const [activeStatusFilter, setActiveStatusFilter] = useState<"all" | "active" | "inactive">("all");
  
  // Form states
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [currentIndustry, setCurrentIndustry] = useState<Industry | null>(null);
  const [newIndustryName, setNewIndustryName] = useState("");
  const [newIndustrySlug, setNewIndustrySlug] = useState("");
  const [editIndustryName, setEditIndustryName] = useState("");
  const [editIndustrySlug, setEditIndustrySlug] = useState("");

  const token = Cookies.get("admin_token");

  const fetchIndustries = useCallback(async () => {
    try {
      setIsLoading(true);
      
      // Build query parameters
      const params = new URLSearchParams();
      params.append("page", currentPage.toString());
      params.append("limit", limit.toString());
      
      if (searchTerm) {
        params.append("q", searchTerm);
      }
      
      if (activeStatusFilter !== "all") {
        params.append("active", activeStatusFilter === "active" ? "true" : "false");
      }
      
      const baseUrl = import.meta.env.VITE_BASE_UR;
      const url = `${baseUrl}admin/industries?${params.toString()}`;
      
      const response = await axios.get(url, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (response.data) {
        setIndustries(response.data.industries);
        setTotal(response.data.total);
        setTotalPages(response.data.totalPages);
      } else {
        toast({
          title: "Error",
          description: response.data.message || "Failed to fetch industries.",
          variant: "destructive",
        });
      }
    } catch (error) {
      console.error("Failed to fetch industries:", error);
      let errorMessage = "Failed to fetch industries. Please try again.";
      if (axios.isAxiosError(error)) {
        errorMessage =
          error.response?.data?.message || error.message || errorMessage;
      }
      toast({
        title: "Error",
        description: errorMessage,
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  }, [token, currentPage, limit, searchTerm, activeStatusFilter]);

  useEffect(() => {
    fetchIndustries();
  }, [fetchIndustries]);

  const applyFilters = () => {
    setCurrentPage(1); // Reset to first page when applying filters
    fetchIndustries();
  };

  const clearFilters = () => {
    setSearchTerm("");
    setActiveStatusFilter("all");
    setCurrentPage(1);
  };

  const getStatusBadge = (isActive: boolean) => {
    return isActive ? (
      <Badge className="bg-green-100 text-green-800">Active</Badge>
    ) : (
      <Badge className="bg-red-100 text-red-800">Inactive</Badge>
    );
  };

  const handleCreateIndustry = async () => {
    try {
      const response = await axios.post(
        `${import.meta.env.VITE_BASE_UR}admin/industries`,
        { name: newIndustryName, slug: newIndustrySlug },
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
          description: response.data.message,
        });
        setIsCreateDialogOpen(false);
        setNewIndustryName("");
        setNewIndustrySlug("");
        await fetchIndustries(); // Refresh the data
      }
    } catch (error) {
      console.error("Error creating industry:", error);
      toast({
        title: "Error",
        description: error.response?.data?.message || "Failed to create industry",
        variant: "destructive",
      });
    }
  };

  const handleEditIndustry = async () => {
    if (!currentIndustry) return;
    
    try {
      const response = await axios.put(
        `${import.meta.env.VITE_BASE_UR}admin/industries/${currentIndustry._id}`,
        { name: editIndustryName, slug: editIndustrySlug },
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
          description: response.data.message,
        });
        setIsEditDialogOpen(false);
        setCurrentIndustry(null);
        setEditIndustryName("");
        setEditIndustrySlug("");
        await fetchIndustries(); // Refresh the data
      }
    } catch (error) {
      console.error("Error updating industry:", error);
      toast({
        title: "Error",
        description: error.response?.data?.message || "Failed to update industry",
        variant: "destructive",
      });
    }
  };

  const toggleIndustryStatus = async (industryId: string, currentStatus: boolean) => {
    try {
      const response = await axios.patch(
        `${import.meta.env.VITE_BASE_UR}admin/industries/${industryId}/toggle-active`,
        {},
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
          description: response.data.message,
        });
        await fetchIndustries(); // Refresh the data
      }
    } catch (error) {
      console.error("Error toggling industry status:", error);
      toast({
        title: "Error",
        description: error.response?.data?.message || "Failed to toggle industry status",
        variant: "destructive",
      });
    }
  };

  const openEditDialog = (industry: Industry) => {
    setCurrentIndustry(industry);
    setEditIndustryName(industry.name);
    setEditIndustrySlug(industry.slug);
    setIsEditDialogOpen(true);
  };

  return (
    <div className="space-y-6 p-6">
      {/* Header with Search and Filters */}
      <div className="space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between space-y-4 sm:space-y-0">
          <div className="flex items-center space-x-4">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
              <Input
                placeholder="Search industries..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-64 pl-10"
              />
            </div>
          </div>
          
          <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
            <DialogTrigger asChild>
              <Button onClick={() => setIsCreateDialogOpen(true)}>
                <Plus className="mr-2 h-4 w-4" />
                Add Industry
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Create New Industry</DialogTitle>
                <DialogDescription>
                  Add a new industry to the system.
                </DialogDescription>
              </DialogHeader>
              <div className="space-y-4">
                <div>
                  <label className="text-sm font-medium mb-1 block">Industry Name</label>
                  <Input
                    placeholder="Enter industry name"
                    value={newIndustryName}
                    onChange={(e) => setNewIndustryName(e.target.value)}
                  />
                </div>
                <div>
                  <label className="text-sm font-medium mb-1 block">Slug</label>
                  <Input
                    placeholder="Enter slug (optional)"
                    value={newIndustrySlug}
                    onChange={(e) => setNewIndustrySlug(e.target.value)}
                  />
                </div>
              </div>
              <DialogFooter>
                <Button variant="outline" onClick={() => setIsCreateDialogOpen(false)}>
                  Cancel
                </Button>
                <Button onClick={handleCreateIndustry} disabled={!newIndustryName.trim()}>
                  Create Industry
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </div>

        {/* Filter Section */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Filter className="h-5 w-5" />
              Filters
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              {/* Active Status Filter */}
              <div>
                <label className="text-sm font-medium mb-1 block">Status</label>
                <Select value={activeStatusFilter} onValueChange={(value: "all" | "active" | "inactive") => setActiveStatusFilter(value)}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Industries</SelectItem>
                    <SelectItem value="active">Active</SelectItem>
                    <SelectItem value="inactive">Inactive</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              
              {/* Filter Actions */}
              <div className="flex items-end gap-2">
                <Button onClick={applyFilters} className="flex-1">
                  Apply Filters
                </Button>
                <Button variant="outline" onClick={clearFilters} className="flex-1">
                  Clear
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Industries Table */}
      <Card>
        <CardHeader>
          <CardTitle>Industry Management</CardTitle>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="flex items-center justify-center h-32">
              <p>Loading industries...</p>
            </div>
          ) : (
            <>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>#</TableHead>
                    <TableHead>Name</TableHead>
                    <TableHead>Slug</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Created At</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {industries?.map((industry, index) => (
                    <TableRow key={industry._id} className="hover:bg-gray-50">
                      <TableCell>{(currentPage - 1) * limit + index + 1}</TableCell>
                      <TableCell className="font-medium">{industry.name}</TableCell>
                      <TableCell>{industry.slug || "-"}</TableCell>
                      <TableCell>{getStatusBadge(industry.isActive)}</TableCell>
                      <TableCell>
                        {new Date(industry.createdAt).toLocaleDateString()}
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
                                onClick={() => openEditDialog(industry)}
                              >
                                <Edit className="mr-2 h-4 w-4" />
                                Edit
                              </DropdownMenuItem>
                              <DropdownMenuItem
                                onClick={() => toggleIndustryStatus(industry._id, industry.isActive)}
                              >
                                {industry.isActive ? (
                                  <>
                                    <X className="mr-2 h-4 w-4" />
                                    Deactivate
                                  </>
                                ) : (
                                  <>
                                    <Check className="mr-2 h-4 w-4" />
                                    Activate
                                  </>
                                )}
                              </DropdownMenuItem>
                            </DropdownMenuContent>
                          </DropdownMenu>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>

              {/* Pagination */}
              {totalPages > 1 && (
                <div className="flex items-center justify-between mt-4">
                  <div className="text-sm text-gray-500">
                    Showing {(currentPage - 1) * limit + 1} to {Math.min(currentPage * limit, total)} of {total} results
                  </div>
                  <div className="flex space-x-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                      disabled={currentPage === 1}
                    >
                      Previous
                    </Button>
                    <div className="flex items-center">
                      Page {currentPage} of {totalPages}
                    </div>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
                      disabled={currentPage === totalPages}
                    >
                      Next
                    </Button>
                  </div>
                </div>
              )}
            </>
          )}
        </CardContent>
      </Card>

      {/* Edit Industry Dialog */}
      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Edit Industry</DialogTitle>
            <DialogDescription>
              Update the industry details.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <label className="text-sm font-medium mb-1 block">Industry Name</label>
              <Input
                placeholder="Enter industry name"
                value={editIndustryName}
                onChange={(e) => setEditIndustryName(e.target.value)}
              />
            </div>
            <div>
              <label className="text-sm font-medium mb-1 block">Slug</label>
              <Input
                placeholder="Enter slug"
                value={editIndustrySlug}
                onChange={(e) => setEditIndustrySlug(e.target.value)}
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsEditDialogOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleEditIndustry} disabled={!editIndustryName.trim()}>
              Update Industry
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
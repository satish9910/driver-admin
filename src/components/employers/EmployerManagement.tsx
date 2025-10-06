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
  Eye,
  Check,
  X,
  Edit,
  Trash2,
  Calendar,
  Filter,
  ShieldCheck,
} from "lucide-react";
import Cookies from "js-cookie";
import { useNavigate } from "react-router-dom";

interface Employer {
  _id: string;
  fullName: string;
  email: string;
  mobile: string;
  companyName: string;
  industry: string;
  verified: boolean;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
  role: string;
}

export function EmployerManagement() {
  const [employers, setEmployers] = useState<Employer[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [limit, setLimit] = useState(20);
  const [total, setTotal] = useState(0);
  const [activeStatusFilter, setActiveStatusFilter] = useState<"all" | "active" | "inactive">("all");
  const [verificationFilter, setVerificationFilter] = useState<"all" | "verified" | "unverified">("all");
  
  const token = Cookies.get("admin_token");
  const navigation = useNavigate();

  const fetchEmployers = useCallback(async () => {
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
      
      if (verificationFilter !== "all") {
        params.append("verified", verificationFilter === "verified" ? "true" : "false");
      }
      
      const baseUrl = import.meta.env.VITE_BASE_UR;
      const url = `${baseUrl}admin/employers?${params.toString()}`;
      
      const response = await axios.get(url, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (response.data) {
        setEmployers(response.data.employers);
        setTotal(response.data.total);
        setTotalPages(response.data.totalPages);
      } else {
        toast({
          title: "Error",
          description: response.data.message || "Failed to fetch employers.",
          variant: "destructive",
        });
      }
    } catch (error) {
      console.error("Failed to fetch employers:", error);
      let errorMessage = "Failed to fetch employers. Please try again.";
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
  }, [token, currentPage, limit, searchTerm, activeStatusFilter, verificationFilter]);

  useEffect(() => {
    fetchEmployers();
  }, [fetchEmployers]);

  const applyFilters = () => {
    setCurrentPage(1); // Reset to first page when applying filters
    fetchEmployers();
  };

  const clearFilters = () => {
    setSearchTerm("");
    setActiveStatusFilter("all");
    setVerificationFilter("all");
    setCurrentPage(1);
  };

  const getStatusBadge = (isActive: boolean) => {
    return isActive ? (
      <Badge className="bg-green-100 text-green-800">Active</Badge>
    ) : (
      <Badge className="bg-red-100 text-red-800">Inactive</Badge>
    );
  };

  const getVerificationBadge = (isVerified: boolean) => {
    return isVerified ? (
      <Badge className="bg-blue-100 text-blue-800">
        <ShieldCheck className="h-3 w-3 mr-1" />
        Verified
      </Badge>
    ) : (
      <Badge className="bg-yellow-100 text-yellow-800">Unverified</Badge>
    );
  };

  const handleViewEmployer = (employer: Employer) => {
    // Navigate to employer detail page (you can implement this later)
    console.log("View employer:", employer);
    toast({
      title: "View Employer",
      description: "Employer detail view would open here.",
    });
  };

  const toggleEmployerStatus = async (employerId: string, currentStatus: boolean) => {
    try {
      const response = await axios.patch(
        `${import.meta.env.VITE_BASE_UR}admin/employers/${employerId}/toggle-active`,
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
        await fetchEmployers(); // Refresh the data
      }
    } catch (error) {
      console.error("Error toggling employer status:", error);
      toast({
        title: "Error",
        description: error.response?.data?.message || "Failed to toggle employer status",
        variant: "destructive",
      });
    }
  };

  const toggleEmployerVerification = async (employerId: string, currentVerification: boolean) => {
    try {
      const response = await axios.patch(
        `${import.meta.env.VITE_BASE_UR}admin/employers/${employerId}/toggle-verified`,
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
        await fetchEmployers(); // Refresh the data
      }
    } catch (error) {
      console.error("Error toggling employer verification:", error);
      toast({
        title: "Error",
        description: error.response?.data?.message || "Failed to toggle employer verification",
        variant: "destructive",
      });
    }
  };

  const handleDeleteEmployer = async (employerId: string) => {
    // In a real application, you would implement delete functionality
    toast({
      title: "Delete Employer",
      description: "Delete functionality would be implemented here.",
    });
  };

  const filteredEmployers = employers?.filter((employer) =>
    employer?.fullName?.toLowerCase()?.includes(searchTerm?.toLowerCase()) ||
    employer?.email?.toLowerCase()?.includes(searchTerm?.toLowerCase()) ||
    employer?.mobile?.includes(searchTerm) ||
    employer?.companyName?.toLowerCase()?.includes(searchTerm?.toLowerCase())
  );

  return (
    <div className="space-y-6 p-6">
      {/* Header with Search and Filters */}
      <div className="space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between space-y-4 sm:space-y-0">
          <div className="flex items-center space-x-4">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
              <Input
                placeholder="Search employers..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-64 pl-10"
              />
            </div>
          </div>
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
                    <SelectItem value="all">All Employers</SelectItem>
                    <SelectItem value="active">Active</SelectItem>
                    <SelectItem value="inactive">Inactive</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              
              {/* Verification Filter */}
              <div>
                <label className="text-sm font-medium mb-1 block">Verification</label>
                <Select value={verificationFilter} onValueChange={(value: "all" | "verified" | "unverified") => setVerificationFilter(value)}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select verification" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Employers</SelectItem>
                    <SelectItem value="verified">Verified</SelectItem>
                    <SelectItem value="unverified">Unverified</SelectItem>
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

      {/* Employers Table */}
      <Card>
        <CardHeader>
          <CardTitle>Employer Management</CardTitle>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="flex items-center justify-center h-32">
              <p>Loading employers...</p>
            </div>
          ) : (
            <>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>#</TableHead>
                    <TableHead>Company</TableHead>
                    <TableHead>Contact Person</TableHead>
                    <TableHead>Email</TableHead>
                    <TableHead>Mobile</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Verification</TableHead>
                    <TableHead>Join Date</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredEmployers?.map((employer, index) => (
                    <TableRow key={employer._id} className="hover:bg-gray-50">
                      <TableCell>{(currentPage - 1) * limit + index + 1}</TableCell>
                      <TableCell className="font-medium">{employer.companyName}</TableCell>
                      <TableCell>{employer.fullName}</TableCell>
                      <TableCell>{employer.email}</TableCell>
                      <TableCell>{employer.mobile}</TableCell>
                      <TableCell>{getStatusBadge(employer.isActive)}</TableCell>
                      <TableCell>{getVerificationBadge(employer.verified)}</TableCell>
                      <TableCell>
                        {new Date(employer.createdAt).toLocaleDateString()}
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
                                onClick={() => handleViewEmployer(employer)}
                              >
                                <Eye className="mr-2 h-4 w-4" />
                                View
                              </DropdownMenuItem>
                              <DropdownMenuItem
                                onClick={() => toggleEmployerStatus(employer._id, employer.isActive)}
                              >
                                {employer.isActive ? (
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
                              <DropdownMenuItem
                                onClick={() => toggleEmployerVerification(employer._id, employer.verified)}
                              >
                                {employer.verified ? (
                                  <>
                                    <X className="mr-2 h-4 w-4" />
                                    Unverify
                                  </>
                                ) : (
                                  <>
                                    <ShieldCheck className="mr-2 h-4 w-4" />
                                    Verify
                                  </>
                                )}
                              </DropdownMenuItem>
                              <DropdownMenuItem
                                onClick={() => handleDeleteEmployer(employer._id)}
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
    </div>
  );
}
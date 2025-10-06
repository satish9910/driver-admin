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
} from "lucide-react";
import Cookies from "js-cookie";
import { useNavigate } from "react-router-dom";

interface JobSeeker {
  _id: string;
  fullName: string;
  email: string;
  mobile: string;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
  role: string;
}

export function JobSeekerManagement() {
  const [jobSeekers, setJobSeekers] = useState<JobSeeker[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [limit, setLimit] = useState(20);
  const [total, setTotal] = useState(0);
  const [activeStatusFilter, setActiveStatusFilter] = useState<"all" | "active" | "inactive">("all");
  
  const token = Cookies.get("admin_token");
  const navigation = useNavigate();

  const fetchJobSeekers = useCallback(async () => {
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
      const url = `${baseUrl}admin/jobseekers?${params.toString()}`;
      
      const response = await axios.get(url, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (response.data) {
        setJobSeekers(response.data.jobSeekers);
        setTotal(response.data.total);
        setTotalPages(response.data.totalPages);
      } else {
        toast({
          title: "Error",
          description: response.data.message || "Failed to fetch job seekers.",
          variant: "destructive",
        });
      }
    } catch (error) {
      console.error("Failed to fetch job seekers:", error);
      let errorMessage = "Failed to fetch job seekers. Please try again.";
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
    fetchJobSeekers();
  }, [fetchJobSeekers]);

  const applyFilters = () => {
    setCurrentPage(1); // Reset to first page when applying filters
    fetchJobSeekers();
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

  const handleViewJobSeeker = (jobSeeker: JobSeeker) => {
    // Navigate to job seeker detail page
    navigation(`/job-seekers/${jobSeeker._id}`);
  };

  const toggleJobSeekerStatus = async (jobSeekerId: string, currentStatus: boolean) => {
    try {
      const response = await axios.patch(
        `${import.meta.env.VITE_BASE_UR}admin/jobseekers/${jobSeekerId}/toggle-active`,
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
        await fetchJobSeekers(); // Refresh the data
      }
    } catch (error) {
      console.error("Error toggling job seeker status:", error);
      toast({
        title: "Error",
        description: error.response?.data?.message || "Failed to toggle job seeker status",
        variant: "destructive",
      });
    }
  };

  const handleDeleteJobSeeker = async (jobSeekerId: string) => {
    // In a real application, you would implement delete functionality
    toast({
      title: "Delete Job Seeker",
      description: "Delete functionality would be implemented here.",
    });
  };

  const filteredJobSeekers = jobSeekers?.filter((jobSeeker) =>
    jobSeeker?.fullName?.toLowerCase()?.includes(searchTerm?.toLowerCase()) ||
    jobSeeker?.email?.toLowerCase()?.includes(searchTerm?.toLowerCase()) ||
    jobSeeker?.mobile?.includes(searchTerm)
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
                placeholder="Search job seekers..."
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
                    <SelectItem value="all">All Job Seekers</SelectItem>
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

      {/* Job Seekers Table */}
      <Card>
        <CardHeader>
          <CardTitle>Job Seeker Management</CardTitle>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="flex items-center justify-center h-32">
              <p>Loading job seekers...</p>
            </div>
          ) : (
            <>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>#</TableHead>
                    <TableHead>Name</TableHead>
                    <TableHead>Email</TableHead>
                    <TableHead>Mobile</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Join Date</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredJobSeekers?.map((jobSeeker, index) => (
                    <TableRow key={jobSeeker._id} className="hover:bg-gray-50">
                      <TableCell>{(currentPage - 1) * limit + index + 1}</TableCell>
                      <TableCell className="font-medium">{jobSeeker.fullName}</TableCell>
                      <TableCell>{jobSeeker.email}</TableCell>
                      <TableCell>{jobSeeker.mobile}</TableCell>
                      <TableCell>{getStatusBadge(jobSeeker.isActive)}</TableCell>
                      <TableCell>
                        {new Date(jobSeeker.createdAt).toLocaleDateString()}
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
                                onClick={() => handleViewJobSeeker(jobSeeker)}
                              >
                                <Eye className="mr-2 h-4 w-4" />
                                View
                              </DropdownMenuItem>
                              <DropdownMenuItem
                                onClick={() => toggleJobSeekerStatus(jobSeeker._id, jobSeeker.isActive)}
                              >
                                {jobSeeker.isActive ? (
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
                                onClick={() => handleDeleteJobSeeker(jobSeeker._id)}
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
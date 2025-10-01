import { useState, useEffect, useMemo, useCallback } from "react";
import axios from "axios";
import Cookies from "js-cookie";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import { Search } from "lucide-react";
import { Input } from "@/components/ui/input";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

interface Label {
  _id: string;
  name: string;
  color: string;
}

interface BookingRecord {
  _id: string;
  driver: null;
  status: number;
  data: {
    customerName: string;
    email: string;
    phoneNumber: string;
    pickupLocation: string;
    dropLocation: string;
    date: string;
    duration: string;
    price: string;
  };
  primaryExpense: null;
  receiving: null;
  labels: Label[];
  createdAt: string;
  updatedAt: string;
}

interface Driver {
  _id: string;
  name: string;
  email: string;
  mobile: string;
  vehicleNumber?: string;
  isActive: boolean;
}

const UnassignedBookings = () => {
  const [bookings, setBookings] = useState<BookingRecord[]>([]);
  const [drivers, setDrivers] = useState<Driver[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadingDrivers, setLoadingDrivers] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedBookingId, setSelectedBookingId] = useState<string | null>(null);
  const [isAssignModalOpen, setIsAssignModalOpen] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;
  const [selectedDriver, setSelectedDriver] = useState<string>("");
  const [isAssigning, setIsAssigning] = useState(false);
  
  const { toast } = useToast();
  const token = Cookies.get("admin_token");
  const navigate = useNavigate();

  const baseUrl = import.meta.env.VITE_BASE_UR || "http://localhost:3000";
  const api = useMemo(() => {
    return axios.create({
      baseURL: baseUrl,
      headers: { "Content-Type": "application/json" },
    });
  }, [baseUrl]);

  const fetchUnassignedBookings = useCallback(async () => {
    try {
      setLoading(true);
      const response = await api.get(
        `admin/bookings/unassigned`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );
      
      setBookings(response.data);
      setError(null);
    } catch (err) {
      const msg = err instanceof Error ? err.message : "Failed to load unassigned bookings";
      setError(msg);
      toast({
        title: "Error",
        description: msg,
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  }, [api, token, toast]);

  const fetchDrivers = useCallback(async () => {
    try {
      setLoadingDrivers(true);
      const response = await api.get(
        `admin/drivers`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );
      
      // The API returns drivers in a "drivers" property, so we need to extract them
      setDrivers(response.data.drivers || response.data);
    } catch (err) {
      console.error("Error fetching drivers:", err);
      toast({
        title: "Error",
        description: "Failed to fetch drivers",
        variant: "destructive",
      });
    } finally {
      setLoadingDrivers(false);
    }
  }, [api, token, toast]);

  useEffect(() => {
    if (token) {
      fetchUnassignedBookings();
    }
  }, [token, fetchUnassignedBookings]);

  // Filter bookings based on search term
  const filteredBookings = useMemo(() => {
    if (!searchTerm) return bookings;
    
    const term = searchTerm.toLowerCase();
    return bookings.filter(booking => 
      booking.data.customerName.toLowerCase().includes(term) ||
      booking.data.pickupLocation.toLowerCase().includes(term) ||
      booking.data.dropLocation.toLowerCase().includes(term) ||
      booking.data.phoneNumber.includes(term)
    );
  }, [bookings, searchTerm]);

  // Pagination
  const totalItems = filteredBookings.length;
  const totalPages = Math.ceil(totalItems / itemsPerPage);
  
  const currentBookings = useMemo(() => {
    const startIndex = (currentPage - 1) * itemsPerPage;
    return filteredBookings.slice(startIndex, startIndex + itemsPerPage);
  }, [filteredBookings, currentPage]);

  const handleAssignDriverClick = (bookingId: string) => {
    setSelectedBookingId(bookingId);
    setSelectedDriver("");
    fetchDrivers();
    setIsAssignModalOpen(true);
  };

  const handleAssignDriver = async () => {
    if (!selectedDriver || !selectedBookingId) {
      toast({
        title: "Error",
        description: "Please select a driver",
        variant: "destructive",
      });
      return;
    }

    setIsAssigning(true);
    try {
      const token = Cookies.get("admin_token");
      if (!token) {
        throw new Error("No authentication token found");
      }

      await api.put(
        `admin/assign-driver`,
        {
          bookingId: selectedBookingId,
          driverId: selectedDriver,
        },
        {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        }
      );

      toast({
        title: "Success",
        description: "Driver assigned successfully",
      });
      
      // Refresh the bookings list after assigning a driver
      fetchUnassignedBookings();
      setSelectedBookingId(null);
      setSelectedDriver("");
      setIsAssignModalOpen(false);
    } catch (error) {
      console.error("Error assigning driver:", error);
      toast({
        title: "Error",
        description: "Failed to assign driver",
        variant: "destructive",
      });
    } finally {
      setIsAssigning(false);
    }
  };

  const goToPage = (page: number) => {
    if (page >= 1 && page <= totalPages) {
      setCurrentPage(page);
    }
  };

  const getVisiblePages = () => {
    const visiblePages = [];
    const maxVisiblePages = 5;

    if (totalPages <= maxVisiblePages) {
      for (let i = 1; i <= totalPages; i++) {
        visiblePages.push(i);
      }
    } else {
      const half = Math.floor(maxVisiblePages / 2);
      let start = Math.max(1, currentPage - half);
      const end = Math.min(totalPages, start + maxVisiblePages - 1);

      if (end - start + 1 < maxVisiblePages) {
        start = Math.max(1, end - maxVisiblePages + 1);
      }

      if (start > 1) {
        visiblePages.push(1);
        if (start > 2) {
          visiblePages.push("...");
        }
      }

      for (let i = start; i <= end; i++) {
        visiblePages.push(i);
      }

      if (end < totalPages) {
        if (end < totalPages - 1) {
          visiblePages.push("...");
        }
        visiblePages.push(totalPages);
      }
    }

    return visiblePages;
  };

  return (
    <div className="space-y-6 p-4 md:p-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div className="flex flex-col sm:flex-row sm:items-center gap-2 w-full sm:w-auto">
          <div className="relative w-full sm:w-auto">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
            <Input
              placeholder="Search bookings..."
              value={searchTerm}
              onChange={(e) => {
                setSearchTerm(e.target.value);
                setCurrentPage(1);
              }}
              className="w-full pl-10"
            />
          </div>
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Unassigned Bookings ({filteredBookings.length})</CardTitle>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="space-y-4">
              <div className="flex justify-between">
                {[...Array(5)].map((_, i) => (
                  <Skeleton key={`header-${i}`} className="h-10 w-24" />
                ))}
              </div>
              {[...Array(5)].map((_, i) => (
                <div key={`row-${i}`} className="flex justify-between">
                  {[...Array(5)].map((_, j) => (
                    <Skeleton key={`cell-${i}-${j}`} className="h-12 w-24" />
                  ))}
                </div>
              ))}
            </div>
          ) : error ? (
            <div className="text-center py-8 text-red-500">
              <p>Error loading bookings: {error}</p>
            </div>
          ) : (
            <>
              <div className="w-full overflow-x-auto">
                <Table className="min-w-full">
                  <TableHeader>
                    <TableRow>
                      <TableHead>Customer Name</TableHead>
                      <TableHead>Pickup Location</TableHead>
                      <TableHead>Drop Location</TableHead>
                      <TableHead>Date</TableHead>
                      <TableHead>Duration</TableHead>
                      <TableHead>Price</TableHead>
                      <TableHead>Labels</TableHead>
                      <TableHead className="text-right">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {currentBookings.length > 0 ? (
                      currentBookings.map((booking) => (
                        <TableRow key={booking._id} className="hover:bg-muted/50">
                          <TableCell className="font-medium">
                            {booking.data.customerName}
                          </TableCell>
                          <TableCell>{booking.data.pickupLocation}</TableCell>
                          <TableCell>{booking.data.dropLocation}</TableCell>
                          <TableCell>{booking.data.date}</TableCell>
                          <TableCell>{booking.data.duration}</TableCell>
                          <TableCell>₹{booking.data.price}</TableCell>
                          <TableCell>
                            {booking.labels && booking.labels.length > 0 ? (
                              <div className="flex flex-wrap gap-1">
                                {booking.labels.map((label) => (
                                  <Badge
                                    key={label._id}
                                    style={{ backgroundColor: label.color }}
                                    className="text-white text-xs"
                                  >
                                    {label.name}
                                  </Badge>
                                ))}
                              </div>
                            ) : (
                              <span className="text-gray-400 text-xs">No labels</span>
                            )}
                          </TableCell>
                          <TableCell className="text-right">
                            <div className="flex justify-end gap-2">
                              <Button
                                size="sm"
                                onClick={() => handleAssignDriverClick(booking._id)}
                              >
                                Assign Driver
                              </Button>
                              <Button
                                size="sm"
                                variant="outline"
                                onClick={() => navigate(`/booking/${booking._id}`)}
                              >
                                View Details
                              </Button>
                            </div>
                          </TableCell>
                        </TableRow>
                      ))
                    ) : (
                      <TableRow>
                        <TableCell colSpan={8} className="text-center h-24 text-muted-foreground">
                          No unassigned bookings found
                        </TableCell>
                      </TableRow>
                    )}
                  </TableBody>
                </Table>
              </div>

              {/* Pagination Controls */}
              {totalItems > itemsPerPage && (
                <div className="flex flex-col sm:flex-row items-center justify-between gap-4 pt-4">
                  <div className="text-sm text-muted-foreground">
                    Showing {(currentPage - 1) * itemsPerPage + 1} to{" "}
                    {Math.min(currentPage * itemsPerPage, totalItems)} of{" "}
                    {totalItems} bookings
                  </div>

                  <div className="flex items-center gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => goToPage(1)}
                      disabled={currentPage === 1}
                    >
                      First
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => goToPage(currentPage - 1)}
                      disabled={currentPage === 1}
                    >
                      Previous
                    </Button>

                    {getVisiblePages().map((page, index) =>
                      page === "..." ? (
                        <Button
                          key={`ellipsis-${index}`}
                          variant="outline"
                          size="sm"
                          disabled
                        >
                          ...
                        </Button>
                      ) : (
                        <Button
                          key={page}
                          variant={currentPage === page ? "default" : "outline"}
                          size="sm"
                          onClick={() => goToPage(page as number)}
                        >
                          {page}
                        </Button>
                      )
                    )}

                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => goToPage(currentPage + 1)}
                      disabled={currentPage === totalPages}
                    >
                      Next
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => goToPage(totalPages)}
                      disabled={currentPage === totalPages}
                    >
                      Last
                    </Button>
                  </div>
                </div>
              )}
            </>
          )}
        </CardContent>
      </Card>

      {/* Assign Driver Modal */}
      <Dialog open={isAssignModalOpen} onOpenChange={setIsAssignModalOpen}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>Assign Driver</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div className="space-y-2">
              <h4 className="text-sm font-medium">Available Drivers</h4>
              <div className="border rounded-md divide-y max-h-60 overflow-y-auto">
                {loadingDrivers ? (
                  <div className="p-4 text-center">Loading drivers...</div>
                ) : drivers.length > 0 ? (
                  drivers.map((driver) => (
                    <div
                      key={driver._id}
                      className={`p-3 flex items-center justify-between cursor-pointer ${
                        selectedDriver === driver._id ? "bg-gray-100" : ""
                      }`}
                      onClick={() => setSelectedDriver(driver._id)}
                    >
                      <div>
                        <p className="font-medium">{driver.name}</p>
                        <p className="text-sm text-gray-600">{driver.mobile}</p>
                        {driver.vehicleNumber && (
                          <p className="text-xs text-gray-500">
                            Vehicle: {driver.vehicleNumber}
                          </p>
                        )}
                      </div>
                      <input
                        type="radio"
                        checked={selectedDriver === driver._id}
                        onChange={() => setSelectedDriver(driver._id)}
                        className="h-4 w-4 text-primary focus:ring-primary"
                      />
                    </div>
                  ))
                ) : (
                  <div className="p-4 text-center text-gray-500">
                    No drivers available
                  </div>
                )}
              </div>
            </div>
            <div className="flex justify-end gap-2">
              <Button
                variant="outline"
                onClick={() => setIsAssignModalOpen(false)}
                disabled={isAssigning}
              >
                Cancel
              </Button>
              <Button
                onClick={handleAssignDriver}
                disabled={!selectedDriver || isAssigning}
              >
                {isAssigning ? "Assigning..." : "Assign Driver"}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default UnassignedBookings;
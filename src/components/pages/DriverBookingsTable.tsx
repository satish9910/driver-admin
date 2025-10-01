import { useEffect, useState, useMemo, useCallback } from "react";
import axios from "axios";
import Cookies from "js-cookie";
import { useParams, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Checkbox } from "@/components/ui/checkbox";
import { ScrollArea } from "@/components/ui/scroll-area";
import { useToast } from "@/hooks/use-toast";
import { Tags, Search, Calendar, Filter } from "lucide-react";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { format } from "date-fns";
import { Calendar as CalendarIcon } from "@/components/ui/calendar";

interface Label {
  _id: string;
  name: string;
  color: string;
  createdBy?: string;
  role?: string;
  createdAt?: string;
  updatedAt?: string;
}

interface BookingDataKV {
  key: string;
  value: string | number | null;
  _id: string;
}
interface BillingItem {
  category: string;
  amount: number;
  note?: string;
  image?: string | null;
}
interface PrimaryExpense {
  _id?: string;
  userId?: string;
  bookingId?: string;
  dutyStartDate?: string;
  dutyStartTime?: string;
  dutyEndDate?: string;
  dutyEndTime?: string;
  dutyStartKm?: number;
  dutyEndKm?: number;
  dutyType?: string;
  billingItems?: BillingItem[];
  dailyAllowance?: number;
  outstationAllowance?: number;
  earlyStartAllowance?: number;
  nightAllowance?: number;
  overTime?: number;
  sundayAllowance?: number;
  outstationOvernightAllowance?: number;
  extraDutyAllowance?: number;
  notes?: string;
  totalAllowances?: number;
  // legacy aggregate fields if still returned by API
  driverCharge?: number;
  cashToll?: number;
  cashParking?: number;
  otherCash?: number;
  totalDriverExpense?: number;
  dutyAmount?: number;
  advanceAmount?: number;
  dutyExpenses?: number;
  advanceFromCompany?: number;
  officeTransfer?: number;
  balanceDriver?: number;
  balanceCompany?: number;
  fuelExpense?: {
    fuel: string;
    meter: string;
    location: string;
    amount: number;
    date: string;
  }[];
  receiving?: Record<string, unknown>; // legacy nested
}
interface ReceivingRecord {
  _id?: string;
  userId?: string;
  bookingId?: string;
  dutyStartDate?: string;
  dutyStartTime?: string;
  dutyEndDate?: string;
  dutyEndTime?: string;
  dutyStartKm?: number;
  dutyEndKm?: number;
  dutyType?: string;
  dailyAllowance?: number;
  outstationAllowance?: number;
  earlyStartAllowance?: number;
  nightAllowance?: number;
  receivedFromCompany?: number;
  receivedFromClient?: number;
  overTime?: number;
  sundayAllowance?: number;
  outstationOvernightAllowance?: number;
  extraDutyAllowance?: number;
  notes?: string;
  billingItems?: BillingItem[];
  totalAllowances?: number;
  [k: string]: unknown;
}
interface BookingRecord {
  _id: string;
  status: number;
  data: BookingDataKV[];
  primaryExpense?: PrimaryExpense | null;
  receiving?: ReceivingRecord | null;
  labels?: Label[];
  createdAt?: string;
  updatedAt?: string;
}

const DriverBookingsTable = () => {
  const [bookings, setBookings] = useState<BookingRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedBookingId, setSelectedBookingId] = useState<string | null>(null);
  
  // Pagination state
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(20);
  const [totalItems, setTotalItems] = useState(0);
  const [totalPages, setTotalPages] = useState(0);
  
  // Filter state
  const [dutyId, setDutyId] = useState("");
  const [searchTerm, setSearchTerm] = useState("");
  const [settledFilter, setSettledFilter] = useState<"all" | "true" | "false">("all");
  const [dateRange, setDateRange] = useState<{ from: Date | undefined; to: Date | undefined }>({
    from: undefined,
    to: undefined
  });
  
  // Label management state
  const [availableLabels, setAvailableLabels] = useState<Label[]>([]);
  const [isLabelModalOpen, setIsLabelModalOpen] = useState(false);
  const [selectedBookingForLabels, setSelectedBookingForLabels] = useState<string | null>(null);
  const [selectedLabels, setSelectedLabels] = useState<string[]>([]);
  const [isUpdatingLabels, setIsUpdatingLabels] = useState(false);
  
  const { toast } = useToast();
  const token = Cookies.get("admin_token");
  const navigate = useNavigate();
  const { driverId } = useParams();

  const fetchDriverBookings = useCallback(async () => {
    try {
      setLoading(true);
      
      // Build query parameters
      const params = new URLSearchParams();
      params.append("page", currentPage.toString());
      params.append("limit", itemsPerPage.toString());
      
      if (dutyId) params.append("dutyId", dutyId);
      if (searchTerm) params.append("q", searchTerm);
      if (settledFilter !== "all") params.append("settled", settledFilter);
      
      // Format dates to match backend expectations (dd-MM-yyyy)
      if (dateRange.from) {
        const formattedFrom = format(dateRange.from, "dd-MM-yyyy");
        params.append("startDate", formattedFrom);
      }
      if (dateRange.to) {
        const formattedTo = format(dateRange.to, "dd-MM-yyyy");
        params.append("endDate", formattedTo);
      }
      
      const url = `${import.meta.env.VITE_BASE_UR}admin/driver-bookings/${driverId}?${params.toString()}`;
      
      const response = await axios.get(url, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      
      const payload = response.data;
      const list = payload?.bookings || [];
      
      setBookings(list);
      setTotalItems(payload.pagination?.total || 0);
      setTotalPages(payload.pagination?.pages || 1);
      
      if (!selectedBookingId && list.length)
        setSelectedBookingId(list[0]._id);
      
      setError(null);
    } catch (err) {
      const msg = err instanceof Error ? err.message : "Failed to load";
      setError(msg);
    } finally {
      setLoading(false);
    }
  }, [driverId, token, selectedBookingId, currentPage, itemsPerPage, dutyId, searchTerm, settledFilter, dateRange]);

  useEffect(() => {
    fetchDriverBookings();
  }, [fetchDriverBookings]);

  // Fetch available labels
  useEffect(() => {
    const fetchLabels = async () => {
      try {
        const response = await axios.get(
          `${import.meta.env.VITE_BASE_UR}admin/get-labels`,
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        );
        setAvailableLabels(response.data.labels || []);
      } catch (err) {
        console.error("Failed to fetch labels:", err);
      }
    };

    if (token) {
      fetchLabels();
    }
  }, [token]);

  // Label management functions
  const openLabelModal = (booking: BookingRecord) => {
    setSelectedBookingForLabels(booking._id);
    setSelectedLabels(booking?.labels?.map(l => l._id) || []);
    setIsLabelModalOpen(true);
  };

  const updateBookingLabels = async () => {
    if (!selectedBookingForLabels) return;
    
    setIsUpdatingLabels(true);
    try {
      await axios.post(
        `${import.meta.env.VITE_BASE_UR}admin/add-label-booking/${selectedBookingForLabels}`,
        {
          labels: selectedLabels,
          mode: "replace"
        },
        {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json"
          },
        }
      );

      toast({
        title: "Success",
        description: "Labels updated successfully",
      });

      // Refresh bookings to show updated labels
      await fetchDriverBookings();

      setIsLabelModalOpen(false);
      setSelectedBookingForLabels(null);
      setSelectedLabels([]);
    } catch (err) {
      console.error("Failed to update labels:", err);
      toast({
        title: "Error",
        description: "Failed to update labels",
        variant: "destructive",
      });
    } finally {
      setIsUpdatingLabels(false);
    }
  };
  
  const applyFilters = () => {
    setCurrentPage(1); // Reset to first page when applying filters
    fetchDriverBookings();
  };
  
  const clearFilters = () => {
    setDutyId("");
    setSearchTerm("");
    setSettledFilter("all");
    setDateRange({ from: undefined, to: undefined });
    setCurrentPage(1);
  };
  
  // Pagination functions
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

  // Major columns to display (subset)
  const headers = useMemo(() => [
    "Duty Id",
    "Customer",
    "From city",
    "To city",
    "Vehicle Number",
    "Vehicle Name",
    "Start Date",
    "End Date",
    "Reporting Time",
    "Total KM",
    "Total Hours",
    "Price",
    "Total Price",
    "Status",
    "Labels",
    "Actions",
  ], []);

  const selectedBooking = useMemo(
    () => bookings.find((b) => b._id === selectedBookingId),
    [bookings, selectedBookingId]
  );
  
  return (
    <div className="space-y-6 p-6">
      {/* Filters Section */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Filter className="h-5 w-5" />
            Booking Filters
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {/* Duty ID Filter */}
            <div>
              <label className="text-sm font-medium mb-1 block">Duty ID</label>
              <Input
                placeholder="Enter duty ID"
                value={dutyId}
                onChange={(e) => setDutyId(e.target.value)}
              />
            </div>
            
            {/* Search Filter */}
            <div>
              <label className="text-sm font-medium mb-1 block">Search</label>
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                <Input
                  placeholder="Search bookings..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>
            
            {/* Settled Status Filter */}
            <div>
              <label className="text-sm font-medium mb-1 block">Settlement Status</label>
              <Select value={settledFilter} onValueChange={(value: "all" | "true" | "false") => setSettledFilter(value)}>
                <SelectTrigger>
                  <SelectValue placeholder="Select status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Bookings</SelectItem>
                  <SelectItem value="true">Settled</SelectItem>
                  <SelectItem value="false">Not Settled</SelectItem>
                </SelectContent>
              </Select>
            </div>
            
            {/* Date Range Filter */}
            <div>
              <label className="text-sm font-medium mb-1 block">Date Range</label>
              <Popover>
                <PopoverTrigger asChild>
                  <Button
                    variant="outline"
                    className="w-full justify-start text-left font-normal"
                  >
                    <Calendar className="mr-2 h-4 w-4" />
                    {dateRange.from ? (
                      dateRange.to ? (
                        `${format(dateRange.from, "MMM dd, yyyy")} - ${format(
                          dateRange.to,
                          "MMM dd, yyyy"
                        )}`
                      ) : (
                        format(dateRange.from, "MMM dd, yyyy")
                      )
                    ) : (
                      <span>Pick a date range</span>
                    )}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0">
                  <CalendarIcon
                    mode="range"
                    selected={{
                      from: dateRange.from,
                      to: dateRange.to
                    }}
                    onSelect={(range) => setDateRange({
                      from: range?.from,
                      to: range?.to
                    })}
                    numberOfMonths={2}
                  />
                </PopoverContent>
              </Popover>
            </div>
            
            {/* Filter Actions */}
            <div className="flex items-end gap-2 lg:col-span-4">
              <Button onClick={applyFilters}>
                Apply Filters
              </Button>
              <Button variant="outline" onClick={clearFilters}>
                Clear Filters
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Bookings Table */}
      {loading && (
        <div className="flex justify-center items-center py-8">
          <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-blue-500"></div>
        </div>
      )}
      {!loading && error && (
        <div
          className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative mb-4"
          role="alert"
        >
          <strong className="font-bold">Error: </strong>
          <span className="block sm:inline">{error}</span>
        </div>
      )}
      {!loading && !error && (!bookings || bookings.length === 0) && (
        <div className="text-center py-8">
          <p className="text-gray-500">No bookings found for this driver</p>
        </div>
      )}
      {!loading && !error && bookings.length > 0 && (
        <>
          <div className="rounded-md border overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  {headers.map((header) => {
                    return (
                      <th
                        key={header}
                        className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider sticky top-0 bg-gray-50"
                      >
                        {header}
                      </th>
                    );
                  })}
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {bookings.map((booking) => (
                  <tr
                    key={booking._id}
                    className={`hover:bg-muted/50 cursor-pointer ${
                      booking._id === selectedBookingId ? "bg-blue-50" : ""
                    }`}
                    onClick={() => setSelectedBookingId(booking._id)}
                  >
                    {headers.map((header) => {
                      // Handle special columns
                      if (header === "Status") {
                        return (
                          <td
                            key={`${booking._id}-${header}`}
                            className="px-6 py-4 whitespace-nowrap text-sm"
                          >
                            {booking.status === 1 ? (
                              <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200">
                                Settled
                              </Badge>
                            ) : booking.status === 0 ? (
                              <Badge variant="outline" className="bg-red-50 text-red-700 border-red-200">
                                Not Settled
                              </Badge>
                            ) : (
                              <Badge variant="outline" className="bg-gray-50 text-gray-700 border-gray-200">
                                Status: {booking.status}
                              </Badge>
                            )}
                          </td>
                        );
                      }
                      
                      if (header === "Labels") {
                        return (
                          <td
                            key={`${booking._id}-${header}`}
                            className="px-6 py-4 whitespace-nowrap text-sm"
                          >
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
                          </td>
                        );
                      }
                      
                      if (header === "Actions") {
                        return (
                          <td
                            key={`${booking._id}-${header}`}
                            className="px-6 py-4 whitespace-nowrap text-sm"
                          >
                            <div className="flex gap-2">
                              <Button
                                size="sm"
                                variant="outline"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  openLabelModal(booking);
                                }}
                                className="flex items-center gap-1"
                              >
                                <Tags className="w-3 h-3" />
                                Labels
                              </Button>
                              {booking.primaryExpense || booking.receiving ? (
                                <Button
                                  size="sm"
                                  variant="outline"
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    navigate(`/booking/${booking._id}`);
                                  }}
                                >
                                  Details
                                </Button>
                              ) : null}
                            </div>
                          </td>
                        );
                      }

                      // Regular column handling
                      const dataItem = booking.data?.find(
                        (item) => item.key === header
                      );
                      let value: unknown = dataItem ? dataItem.value : undefined;
                      if (value === undefined) {
                        const getVal = (obj: unknown, key: string) =>
                          obj &&
                          typeof obj === "object" &&
                          key in (obj as Record<string, unknown>)
                            ? (obj as Record<string, unknown>)[key]
                            : undefined;
                        if (booking.primaryExpense) {
                          const direct = getVal(booking.primaryExpense, header);
                          if (direct !== undefined) value = direct;
                          else if (booking.primaryExpense.receiving) {
                            const nested = getVal(
                              booking.primaryExpense.receiving,
                              header
                            );
                            if (nested !== undefined) value = nested;
                          }
                        }
                        if (value === undefined && booking.receiving) {
                          const rVal = getVal(booking.receiving, header);
                          if (rVal !== undefined) value = rVal;
                        }
                      }
                      const display =
                        value === null || value === undefined || value === ""
                          ? "-"
                          : String(value);
                      return (
                        <td
                          key={`${booking._id}-${header}`}
                          className="px-6 py-4 whitespace-nowrap text-sm text-gray-500"
                        >
                          {display}
                        </td>
                      );
                    })}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Pagination Controls */}
          {totalItems > itemsPerPage && (
            <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
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
      
      {/* Label Assignment Modal */}
      <Dialog open={isLabelModalOpen} onOpenChange={setIsLabelModalOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Assign Labels</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div className="text-sm text-gray-600">
              Select labels for booking:
            </div>
            <ScrollArea className="max-h-60">
              <div className="space-y-2">
                {availableLabels.map((label) => (
                  <div key={label._id} className="flex items-center space-x-2">
                    <Checkbox
                      id={`label-${label._id}`}
                      checked={selectedLabels.includes(label._id)}
                      onCheckedChange={(checked) => {
                        if (checked) {
                          setSelectedLabels((prev) => [...prev, label._id]);
                        } else {
                          setSelectedLabels((prev) => prev.filter((id) => id !== label._id));
                        }
                      }}
                    />
                    <Label
                      htmlFor={`label-${label._id}`}
                      className="flex items-center space-x-2 cursor-pointer"
                    >
                      <Badge style={{ backgroundColor: label.color }} className="text-white">
                        {label.name}
                      </Badge>
                    </Label>
                  </div>
                ))}
              </div>
            </ScrollArea>
            <div className="flex justify-end space-x-2">
              <Button variant="outline" onClick={() => setIsLabelModalOpen(false)}>
                Cancel
              </Button>
              <Button
                onClick={updateBookingLabels}
                disabled={isUpdatingLabels}
              >
                {isUpdatingLabels ? "Updating..." : "Update Labels"}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default DriverBookingsTable;
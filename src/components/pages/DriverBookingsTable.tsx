import { useEffect, useState, useMemo } from "react";
import axios from "axios";
import Cookies from "js-cookie";
import { useParams, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Checkbox } from "@/components/ui/checkbox";
import { ScrollArea } from "@/components/ui/scroll-area";
import { useToast } from "@/hooks/use-toast";
import { Tags, Calendar, Filter } from "lucide-react";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

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
  receiving?: Record<string, unknown>;
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

interface FilterState {
  settled?: boolean;
  endDate?: string;
}

interface ApiResponse {
  success: boolean;
  data?: BookingRecord[];
  bookings?: BookingRecord[];
}

const DriverBookingsTable = () => {
  const [bookings, setBookings] = useState<BookingRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedBookingId, setSelectedBookingId] = useState<string | null>(null);
  
  // Filter state
  const [filters, setFilters] = useState<FilterState>({});
  
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

  useEffect(() => {
    const fetchDriverBookings = async () => {
      setLoading(true);
      try {
        const params = new URLSearchParams();
        
        // Add filter parameters
        if (filters.settled !== undefined) {
          params.append('settled', filters.settled.toString());
        }
        if (filters.endDate) {
          params.append('endDate', filters.endDate);
        }
        
        const response = await axios.get(
          `${import.meta.env.VITE_BASE_UR}admin/driver-bookings/${driverId}?${params.toString()}`,
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        );
        
        const payload: ApiResponse = response.data;
        const list = payload?.data || payload?.bookings || [];

        setBookings(list);
        
        if (!selectedBookingId && list.length) {
          setSelectedBookingId(list[0]._id);
        }
        
        setError(null);
      } catch (err) {
        const msg = err instanceof Error ? err.message : "Failed to load bookings";
        setError(msg);
        console.error('Error fetching driver bookings:', err);
      } finally {
        setLoading(false);
      }
    };

    if (driverId && token) {
      fetchDriverBookings();
    }
  }, [driverId, token, filters]);

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
      const params = new URLSearchParams();
      
      if (filters.settled !== undefined) {
        params.append('settled', filters.settled.toString());
      }
      if (filters.endDate) {
        params.append('endDate', filters.endDate);
      }
      
      const response = await axios.get(
        `${import.meta.env.VITE_BASE_UR}admin/driver-bookings/${driverId}?${params.toString()}`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );
      const payload: ApiResponse = response.data;
      const list = payload?.data || payload?.bookings || [];
      setBookings(list);

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

  // Filter handlers
  const handleSettledChange = (settled: string) => {
    setFilters(prev => ({
      ...prev,
      settled: settled === "all" ? undefined : settled === "true",
    }));
  };

  const handleEndDateChange = (endDate: string) => {
    setFilters(prev => ({
      ...prev,
      endDate: endDate || undefined,
    }));
  };

  const clearFilters = () => {
    setFilters({});
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
    <div className="space-y-6">
      {/* Filters */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Filter className="w-5 h-5" />
            Filters
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {/* Settled Filter */}
            <div className="space-y-2">
              <Label htmlFor="settled-filter">Settlement</Label>
              <Select
                value={filters.settled?.toString() || "all"}
                onValueChange={handleSettledChange}
              >
                <SelectTrigger>
                  <SelectValue placeholder="All" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All</SelectItem>
                  <SelectItem value="true">Settled</SelectItem>
                  <SelectItem value="false">Not Settled</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* End Date Filter */}
            <div className="space-y-2">
              <Label htmlFor="end-date">End Date</Label>
              <div className="relative">
                <Calendar className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                <Input
                  id="end-date"
                  type="date"
                  value={filters.endDate || ""}
                  onChange={(e) => handleEndDateChange(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>

            {/* Clear Filters */}
            <div className="space-y-2">
              <Label>&nbsp;</Label>
              <Button 
                variant="outline" 
                onClick={clearFilters}
                className="w-full"
              >
                Clear Filters
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Table */}
      <div className="overflow-x-auto">
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
          <Card>
            <CardContent className="p-0">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    {headers.map((header) => {
                      return (
                        <th
                          key={header}
                          className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
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
            </CardContent>
          </Card>
        )}
      </div>
      
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
import { useState, useEffect, useMemo, useCallback } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
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
  Search,
  Upload,
  ChevronLeft,
  ChevronRight,
  Calendar,
  SlidersHorizontal,
} from "lucide-react";
import { useToast } from "@/components/ui/use-toast";
import axios from "axios";
import Cookies from "js-cookie";
import { DateRange } from "react-day-picker";
import { format } from "date-fns";
import { Calendar as CalendarPicker } from "@/components/ui/calendar";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Skeleton } from "@/components/ui/skeleton";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Checkbox } from "@/components/ui/checkbox";
import { ScrollArea } from "@/components/ui/scroll-area";
import { useNavigate } from "react-router-dom";
import { Badge } from "@/components/ui/badge";

// Data modeling
type Primitive = string | number | boolean | null | undefined;
interface KeyValuePair { key: string; value: Primitive }
interface Expense {
  _id: string;
  bookingId: string;
  tripRoute: string | null;
  driverCharge: number;
  cashToll: number;
  cashParking: number;
  otherCash: number;
  fuelExpense: { fuel: string; meter: string; location: string; amount: number; date: string }[];
  totalDriverExpense: number;
  dutyAmount: number;
  advanceAmount: number;
  dutyExpenses: number;
  advanceFromCompany: number;
  officeTransfer: number;
  balanceDriver: number;
  balanceCompany: number;
  totalAllowances?: number;
  billingItems?: BillingItem[];
  createdAt: string;
  updatedAt: string;
}
// API now returns booking.data as an object map (previously we handled an array).
// Keep backward compatibility by allowing either.
interface RawBooking {
  _id: string;
  driver: { _id: string; name: string; drivercode?: string } | null;
  // Can be an object map or an array of key/value pairs
  data: Record<string, Primitive> | KeyValuePair[];
  createdAt: string;
  updatedAt: string;
  expenses?: Expense[];
  receiving?: {
    _id: string;
    totalAllowances?: number;
    billingItems?: BillingItem[];
  };
  primaryExpense?: {
    _id: string;
    totalAllowances?: number;
    billingItems?: BillingItem[];
  };
  labels?: Label[];
  // Other possible fields like status can come through; index signature avoided to keep type safety.
  status?: number;
}

interface BillingItem {
  category: string;
  amount: number;
  note?: string;
}

interface Label {
  _id: string;
  name: string;
  color?: string;
}
interface ProcessedBookingBase {
  _id: string;
  driver: { _id: string; name: string; drivercode?: string } | null;
}
type ProcessedBooking = ProcessedBookingBase & Record<string, Primitive>;

export function BookingManagement() {
  const navigate = useNavigate();
  const [rawBookings, setRawBookings] = useState<RawBooking[]>([]); // Store original API response
  const [tableHeaders, setTableHeaders] = useState<string[]>([]); // For dynamic columns
  const [processedBookings, setProcessedBookings] = useState<
    ProcessedBooking[]
  >([]); // Flattened data
  const [searchTerm, setSearchTerm] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [file, setFile] = useState<File | null>(null);
  const [availableLabels, setAvailableLabels] = useState<Label[]>([]);
  const [selectedLabels, setSelectedLabels] = useState<string[]>([]);
  const [isLabelModalOpen, setIsLabelModalOpen] = useState(false);
  const [selectedBookingForLabels, setSelectedBookingForLabels] = useState<string | null>(null);
  const { toast } = useToast();
  const [dateRange, setDateRange] = useState<DateRange | undefined>();

  // Pagination state
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(10);

  // Column selection & filtering state
  const [isColumnModalOpen, setIsColumnModalOpen] = useState(false);
  const [allKeys, setAllKeys] = useState<string[]>([]); // keys available from booking-keys API
  const [selectedKeys, setSelectedKeys] = useState<string[]>([]); // user chosen keys
  const [isFetchingKeys, setIsFetchingKeys] = useState(false);
  const [isApplyingFilter, setIsApplyingFilter] = useState(false);
  const [isFilteredMode, setIsFilteredMode] = useState(false); // whether table currently shows filtered result

  const baseUrl = import.meta.env.VITE_BASE_UR || "http://localhost:3000";
  // Memoize axios instance so it doesn't get recreated every render (which was
  // causing fetch callbacks to change and the effect to fire repeatedly)
  const api = useMemo(() => {
    return axios.create({
      baseURL: baseUrl,
      headers: { "Content-Type": "application/json" },
    });
  }, [baseUrl]);

  const fetchLabels = useCallback(async () => {
    try {
      const token = Cookies.get("admin_token");
      if (!token) throw new Error("No authentication token found");
      const response = await api.get<{ labels: Label[] }>("admin/get-labels", {
        headers: { Authorization: `Bearer ${token}` },
      });
      setAvailableLabels(response.data.labels || []);
    } catch (error) {
      console.error("Error fetching labels:", error);
      toast({
        title: "Error",
        description: "Failed to fetch labels",
        variant: "destructive",
      });
    }
  }, [api, toast]);

  interface BookingsApiResponse {
    success: boolean;
    count: number;
    data: RawBooking[];
  }

  interface BookingKeysApiResponse {
    success?: boolean;
    keys?: string[]; // expected
    data?: string[]; // fallback
  }

  const fetchBookings = useCallback(async () => {
    setIsLoading(true);
    try {
      const token = Cookies.get("admin_token");
      if (!token) throw new Error("No authentication token found");

      let url = "admin/bookings";
      const params = new URLSearchParams();
      if (dateRange?.from && dateRange?.to) {
        params.append("startDate", format(dateRange.from, "dd-MM-yyyy"));
        params.append("endDate", format(dateRange.to, "dd-MM-yyyy"));
        url = `${url}?${params.toString()}`;
      }

      const response = await api.get<BookingsApiResponse | RawBooking[]>(url, {
        headers: { Authorization: `Bearer ${token}` },
      });

      // Support both old (array directly) and new (wrapped object) response shapes
      const bookingsData: RawBooking[] = Array.isArray(response.data)
        ? response.data
        : (response.data as BookingsApiResponse).data;
      setRawBookings(bookingsData);

  if (bookingsData && bookingsData.length > 0) {
        // 1. Get all unique keys from all bookings to create headers
        const headersSet = new Set<string>();
        bookingsData.forEach((booking) => {
          if (Array.isArray(booking.data)) {
            booking.data.forEach((item) => headersSet.add(item.key));
          } else if (booking.data && typeof booking.data === "object") {
            Object.keys(booking.data).forEach((k) => headersSet.add(k));
          }
        });
        const dynamicHeaders = Array.from(headersSet);
        setTableHeaders(dynamicHeaders);

        // 2. Transform the raw nested data into a flat object for each booking
        const flattenedBookings: ProcessedBooking[] = bookingsData.map(
          (rawBooking) => {
            const flat: ProcessedBooking = {
              _id: rawBooking._id,
              driver: rawBooking.driver,
            } as ProcessedBooking;
            const rec = flat as Record<string, Primitive>;
            if (Array.isArray(rawBooking.data)) {
              rawBooking.data.forEach((item) => {
                rec[item.key] = item.value;
              });
            } else if (rawBooking.data && typeof rawBooking.data === "object") {
              Object.entries(rawBooking.data).forEach(([k, v]) => {
                rec[k] = v;
              });
            }
            return flat;
          }
        );
        setProcessedBookings(flattenedBookings);
      } else {
        // Clear table if no data
        setTableHeaders([]);
        setProcessedBookings([]);
      }
    } catch (error) {
      console.error("Error fetching bookings:", error);
      toast({
        title: "Error",
        description: "Failed to fetch bookings",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  }, [api, dateRange, toast]);

  // Fetch all available booking keys (column names) for selector
  const fetchBookingKeys = useCallback(async () => {
    setIsFetchingKeys(true);
    try {
      const token = Cookies.get("admin_token");
      if (!token) throw new Error("No authentication token found");
      const response = await api.get<BookingKeysApiResponse | string[]>(
        "admin/booking-keys",
        { headers: { Authorization: `Bearer ${token}` } }
      );
      let keys: string[] = [];
      if (Array.isArray(response.data)) keys = response.data;
      else {
        const body = response.data as BookingKeysApiResponse;
        keys = body.keys || body.data || [];
      }
      setAllKeys(keys);
      // Initialize selection with existing tableHeaders (if first open) or previously selected
      setSelectedKeys((prev) => (prev.length ? prev : keys.slice(0, 15))); // pick first 15 as default to avoid over-wide table
    } catch (error) {
      console.error("Error fetching booking keys:", error);
      toast({
        title: "Error",
        description: "Failed to fetch booking keys",
        variant: "destructive",
      });
    } finally {
      setIsFetchingKeys(false);
    }
  }, [api, toast]);

  // Apply selected columns via filter API
  const applySelectedColumns = async () => {
    if (!selectedKeys.length) {
      toast({ title: "Select at least one column" });
      return;
    }
    setIsApplyingFilter(true);
    try {
      const token = Cookies.get("admin_token");
      if (!token) throw new Error("No authentication token found");
  const payload: { keys: string[]; startDate?: string; endDate?: string } = { keys: selectedKeys };
      if (dateRange?.from && dateRange?.to) {
        payload.startDate = format(dateRange.from, "dd-MM-yyyy");
        payload.endDate = format(dateRange.to, "dd-MM-yyyy");
      }
      const response = await api.post<BookingsApiResponse | RawBooking[]>(
        "admin/bookings-filters",
        payload,
        { headers: { Authorization: `Bearer ${token}` } }
      );
      const bookingsData: RawBooking[] = Array.isArray(response.data)
        ? response.data
        : (response.data as BookingsApiResponse).data;
      setRawBookings(bookingsData);

      if (bookingsData && bookingsData.length) {
        const flattened: ProcessedBooking[] = bookingsData.map((rb) => {
          const flat: ProcessedBooking = { _id: rb._id, driver: rb.driver } as ProcessedBooking;
          const rec = flat as Record<string, Primitive>;
          if (Array.isArray(rb.data)) {
            rb.data.forEach((kv) => (rec[kv.key] = kv.value));
          } else if (rb.data && typeof rb.data === "object") {
            Object.entries(rb.data).forEach(([k, v]) => {
              if (selectedKeys.includes(k)) rec[k] = v;
            });
          }
          return flat;
        });
        setProcessedBookings(flattened);
        setTableHeaders(selectedKeys); // enforce order user picked
      } else {
        setProcessedBookings([]);
        setTableHeaders(selectedKeys);
      }
      setIsFilteredMode(true);
      setCurrentPage(1);
      setIsColumnModalOpen(false);
      toast({ title: "Columns applied", description: `${selectedKeys.length} columns selected` });
    } catch (error) {
      console.error("Error applying column filter:", error);
      toast({
        title: "Error",
        description: "Failed to apply selected columns",
        variant: "destructive",
      });
    } finally {
      setIsApplyingFilter(false);
    }
  };

  const clearFilters = async () => {
    setIsFilteredMode(false);
    setSelectedKeys([]);
    await fetchBookings();
    toast({ title: "Filters cleared" });
  };

  // When opening modal first time, fetch keys
  useEffect(() => {
    if (isColumnModalOpen && !allKeys.length && !isFetchingKeys) {
      fetchBookingKeys();
    }
  }, [isColumnModalOpen, allKeys.length, isFetchingKeys, fetchBookingKeys]);

  useEffect(() => {
    fetchBookings();
    fetchLabels();
  }, [fetchBookings, fetchLabels]);

  const handleFileUpload = async () => {
    if (!file) {
      toast({
        title: "Error",
        description: "Please select a file first",
        variant: "destructive",
      });
      return;
    }
    const formData = new FormData();
    formData.append("file", file);
    setIsLoading(true);
    try {
      const token = Cookies.get("admin_token");
      if (!token) throw new Error("No authentication token found");
      const response = await api.post("admin/upload-bookings", formData, {
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "multipart/form-data",
        },
      });
      toast({
        title: "Success",
        description: response.data.message || "File uploaded successfully",
      });
      fetchBookings();
      setCurrentPage(1);
    } catch (error) {
      console.error("Error uploading file:", error);
      toast({
        title: "Error",
        description: "Failed to upload file",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
      setFile(null);
    }
  };

  const filteredBookings = useMemo(() => {
    if (!searchTerm) return processedBookings;
    const searchLower = searchTerm.toLowerCase();
    return processedBookings.filter((booking) =>
      Object.values(booking).some((value) =>
        String(value).toLowerCase().includes(searchLower)
      )
    );
  }, [processedBookings, searchTerm]);

  const { totalRevenue, totalBookings, totalKms } = useMemo(() => {
    const totalRevenue = filteredBookings.reduce(
      (sum, booking) =>
        sum + (Number(booking["Total Price"]) || Number(booking["Price"]) || 0),
      0
    );
    const totalBookings = filteredBookings.length;
    const totalKms = filteredBookings.reduce(
      (sum, booking) => sum + (Number(booking["Total KM"]) || 0),
      0
    );
    return { totalRevenue, totalBookings, totalKms };
  }, [filteredBookings]);

  // Pagination calculations
  const totalItems = filteredBookings.length;
  const totalPages = Math.ceil(totalItems / itemsPerPage);
  const currentBookings = useMemo(() => {
    const startIndex = (currentPage - 1) * itemsPerPage;
    return filteredBookings.slice(startIndex, startIndex + itemsPerPage);
  }, [filteredBookings, currentPage, itemsPerPage]);

  // Handle page changes
  const goToPage = (page: number) => {
    if (page >= 1 && page <= totalPages) {
      setCurrentPage(page);
    }
  };

  const handleExport = async () => {
    try {
      const token = Cookies.get("admin_token");
      if (!token) throw new Error("No authentication token found");
      let url = "admin/export-bookings";
      const params = new URLSearchParams();
      if (dateRange?.from && dateRange?.to) {
        params.append("startDate", format(dateRange.from, "yyyy-MM-dd"));
        params.append("endDate", format(dateRange.to, "yyyy-MM-dd"));
        url = `${url}?${params.toString()}`;
      }
      const response = await api.get(url, {
        headers: { Authorization: `Bearer ${token}` },
        responseType: "blob",
      });
      const urlObject = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement("a");
      link.href = urlObject;
      link.setAttribute(
        "download",
        `bookings_${new Date().toISOString()}.xlsx`
      );
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      toast({ title: "Success", description: "Export started successfully" });
    } catch (error) {
      console.error("Error exporting data:", error);
      toast({
        title: "Error",
        description: "Failed to export data",
        variant: "destructive",
      });
    }
  };

  // Generate visible page numbers for pagination
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

  const getExpensesForBooking = (bookingId: string) => {
    const booking = rawBookings.find((b) => b._id === bookingId);
    return booking?.expenses || [];
  };

  const updateBookingLabels = async (bookingId: string, labelIds: string[]) => {
    try {
      const token = Cookies.get("admin_token");
      if (!token) throw new Error("No authentication token found");
      await api.post(
        `admin/add-label-booking/${bookingId}`,
        { labels: labelIds, mode: "replace" },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      toast({ title: "Success", description: "Labels updated successfully" });
      fetchBookings(); // Refresh to show updated labels
    } catch (error) {
      console.error("Error updating labels:", error);
      toast({
        title: "Error",
        description: "Failed to update labels",
        variant: "destructive",
      });
    }
  };

  const openLabelModal = (bookingId: string) => {
    const booking = rawBookings.find((b) => b._id === bookingId);
    setSelectedBookingForLabels(bookingId);
    setSelectedLabels(booking?.labels?.map(l => l._id) || []);
    setIsLabelModalOpen(true);
  };

  const handleLabelSave = () => {
    if (selectedBookingForLabels) {
      updateBookingLabels(selectedBookingForLabels, selectedLabels);
      setIsLabelModalOpen(false);
      setSelectedBookingForLabels(null);
      setSelectedLabels([]);
    }
  };

  return (
    <div className="space-y-6 p-4 md:p-6">
      {/* Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        <Card>
          <CardContent className="pt-6">
            <div className="text-2xl font-bold">
              ₹{totalRevenue.toLocaleString()}
            </div>
            <p className="text-sm text-gray-600">Total Revenue</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="text-2xl font-bold">{totalBookings}</div>
            <p className="text-sm text-gray-600">Total Bookings</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="text-2xl font-bold">
              {totalKms.toLocaleString()} kms
            </div>
            <p className="text-sm text-gray-600">Total Kilometers</p>
          </CardContent>
        </Card>
      </div>

      {/* File Upload Section */}
      <Card>
        <CardHeader>
          <CardTitle>Upload Bookings</CardTitle>
          <p className="text-sm text-gray-500 mt-2">
            Supported formats: CSV, Excel (.xlsx, .xls)
          </p>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col sm:flex-row sm:items-center gap-4">
            <div className="flex-1">
              <Input
                type="file"
                accept=".csv,.xlsx,.xls"
                onChange={(e) => setFile(e.target.files?.[0] || null)}
                className="w-full"
              />
            </div>
            <Button
              onClick={handleFileUpload}
              disabled={!file || isLoading}
              className="gap-2 w-full sm:w-auto"
            >
              <Upload className="h-4 w-4" />
              {isLoading ? "Uploading..." : "Upload"}
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Header with Search and Date Picker */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div className="flex flex-col sm:flex-row sm:items-center gap-2 w-full sm:w-auto">
          <Popover>
            <PopoverTrigger asChild>
              <Button
                variant="outline"
                className="w-full sm:w-[280px] justify-start text-left font-normal"
              >
                <Calendar className="mr-2 h-4 w-4" />
                {dateRange?.from ? (
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
              <CalendarPicker
                mode="range"
                selected={dateRange}
                onSelect={setDateRange}
                numberOfMonths={2}
              />
            </PopoverContent>
          </Popover>
          <Button
            variant="outline"
            onClick={() => {
              setDateRange(undefined);
              setCurrentPage(1);
            }}
            className="w-full sm:w-auto"
          >
            Clear
          </Button>
        </div>

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

        <div className="flex gap-2 w-full sm:w-auto">
          <Button
            variant="outline"
            className="w-full sm:w-auto gap-2"
            onClick={() => setIsColumnModalOpen(true)}
          >
            <SlidersHorizontal className="h-4 w-4" /> Columns
          </Button>
          {isFilteredMode && (
            <Button
              variant="secondary"
              className="w-full sm:w-auto"
              onClick={clearFilters}
              disabled={isLoading}
            >
              Clear Filters
            </Button>
          )}
        </div>

        {/* <Button
          variant="outline"
          onClick={handleExport}
          disabled={isLoading}
          className="w-full sm:w-auto"
        >
          <Download className="h-4 w-4 mr-2" />
          Export Data
        </Button> */}

      </div>

      {/* Bookings Table - DYNAMIC RENDERING */}
      <Card>
        <CardHeader>
          <CardTitle>Bookings ({filteredBookings.length})</CardTitle>
        </CardHeader>
        <CardContent>
          {isLoading ? (
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
          ) : (
            <>
              <div className="w-full overflow-x-auto">
                <Table className="min-w-full">
                  <TableHeader>
                    <TableRow>
                      {tableHeaders.map((header) => (
                        <TableHead key={header} className="whitespace-nowrap">
                          {header}
                        </TableHead>
                      ))}
                      {tableHeaders.length > 0 && (
                        <TableHead className="sticky right-0 bg-background">
                          Actions
                        </TableHead>
                      )}
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {currentBookings.length > 0 ? (
                      currentBookings.map((booking) => (
                        <TableRow
                          key={booking._id}
                          className="hover:bg-muted/50"
                        >
                          {tableHeaders.map((header) => (
                            <TableCell
                              key={`${booking._id}-${header}`}
                              className="whitespace-nowrap max-w-[200px] truncate"
                              title={String(booking[header] ?? "")}
                            >
                              {booking[header] !== undefined &&
                              booking[header] !== null
                                ? String(booking[header])
                                : "-"}
                            </TableCell>
                          ))}
                          <TableCell className="sticky right-0 bg-background">
                            <div className="flex flex-col gap-2 min-w-[200px]">
                              {/* Driver Info */}
                              <div className="text-xs">
                                <strong>Driver:</strong> {booking.driver?.name || "Not assigned"}
                              </div>
                              
                              {/* Expense/Receiving Summary */}
                              <div className="text-xs space-y-1">
                                {(() => {
                                  const rawBooking = rawBookings.find(b => b._id === booking._id);
                                  const expense = rawBooking?.primaryExpense || rawBooking?.expenses?.[0];
                                  const receiving = rawBooking?.receiving;
                                  const expenseTotal = (expense?.totalAllowances || 0) + 
                                    (expense?.billingItems?.reduce((sum, item) => sum + item.amount, 0) || 0);
                                  const receivingTotal = (receiving?.totalAllowances || 0) + 
                                    (receiving?.billingItems?.reduce((sum, item) => sum + item.amount, 0) || 0);
                                  
                                  return (
                                    <>
                                      <div>Expense: ₹{expenseTotal}</div>
                                      <div>Receiving: ₹{receivingTotal}</div>
                                      <div className={`font-medium ${expenseTotal - receivingTotal >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                                        Diff: ₹{expenseTotal - receivingTotal}
                                      </div>
                                    </>
                                  );
                                })()}
                              </div>

                              {/* Labels */}
                              <div className="text-xs">
                                <div className="flex flex-wrap gap-1 mb-1">
                                  {(() => {
                                    const rawBooking = rawBookings.find(b => b._id === booking._id);
                                    return rawBooking?.labels?.map(label => (
                                      <Badge key={label._id} variant="secondary" className="text-[10px]">
                                        {label.name}
                                      </Badge>
                                    )) || <span className="text-muted-foreground">No labels</span>;
                                  })()}
                                </div>
                                <Button
                                  variant="outline"
                                  size="sm"
                                  onClick={() => openLabelModal(booking._id)}
                                  className="text-xs h-6"
                                >
                                  Edit Labels
                                </Button>
                              </div>

                              {/* Details Button */}
                              <Button
                                variant="default"
                                size="sm"
                                onClick={() => navigate(`/booking/${booking._id}`)}
                                className="text-xs h-6"
                              >
                                View Details
                              </Button>
                            </div>
                          </TableCell>
                        </TableRow>
                      ))
                    ) : (
                      <TableRow>
                        <TableCell
                          colSpan={tableHeaders.length + 1}
                          className="text-center h-24 text-muted-foreground"
                        >
                          No bookings found
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
                      <ChevronLeft className="h-4 w-4" />
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
                      <ChevronRight className="h-4 w-4" />
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

      {/* Label Assignment Modal */}
      <Dialog open={isLabelModalOpen} onOpenChange={setIsLabelModalOpen}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>Assign Labels</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div className="border rounded-md h-64">
              <ScrollArea className="h-full p-2">
                {availableLabels.length ? (
                  <div className="space-y-2">
                    {availableLabels.map((label) => {
                      const checked = selectedLabels.includes(label._id);
                      return (
                        <label
                          key={label._id}
                          className="flex items-center gap-2 text-sm cursor-pointer select-none"
                        >
                          <Checkbox
                            checked={checked}
                            onCheckedChange={(val) => {
                              setSelectedLabels((prev) =>
                                val
                                  ? [...prev, label._id]
                                  : prev.filter((id) => id !== label._id)
                              );
                            }}
                          />
                          <Badge variant="secondary" className="text-xs">
                            {label.name}
                          </Badge>
                        </label>
                      );
                    })}
                  </div>
                ) : (
                  <div className="text-sm text-muted-foreground p-2">No labels available</div>
                )}
              </ScrollArea>
            </div>
            <div className="flex justify-end gap-2 pt-2">
              <Button
                variant="outline"
                onClick={() => {
                  setIsLabelModalOpen(false);
                  setSelectedBookingForLabels(null);
                  setSelectedLabels([]);
                }}
              >
                Cancel
              </Button>
              <Button onClick={handleLabelSave}>
                Save Labels
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      <Dialog open={isColumnModalOpen} onOpenChange={setIsColumnModalOpen}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>Select Columns</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div className="flex items-center gap-2">
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => setSelectedKeys(allKeys)}
                disabled={!allKeys.length}
              >
                Select All
              </Button>
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => setSelectedKeys([])}
                disabled={!allKeys.length}
              >
                Clear
              </Button>
            </div>
            <div className="border rounded-md h-64">
              <ScrollArea className="h-full p-2">
                {isFetchingKeys ? (
                  <div className="text-sm text-muted-foreground p-2">Loading keys...</div>
                ) : allKeys.length ? (
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                    {allKeys.map((keyName) => {
                      const checked = selectedKeys.includes(keyName);
                      return (
                        <label
                          key={keyName}
                          className="flex items-center gap-2 text-sm cursor-pointer select-none"
                        >
                          <Checkbox
                            checked={checked}
                            onCheckedChange={(val) => {
                              setSelectedKeys((prev) =>
                                val
                                  ? [...prev, keyName]
                                  : prev.filter((k) => k !== keyName)
                              );
                            }}
                          />
                          <span className="truncate" title={keyName}>{keyName}</span>
                        </label>
                      );
                    })}
                  </div>
                ) : (
                  <div className="text-sm text-muted-foreground p-2">No keys available</div>
                )}
              </ScrollArea>
            </div>
            <div className="flex justify-end gap-2 pt-2">
              <Button
                variant="outline"
                onClick={() => setIsColumnModalOpen(false)}
                disabled={isApplyingFilter}
              >
                Cancel
              </Button>
              <Button
                onClick={applySelectedColumns}
                disabled={isApplyingFilter || !selectedKeys.length}
              >
                {isApplyingFilter ? "Applying..." : "Apply"}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

    </div>
  );
}

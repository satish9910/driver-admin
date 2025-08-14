import { useState, useEffect } from "react";
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
  Download,
  ChevronLeft,
  ChevronRight,
  Calendar,
} from "lucide-react";
import { useToast } from "@/components/ui/use-toast";
import axios from "axios";
import Cookies from "js-cookie";
import { DateRange } from "react-day-picker";
import { format, subDays } from "date-fns";
import { Calendar as CalendarPicker } from "@/components/ui/calendar";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { AssignDriverModal } from "./AssignDriverModal";

interface Booking {
  _id: string;
  customerName: string;
  email: string;
  phoneNumber: string;
  pickupLocation: string;
  dropLocation: string;
  date: string;
  duration: string;
  price: number;
  createdAt: string;
  updatedAt: string;
  driver?: {
    _id: string;
    name: string;
  };
}

export function BookingManagement() {
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [file, setFile] = useState<File | null>(null);
  const [drivers, setDrivers] = useState<Driver[]>([]);
  const { toast } = useToast();

  const [dateRange, setDateRange] = useState<DateRange | undefined>();

  // Pagination state
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(10);

  // Get base URL from environment variables
  const baseUrl = import.meta.env.VITE_BASE_UR || "http://localhost:3000";

  // Create axios instance with base URL and auth headers
  const api = axios.create({
    baseURL: baseUrl,
    headers: {
      "Content-Type": "application/json",
    },
  });

  const fetchDrivers = async () => {
    try {
      const token = Cookies.get("admin_token");
      if (!token) {
        throw new Error("No authentication token found");
      }

      const response = await api.get("admin/drivers", {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      setDrivers(response.data.drivers);
    } catch (error) {
      console.error("Error fetching drivers:", error);
      toast({
        title: "Error",
        description: "Failed to fetch drivers",
        variant: "destructive",
      });
    }
  };

  // Fetch bookings from API
  const fetchBookings = async () => {
    setIsLoading(true);
    try {
      const token = Cookies.get("admin_token");
      if (!token) {
        throw new Error("No authentication token found");
      }

      let url = "admin/bookings";
      const params = new URLSearchParams();

      if (dateRange?.from && dateRange?.to) {
        params.append("startDate", format(dateRange.from, "yyyy-MM-dd"));
        params.append("endDate", format(dateRange.to, "yyyy-MM-dd"));
        url = `${url}?${params.toString()}`;
      }

      const response = await api.get(url, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      setBookings(response.data);
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
  };

  useEffect(() => {
    fetchBookings();
    fetchDrivers();
  }, [dateRange]);

  // Handle file upload
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
      if (!token) {
        throw new Error("No authentication token found");
      }

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
      fetchBookings(); // Refresh the bookings list
      setCurrentPage(1); // Reset to first page after upload
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

  // Filter bookings based on search term
  const filteredBookings = bookings.filter((booking) => {
    const searchLower = searchTerm.toLowerCase();
    return (
      booking.customerName.toLowerCase().includes(searchLower) ||
      booking.email.toLowerCase().includes(searchLower) ||
      booking.phoneNumber.includes(searchTerm) ||
      booking.pickupLocation.toLowerCase().includes(searchLower) ||
      booking.dropLocation.toLowerCase().includes(searchLower)
    );
  });

  // Calculate totals based on filtered bookings
  const calculateTotals = () => {
    const totalRevenue = filteredBookings.reduce(
      (sum, booking) => sum + booking.price,
      0
    );
    const totalBookings = filteredBookings.length;
    const avgDuration =
      filteredBookings.reduce((sum, booking) => {
        const hours = parseFloat(booking.duration.split(" ")[0]);
        return sum + hours;
      }, 0) / totalBookings;

    return {
      totalRevenue,
      totalBookings,
      avgDuration: isNaN(avgDuration) ? 0 : avgDuration.toFixed(1),
    };
  };

  // Pagination logic
  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentBookings = filteredBookings.slice(
    indexOfFirstItem,
    indexOfLastItem
  );
  const totalPages = Math.ceil(filteredBookings.length / itemsPerPage);

  const paginate = (pageNumber: number) => setCurrentPage(pageNumber);

  const { totalRevenue, totalBookings, avgDuration } = calculateTotals();

  // Handle export data
  const handleExport = async () => {
    try {
      const token = Cookies.get("admin_token");
      if (!token) {
        throw new Error("No authentication token found");
      }

      let url = "admin/export-bookings";
      const params = new URLSearchParams();

      if (dateRange?.from && dateRange?.to) {
        params.append("startDate", format(dateRange.from, "yyyy-MM-dd"));
        params.append("endDate", format(dateRange.to, "yyyy-MM-dd"));
        url = `${url}?${params.toString()}`;
      }

      const response = await api.get(url, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
        responseType: "blob",
      });

      // Create download link
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

      toast({
        title: "Success",
        description: "Export started successfully",
      });
    } catch (error) {
      console.error("Error exporting data:", error);
      toast({
        title: "Error",
        description: "Failed to export data",
        variant: "destructive",
      });
    }
  };

  return (
    <div className="space-y-6">
      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
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
            <div className="text-2xl font-bold">{avgDuration} hours</div>
            <p className="text-sm text-gray-600">Average Duration</p>
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
              />
            </div>
            <Button
              onClick={handleFileUpload}
              disabled={!file || isLoading}
              className="gap-2"
            >
              <Upload className="h-4 w-4" />
              {isLoading ? "Uploading..." : "Upload"}
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Header with Search */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between space-y-4 sm:space-y-0">
        {/* Date Range Picker */}
        <div className="flex items-center gap-2">
          <Popover>
            <PopoverTrigger asChild>
              <Button
                variant="outline"
                className="w-[280px] justify-start text-left font-normal"
              >
                <Calendar className="mr-2 h-4 w-4" />
                {dateRange?.from ? (
                  dateRange.to ? (
                    <>
                      {format(dateRange.from, "MMM dd, yyyy")} -{" "}
                      {format(dateRange.to, "MMM dd, yyyy")}
                    </>
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
              setDateRange({
                from: undefined,
                to: undefined,
              });
              setCurrentPage(1);
            }}
          >
            Clear
          </Button>
        </div>
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
          <Input
            placeholder="Search bookings..."
            value={searchTerm}
            onChange={(e) => {
              setSearchTerm(e.target.value);
              setCurrentPage(1); // Reset to first page when searching
            }}
            className="w-64 pl-10"
          />
        </div>
        {/* <Button variant="outline" onClick={handleExport} disabled={isLoading}>
          <Download className="h-4 w-4 mr-2" />
          Export Data
        </Button> */}
      </div>

      {/* Bookings Table */}
      <Card>
        <CardHeader>
          <CardTitle>Bookings ({filteredBookings.length})</CardTitle>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="flex justify-center items-center h-64">
              <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
            </div>
          ) : (
            <>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Customer</TableHead>
                    <TableHead>Contact</TableHead>
                    <TableHead>Pickup</TableHead>
                    <TableHead>Drop</TableHead>
                    <TableHead>Date</TableHead>
                    <TableHead>Duration</TableHead>
                    <TableHead className="text-right">Price</TableHead>
                    <TableHead>Driver</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {currentBookings.length > 0 ? (
                    currentBookings.map((booking) => (
                      <TableRow key={booking._id} className="hover:bg-gray-50">
                        <TableCell className="font-medium">
                          {booking.customerName}
                        </TableCell>
                        <TableCell>
                          <div>{booking.email}</div>
                          <div className="text-sm text-gray-500">
                            {booking.phoneNumber}
                          </div>
                        </TableCell>
                        <TableCell>{booking.pickupLocation}</TableCell>
                        <TableCell>{booking.dropLocation}</TableCell>
                        <TableCell>
                          {new Date(booking.date).toLocaleDateString()}
                        </TableCell>
                        <TableCell>{booking.duration}</TableCell>
                        <TableCell className="text-right font-medium">
                          ₹{booking.price.toLocaleString()}
                        </TableCell>
                        <TableCell>
                          {booking.driver ? (
                            <div className="space-y-1 flex items-center gap-5">
                              <p className="font-medium">
                                {booking.driver.name}
                              </p>
                              <AssignDriverModal
                                bookingId={booking._id}
                                currentDriverId={booking.driver._id}
                                onSuccess={fetchBookings}
                                drivers={drivers}
                                action="change"
                              />
                            </div>
                          ) : (
                            <AssignDriverModal
                              bookingId={booking._id}
                              onSuccess={fetchBookings}
                              drivers={drivers}
                              action="assign"
                            />
                          )}
                        </TableCell>
                      </TableRow>
                    ))
                  ) : (
                    <TableRow>
                      <TableCell colSpan={7} className="text-center h-24">
                        No bookings found
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>

              {/* Pagination Controls */}
              {filteredBookings.length > itemsPerPage && (
                <div className="flex items-center justify-end space-x-2 py-4">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => paginate(currentPage - 1)}
                    disabled={currentPage === 1}
                  >
                    <ChevronLeft className="h-4 w-4" />
                  </Button>
                  {Array.from({ length: totalPages }, (_, i) => i + 1).map(
                    (number) => (
                      <Button
                        key={number}
                        variant={currentPage === number ? "default" : "outline"}
                        size="sm"
                        onClick={() => paginate(number)}
                      >
                        {number}
                      </Button>
                    )
                  )}
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => paginate(currentPage + 1)}
                    disabled={currentPage === totalPages}
                  >
                    <ChevronRight className="h-4 w-4" />
                  </Button>
                </div>
              )}
            </>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

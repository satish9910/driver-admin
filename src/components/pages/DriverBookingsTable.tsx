import { useEffect, useState, useMemo } from "react";
import axios from "axios";
import Cookies from "js-cookie";
import { useParams, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";

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
}

const DriverBookingsTable = () => {
  const [bookings, setBookings] = useState<BookingRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedBookingId, setSelectedBookingId] = useState<string | null>(null);
  const token = Cookies.get("admin_token");
  const navigate = useNavigate();
  const { driverId } = useParams();

  useEffect(() => {
    const fetchDriverBookings = async () => {
      try {
        const response = await axios.get(
          `${import.meta.env.VITE_BASE_UR}admin/driver-bookings/${driverId}`,
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        );
        const payload = response.data;
        const list = payload?.data || payload?.bookings || [];
        setBookings(list);
        if (!selectedBookingId && list.length)
          setSelectedBookingId(list[0]._id);
        setLoading(false);
      } catch (err) {
        const msg = err instanceof Error ? err.message : "Failed to load";
        setError(msg);
        setLoading(false);
      }
    };

    fetchDriverBookings();
  }, [driverId, token, selectedBookingId]);
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
  ], []);

  const selectedBooking = useMemo(
    () => bookings.find((b) => b._id === selectedBookingId),
    [bookings, selectedBookingId]
  );
  return (
    <div className="overflow-x-auto space-y-6">
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
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Actions
              </th>
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
                  // First try booking data
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
                <td className="px-6 py-4 whitespace-nowrap text-sm">
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
                  ) : (
                    <span className="text-muted-foreground text-xs">
                      No Expense
                    </span>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
};

export default DriverBookingsTable;

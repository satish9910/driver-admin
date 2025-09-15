import React, { useEffect, useState, useCallback } from "react";
import { useParams, useNavigate } from "react-router-dom";
import Cookies from "js-cookie";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";

interface BillingItem {
  category: string;
  amount: number;
  note?: string;
  image?: string | null;
}
interface DutyInfo {
  _id?: string;
  dutyStartDate?: string;
  dutyEndDate?: string;
  dutyStartTime?: string;
  dutyEndTime?: string;
  dutyType?: string;
  dutyStartKm?: number;
  dutyEndKm?: number;
  notes?: string;
  totalKm?: number;
  totalHours?: number;
  totalDays?: number;
  formattedDuration?: string;
  dateRange?: string;
  timeRange?: string;
}
interface ExpenseLike {
  _id?: string;
  notes?: string;
  billingItems?: BillingItem[];
  dailyAllowance?: number;
  outstationAllowance?: number;
  nightAllowance?: number;
  receivedFromClient?: number;
  clientAdvanceAmount?: number;
  clientBonusAmount?: number;
  incentiveAmount?: number;
  totalAllowances?: number;
  totalReceivingAmount?: number;
  receivingAmount?: number;
}
interface DriverInfo {
  wallet?: { balance: number };
  name?: string;
  drivercode?: string;
}
interface Settlement {
  isSettled: boolean;
  settlementAmount: number;
  calculatedAmount: number;
  adminAdjustments: number;
  notes: string;
  status: string;
  adjustAdminWallet: boolean;
  action: string;
  settledAt?: string;
  settledBy?: string;
  settledByRole?: string;
  transactionId?: string;
  adminTransactionId?: string;
}

interface BookingRecord {
  _id: string;
  data: { key: string; value: string | number | null; _id: string }[];
  primaryExpense?: ExpenseLike | null;
  receiving?: ExpenseLike | null;
  expenses?: ExpenseLike[]; // array from sample
  driver?: DriverInfo; // include driver to show wallet balance
  settlement?: Settlement;
  dutyInfo?: DutyInfo;
}

// Backend-provided totals shape
interface BackendExpenseTotals {
  billingSum: number;
  totalAllowances: number;
  totalExpense: number;
}
interface BackendReceivingTotals {
  receivingBillingSum: number;
  receivingAllowances: number;
  receivingAmount: number;
  totalReceiving: number;
}
interface BackendTotals {
  expense: BackendExpenseTotals;
  receiving: BackendReceivingTotals;
  difference: number;
}

const allowanceKeys = [
  "dailyAllowance",
  "outstationAllowance",
  "nightAllowance",
] as const;

type AllowanceKey = (typeof allowanceKeys)[number];

const totalAllowances = (obj?: ExpenseLike | null) =>
  allowanceKeys.reduce((s, k) => s + Number(obj?.[k] || 0), 0);

const BookingDetailPage: React.FC = () => {
  const { bookingId } = useParams();
  const navigate = useNavigate();
  const token = Cookies.get("admin_token");
  const { toast } = useToast();
  const [booking, setBooking] = useState<BookingRecord | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [backendTotals, setBackendTotals] = useState<BackendTotals | null>(null);
  const [expense, setExpense] = useState<ExpenseLike | null>(null);
  const [receiving, setReceiving] = useState<ExpenseLike | null>(null);
  const [dutyInfo, setDutyInfo] = useState<DutyInfo | null>(null);
  const [savingExpense, setSavingExpense] = useState(false);
  const [savingReceiving, setSavingReceiving] = useState(false);
  const [savingDuty, setSavingDuty] = useState(false);
  const [msgExpense, setMsgExpense] = useState<string | null>(null);
  const [msgReceiving, setMsgReceiving] = useState<string | null>(null);
  const [msgDuty, setMsgDuty] = useState<string | null>(null);
  
  // Settlement modal state
  const [isSettlementModalOpen, setIsSettlementModalOpen] = useState(false);
  const [settlementForm, setSettlementForm] = useState({
    adminAdjustments: 0,
    notes: "",
    markCompleted: true,
    forceSettlement: false
  });
  const [isSettling, setIsSettling] = useState(false);
  // derived totals recomputed from editable state
  const expenseBillingSum = (expense?.billingItems || []).reduce(
    (s, b) => s + Number(b.amount || 0),
    0
  );
  const receivingBillingSum = (receiving?.billingItems || []).reduce(
    (s, b) => s + Number(b.amount || 0),
    0
  );
  const expenseAllowances = totalAllowances(expense);
  const receivingAllowances = totalAllowances(receiving);
  const receivingAmountSum = (receiving?.receivedFromClient || 0) + 
    (receiving?.clientAdvanceAmount || 0) + 
    (receiving?.clientBonusAmount || 0) + 
    (receiving?.incentiveAmount || 0);
  const totalExpense = expenseBillingSum + expenseAllowances;
  const totalReceiving = receivingBillingSum + receivingAllowances + receivingAmountSum;
  const difference = totalExpense - totalReceiving; // positive => add to wallet, negative => deduct
  const driverBalance = booking?.driver?.wallet?.balance ?? null;
  const serverDifference = backendTotals?.difference ?? 0;
  const walletActionLabel =
    serverDifference === 0
      ? "No wallet adjustment"
      : serverDifference > 0
      ? `Add ₹${serverDifference}`
      : `Deduct ₹${Math.abs(serverDifference)}`;

  const fetchBooking = useCallback(async () => {
    if (!bookingId) return;
    setLoading(true);
    setError(null);
    try {
      const res = await fetch(
        `${import.meta.env.VITE_BASE_UR}admin/booking/${bookingId}`,
        { headers: { Authorization: `Bearer ${token}` } }
      );
      if (!res.ok) throw new Error("Failed to load");
      const data = await res.json();
      const bk: BookingRecord = data.booking || data.data || data;
      setBooking(bk);
      // store backend totals if provided
      setBackendTotals(data.totals || null);
      // choose primaryExpense if exists else first element from expenses array
      const exp =
        bk.primaryExpense ||
        (bk.expenses && bk.expenses.length ? bk.expenses[0] : null);
      setExpense(exp || null);
      setReceiving(bk.receiving || null);
      setDutyInfo(bk.dutyInfo || null);
      console.log(bk.dutyInfo,"sdfghngfd")
    } catch (e) {
      setError(e instanceof Error ? e.message : "Error");
    } finally {
      setLoading(false);
    }
  }, [bookingId, token]);

  useEffect(() => {
    fetchBooking();
  }, [fetchBooking]);

  const updateExp = (
    setter: React.Dispatch<React.SetStateAction<ExpenseLike | null>>,
    key: keyof ExpenseLike,
    raw: string
  ) => {
    setter((prev) => ({
      ...(prev || {}),
      [key]: raw === "" ? undefined : isNaN(Number(raw)) ? raw : Number(raw),
    }));
  };

  const updateDuty = (
    key: keyof DutyInfo,
    raw: string
  ) => {
    setDutyInfo((prev) => ({
      ...(prev || {}),
      [key]: raw === "" ? undefined : isNaN(Number(raw)) ? raw : Number(raw),
    }));
  };
  const updateBilling = (
    setter: React.Dispatch<React.SetStateAction<ExpenseLike | null>>,
    idx: number,
    key: keyof BillingItem,
    val: string
  ) => {
    setter((prev) => {
      if (!prev) return prev;
      const items = [...(prev.billingItems || [])];
      const base = items[idx] || { category: "", amount: 0, note: "" };
      items[idx] = {
        ...base,
        [key]: key === "amount" ? Number(val) || 0 : val,
      };
      return { ...prev, billingItems: items };
    });
  };
  const addBilling = (
    setter: React.Dispatch<React.SetStateAction<ExpenseLike | null>>
  ) =>
    setter((p) => ({
      ...(p || {}),
      billingItems: [
        ...(p?.billingItems || []),
        { category: "", amount: 0, note: "" },
      ],
    }));
  const removeBilling = (
    setter: React.Dispatch<React.SetStateAction<ExpenseLike | null>>,
    idx: number
  ) =>
    setter((p) => {
      if (!p) return p;
      const items = [...(p.billingItems || [])];
      items.splice(idx, 1);
      return { ...p, billingItems: items };
    });

  const saveExpense = async () => {
    if (!bookingId || !expense) return;
    setSavingExpense(true);
    setMsgExpense(null);
    try {
      const {
        dailyAllowance,
        outstationAllowance,
        nightAllowance,
        notes,
        billingItems,
      } = expense;
      const body = {
        dailyAllowance,
        outstationAllowance,
        nightAllowance,
        notes,
        billingItems,
      };
      const res = await fetch(
        `${import.meta.env.VITE_BASE_UR}admin/update-expense-booking/${bookingId}`,
        {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify(body),
        }
      );
      if (!res.ok) throw new Error("Expense update failed");
      setMsgExpense("Saved");
      await fetchBooking();
    } catch (e) {
      setMsgExpense(e instanceof Error ? e.message : "Error");
    } finally {
      setSavingExpense(false);
    }
  };

  const saveDuty = async () => {
    if (!bookingId || !dutyInfo) return;
    setSavingDuty(true);
    setMsgDuty(null);
    try {
      const {
        dutyStartDate,
        dutyEndDate,
        dutyStartTime,
        dutyEndTime,
        dutyType,
        dutyStartKm,
        dutyEndKm,
        notes,
      } = dutyInfo;
      const body = {
        dutyStartDate,
        dutyEndDate,
        dutyStartTime,
        dutyEndTime,
        dutyType,
        dutyStartKm,
        dutyEndKm,
        notes,
      };
      const res = await fetch(
        `${import.meta.env.VITE_BASE_UR}admin/update-duty-booking/${bookingId}`,
        {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify(body),
        }
      );
      if (!res.ok) throw new Error("Duty update failed");
      setMsgDuty("Saved");
      await fetchBooking();
    } catch (e) {
      setMsgDuty(e instanceof Error ? e.message : "Error");
    } finally {
      setSavingDuty(false);
    }
  };
  const saveReceiving = async () => {
    if (!bookingId || !receiving) return;
    setSavingReceiving(true);
    setMsgReceiving(null);
    try {
      const {
        dailyAllowance,
        outstationAllowance,
        nightAllowance,
        receivedFromClient,
        clientAdvanceAmount,
        clientBonusAmount,
        incentiveAmount,
        notes,
        billingItems,
      } = receiving;
      const body = {
        dailyAllowance,
        outstationAllowance,
        nightAllowance,
        receivedFromClient,
        clientAdvanceAmount,
        clientBonusAmount,
        incentiveAmount,
        notes,
        billingItems,
      };
      const res = await fetch(
        `${import.meta.env.VITE_BASE_UR}admin/update-receiving-booking/${bookingId}`,
        {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify(body),
        }
      );
      if (!res.ok) throw new Error("Receiving update failed");
      setMsgReceiving("Saved");
      await fetchBooking();
    } catch (e) {
      setMsgReceiving(e instanceof Error ? e.message : "Error");
    } finally {
      setSavingReceiving(false);
    }
  };

  const handleSettlement = async () => {
    if (!bookingId) return;
    setIsSettling(true);
    try {
      const res = await fetch(
        `${import.meta.env.VITE_BASE_UR}admin/booking-settlement-settle/${bookingId}`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify(settlementForm),
        }
      );
      
      if (!res.ok) throw new Error("Settlement failed");
      
      toast({
        title: "Success",
        description: "Booking settled successfully",
      });
      
      setIsSettlementModalOpen(false);
      setSettlementForm({
        adminAdjustments: 0,
        notes: "",
        markCompleted: true,
        forceSettlement: false
      });
      await fetchBooking();
    } catch (e) {
      toast({
        title: "Error",
        description: e instanceof Error ? e.message : "Settlement failed",
        variant: "destructive",
      });
    } finally {
      setIsSettling(false);
    }
  };

  if (loading) return <div className="p-4">Loading...</div>;
  if (error) return <div className="p-4 text-red-600">{error}</div>;
  if (!booking) return <div className="p-4">Not found</div>;

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <h1 className="text-lg font-semibold">Booking Detail</h1>
        <Button variant="outline" onClick={() => navigate(-1)}>
          Back
        </Button>
      </div>
      {/* Summary Cards (from backend totals) */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4 text-xs">
        <div className="border rounded p-3 bg-white">
          <div className="font-semibold mb-1">Expense</div>
          <div>Billing: ₹{backendTotals?.expense.billingSum ?? 0}</div>
          <div>Allowances: ₹{backendTotals?.expense.totalAllowances ?? 0}</div>
          <div className="font-medium">Total: ₹{backendTotals?.expense.totalExpense ?? 0}</div>
        </div>
        <div className="border rounded p-3 bg-white">
          <div className="font-semibold mb-1">Receiving</div>
          <div>Billing: ₹{backendTotals?.receiving?.receivingBillingSum ?? 0}</div>
          <div>Allowances: ₹{backendTotals?.receiving?.receivingAllowances ?? 0}</div>
          <div>Received: ₹{backendTotals?.receiving?.receivingAmount ?? 0}</div>
          <div className="font-medium">Total: ₹{backendTotals?.receiving?.totalReceiving ?? 0}</div>
        </div>
        <div
          className={`border rounded p-3 bg-white ${
            (backendTotals?.difference ?? 0) === 0
              ? ""
              : (backendTotals?.difference ?? 0) > 0
              ? "text-green-600"
              : "text-red-600"
          }`}
        >
          <div className="font-semibold mb-1">Difference</div>
          <div className="font-medium">₹{backendTotals?.difference ?? 0}</div>
          <div className="text-[10px] mt-1">(Expense - Receiving)</div>
        </div>
        <div className="border rounded p-3 bg-white">
          <div className="font-semibold mb-1">Driver Wallet</div>
          <div>
            Current: {driverBalance !== null ? `₹${driverBalance}` : "-"}
          </div>
          {/* {driverBalance !== null && (backendTotals?.difference ?? 0) !== 0 && (
            <div className="mt-1 text-[10px]">
              After: ₹{driverBalance  0)}
            </div>
          )} */}
        </div>
        <div className="border rounded p-3 bg-white flex flex-col justify-between">
          <div className="font-semibold mb-1">Wallet Action</div>
          <div className="font-medium">{walletActionLabel}</div>
          <div className="text-[10px] mt-1">
            {booking.settlement?.isSettled ? 'Already applied' : 'Not yet applied'}
          </div>
        </div>
      </div>

      {/* Settlement Status */}
      <div className="border rounded bg-white p-4">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold">Settlement Status</h3>
          <div className="flex items-center gap-3">
            <div className={`px-3 py-1 rounded-full text-sm font-medium ${
              booking.settlement?.isSettled 
                ? 'bg-green-100 text-green-800' 
                : 'bg-yellow-100 text-yellow-800'
            }`}>
              {booking.settlement?.isSettled ? 'Settled' : 'Pending'}
            </div>
            {!booking.settlement?.isSettled && (
              <Button 
                onClick={() => setIsSettlementModalOpen(true)}
                size="sm"
                className="bg-blue-600 hover:bg-blue-700"
              >
                Settle Booking
              </Button>
            )}
          </div>
        </div>
        
        {booking.settlement?.isSettled ? (
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4 text-sm">
              <div className="space-y-2">
                <div className="font-medium text-gray-600">Settlement Details</div>
                <div>Amount: <span className="font-medium">₹{booking.settlement.settlementAmount}</span></div>
                <div>Calculated: <span className="font-medium">₹{booking.settlement.calculatedAmount}</span></div>
                {booking.settlement.adminAdjustments !== 0 && (
                  <div>Adjustments: <span className="font-medium">₹{booking.settlement.adminAdjustments}</span></div>
                )}
                <div>Action: <span className="font-medium capitalize">{booking.settlement.action.replace(/_/g, ' ')}</span></div>
              </div>
              
              <div className="space-y-2">
                <div className="font-medium text-gray-600">Settlement Info</div>
                {booking.settlement.settledAt && (
                  <div>Settled At: <span className="font-medium">
                    {new Date(booking.settlement.settledAt).toLocaleString()}
                  </span></div>
                )}
                {booking.settlement.settledByRole && (
                  <div>Settled By: <span className="font-medium capitalize">{booking.settlement.settledByRole}</span></div>
                )}
                <div>Status: <span className="font-medium capitalize">{booking.settlement.status}</span></div>
              </div>
              
              {booking.settlement.notes && (
                <div className="space-y-2">
                  <div className="font-medium text-gray-600">Notes</div>
                  <div className="text-sm bg-gray-50 p-2 rounded">{booking.settlement.notes}</div>
                </div>
              )}
              
              {(booking.settlement.transactionId || booking.settlement.adminTransactionId) && (
                <div className="space-y-2">
                  <div className="font-medium text-gray-600">Transaction IDs</div>
                  {booking.settlement.transactionId && (
                    <div className="text-xs">Driver: <code className="bg-gray-100 px-1 rounded">{booking.settlement.transactionId}</code></div>
                  )}
                  {booking.settlement.adminTransactionId && (
                    <div className="text-xs">Admin: <code className="bg-gray-100 px-1 rounded">{booking.settlement.adminTransactionId}</code></div>
                  )}
                </div>
              )}
            </div>
          ) : (
            <div className="text-center py-6 text-gray-500">
              <div className="text-lg mb-2">⏳</div>
              <div>Settlement is pending</div>
              <div className="text-sm mt-1">Difference amount: ₹{backendTotals?.difference ?? 0}</div>
              <div className="mt-4">
                <Button 
                  onClick={() => setIsSettlementModalOpen(true)}
                  className="bg-blue-600 hover:bg-blue-700"
                >
                  Settle This Booking
                </Button>
              </div>
            </div>
          )}
        </div>
     
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Duty Info */}
        <div className="border rounded bg-white p-4">
          <div className="flex flex-col sm:flex-row justify-between mb-3 items-start sm:items-center gap-2">
            <h3 className="font-semibold text-sm">Duty Information</h3>
            <div className="flex gap-2 w-full sm:w-auto">
              <Button
                variant="outline"
                size="sm"
                className="flex-1 sm:flex-none"
                onClick={() => setDutyInfo(booking.dutyInfo || null)}
              >
                Reset
              </Button>
              <Button size="sm" className="flex-1 sm:flex-none" disabled={savingDuty} onClick={saveDuty}>
                {savingDuty ? "Saving..." : "Save"}
              </Button>
            </div>
          </div>
          {!dutyInfo && (
            <div className="text-xs text-muted-foreground mb-2">
              No duty info yet
            </div>
          )}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-4">
            <div>
              <label className="block text-[10px] mb-1 text-gray-600">Start Date</label>
              <input
                type="date"
                className="border rounded px-2 py-1 h-8 text-xs w-full"
                value={dutyInfo?.dutyStartDate?.substring(0, 10) || ""}
                onChange={(e) =>
                  updateDuty("dutyStartDate", e.target.value)
                }
              />
            </div>
            <div>
              <label className="block text-[10px] mb-1 text-gray-600">Start Time</label>
              <input
                type="time"
                className="border rounded px-2 py-1 h-8 text-xs w-full"
                value={dutyInfo?.dutyStartTime || ""}
                onChange={(e) =>
                  updateDuty("dutyStartTime", e.target.value)
                }
              />
            </div>
            <div>
              <label className="block text-[10px] mb-1 text-gray-600">End Date</label>
              <input
                type="date"
                className="border rounded px-2 py-1 h-8 text-xs w-full"
                value={dutyInfo?.dutyEndDate?.substring(0, 10) || ""}
                onChange={(e) =>
                  updateDuty("dutyEndDate", e.target.value)
                }
              />
            </div>
            <div>
              <label className="block text-[10px] mb-1 text-gray-600">End Time</label>
              <input
                type="time"
                className="border rounded px-2 py-1 h-8 text-xs w-full"
                value={dutyInfo?.dutyEndTime || ""}
                onChange={(e) =>
                  updateDuty("dutyEndTime", e.target.value)
                }
              />
            </div>
            <div>
              <label className="block text-[10px] mb-1 text-gray-600">Start KM</label>
              <input
                type="number"
                placeholder="Start Km"
                className="border rounded px-2 py-1 h-8 text-xs w-full"
                value={dutyInfo?.dutyStartKm ?? ""}
                onChange={(e) =>
                  updateDuty("dutyStartKm", e.target.value)
                }
              />
            </div>
            <div>
              <label className="block text-[10px] mb-1 text-gray-600">End KM</label>
              <input
                type="number"
                placeholder="End Km"
                className="border rounded px-2 py-1 h-8 text-xs w-full"
                value={dutyInfo?.dutyEndKm ?? ""}
                onChange={(e) =>
                  updateDuty("dutyEndKm", e.target.value)
                }
              />
            </div>
            <div>
              <label className="block text-[10px] mb-1 text-gray-600">Duty Type</label>
              <input
                type="text"
                placeholder="Duty Type"
                className="border rounded px-2 py-1 h-8 text-xs w-full"
                value={dutyInfo?.dutyType || ""}
                onChange={(e) =>
                  updateDuty("dutyType", e.target.value)
                }
              />
            </div>
            <div>
              <label className="block text-[10px] mb-1 text-gray-600">Notes</label>
              <input
                type="text"
                placeholder="Duty notes"
                className="border rounded px-2 py-1 h-8 text-xs w-full"
                value={dutyInfo?.notes || ""}
                onChange={(e) => updateDuty("notes", e.target.value)}
              />
            </div>
          </div>
          {dutyInfo && (
            <div className="text-xs text-gray-600 space-y-1">
              {dutyInfo.totalKm && <div>Total KM: {dutyInfo.totalKm}</div>}
              {dutyInfo.totalHours && <div>Total Hours: {dutyInfo.totalHours}</div>}
              {dutyInfo.formattedDuration && <div>Duration: {dutyInfo.formattedDuration}</div>}
              {dutyInfo.dateRange && <div>Date Range: {dutyInfo.dateRange}</div>}
              {dutyInfo.timeRange && <div>Time Range: {dutyInfo.timeRange}</div>}
            </div>
          )}
          {msgDuty && <div className="text-[11px] mt-1">{msgDuty}</div>}
        </div>
        {/* Expense */}
        <div className="border rounded bg-white p-4">
          <div className="flex flex-col sm:flex-row justify-between mb-3 items-start sm:items-center gap-2">
            <h3 className="font-semibold text-sm">Expense</h3>
            <div className="flex gap-2 w-full sm:w-auto">
              <Button
                variant="outline"
                size="sm"
                className="flex-1 sm:flex-none"
                onClick={() =>
                  setExpense(
                    booking.primaryExpense || booking.expenses?.[0] || null
                  )
                }
              >
                Reset
              </Button>
              <Button size="sm" className="flex-1 sm:flex-none" disabled={savingExpense} onClick={saveExpense}>
                {savingExpense ? "Saving..." : "Save"}
              </Button>
            </div>
          </div>
          {!expense && (
            <div className="text-xs text-muted-foreground mb-2">
              No expense yet
            </div>
          )}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-4">
            <div>
              <label className="block text-[10px] mb-1 text-gray-600">Notes</label>
              <input
                type="text"
                placeholder="Expense notes"
                className="border rounded px-2 py-1 h-8 text-xs w-full"
                value={expense?.notes || ""}
                onChange={(e) => updateExp(setExpense, "notes", e.target.value)}
              />
            </div>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 mb-4">
            {allowanceKeys.map((k) => (
              <div key={k}>
                <label className="block text-[10px] mb-1 capitalize">{k.replace(/([A-Z])/g, ' $1')}</label>
                <input
                  type="number"
                  className="border rounded px-2 py-1 h-8 text-xs w-full"
                  value={expense?.[k] ?? ""}
                  onChange={(e) => updateExp(setExpense, k, e.target.value)}
                />
              </div>
            ))}
            <div>
              <label className="block text-[10px] mb-1">Total</label>
              <div className="text-xs font-medium">
                {totalAllowances(expense)}
              </div>
            </div>
          </div>
          <div className="mb-2 flex items-center justify-between">
            <h4 className="text-xs font-semibold">Billing Items</h4>
            <Button
              size="sm"
              variant="outline"
              onClick={() => addBilling(setExpense)}
            >
              Add
            </Button>
          </div>
          {(expense?.billingItems || []).length === 0 && (
            <div className="text-[10px] text-muted-foreground mb-2">
              No items
            </div>
          )}
          {expense?.billingItems?.map((bi, idx) => (
            <div
              key={idx}
              className="grid grid-cols-1 sm:grid-cols-12 gap-2 items-center mb-2 p-2 border rounded"
            >
              <div className="sm:col-span-3">
                <label className="block text-[10px] mb-1 text-gray-600 sm:hidden">Category</label>
                <select
                  className="border rounded px-2 py-1 h-8 text-[10px] w-full"
                  value={bi.category}
                  onChange={(e) =>
                    updateBilling(setExpense, idx, "category", e.target.value)
                  }
                >
                  <option value="">Category</option>
                  <option value="Parking">Parking</option>
                  <option value="Toll">Toll</option>
                  <option value="MCD">MCD</option>
                  <option value="InterstateTax">Interstate Tax</option>
                  <option value="Fuel">Fuel</option>
                  <option value="Other">Other</option>
                </select>
              </div>
              <div className="sm:col-span-2">
                <label className="block text-[10px] mb-1 text-gray-600 sm:hidden">Amount</label>
                <input
                  type="number"
                  className="border rounded px-2 py-1 h-8 text-[10px] w-full"
                  placeholder="Amount"
                  value={bi.amount}
                  onChange={(e) =>
                    updateBilling(setExpense, idx, "amount", e.target.value)
                  }
                />
              </div>
              <div className="sm:col-span-6">
                <label className="block text-[10px] mb-1 text-gray-600 sm:hidden">Note</label>
                <input
                  type="text"
                  className="border rounded px-2 py-1 h-8 text-[10px] w-full"
                  placeholder="Note"
                  value={bi.note || ""}
                  onChange={(e) =>
                    updateBilling(setExpense, idx, "note", e.target.value)
                  }
                />
              </div>
              <div className="sm:col-span-1 flex justify-center">
                <button
                  type="button"
                  className="text-red-600 text-sm px-2 py-1 hover:bg-red-50 rounded"
                  onClick={() => removeBilling(setExpense, idx)}
                >
                  ×
                </button>
              </div>
            </div>
          ))}
          {msgExpense && <div className="text-[11px] mt-1">{msgExpense}</div>}
        </div>
        {/* Receiving */}
        <div className="border rounded bg-white p-4">
          <div className="flex flex-col sm:flex-row justify-between mb-3 items-start sm:items-center gap-2">
            <h3 className="font-semibold text-sm">Receiving</h3>
            <div className="flex gap-2 w-full sm:w-auto">
              <Button
                variant="outline"
                size="sm"
                className="flex-1 sm:flex-none"
                onClick={() => setReceiving(booking.receiving || null)}
              >
                Reset
              </Button>
              <Button
                size="sm"
                className="flex-1 sm:flex-none"
                disabled={savingReceiving}
                onClick={saveReceiving}
              >
                {savingReceiving ? "Saving..." : "Save"}
              </Button>
            </div>
          </div>
          {!receiving && (
            <div className="text-xs text-muted-foreground mb-2">
              No receiving yet
            </div>
          )}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-4">
            <div>
              <label className="block text-[10px] mb-1 text-gray-600">Notes</label>
              <input
                type="text"
                placeholder="Receiving notes"
                className="border rounded px-2 py-1 h-8 text-xs w-full"
                value={receiving?.notes || ""}
                onChange={(e) => updateExp(setReceiving, "notes", e.target.value)}
              />
            </div>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-4">
            <div>
              <label className="block text-[10px] mb-1 text-gray-600">Client Payment</label>
              <input
                type="number"
                placeholder="Client Payment"
                className="border rounded px-2 py-1 h-8 text-xs w-full"
                value={receiving?.receivedFromClient ?? ""}
                onChange={(e) =>
                  updateExp(setReceiving, "receivedFromClient", e.target.value)
                }
              />
            </div>
            <div>
              <label className="block text-[10px] mb-1 text-gray-600">Client Advance</label>
              <input
                type="number"
                placeholder="Client Advance"
                className="border rounded px-2 py-1 h-8 text-xs w-full"
                value={receiving?.clientAdvanceAmount ?? ""}
                onChange={(e) =>
                  updateExp(setReceiving, "clientAdvanceAmount", e.target.value)
                }
              />
            </div>
            <div>
              <label className="block text-[10px] mb-1 text-gray-600">Client Bonus</label>
              <input
                type="number"
                placeholder="Client Bonus"
                className="border rounded px-2 py-1 h-8 text-xs w-full"
                value={receiving?.clientBonusAmount ?? ""}
                onChange={(e) =>
                  updateExp(setReceiving, "clientBonusAmount", e.target.value)
                }
              />
            </div>
            <div>
              <label className="block text-[10px] mb-1 text-gray-600">Incentive Amount</label>
              <input
                type="number"
                placeholder="Incentive Amount"
                className="border rounded px-2 py-1 h-8 text-xs w-full"
                value={receiving?.incentiveAmount ?? ""}
                onChange={(e) =>
                  updateExp(setReceiving, "incentiveAmount", e.target.value)
                }
              />
            </div>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 mb-4">
            {allowanceKeys.map((k) => (
              <div key={k}>
                <label className="block text-[10px] mb-1 capitalize">{k.replace(/([A-Z])/g, ' $1')}</label>
                <input
                  type="number"
                  className="border rounded px-2 py-1 h-8 text-xs w-full"
                  value={receiving?.[k] ?? ""}
                  onChange={(e) => updateExp(setReceiving, k, e.target.value)}
                />
              </div>
            ))}
            <div>
              <label className="block text-[10px] mb-1">Total</label>
              <div className="text-xs font-medium">
                {totalAllowances(receiving)}
              </div>
            </div>
          </div>
          <div className="mt-3 p-2 bg-gray-50 rounded text-xs">
            <div className="font-semibold mb-2">Client Receiving Summary</div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
              <div>Client Payment: ₹{receiving?.receivedFromClient || 0}</div>
              <div>Client Advance: ₹{receiving?.clientAdvanceAmount || 0}</div>
              <div>Client Bonus: ₹{receiving?.clientBonusAmount || 0}</div>
              <div>Incentive: ₹{receiving?.incentiveAmount || 0}</div>
              <div className="col-span-1 sm:col-span-2 border-t pt-2 mt-1 font-medium text-center">
                Total Client Amounts: ₹{receivingAmountSum}
              </div>
            </div>
          </div>
          <div className="mb-2 flex items-center justify-between">
            <h4 className="text-xs font-semibold">Billing Items</h4>
            <Button
              size="sm"
              variant="outline"
              onClick={() => addBilling(setReceiving)}
            >
              Add
            </Button>
          </div>
          {(receiving?.billingItems || []).length === 0 && (
            <div className="text-[10px] text-muted-foreground mb-2">
              No items
            </div>
          )}
          {receiving?.billingItems?.map((bi, idx) => (
            <div
              key={idx}
              className="grid grid-cols-1 sm:grid-cols-12 gap-2 items-center mb-2 p-2 border rounded"
            >
              <div className="sm:col-span-3">
                <label className="block text-[10px] mb-1 text-gray-600 sm:hidden">Category</label>
                <select
                  className="border rounded px-2 py-1 h-8 text-[10px] w-full"
                  value={bi.category}
                  onChange={(e) =>
                    updateBilling(setReceiving, idx, "category", e.target.value)
                  }
                >
                  <option value="">Category</option>
                  <option value="Parking">Parking</option>
                  <option value="Toll">Toll</option>
                  <option value="MCD">MCD</option>
                  <option value="InterstateTax">Interstate Tax</option>
                  <option value="Fuel">Fuel</option>
                  <option value="Other">Other</option>
                </select>
              </div>
              <div className="sm:col-span-2">
                <label className="block text-[10px] mb-1 text-gray-600 sm:hidden">Amount</label>
                <input
                  type="number"
                  className="border rounded px-2 py-1 h-8 text-[10px] w-full"
                  placeholder="Amount"
                  value={bi.amount}
                  onChange={(e) =>
                    updateBilling(setReceiving, idx, "amount", e.target.value)
                  }
                />
              </div>
              <div className="sm:col-span-6">
                <label className="block text-[10px] mb-1 text-gray-600 sm:hidden">Note</label>
                <input
                  type="text"
                  className="border rounded px-2 py-1 h-8 text-[10px] w-full"
                  placeholder="Note"
                  value={bi.note || ""}
                  onChange={(e) =>
                    updateBilling(setReceiving, idx, "note", e.target.value)
                  }
                />
              </div>
              <div className="sm:col-span-1 flex justify-center">
                <button
                  type="button"
                  className="text-red-600 text-sm px-2 py-1 hover:bg-red-50 rounded"
                  onClick={() => removeBilling(setReceiving, idx)}
                >
                  ×
                </button>
              </div>
            </div>
          ))}
          {msgReceiving && (
            <div className="text-[11px] mt-1">{msgReceiving}</div>
          )}
        </div>
      </div>
      
      {/* Duty Info Display */}
      {dutyInfo && (
        <div className="border rounded bg-white p-4">
          <h3 className="font-semibold text-sm mb-3">Duty Information Summary</h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 text-xs">
            <div>
              <div className="font-medium text-gray-600 mb-1">Duration</div>
              <div>{dutyInfo.formattedDuration || 'N/A'}</div>
            </div>
            <div>
              <div className="font-medium text-gray-600 mb-1">Date Range</div>
              <div>{dutyInfo.dateRange || 'N/A'}</div>
            </div>
            <div>
              <div className="font-medium text-gray-600 mb-1">Time Range</div>
              <div>{dutyInfo.timeRange || 'N/A'}</div>
            </div>
            <div>
              <div className="font-medium text-gray-600 mb-1">Duty Type</div>
              <div>{dutyInfo.dutyType || 'N/A'}</div>
            </div>
            {dutyInfo.totalKm && (
              <div>
                <div className="font-medium text-gray-600 mb-1">Total KM</div>
                <div>{dutyInfo.totalKm}</div>
              </div>
            )}
            {dutyInfo.totalHours && (
              <div>
                <div className="font-medium text-gray-600 mb-1">Total Hours</div>
                <div>{dutyInfo.totalHours}</div>
              </div>
            )}
            {dutyInfo.totalDays && (
              <div>
                <div className="font-medium text-gray-600 mb-1">Total Days</div>
                <div>{dutyInfo.totalDays}</div>
              </div>
            )}
          </div>
          {dutyInfo.notes && (
            <div className="mt-3 p-2 bg-gray-50 rounded text-sm">
              <div className="font-medium text-gray-600 mb-1">Notes</div>
              <div>{dutyInfo.notes}</div>
            </div>
          )}
        </div>
      )}
       <div className="border rounded bg-white p-4 overflow-x-auto">
        <h2 className="font-medium mb-2 text-sm">Core Data</h2>
        <table className="min-w-full text-xs">
          <thead>
            <tr>
              <th className="border px-2 py-1 text-left">Field</th>
              <th className="border px-2 py-1 text-left">Value</th>
            </tr>
          </thead>
          <tbody>
            {booking.data.map((d) => (
              <tr key={d._id}>
                <td className="border px-2 py-1">{d.key}</td>
                <td className="border px-2 py-1">
                  {d.value === "" ? "-" : String(d.value)}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Settlement Modal */}
      <Dialog open={isSettlementModalOpen} onOpenChange={setIsSettlementModalOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Settle Booking</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div className="bg-gray-50 p-3 rounded-lg text-sm">
              <div className="font-medium mb-2">Settlement Summary</div>
              <div>Expected Difference: <span className="font-medium">₹{backendTotals?.difference ?? 0}</span></div>
              <div className="text-xs text-gray-600 mt-1">
                {(backendTotals?.difference ?? 0) > 0 
                  ? "Amount will be added to driver wallet" 
                  : "Amount will be deducted from driver wallet"}
              </div>
            </div>
            
            <div className="space-y-3">
              <div>
                <Label htmlFor="adminAdjustments">Admin Adjustments (₹)</Label>
                <Input
                  id="adminAdjustments"
                  type="number"
                  value={settlementForm.adminAdjustments}
                  onChange={(e) => setSettlementForm(prev => ({
                    ...prev, 
                    adminAdjustments: Number(e.target.value) || 0
                  }))}
                  placeholder="0"
                />
                <div className="text-xs text-gray-500 mt-1">
                  Optional adjustment amount
                </div>
              </div>
              
              <div>
                <Label htmlFor="notes">Notes</Label>
                <Textarea
                  id="notes"
                  value={settlementForm.notes}
                  onChange={(e) => setSettlementForm(prev => ({
                    ...prev, 
                    notes: e.target.value
                  }))}
                  placeholder="Settlement notes (optional)"
                  rows={3}
                />
              </div>
              
              {settlementForm.adminAdjustments !== 0 && (
                <div className="bg-blue-50 p-3 rounded-lg text-sm">
                  <div className="font-medium text-blue-800 mb-1">Final Settlement</div>
                  <div className="text-blue-700">
                    Base Amount: ₹{backendTotals?.difference ?? 0}<br/>
                    Admin Adjustment: ₹{settlementForm.adminAdjustments}<br/>
                    <div className="font-medium border-t border-blue-200 pt-1 mt-1">
                      Total: ₹{(backendTotals?.difference ?? 0) + settlementForm.adminAdjustments}
                    </div>
                  </div>
                </div>
              )}
            </div>
            
            <div className="flex gap-2 pt-2">
              <Button 
                variant="outline" 
                onClick={() => setIsSettlementModalOpen(false)}
                disabled={isSettling}
                className="flex-1"
              >
                Cancel
              </Button>
              <Button 
                onClick={handleSettlement}
                disabled={isSettling}
                className="flex-1 bg-blue-600 hover:bg-blue-700"
              >
                {isSettling ? "Settling..." : "Settle Booking"}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default BookingDetailPage;

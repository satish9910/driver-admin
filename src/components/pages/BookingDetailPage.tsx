import React, { useEffect, useState, useCallback } from "react";
import { useParams, useNavigate } from "react-router-dom";
import Cookies from "js-cookie";
import { Button } from "@/components/ui/button";

interface BillingItem {
  category: string;
  amount: number;
  note?: string;
  image?: string | null;
}
interface ExpenseLike {
  _id?: string;
  dutyStartDate?: string;
  dutyEndDate?: string;
  dutyStartTime?: string;
  dutyEndTime?: string;
  dutyType?: string;
  dutyStartKm?: number;
  dutyEndKm?: number;
  notes?: string;
  billingItems?: BillingItem[];
  dailyAllowance?: number;
  outstationAllowance?: number;
  earlyStartAllowance?: number;
  nightAllowance?: number;
  overTime?: number;
  sundayAllowance?: number;
  outstationOvernightAllowance?: number;
  extraDutyAllowance?: number;
  receivedFromCompany?: number;
  receivedFromClient?: number; // only for receiving
}
interface DriverInfo {
  wallet?: { balance: number };
  name?: string;
  drivercode?: string;
}
interface BookingRecord {
  _id: string;
  data: { key: string; value: string | number | null; _id: string }[];
  primaryExpense?: ExpenseLike | null;
  receiving?: ExpenseLike | null;
  expenses?: ExpenseLike[]; // array from sample
  driver?: DriverInfo; // include driver to show wallet balance
}

const allowanceKeys = [
  "dailyAllowance",
  "outstationAllowance",
  "earlyStartAllowance",
  "nightAllowance",
  "overTime",
  "sundayAllowance",
  "outstationOvernightAllowance",
  "extraDutyAllowance",
] as const;

type AllowanceKey = (typeof allowanceKeys)[number];

const totalAllowances = (obj?: ExpenseLike | null) =>
  allowanceKeys.reduce((s, k) => s + Number(obj?.[k] || 0), 0);

const BookingDetailPage: React.FC = () => {
  const { bookingId } = useParams();
  const navigate = useNavigate();
  const token = Cookies.get("admin_token");
  const [booking, setBooking] = useState<BookingRecord | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [expense, setExpense] = useState<ExpenseLike | null>(null);
  const [receiving, setReceiving] = useState<ExpenseLike | null>(null);
  const [savingExpense, setSavingExpense] = useState(false);
  const [savingReceiving, setSavingReceiving] = useState(false);
  const [msgExpense, setMsgExpense] = useState<string | null>(null);
  const [msgReceiving, setMsgReceiving] = useState<string | null>(null);
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
  const totalExpense = expenseBillingSum + expenseAllowances;
  const totalReceiving = receivingBillingSum + receivingAllowances;
  const difference = totalExpense - totalReceiving; // positive => add to wallet, negative => deduct
  const driverBalance = booking?.driver?.wallet?.balance ?? null;
  const walletActionLabel =
    difference === 0
      ? "No wallet adjustment"
      : difference > 0
      ? `Add ₹${difference}`
      : `Deduct ₹${Math.abs(difference)}`;

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
      // choose primaryExpense if exists else first element from expenses array
      const exp =
        bk.primaryExpense ||
        (bk.expenses && bk.expenses.length ? bk.expenses[0] : null);
      setExpense(exp || null);
      setReceiving(bk.receiving || null);
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
        dutyStartDate,
        dutyEndDate,
        dutyStartTime,
        dutyEndTime,
        dutyType,
        dutyStartKm,
        dutyEndKm,
        dailyAllowance,
        outstationAllowance,
        earlyStartAllowance,
        nightAllowance,
        overTime,
        sundayAllowance,
        outstationOvernightAllowance,
        extraDutyAllowance,
        notes,
        billingItems,
      } = expense;
      const body = {
        dutyStartDate,
        dutyEndDate,
        dutyStartTime,
        dutyEndTime,
        dutyType,
        dutyStartKm,
        dutyEndKm,
        dailyAllowance,
        outstationAllowance,
        earlyStartAllowance,
        nightAllowance,
        overTime,
        sundayAllowance,
        outstationOvernightAllowance,
        extraDutyAllowance,
        notes,
        billingItems,
      };
      const res = await fetch(
        `${
          import.meta.env.VITE_BASE_UR
        }admin/update-expense-booking/${bookingId}`,
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
  const saveReceiving = async () => {
    if (!bookingId || !receiving) return;
    setSavingReceiving(true);
    setMsgReceiving(null);
    try {
      const {
        dutyStartDate,
        dutyEndDate,
        dutyStartTime,
        dutyEndTime,
        dutyType,
        dutyStartKm,
        dutyEndKm,
        dailyAllowance,
        outstationAllowance,
        earlyStartAllowance,
        nightAllowance,
        overTime,
        sundayAllowance,
        outstationOvernightAllowance,
        extraDutyAllowance,
        notes,
        billingItems,
        receivedFromCompany,
        receivedFromClient,
      } = receiving;
      const body = {
        dutyStartDate,
        dutyEndDate,
        dutyStartTime,
        dutyEndTime,
        dutyType,
        dutyStartKm,
        dutyEndKm,
        dailyAllowance,
        outstationAllowance,
        earlyStartAllowance,
        nightAllowance,
        overTime,
        sundayAllowance,
        outstationOvernightAllowance,
        extraDutyAllowance,
        notes,
        billingItems,
        receivedFromCompany,
        receivedFromClient,
      };
      const res = await fetch(
        `${
          import.meta.env.VITE_BASE_UR
        }admin/update-receiving-booking/${bookingId}`,
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
      {/* Summary Cards */}
      <div className="grid md:grid-cols-5 gap-4 text-xs">
        <div className="border rounded p-3 bg-white">
          <div className="font-semibold mb-1">Expense</div>
          <div>Billing: ₹{expenseBillingSum}</div>
          <div>Allowances: ₹{expenseAllowances}</div>
          <div className="font-medium">Total: ₹{totalExpense}</div>
        </div>
        <div className="border rounded p-3 bg-white">
          <div className="font-semibold mb-1">Receiving</div>
          <div>Billing: ₹{receivingBillingSum}</div>
          <div>Allowances: ₹{receivingAllowances}</div>
          <div className="font-medium">Total: ₹{totalReceiving}</div>
        </div>
        <div
          className={`border rounded p-3 bg-white ${
            difference === 0
              ? ""
              : difference > 0
              ? "text-green-600"
              : "text-red-600"
          }`}
        >
          <div className="font-semibold mb-1">Difference</div>
          <div className="font-medium">₹{difference}</div>
          <div className="text-[10px] mt-1">(Expense - Receiving)</div>
        </div>
        <div className="border rounded p-3 bg-white">
          <div className="font-semibold mb-1">Driver Wallet</div>
          <div>
            Current: {driverBalance !== null ? `₹${driverBalance}` : "-"}
          </div>
          {driverBalance !== null && difference !== 0 && (
            <div className="mt-1 text-[10px]">
              After: ₹{driverBalance + difference}
            </div>
          )}
        </div>
        <div className="border rounded p-3 bg-white flex flex-col justify-between">
          <div className="font-semibold mb-1">Wallet Action</div>
          <div className="font-medium">{walletActionLabel}</div>
          <div className="text-[10px] mt-1">Not yet applied</div>
        </div>
      </div>
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
      <div className="grid md:grid-cols-2 gap-6">
        {/* Expense */}
        <div className="border rounded bg-white p-4">
          <div className="flex justify-between mb-3 items-center">
            <h3 className="font-semibold text-sm">Expense</h3>
            <div className="flex gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() =>
                  setExpense(
                    booking.primaryExpense || booking.expenses?.[0] || null
                  )
                }
              >
                Reset
              </Button>
              <Button size="sm" disabled={savingExpense} onClick={saveExpense}>
                {savingExpense ? "Saving..." : "Save"}
              </Button>
            </div>
          </div>
          {!expense && (
            <div className="text-xs text-muted-foreground mb-2">
              No expense yet
            </div>
          )}
          <div className="grid grid-cols-2 gap-3 mb-4">
            <input
              type="date"
              className="border rounded px-2 py-1 h-8 text-xs"
              value={expense?.dutyStartDate?.substring(0, 10) || ""}
              onChange={(e) =>
                updateExp(setExpense, "dutyStartDate", e.target.value)
              }
            />
            <input
              type="time"
              className="border rounded px-2 py-1 h-8 text-xs"
              value={expense?.dutyStartTime || ""}
              onChange={(e) =>
                updateExp(setExpense, "dutyStartTime", e.target.value)
              }
            />
            <input
              type="date"
              className="border rounded px-2 py-1 h-8 text-xs"
              value={expense?.dutyEndDate?.substring(0, 10) || ""}
              onChange={(e) =>
                updateExp(setExpense, "dutyEndDate", e.target.value)
              }
            />
            <input
              type="time"
              className="border rounded px-2 py-1 h-8 text-xs"
              value={expense?.dutyEndTime || ""}
              onChange={(e) =>
                updateExp(setExpense, "dutyEndTime", e.target.value)
              }
            />
            <input
              type="number"
              placeholder="Start Km"
              className="border rounded px-2 py-1 h-8 text-xs"
              value={expense?.dutyStartKm ?? ""}
              onChange={(e) =>
                updateExp(setExpense, "dutyStartKm", e.target.value)
              }
            />
            <input
              type="number"
              placeholder="End Km"
              className="border rounded px-2 py-1 h-8 text-xs"
              value={expense?.dutyEndKm ?? ""}
              onChange={(e) =>
                updateExp(setExpense, "dutyEndKm", e.target.value)
              }
            />
            <input
              type="text"
              placeholder="Duty Type"
              className="border rounded px-2 py-1 h-8 text-xs"
              value={expense?.dutyType || ""}
              onChange={(e) =>
                updateExp(setExpense, "dutyType", e.target.value)
              }
            />
            <input
              type="text"
              placeholder="Notes"
              className="border rounded px-2 py-1 h-8 text-xs"
              value={expense?.notes || ""}
              onChange={(e) => updateExp(setExpense, "notes", e.target.value)}
            />
          </div>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-3 mb-4">
            {allowanceKeys.map((k) => (
              <div key={k}>
                <label className="block text-[10px] mb-1 capitalize">{k}</label>
                <input
                  type="number"
                  className="border rounded px-2 py-1 h-8 text-xs"
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
              className="grid grid-cols-12 gap-2 items-center mb-2"
            >
              <select
                className="col-span-3 border rounded px-2 py-1 h-8 text-[10px]"
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
              <input
                type="number"
                className="col-span-2 border rounded px-2 py-1 h-8 text-[10px]"
                value={bi.amount}
                onChange={(e) =>
                  updateBilling(setExpense, idx, "amount", e.target.value)
                }
              />
              <input
                type="text"
                className="col-span-6 border rounded px-2 py-1 h-8 text-[10px]"
                placeholder="Note"
                value={bi.note || ""}
                onChange={(e) =>
                  updateBilling(setExpense, idx, "note", e.target.value)
                }
              />
              <button
                type="button"
                className="col-span-1 text-red-600 text-[10px]"
                onClick={() => removeBilling(setExpense, idx)}
              >
                X
              </button>
            </div>
          ))}
          {msgExpense && <div className="text-[11px] mt-1">{msgExpense}</div>}
        </div>
        {/* Receiving */}
        <div className="border rounded bg-white p-4">
          <div className="flex justify-between mb-3 items-center">
            <h3 className="font-semibold text-sm">Receiving</h3>
            <div className="flex gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setReceiving(booking.receiving || null)}
              >
                Reset
              </Button>
              <Button
                size="sm"
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
          <div className="grid grid-cols-2 gap-3 mb-4">
            <input
              type="date"
              className="border rounded px-2 py-1 h-8 text-xs"
              value={receiving?.dutyStartDate?.substring(0, 10) || ""}
              onChange={(e) =>
                updateExp(setReceiving, "dutyStartDate", e.target.value)
              }
            />
            <input
              type="time"
              className="border rounded px-2 py-1 h-8 text-xs"
              value={receiving?.dutyStartTime || ""}
              onChange={(e) =>
                updateExp(setReceiving, "dutyStartTime", e.target.value)
              }
            />
            <input
              type="date"
              className="border rounded px-2 py-1 h-8 text-xs"
              value={receiving?.dutyEndDate?.substring(0, 10) || ""}
              onChange={(e) =>
                updateExp(setReceiving, "dutyEndDate", e.target.value)
              }
            />
            <input
              type="time"
              className="border rounded px-2 py-1 h-8 text-xs"
              value={receiving?.dutyEndTime || ""}
              onChange={(e) =>
                updateExp(setReceiving, "dutyEndTime", e.target.value)
              }
            />
            <input
              type="number"
              placeholder="Start Km"
              className="border rounded px-2 py-1 h-8 text-xs"
              value={receiving?.dutyStartKm ?? ""}
              onChange={(e) =>
                updateExp(setReceiving, "dutyStartKm", e.target.value)
              }
            />
            <input
              type="number"
              placeholder="End Km"
              className="border rounded px-2 py-1 h-8 text-xs"
              value={receiving?.dutyEndKm ?? ""}
              onChange={(e) =>
                updateExp(setReceiving, "dutyEndKm", e.target.value)
              }
            />
            <input
              type="text"
              placeholder="Duty Type"
              className="border rounded px-2 py-1 h-8 text-xs"
              value={receiving?.dutyType || ""}
              onChange={(e) =>
                updateExp(setReceiving, "dutyType", e.target.value)
              }
            />
            <input
              type="text"
              placeholder="Notes"
              className="border rounded px-2 py-1 h-8 text-xs"
              value={receiving?.notes || ""}
              onChange={(e) => updateExp(setReceiving, "notes", e.target.value)}
            />
            <input
              type="number"
              placeholder="Received Company"
              className="border rounded px-2 py-1 h-8 text-xs"
              value={receiving?.receivedFromCompany ?? ""}
              onChange={(e) =>
                updateExp(setReceiving, "receivedFromCompany", e.target.value)
              }
            />
            <input
              type="number"
              placeholder="Received Client"
              className="border rounded px-2 py-1 h-8 text-xs"
              value={receiving?.receivedFromClient ?? ""}
              onChange={(e) =>
                updateExp(setReceiving, "receivedFromClient", e.target.value)
              }
            />
          </div>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-3 mb-4">
            {allowanceKeys.map((k) => (
              <div key={k}>
                <label className="block text-[10px] mb-1 capitalize">{k}</label>
                <input
                  type="number"
                  className="border rounded px-2 py-1 h-8 text-xs"
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
              className="grid grid-cols-12 gap-2 items-center mb-2"
            >
              <select
                className="col-span-3 border rounded px-2 py-1 h-8 text-[10px]"
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
              <input
                type="number"
                className="col-span-2 border rounded px-2 py-1 h-8 text-[10px]"
                value={bi.amount}
                onChange={(e) =>
                  updateBilling(setReceiving, idx, "amount", e.target.value)
                }
              />
              <input
                type="text"
                className="col-span-6 border rounded px-2 py-1 h-8 text-[10px]"
                placeholder="Note"
                value={bi.note || ""}
                onChange={(e) =>
                  updateBilling(setReceiving, idx, "note", e.target.value)
                }
              />
              <button
                type="button"
                className="col-span-1 text-red-600 text-[10px]"
                onClick={() => removeBilling(setReceiving, idx)}
              >
                X
              </button>
            </div>
          ))}
          {msgReceiving && (
            <div className="text-[11px] mt-1">{msgReceiving}</div>
          )}
        </div>
      </div>
    </div>
  );
};

export default BookingDetailPage;

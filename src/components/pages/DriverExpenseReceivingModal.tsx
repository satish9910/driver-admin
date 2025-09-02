import { useState, useEffect, useMemo } from "react";
import Cookies from "js-cookie";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";

interface FuelExpenseItem {
  fuel: string;
  meter: string;
  location: string;
  amount: number;
  date: string;
  image?: string | null;
}

interface ExpenseReceivingNested {
  dailyAllowance?: number;
  outstationAllowance?: number;
  earlyStartAllowance?: number;
  nightAllowance?: number;
  receivedFromCompany?: number;
  receivedFromClient?: number;
  notes?: string;
  totalAllowances?: number;
  // optional extra fields present in some payloads
  outstationOvernightAllowance?: number;
  sundayAllowance?: number;
  extraDutyAllowance?: number;
  overTime?: number;
}

interface Expense {
  _id: string;
  bookingId?: string;
  tripRoute?: string | null;
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
  fuelExpense?: FuelExpenseItem[];
  receiving?: ExpenseReceivingNested; // nested receiving (from primaryExpense in sample)
  createdAt?: string;
  updatedAt?: string;
}

interface Receiving extends ExpenseReceivingNested {
  _id: string;
  bookingId?: string;
  userId?: string;
  createdAt?: string;
  updatedAt?: string;
}

interface Props {
  open: boolean;
  onClose: () => void;
  expense: Expense | null; // primary expense (may be null)
  receiving: Receiving | null; // separate receiving record (may be null)
  onSaved?: () => void; // callback to refresh parent list
}

// Field configuration for rendering numeric editable inputs for expense & receiving
const EXPENSE_FIELDS: { key: keyof Expense; label: string }[] = [
  { key: "driverCharge", label: "Driver Charge" },
  { key: "cashToll", label: "Cash Toll" },
  { key: "cashParking", label: "Cash Parking" },
  { key: "otherCash", label: "Other Cash" },
  { key: "dutyAmount", label: "Duty Amount" },
  { key: "advanceAmount", label: "Advance Amount" },
  { key: "dutyExpenses", label: "Duty Expenses" },
  { key: "advanceFromCompany", label: "Advance From Company" },
  { key: "officeTransfer", label: "Office Transfer" },
];

const RECEIVING_FIELDS: { key: keyof ExpenseReceivingNested; label: string }[] = [
  { key: "dailyAllowance", label: "Daily Allowance" },
  { key: "outstationAllowance", label: "Outstation Allowance" },
  { key: "earlyStartAllowance", label: "Early Start Allowance" },
  { key: "nightAllowance", label: "Night Allowance" },
  { key: "outstationOvernightAllowance", label: "Outstation Overnight" },
  { key: "sundayAllowance", label: "Sunday Allowance" },
  { key: "extraDutyAllowance", label: "Extra Duty Allowance" },
  { key: "overTime", label: "Over Time" },
  { key: "receivedFromCompany", label: "Received From Company" },
  { key: "receivedFromClient", label: "Received From Client" },
];

export function DriverExpenseReceivingModal({ open, onClose, expense, receiving, onSaved }: Props) {
  const token = Cookies.get("admin_token");

  // local clones for editing
  const [localExpense, setLocalExpense] = useState<Expense | null>(expense);
  const [localReceiving, setLocalReceiving] = useState<Receiving | null>(receiving);
  const [editing, setEditing] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  // sync when prop changes
  useEffect(() => {
    setLocalExpense(expense);
    setLocalReceiving(receiving);
    setEditing(false);
    setError(null);
    setSuccess(null);
  }, [expense, receiving, open]);

  const baseUrl = import.meta.env.VITE_BASE_UR;

  const totalAllowancesComputed = useMemo(() => {
    if (!localReceiving) return 0;
    const allowKeys: (keyof ExpenseReceivingNested)[] = [
      "dailyAllowance",
      "outstationAllowance",
      "earlyStartAllowance",
      "nightAllowance",
      "outstationOvernightAllowance",
      "sundayAllowance",
      "extraDutyAllowance",
    ];
    return allowKeys.reduce((sum, k) => sum + (Number(localReceiving[k]) || 0), 0);
  }, [localReceiving]);

  const handleExpenseChange = (key: keyof Expense, value: string) => {
    if (!localExpense) return;
    setLocalExpense({ ...localExpense, [key]: value === "" ? undefined : Number(value) });
  };

  const handleReceivingChange = (key: keyof ExpenseReceivingNested, value: string) => {
    if (!localReceiving) return;
    // string fields (notes) keep as string
    if (key === "notes") {
      setLocalReceiving({ ...localReceiving, [key]: value });
    } else {
      setLocalReceiving({ ...localReceiving, [key]: value === "" ? undefined : Number(value) });
    }
  };

  type PlainObj = Record<string, unknown>;
  const diffObject = <T extends PlainObj>(original: T | null, updated: T | null, allowed: string[]) => {
    if (!original || !updated) return null;
  const diff: Record<string, unknown> = {};
    allowed.forEach((k) => {
      if (original[k] !== updated[k]) diff[k] = updated[k];
    });
    return Object.keys(diff).length ? diff : null;
  };

  const saveChanges = async () => {
    setSaving(true);
    setError(null);
    setSuccess(null);
    try {
  const expenseDiff = diffObject(expense as unknown as PlainObj, localExpense as unknown as PlainObj, EXPENSE_FIELDS.map(f => f.key as string));
  const receivingDiff = diffObject(receiving as unknown as PlainObj, localReceiving as unknown as PlainObj, [
        ...RECEIVING_FIELDS.map(f => f.key as string),
        "notes",
      ]);

  const requests: Promise<unknown>[] = [];
      if (expense && expenseDiff && Object.keys(expenseDiff).length) {
        const url = `${baseUrl}admin/expenses/${expense._id}`; // assumption: confirm with backend
        requests.push(fetch(url, {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
            body: JSON.stringify(expenseDiff),
        }).then(r => {
          if (!r.ok) throw new Error("Failed to update expense");
          return r.json();
        }));
      }
      if (receiving && receivingDiff && Object.keys(receivingDiff).length) {
        const url = `${baseUrl}admin/receiving/${receiving._id}`; // assumption: confirm with backend
        requests.push(fetch(url, {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
            body: JSON.stringify(receivingDiff),
        }).then(r => {
          if (!r.ok) throw new Error("Failed to update receiving");
          return r.json();
        }));
      }

      if (!requests.length) {
        setSuccess("No changes to save");
        setSaving(false);
        setEditing(false);
        return;
      }
      await Promise.all(requests);
      setSuccess("Updated successfully");
      setEditing(false);
      onSaved?.();
    } catch (e: unknown) {
      const msg = e instanceof Error ? e.message : "Save failed";
      setError(msg);
    } finally {
      setSaving(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-5xl">
        <DialogHeader>
          <DialogTitle>Expense & Receiving Details</DialogTitle>
        </DialogHeader>
        <ScrollArea className="max-h-[70vh] pr-4">
          {!expense && !receiving && (
            <div className="text-sm text-muted-foreground py-6 text-center">No expense / receiving data for this booking.</div>
          )}

          {expense && (
            <section className="mb-6">
              <div className="flex items-center justify-between mb-2">
                <h3 className="font-semibold">Expense</h3>
                {editing ? null : (
                  <Button variant="outline" size="sm" onClick={() => setEditing(true)}>Edit</Button>
                )}
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
                {EXPENSE_FIELDS.map(f => (
                  <div key={String(f.key)}>
                    <label className="block text-xs font-medium mb-1 text-muted-foreground">{f.label}</label>
                    {editing ? (
                      <Input
                        type="number"
                        value={typeof localExpense?.[f.key] === 'number' || typeof localExpense?.[f.key] === 'string' ? (localExpense?.[f.key] as number | string) : ""}
                        onChange={e => handleExpenseChange(f.key, e.target.value)}
                        className="h-8"
                      />
                    ) : (
                      <div className="text-sm">{typeof expense[f.key] === 'number' || typeof expense[f.key] === 'string' ? String(expense[f.key]) : '0'}</div>
                    )}
                  </div>
                ))}
                <div>
                  <label className="block text-xs font-medium mb-1 text-muted-foreground">Total Driver Expense</label>
                  <div className="text-sm">{expense.totalDriverExpense ?? 0}</div>
                </div>
              </div>

              {expense.fuelExpense?.length ? (
                <div className="mt-4">
                  <h4 className="text-sm font-medium mb-2">Fuel Entries</h4>
                  <div className="border rounded-md divide-y">
                    {expense.fuelExpense.map((f, i) => (
                      <div key={i} className="p-2 text-xs grid grid-cols-2 sm:grid-cols-4 md:grid-cols-6 gap-2">
                        <span><strong>Fuel:</strong> {f.fuel}</span>
                        <span><strong>Meter:</strong> {f.meter}</span>
                        <span className="col-span-2 sm:col-span-1"><strong>Amt:</strong> {f.amount}</span>
                        <span className="col-span-2 md:col-span-2"><strong>Loc:</strong> {f.location}</span>
                        <span><strong>Date:</strong> {new Date(f.date).toLocaleString()}</span>
                      </div>
                    ))}
                  </div>
                </div>
              ) : null}
            </section>
          )}

          {receiving && (
            <section className="mb-6">
              <h3 className="font-semibold mb-2">Receiving</h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
                {RECEIVING_FIELDS.map(f => (
                  <div key={String(f.key)}>
                    <label className="block text-xs font-medium mb-1 text-muted-foreground">{f.label}</label>
                    {editing ? (
                      <Input
                        type="number"
                        value={localReceiving?.[f.key] ?? ""}
                        onChange={e => handleReceivingChange(f.key, e.target.value)}
                        className="h-8"
                      />
                    ) : (
                      <div className="text-sm">{receiving[f.key] ?? 0}</div>
                    )}
                  </div>
                ))}
                <div className="md:col-span-3">
                  <label className="block text-xs font-medium mb-1 text-muted-foreground">Notes</label>
                  {editing ? (
                    <Input
                      type="text"
                      value={localReceiving?.notes ?? ""}
                      onChange={e => handleReceivingChange("notes", e.target.value)}
                      className="h-8"
                    />
                  ) : (
                    <div className="text-sm break-words">{receiving.notes || "-"}</div>
                  )}
                </div>
                <div>
                  <label className="block text-xs font-medium mb-1 text-muted-foreground">Total Allowances (computed)</label>
                  <div className="text-sm">{totalAllowancesComputed}</div>
                </div>
              </div>
            </section>
          )}

          {error && <div className="text-sm text-red-600 mt-2">{error}</div>}
          {success && <div className="text-sm text-green-600 mt-2">{success}</div>}
        </ScrollArea>
        <DialogFooter className="flex items-center gap-2 justify-end">
          {editing ? (
            <>
              <Button variant="outline" disabled={saving} onClick={() => {
                setLocalExpense(expense);
                setLocalReceiving(receiving);
                setEditing(false);
                setError(null);
                setSuccess(null);
              }}>Cancel</Button>
              <Button onClick={saveChanges} disabled={saving}>{saving ? "Saving..." : "Save"}</Button>
            </>
          ) : (
            <Button variant="outline" onClick={onClose}>Close</Button>
          )}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

export default DriverExpenseReceivingModal;
// ExpenseModal.tsx
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";

interface Expense {
  _id: string;
  bookingId: string;
  tripRoute: string | null;
  driverCharge: number;
  cashToll: number;
  cashParking: number;
  otherCash: number;
  fuelExpense: {
    fuel: string;
    meter: string;
    location: string;
    amount: number;
    date: string;
  }[];
  totalDriverExpense: number;
  dutyAmount: number;
  advanceAmount: number;
  dutyExpenses: number;
  advanceFromCompany: number;
  officeTransfer: number;
  balanceDriver: number;
  balanceCompany: number;
  createdAt: string;
  updatedAt: string;
}

interface ExpenseModalProps {
  isOpen: boolean;
  onClose: () => void;
  expenses: Expense[];
}

export function ExpenseModal({ isOpen, onClose, expenses }: ExpenseModalProps) {
  if (!expenses || expenses.length === 0) {
    return (
      <Dialog open={isOpen} onOpenChange={onClose}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Expense Details</DialogTitle>
          </DialogHeader>
          <div className="py-4 text-center text-gray-500">
            No expenses recorded for this booking
          </div>
        </DialogContent>
      </Dialog>
    );
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Expense Details</DialogTitle>
        </DialogHeader>
        
        {expenses.map((expense, index) => (
          <div key={expense._id} className="space-y-4 mb-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <h3 className="font-semibold">Basic Expenses</h3>
                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <p className="text-sm text-gray-500">Driver Charge</p>
                    <p>₹{expense.driverCharge}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-500">Cash Toll</p>
                    <p>₹{expense.cashToll}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-500">Cash Parking</p>
                    <p>₹{expense.cashParking}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-500">Other Cash</p>
                    <p>₹{expense.otherCash}</p>
                  </div>
                </div>
              </div>

              <div className="space-y-2">
                <h3 className="font-semibold">Financial Summary</h3>
                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <p className="text-sm text-gray-500">Total Driver Expense</p>
                    <p>₹{expense.totalDriverExpense}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-500">Duty Amount</p>
                    <p>₹{expense.dutyAmount}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-500">Advance Amount</p>
                    <p>₹{expense.advanceAmount}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-500">Balance Driver</p>
                    <p>₹{expense.balanceDriver}</p>
                  </div>
                </div>
              </div>
            </div>

            {expense.fuelExpense && expense.fuelExpense.length > 0 && (
              <div className="space-y-2">
                <h3 className="font-semibold">Fuel Expenses</h3>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Fuel Type</TableHead>
                      <TableHead>Meter Reading</TableHead>
                      <TableHead>Location</TableHead>
                      <TableHead>Amount</TableHead>
                      <TableHead>Date</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {expense.fuelExpense.map((fuel, idx) => (
                      <TableRow key={idx}>
                        <TableCell>{fuel.fuel}</TableCell>
                        <TableCell>{fuel.meter}</TableCell>
                        <TableCell>{fuel.location}</TableCell>
                        <TableCell>₹{fuel.amount}</TableCell>
                        <TableCell>
                          {new Date(fuel.date).toLocaleString()}
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            )}

            {index < expenses.length - 1 && <hr className="my-4" />}
          </div>
        ))}
      </DialogContent>
    </Dialog>
  );
}

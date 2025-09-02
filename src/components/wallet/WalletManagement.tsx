import { useState, useEffect, useCallback } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Search,
  Plus,
  Minus,
  MoreHorizontal,
  Eye,
  Download,
  Filter,
  User,
  Users,
} from "lucide-react";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { UserSelect } from "./UserSelect";
import Cookies from "js-cookie";

interface User {
  _id: string;
  name: string;
  email: string;
}

interface Admin {
  _id: string;
  name: string;
  email: string;
  role: "admin" | "subadmin";
}

interface Transaction {
  _id: string;
  fromAdminId: string;
  userId?: User;
  adminId?: Admin;
  amount: number;
  type: "credit" | "debit";
  description: string;
  balanceAfter: number;
  category: "admin_wallet" | "user_wallet" | "transfer";
  date: string;
  createdAt: string;
  updatedAt: string;
}

interface CurrentAdmin {
  id: string;
  name: string;
  email: string;
  role: "admin" | "subadmin";
  permissions: string[];
}

interface SubAdminBrief {
  _id: string;
  name: string;
  email: string;
  role: "subadmin";
  wallet?: { balance?: number };
}

export function WalletManagement() {
  const [searchTerm, setSearchTerm] = useState("");
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [isDeductDialogOpen, setIsDeductDialogOpen] = useState(false);
  const [isTransferUserOpen, setIsTransferUserOpen] = useState(false);
  const [isTransferAdminOpen, setIsTransferAdminOpen] = useState(false);
  const [currentAdmin, setCurrentAdmin] = useState<CurrentAdmin | null>(null);
  const [walletBalance, setWalletBalance] = useState(0);
  const isMainAdmin = currentAdmin?.role === "admin";
  const [walletSummary, setWalletSummary] = useState({
    totalCredit: 0,
    totalDebit: 0,
    transactionsCount: 0,
  });
  const [addFormData, setAddFormData] = useState({
    amount: "",
    description: "Initial balance added by admin",
  });
  const [deductFormData, setDeductFormData] = useState({
    amount: "",
    description: "Amount deducted by admin",
  });
  const [transferUserForm, setTransferUserForm] = useState({
    userId: "",
    amount: "",
    description: "Initial balance added by sub admin",
  });
  const [transferAdminForm, setTransferAdminForm] = useState({
    targetAdminId: "",
    amount: "",
    description: "Initial balance added by sub admin",
  });
  const [subAdmins, setSubAdmins] = useState<SubAdminBrief[]>([]);
  const [subAdminsLoading, setSubAdminsLoading] = useState(false);
  const [adding, setAdding] = useState(false);
  const [deducting, setDeducting] = useState(false);
  const [transferringUser, setTransferringUser] = useState(false);
  const [transferringAdmin, setTransferringAdmin] = useState(false);

  const token = Cookies.get("admin_token");
  const adminData = Cookies.get("user_data");

  useEffect(() => {
    if (adminData) {
      try {
        const parsedAdmin = JSON.parse(adminData);
        setCurrentAdmin(parsedAdmin);
      } catch (err) {
        console.error("Failed to parse admin data from cookie", err);
      }
    }
  }, [adminData]);

  // This effect will run after callbacks are declared (see below)

  const fetchWalletBalance = useCallback(async () => {
    if (!currentAdmin) return;

    try {
      const response = await fetch(
        `${import.meta.env.VITE_BASE_UR}admin/wallet/${currentAdmin.id}`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      if (!response.ok) {
        throw new Error("Failed to fetch wallet balance");
      }

      const data = await response.json();
      if (data && data.wallet) {
        const bal = typeof data.wallet.balance === "number" ? data.wallet.balance : 0;
        const totalCredit = typeof data.wallet.totalCredit === "number" ? data.wallet.totalCredit : 0;
        const totalDebit = typeof data.wallet.totalDebit === "number" ? data.wallet.totalDebit : 0;
        const transactionsCount = typeof data.wallet.transactionsCount === "number" ? data.wallet.transactionsCount : 0;
        setWalletBalance(bal);
        setWalletSummary({ totalCredit, totalDebit, transactionsCount });
      } else {
        throw new Error(data.message || "Failed to fetch wallet balance");
      }
    } catch (err) {
      console.error("Error fetching wallet balance:", err);
      setError(err instanceof Error ? err.message : "An unknown error occurred");
    }
  }, [currentAdmin, token]);

  const fetchTransactions = useCallback(async () => {
    try {
      const response = await fetch(
        `${import.meta.env.VITE_BASE_UR}admin/transactions`,
        {
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
        }
      );

      if (!response.ok) {
        throw new Error("Failed to fetch transactions");
      }

      const data = await response.json();
      if (data) {
        setTransactions(data || []);
      } else {
        throw new Error(data.message || "Failed to fetch transactions");
      }
    } catch (err) {
      console.error("Error fetching transactions:", err);
      setError(err instanceof Error ? err.message : "An unknown error occurred");
    } finally {
      setLoading(false);
    }
  }, [token]);

  const fetchSubAdmins = useCallback(async () => {
    try {
      setSubAdminsLoading(true);
      const res = await fetch(`${import.meta.env.VITE_BASE_UR}admin/sub-admins`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      if (!res.ok) throw new Error("Failed to fetch sub-admins");
      const data = await res.json();
      if (data && Array.isArray(data.subAdmins)) {
        setSubAdmins(data.subAdmins as SubAdminBrief[]);
      } else {
        throw new Error(data.message || "Invalid sub-admins response");
      }
    } catch (err) {
      console.error("Error fetching sub-admins:", err);
      toast.error(err instanceof Error ? err.message : "An unknown error occurred");
    } finally {
      setSubAdminsLoading(false);
    }
  }, [token]);

  useEffect(() => {
    if (currentAdmin) {
      fetchWalletBalance();
      fetchTransactions();
    }
  }, [currentAdmin, fetchWalletBalance, fetchTransactions]);

  // Load sub-admins when opening the transfer dialog
  useEffect(() => {
    if (isTransferAdminOpen && subAdmins.length === 0) {
      fetchSubAdmins();
    }
  }, [isTransferAdminOpen, subAdmins.length, fetchSubAdmins]);

  const handleAddMoney = async () => {
    if (!currentAdmin || !addFormData.amount) {
      toast.error("Amount is required");
      return;
    }
    if (!isMainAdmin) {
      toast.error("Not allowed for sub admin");
      return;
    }

    try {
  setAdding(true);
      const response = await fetch(
        `${import.meta.env.VITE_BASE_UR}admin/add-money`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({
            adminId: currentAdmin.id,
            amount: parseFloat(addFormData.amount),
            type: "credit",
            description: addFormData.description,
          }),
        }
      );

      if (!response.ok) {
        throw new Error("Failed to add money");
      }

      const data = await response.json();
      if (data) {
        toast.success("Money added successfully");
        setIsAddDialogOpen(false);
        setAddFormData({
          amount: "",
          description: "Initial balance added by admin",
        });
        fetchWalletBalance();
        fetchTransactions();
      } else {
        throw new Error(data.message || "Failed to add money");
      }
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "An unknown error occurred");
    } finally {
      setAdding(false);
    }
  };

  const handleDeductMoney = async () => {
    if (!currentAdmin || !deductFormData.amount) {
      toast.error("Amount is required");
      return;
    }
    if (!isMainAdmin) {
      toast.error("Not allowed for sub admin");
      return;
    }

    const amount = parseFloat(deductFormData.amount);
    if (amount > walletBalance) {
      toast.error("Insufficient balance");
      return;
    }

    try {
  setDeducting(true);
      const response = await fetch(
        `${import.meta.env.VITE_BASE_UR}admin/deduct-money`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({
            adminId: currentAdmin.id,
            amount: amount,
            type: "debit",
            description: deductFormData.description,
          }),
        }
      );

      if (!response.ok) {
        throw new Error("Failed to deduct money");
      }

      const data = await response.json();
      if (data) {
        toast.success("Money deducted successfully");
        setIsDeductDialogOpen(false);
        setDeductFormData({
          amount: "",
          description: "Amount deducted by admin",
        });
        fetchWalletBalance();
        fetchTransactions();
      } else {
        throw new Error(data.message || "Failed to deduct money");
      }
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "An unknown error occurred");
    } finally {
      setDeducting(false);
    }
  };

  const handleTransferToUser = async () => {
    if (!currentAdmin) return;
    const { userId, amount, description } = transferUserForm;
    if (!userId || !amount) {
      toast.error("User ID and amount are required");
      return;
    }
    const amt = parseFloat(amount);
    if (isNaN(amt) || amt <= 0) {
      toast.error("Enter a valid amount");
      return;
    }
    if (amt > walletBalance) {
      toast.error("Insufficient balance");
      return;
    }
    try {
      setTransferringUser(true);
      const res = await fetch(`${import.meta.env.VITE_BASE_UR}admin/transfer-to-user`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ userId, amount: amt, description }),
      });
      if (!res.ok) throw new Error("Failed to transfer to user");
      const data = await res.json();
      if (data) {
        toast.success("Amount transferred to user");
        setIsTransferUserOpen(false);
        setTransferUserForm({ userId: "", amount: "", description: "Initial balance added by sub admin" });
        fetchWalletBalance();
        fetchTransactions();
      } else {
        throw new Error(data.message || "Failed to transfer to user");
      }
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "An unknown error occurred");
    } finally {
      setTransferringUser(false);
    }
  };

  const handleTransferToAdmin = async () => {
    if (!currentAdmin) return;
    if (!isMainAdmin) {
      toast.error("Not allowed for sub admin");
      return;
    }
    const { targetAdminId, amount, description } = transferAdminForm;
    if (!targetAdminId || !amount) {
      toast.error("Target Admin ID and amount are required");
      return;
    }
    const amt = parseFloat(amount);
    if (isNaN(amt) || amt <= 0) {
      toast.error("Enter a valid amount");
      return;
    }
    if (amt > walletBalance) {
      toast.error("Insufficient balance");
      return;
    }
    try {
      setTransferringAdmin(true);
      const res = await fetch(`${import.meta.env.VITE_BASE_UR}admin/transfer-to-admin`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ targetAdminId, amount: amt, description }),
      });
      if (!res.ok) throw new Error("Failed to transfer to sub admin");
      const data = await res.json();
      if (data) {
        toast.success("Amount transferred to sub admin");
        setIsTransferAdminOpen(false);
        setTransferAdminForm({ targetAdminId: "", amount: "", description: "Initial balance added by sub admin" });
        fetchWalletBalance();
        fetchTransactions();
      } else {
        throw new Error(data.message || "Failed to transfer to sub admin");
      }
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "An unknown error occurred");
    } finally {
      setTransferringAdmin(false);
    }
  };

  const filteredTransactions = transactions.filter((transaction) => {
    const matchesSearch =
      transaction.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
      transaction.amount.toString().includes(searchTerm) ||
      transaction.type.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (transaction.userId && transaction.userId.name.toLowerCase().includes(searchTerm.toLowerCase())) ||
      (transaction.adminId && transaction.adminId.name.toLowerCase().includes(searchTerm.toLowerCase()));
    return matchesSearch;
  });

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString() + " " + date.toLocaleTimeString();
  };

  const getTransactionType = (transaction: Transaction) => {
    if (transaction.category === "admin_wallet") {
      return transaction.type === "credit" ? "Admin Wallet Credit" : "Admin Wallet Debit";
    } else if (transaction.category === "user_wallet") {
      return transaction.type === "credit" ? "User Wallet Credit" : "User Wallet Debit";
    } else {
      return "Transfer";
    }
  };

  const getTransactionParty = (transaction: Transaction) => {
    if (transaction.userId) {
      return {
        type: "user",
        name: transaction.userId.name,
        email: transaction.userId.email
      };
    } else if (transaction.adminId) {
      return {
        type: "admin",
        name: transaction.adminId.name,
        email: transaction.adminId.email,
        role: transaction.adminId.role
      };
    }
    return null;
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        Loading wallet information...
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex justify-center items-center h-64 text-red-500">
        {error}
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Wallet Summary */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Wallet Balance</CardTitle>
            <Badge variant="outline" className="text-xs">
              {currentAdmin?.role}
            </Badge>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">₹{walletBalance.toFixed(2)}</div>
            <p className="text-xs text-muted-foreground">
              {currentAdmin?.name} ({currentAdmin?.email})
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Credits</CardTitle>
            <Plus className="h-4 w-4 text-green-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-500">
              ₹
              {(walletSummary.totalCredit ||
                transactions
                  .filter((t) => t.type === "credit")
                  .reduce((sum, t) => sum + t.amount, 0))
                .toFixed(2)}
            </div>
            <p className="text-xs text-muted-foreground">
              All time credit transactions
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Debits</CardTitle>
            <Minus className="h-4 w-4 text-red-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-500">
              ₹
              {(walletSummary.totalDebit ||
                transactions
                  .filter((t) => t.type === "debit")
                  .reduce((sum, t) => sum + t.amount, 0))
                .toFixed(2)}
            </div>
            <p className="text-xs text-muted-foreground">
              All time debit transactions
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Header with Search and Actions */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between space-y-4 sm:space-y-0">
        <div className="flex items-center space-x-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
            <Input
              placeholder="Search transactions..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-64 pl-10"
            />
          </div>
        </div>
  <div className="flex space-x-2">
          <Dialog
            open={isTransferUserOpen}
            onOpenChange={(open) => {
              if (!open && transferringUser) return; // prevent closing during submit
              setIsTransferUserOpen(open);
            }}
          >
            <DialogTrigger asChild>
              <Button variant="outline" className="bg-blue-50 text-blue-700 hover:bg-blue-100">
                <User className="h-4 w-4 mr-2" />
                Transfer to User
              </Button>
            </DialogTrigger>
            <DialogContent
              onInteractOutside={(e) => {
                if (transferringUser) e.preventDefault();
              }}
              onEscapeKeyDown={(e) => {
                if (transferringUser) e.preventDefault();
              }}
            >
              <DialogHeader>
                <DialogTitle>Transfer to User</DialogTitle>
              </DialogHeader>
              <div className="space-y-4">
                <div>
                  <Label>Choose User</Label>
                  <UserSelect
                    value={transferUserForm.userId}
                    onChange={(v) => setTransferUserForm({ ...transferUserForm, userId: v })}
                    placeholder="Select a user"
                  />
                </div>
                <div>
                  <Label htmlFor="user-amount">Amount (₹)</Label>
                  <Input
                    id="user-amount"
                    type="number"
                    min="0"
                    step="0.01"
                    value={transferUserForm.amount}
                    onChange={(e) => setTransferUserForm({ ...transferUserForm, amount: e.target.value })}
                    placeholder="Enter amount"
                  />
                </div>
                <div>
                  <Label htmlFor="user-description">Description</Label>
                  <Input
                    id="user-description"
                    value={transferUserForm.description}
                    onChange={(e) => setTransferUserForm({ ...transferUserForm, description: e.target.value })}
                    placeholder="Enter description"
                  />
                </div>
                <div className="flex justify-end space-x-2">
                  <Button variant="outline" onClick={() => setIsTransferUserOpen(false)} disabled={transferringUser}>Cancel</Button>
                  <Button onClick={handleTransferToUser} disabled={transferringUser || !transferUserForm.userId || !transferUserForm.amount}>
                    {transferringUser ? "Transferring..." : "Transfer"}
                  </Button>
                </div>
              </div>
            </DialogContent>
          </Dialog>
          {isMainAdmin && (
            <Dialog
            open={isTransferAdminOpen}
            onOpenChange={(open) => {
              if (!open && transferringAdmin) return; // prevent closing during submit
              setIsTransferAdminOpen(open);
            }}
            >
            <DialogTrigger asChild>
              <Button variant="outline" className="bg-purple-50 text-purple-700 hover:bg-purple-100">
                <Users className="h-4 w-4 mr-2" />
                Transfer to Sub Admin
              </Button>
            </DialogTrigger>
            <DialogContent
              onInteractOutside={(e) => {
                if (transferringAdmin) e.preventDefault();
              }}
              onEscapeKeyDown={(e) => {
                if (transferringAdmin) e.preventDefault();
              }}
            >
              <DialogHeader>
                <DialogTitle>Transfer to Sub Admin</DialogTitle>
              </DialogHeader>
              <div className="space-y-4">
                <div>
                  <Label>Choose Sub Admin</Label>
                  <Select
                    value={transferAdminForm.targetAdminId}
                    onValueChange={(v) => setTransferAdminForm({ ...transferAdminForm, targetAdminId: v })}
                    disabled={subAdminsLoading}
                  >
                    <SelectTrigger className="w-full">
                      <SelectValue placeholder={subAdminsLoading ? "Loading..." : "Select a sub admin"} />
                    </SelectTrigger>
                    <SelectContent>
                      {subAdmins.map((sa) => (
                        <SelectItem key={sa._id} value={sa._id}>
                          {sa.name} ({sa.email}) — ₹{(sa.wallet?.balance ?? 0).toFixed(2)}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label htmlFor="admin-amount">Amount (₹)</Label>
                  <Input
                    id="admin-amount"
                    type="number"
                    min="0"
                    step="0.01"
                    value={transferAdminForm.amount}
                    onChange={(e) => setTransferAdminForm({ ...transferAdminForm, amount: e.target.value })}
                    placeholder="Enter amount"
                  />
                </div>
                <div>
                  <Label htmlFor="admin-description">Description</Label>
                  <Input
                    id="admin-description"
                    value={transferAdminForm.description}
                    onChange={(e) => setTransferAdminForm({ ...transferAdminForm, description: e.target.value })}
                    placeholder="Enter description"
                  />
                </div>
                <div className="flex justify-end space-x-2">
                  <Button variant="outline" onClick={() => setIsTransferAdminOpen(false)} disabled={transferringAdmin}>Cancel</Button>
                  <Button onClick={handleTransferToAdmin} disabled={transferringAdmin || !transferAdminForm.targetAdminId || !transferAdminForm.amount}>
                    {transferringAdmin ? "Transferring..." : "Transfer"}
                  </Button>
                </div>
              </div>
            </DialogContent>
            </Dialog>
          )}

          {isMainAdmin && (
            <Dialog
            open={isAddDialogOpen}
            onOpenChange={(open) => {
              if (!open && adding) return; // prevent closing during submit
              setIsAddDialogOpen(open);
            }}
            >
            <DialogTrigger asChild>
              <Button variant="outline" className="bg-green-50 text-green-700 hover:bg-green-100">
                <Plus className="h-4 w-4 mr-2" />
                Add Money
              </Button>
            </DialogTrigger>
            <DialogContent
              onInteractOutside={(e) => {
                if (adding) e.preventDefault();
              }}
              onEscapeKeyDown={(e) => {
                if (adding) e.preventDefault();
              }}
            >
              <DialogHeader>
                <DialogTitle>Add Money to Wallet</DialogTitle>
              </DialogHeader>
              <div className="space-y-4">
                <div>
                  <Label htmlFor="amount">Amount (₹)</Label>
                  <Input
                    id="amount"
                    type="number"
                    min="0"
                    step="0.01"
                    value={addFormData.amount}
                    onChange={(e) => setAddFormData({ ...addFormData, amount: e.target.value })}
                    placeholder="Enter amount"
                  />
                </div>
                <div>
                  <Label htmlFor="description">Description</Label>
                  <Input
                    id="description"
                    value={addFormData.description}
                    onChange={(e) => setAddFormData({ ...addFormData, description: e.target.value })}
                    placeholder="Enter description"
                  />
                </div>
                <div className="flex justify-end space-x-2">
                  <Button
                    variant="outline"
                    onClick={() => setIsAddDialogOpen(false)}
                    disabled={adding}
                  >
                    Cancel
                  </Button>
                  <Button onClick={handleAddMoney} disabled={adding}>
                    {adding ? "Adding..." : "Add Money"}
                  </Button>
                </div>
              </div>
            </DialogContent>
            </Dialog>
          )}

          {isMainAdmin && (
            <Dialog
            open={isDeductDialogOpen}
            onOpenChange={(open) => {
              if (!open && deducting) return; // prevent closing during submit
              setIsDeductDialogOpen(open);
            }}
            >
            <DialogTrigger asChild>
              <Button variant="outline" className="bg-red-50 text-red-700 hover:bg-red-100">
                <Minus className="h-4 w-4 mr-2" />
                Deduct Money
              </Button>
            </DialogTrigger>
            <DialogContent
              onInteractOutside={(e) => {
                if (deducting) e.preventDefault();
              }}
              onEscapeKeyDown={(e) => {
                if (deducting) e.preventDefault();
              }}
            >
              <DialogHeader>
                <DialogTitle>Deduct Money from Wallet</DialogTitle>
              </DialogHeader>
              <div className="space-y-4">
                <div>
                  <Label htmlFor="deduct-amount">Amount (₹)</Label>
                  <Input
                    id="deduct-amount"
                    type="number"
                    min="0"
                    step="0.01"
                    max={walletBalance}
                    value={deductFormData.amount}
                    onChange={(e) => setDeductFormData({ ...deductFormData, amount: e.target.value })}
                    placeholder="Enter amount"
                  />
                </div>
                <div>
                  <Label htmlFor="deduct-description">Description</Label>
                  <Input
                    id="deduct-description"
                    value={deductFormData.description}
                    onChange={(e) => setDeductFormData({ ...deductFormData, description: e.target.value })}
                    placeholder="Enter description"
                  />
                </div>
                <div className="flex justify-end space-x-2">
                  <Button
                    variant="outline"
                    onClick={() => setIsDeductDialogOpen(false)}
                    disabled={deducting}
                  >
                    Cancel
                  </Button>
                  <Button onClick={handleDeductMoney} disabled={deducting}>
                    {deducting ? "Deducting..." : "Deduct Money"}
                  </Button>
                </div>
              </div>
            </DialogContent>
            </Dialog>
          )}
        </div>
      </div>

      {/* Transactions Table */}
      <Card>
        <CardHeader>
          <CardTitle>Transaction History ({filteredTransactions.length})</CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Date & Time</TableHead>
                <TableHead>Type</TableHead>
                <TableHead>Amount</TableHead>
                <TableHead>Description</TableHead>
                <TableHead>Party</TableHead>
                <TableHead>Balance After</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredTransactions.map((transaction) => {
                const party = getTransactionParty(transaction);
                return (
                  <TableRow key={transaction._id} className="hover:bg-gray-50">
                    <TableCell>{formatDate(transaction.createdAt)}</TableCell>
                    <TableCell>
                      <Badge
                        variant={transaction.type === "credit" ? "default" : "destructive"}
                        className={
                          transaction.type === "credit"
                            ? "bg-green-100 text-green-800"
                            : "bg-red-100 text-red-800"
                        }
                      >
                        {getTransactionType(transaction)}
                      </Badge>
                    </TableCell>
                    <TableCell
                      className={
                        transaction.type === "credit" ? "text-green-600 font-medium" : "text-red-600 font-medium"
                      }
                    >
                      {transaction.type === "credit" ? "+" : "-"}₹{transaction.amount.toFixed(2)}
                    </TableCell>
                    <TableCell>{transaction.description}</TableCell>
                    <TableCell>
                      {party ? (
                        <div className="flex items-center">
                          {party.type === "user" ? (
                            <User className="h-4 w-4 mr-1 text-blue-500" />
                          ) : (
                            <Users className="h-4 w-4 mr-1 text-purple-500" />
                          )}
                          <div>
                            <div className="text-sm font-medium">{party.name}</div>
                            <div className="text-xs text-muted-foreground">{party.email}</div>
                            {party.type === "admin" && (
                              <Badge variant="outline" className="text-xs mt-1">
                                {party.role}
                              </Badge>
                            )}
                          </div>
                        </div>
                      ) : (
                        <span className="text-muted-foreground">N/A</span>
                      )}
                    </TableCell>
                    <TableCell className="font-medium">
                      ₹{transaction.balanceAfter.toFixed(2)}
                    </TableCell>
                    <TableCell className="text-right">
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="icon">
                            <MoreHorizontal className="h-4 w-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuItem>
                            <Eye className="mr-2 h-4 w-4" />
                            View Details
                          </DropdownMenuItem>
                          <DropdownMenuItem>
                            <Download className="mr-2 h-4 w-4" />
                            Download Receipt
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}
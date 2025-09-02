import { useState, useEffect, useCallback } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";
import {  useParams } from "react-router-dom";
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
import Cookies from "js-cookie";

interface SubAdmin {
  _id: string;
  name: string;
  email: string;
  role: "subadmin";
}

interface Admin {
  _id: string;
  name: string;
  email: string;
  role: "admin" | "subadmin";
}

interface Transaction {
  _id: string;
  fromAdminId?: Admin | string;
  adminId?: string | SubAdmin;
  amount: number;
  type: "credit" | "debit";
  description: string;
  balanceAfter: number;
  category: "admin_wallet" | "transfer";
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

interface WalletData {
  subAdmin: SubAdmin;
  transactions: Transaction[];
}

export function SubAdminWalletManagement() {
  const [searchTerm, setSearchTerm] = useState("");
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [isDeductDialogOpen, setIsDeductDialogOpen] = useState(false);
  const [currentAdmin, setCurrentAdmin] = useState<CurrentAdmin | null>(null);
  const [walletBalance, setWalletBalance] = useState(0);
  const [subAdmin, setSubAdmin] = useState<SubAdmin | null>(null);
  const [walletSummary, setWalletSummary] = useState({
    totalCredit: 0,
    totalDebit: 0,
    transactionsCount: 0,
  });
  const [addFormData, setAddFormData] = useState({
    amount: "",
    description: "Initial balance added by super admin",
  });
  const [deductFormData, setDeductFormData] = useState({
    amount: "",
    description: "Amount deducted by admin",
  });
  const [adding, setAdding] = useState(false);
  const [deducting, setDeducting] = useState(false);

  const token = Cookies.get("admin_token");
  const adminData = Cookies.get("user_data");
  const subAdminId = useParams().subAdminId;
//   console.log("SubAdmin ID:", subAdminId);

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

const fetchSubAdminWallet = useCallback(async () => {
    if (!subAdminId) return;

    try {
        const response = await fetch(
            `${import.meta.env.VITE_BASE_UR}admin/subadmin-wallet/${subAdminId}`,
            {
                headers: {
                    Authorization: `Bearer ${token}`,
                },
            }
        );

        if (!response.ok) {
            throw new Error("Failed to fetch subadmin wallet");
        }

        const data = await response.json();
        if (data && data.subAdmin && data.wallet) {
            setSubAdmin(data.subAdmin);

            // Set wallet balance and summary from wallet object
            setWalletBalance(data.wallet.balance ?? 0);
            setWalletSummary({
                totalCredit: data.wallet.totalCredit ?? 0,
                totalDebit: data.wallet.totalDebit ?? 0,
                transactionsCount: data.wallet.transactionsCount ?? 0,
            });

            // If transactions are present, set them
            if (data.wallet.transactions) {
                setTransactions(data.wallet.transactions);
            }
        } else {
            throw new Error(data.message || "Failed to fetch subadmin wallet");
        }
    } catch (err) {
        console.error("Error fetching subadmin wallet:", err);
        setError(err instanceof Error ? err.message : "An unknown error occurred");
    } finally {
        setLoading(false);
    }
}, [subAdminId, token]);

  const fetchTransactions = useCallback(async () => {
    if (!subAdminId) return;
    
    try {
      const response = await fetch(
        `${import.meta.env.VITE_BASE_UR}admin/subadmin-wallet-transactions/${subAdminId}`,
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
      if (data && data.transactions) {
        setTransactions(data.transactions);

        // Update wallet balance from latest transaction
        if (data.transactions.length > 0) {
          const latestTransaction = data.transactions[0];
        //   setWalletBalance(latestTransaction.balanceAfter);
        }
      } else {
        throw new Error(data.message || "Failed to fetch transactions");
      }
    } catch (err) {
      console.error("Error fetching transactions:", err);
      setError(err instanceof Error ? err.message : "An unknown error occurred");
    }
  }, [subAdminId, token]);

  useEffect(() => {
    if (subAdminId) {
      fetchSubAdminWallet();
        fetchTransactions();
    }
  }, [subAdminId, fetchSubAdminWallet, fetchTransactions]);

  const handleAddMoney = async () => {
    if (!subAdminId || !addFormData.amount) {
      toast.error("Amount is required");
      return;
    }

    try {
      setAdding(true);
      const response = await fetch(
        `${import.meta.env.VITE_BASE_UR}admin/add-money-subadmin`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({
            subAdminId: subAdminId,
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
          description: "Initial balance added by super admin",
        });
        fetchSubAdminWallet();
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
    if (!subAdminId || !deductFormData.amount) {
      toast.error("Amount is required");
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
        `${import.meta.env.VITE_BASE_UR}admin/deduct-money-subadmin`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({
            subAdminId: subAdminId,
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
        fetchSubAdminWallet();
      } else {
        throw new Error(data.message || "Failed to deduct money");
      }
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "An unknown error occurred");
    } finally {
      setDeducting(false);
    }
  };

  const filteredTransactions = transactions.filter((transaction) => {
    const matchesSearch =
      transaction.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
      transaction.amount.toString().includes(searchTerm) ||
      transaction.type.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (typeof transaction.fromAdminId === 'object' && 
        transaction.fromAdminId.name.toLowerCase().includes(searchTerm.toLowerCase()));
    return matchesSearch;
  });

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString() + " " + date.toLocaleTimeString();
  };

  const getTransactionType = (transaction: Transaction) => {
    if (transaction.category === "admin_wallet") {
      return transaction.type === "credit" ? "Wallet Credit" : "Wallet Debit";
    } else {
      return "Transfer";
    }
  };

  const getAdminName = (admin: Admin | string | undefined) => {
    if (!admin) return "N/A";
    if (typeof admin === 'object') return admin.name;
    return "Unknown Admin";
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        Loading subadmin wallet information...
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
      {/* Subadmin Info and Wallet Summary */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card className="md:col-span-2">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Subadmin Information</CardTitle>
            <Badge variant="outline" className="text-xs">
              Subadmin
            </Badge>
          </CardHeader>
          <CardContent>
            <div className="text-xl font-bold">{subAdmin?.name}</div>
            <p className="text-sm text-muted-foreground">
              {subAdmin?.email}
            </p>
            <p className="text-xs text-muted-foreground mt-2">
              ID: {subAdminId}
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Wallet Balance</CardTitle>
            <Badge variant="outline" className="text-xs">
              Current
            </Badge>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">₹{walletBalance.toFixed(2)}</div>
            <p className="text-xs text-muted-foreground">
              Updated just now
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Transactions</CardTitle>
            <Badge variant="outline" className="text-xs">
              Count
            </Badge>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{walletSummary.transactionsCount}</div>
            <p className="text-xs text-muted-foreground">
              All transactions
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Wallet Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Credits</CardTitle>
            <Plus className="h-4 w-4 text-green-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-500">
              ₹{walletSummary.totalCredit.toFixed(2)}
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
              ₹{walletSummary.totalDebit.toFixed(2)}
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
            open={isAddDialogOpen}
            onOpenChange={(open) => {
              if (!open && adding) return;
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
                <DialogTitle>Add Money to Subadmin Wallet</DialogTitle>
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

          <Dialog
            open={isDeductDialogOpen}
            onOpenChange={(open) => {
              if (!open && deducting) return;
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
                <DialogTitle>Deduct Money from Subadmin Wallet</DialogTitle>
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
                <TableHead>From Admin</TableHead>
                <TableHead>Balance After</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredTransactions.map((transaction) => (
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
                    {transaction.fromAdminId ? (
                      <div className="flex items-center">
                        <Users className="h-4 w-4 mr-1 text-purple-500" />
                        <div className="text-sm font-medium">
                          {getAdminName(transaction.fromAdminId)}
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
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}


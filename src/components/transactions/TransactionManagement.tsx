import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Search, Filter, Download, Eye } from "lucide-react";

interface Transaction {
  id: number;
  userId: number;
  user?: { name: string };
  order_id: string;
  payment_id: string;
  signature: string;
  amount: number;
  currency: string;
  product_id: number;
  status: string;
  createdAt: string;
  updatedAt: string;
}

export function TransactionManagement() {
  // Static transaction data
  const staticTransactions: Transaction[] = [
    {
      id: 1,
      userId: 101,
      user: { name: "John Doe" },
      order_id: "ORD-123456",
      payment_id: "PAY-789012",
      signature: "sig-abc123",
      amount: 2499,
      currency: "INR",
      product_id: 1,
      status: "success",
      createdAt: "2023-05-15T10:30:00Z",
      updatedAt: "2023-05-15T10:30:00Z",
    },
    {
      id: 2,
      userId: 102,
      user: { name: "Jane Smith" },
      order_id: "ORD-654321",
      payment_id: "PAY-210987",
      signature: "sig-def456",
      amount: 1299,
      currency: "INR",
      product_id: 2,
      status: "pending",
      createdAt: "2023-05-16T14:45:00Z",
      updatedAt: "2023-05-16T14:45:00Z",
    },
    {
      id: 3,
      userId: 103,
      user: { name: "Robert Johnson" },
      order_id: "ORD-987654",
      payment_id: "PAY-345678",
      signature: "sig-ghi789",
      amount: 1999,
      currency: "INR",
      product_id: 3,
      status: "failed",
      createdAt: "2023-05-17T09:15:00Z",
      updatedAt: "2023-05-17T09:15:00Z",
    },
    {
      id: 4,
      userId: 104,
      user: { name: "Emily Davis" },
      order_id: "ORD-456789",
      payment_id: "PAY-876543",
      signature: "sig-jkl012",
      amount: 899,
      currency: "INR",
      product_id: 4,
      status: "success",
      createdAt: "2023-05-18T16:20:00Z",
      updatedAt: "2023-05-18T16:20:00Z",
    },
    {
      id: 5,
      userId: 105,
      user: { name: "Michael Wilson" },
      order_id: "ORD-321654",
      payment_id: "PAY-543210",
      signature: "sig-mno345",
      amount: 1599,
      currency: "INR",
      product_id: 5,
      status: "success",
      createdAt: "2023-05-19T11:10:00Z",
      updatedAt: "2023-05-19T11:10:00Z",
    },
  ];

  const [transactions] = useState<Transaction[]>(staticTransactions);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");

  const getStatusColor = (status: string) => {
    switch (status.toLowerCase()) {
      case "success":
        return "bg-green-100 text-green-800";
      case "pending":
        return "bg-yellow-100 text-yellow-800";
      case "failed":
        return "bg-red-100 text-red-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  const filteredTransactions = transactions.filter((transaction) => {
    const matchesSearch =
      transaction.order_id.toLowerCase().includes(searchTerm.toLowerCase()) ||
      transaction.payment_id.toLowerCase().includes(searchTerm.toLowerCase()) ||
      transaction.amount.toString().includes(searchTerm);
    const matchesStatus =
      statusFilter === "all" ||
      transaction.status.toLowerCase() === statusFilter.toLowerCase();
    return matchesSearch && matchesStatus;
  });

  const calculateTotals = () => {
    const totalAmount = transactions.reduce(
      (sum, transaction) => sum + transaction.amount,
      0
    );
    const successCount = transactions.filter(
      (t) => t.status === "success"
    ).length;

    return {
      totalAmount,
      successCount,
      totalTransactions: transactions.length,
    };
  };

  const { totalAmount, successCount, totalTransactions } = calculateTotals();

  return (
    <div className="space-y-6">
      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card>
          <CardContent className="pt-6">
            <div className="text-2xl font-bold">
              ₹{totalAmount.toLocaleString()}
            </div>
            <p className="text-sm text-gray-600">Total Amount</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="text-2xl font-bold text-green-600">
              {successCount}
            </div>
            <p className="text-sm text-gray-600">Successful Transactions</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="text-2xl font-bold">
              {totalTransactions - successCount}
            </div>
            <p className="text-sm text-gray-600">Other Transactions</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="text-2xl font-bold">{totalTransactions}</div>
            <p className="text-sm text-gray-600">Total Transactions</p>
          </CardContent>
        </Card>
      </div>

      {/* Header with Search and Filters */}
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
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" size="sm">
                <Filter className="h-4 w-4 mr-2" />
                Status: {statusFilter === "all" ? "All" : statusFilter}
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent>
              <DropdownMenuItem onClick={() => setStatusFilter("all")}>
                All
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => setStatusFilter("success")}>
                Success
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => setStatusFilter("pending")}>
                Pending
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => setStatusFilter("failed")}>
                Failed
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
        <div className="flex space-x-2">
          <Button variant="outline">
            <Download className="h-4 w-4 mr-2" />
            Export CSV
          </Button>
          <Button variant="outline">
            <Download className="h-4 w-4 mr-2" />
            Export PDF
          </Button>
        </div>
      </div>

      {/* Transactions Table */}
      <Card>
        <CardHeader>
          <CardTitle>Transactions ({filteredTransactions.length})</CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>#</TableHead>
                <TableHead>Order ID</TableHead>
                <TableHead>Payment ID</TableHead>
                <TableHead>User</TableHead>
                <TableHead>Amount</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Date</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredTransactions.map((transaction, index) => (
                <TableRow key={transaction.id} className="hover:bg-gray-50">
                  <TableCell>{index + 1}</TableCell>
                  <TableCell>{transaction.order_id}</TableCell>
                  <TableCell>{transaction.payment_id}</TableCell>
                  <TableCell>{transaction.user?.name || "N/A"}</TableCell>
                  <TableCell className="text-green-800 font-medium">
                    ₹{transaction.amount.toLocaleString()}
                  </TableCell>
                  <TableCell>
                    <Badge className={getStatusColor(transaction.status)}>
                      {transaction.status}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    {new Date(transaction.createdAt).toLocaleDateString()}
                  </TableCell>
                  <TableCell className="text-right">
                    <Button variant="ghost" size="icon">
                      <Eye className="h-4 w-4" />
                    </Button>
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
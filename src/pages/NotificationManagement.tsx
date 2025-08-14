import React, { useEffect, useState } from "react";
import axios from "axios";
import { toast } from "sonner";
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
import { Search, Filter, MoreHorizontal, Eye, Mail, User } from "lucide-react";
import Cookies from "js-cookie";

export function NotificationManagement() {
  const [notifications, setNotifications] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [roleFilter, setRoleFilter] = useState("all");
  const [readStatusFilter, setReadStatusFilter] = useState("all");
  const token = Cookies.get("admin_token");

  const fetchNotifications = async () => {
    try {
      const res = await axios.get(
        `${import.meta.env.VITE_BASE_UR}admin/get-all-notifications`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );
      console.log("Fetched notifications:", res.data.notifications);
      setNotifications(res.data.notifications);
    } catch (error) {
      console.error("Failed to fetch notifications:", error);
    }
  };

  useEffect(() => {
    fetchNotifications();
  }, []);

  // mark as read function
  const markAsRead = async (notificationId: number) => {
    try {
      await axios.patch(
        `${import.meta.env.VITE_BASE_UR}admin/mark-notification-read/${notificationId}`,
        {},
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );
      fetchNotifications(); // Refresh the notifications list
      toast.success("Notification marked as read");
    } catch (error) {
      console.error("Failed to mark notification as read:", error);
      toast.error("Failed to mark notification as read");
    }
  };

  // delete notification function
  const deleteNotification = async (notificationId: number) => {
    if (window.confirm("Are you sure you want to delete this notification?")) {
      try {
        await axios.delete(
          `${import.meta.env.VITE_BASE_UR}admin/delete-notification/${notificationId}`,
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        );
        setNotifications(notifications.filter((notif) => notif.id !== notificationId));
        toast.success("Notification deleted successfully");
      } catch (error) {
        console.error("Failed to delete notification:", error);
        toast.error("Failed to delete notification");
      }
    }
  };

  const filteredNotifications = notifications.filter((notif) => {
    const matchesSearch =
      notif.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      notif.message.toLowerCase().includes(searchTerm.toLowerCase()) ||
      notif.name?.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesRole =
      roleFilter === "all" || 
      notif.role === roleFilter.toUpperCase();
    
    const matchesReadStatus =
      readStatusFilter === "all" || 
      (readStatusFilter === "read" && notif.isRead) ||
      (readStatusFilter === "unread" && !notif.isRead);
    
    return matchesSearch && matchesRole && matchesReadStatus;
  });

  const formatDate = (dateString: string) =>
    new Date(dateString).toLocaleDateString("en-IN", {
      year: "numeric",
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });

  return (
    <div className="space-y-6 p-4">
      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:space-x-4">
          <div className="relative w-full sm:w-auto">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
            <Input
              placeholder="Search notifications..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full sm:w-64 pl-10"
            />
          </div>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" size="sm" className="w-full sm:w-auto">
                <Filter className="h-4 w-4 mr-2" />
                Role: {roleFilter === "all" ? "All" : 
                      roleFilter === "vendor" ? "Vendor" :
                      roleFilter === "delivery_partner" ? "Delivery Partner" : "User"}
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent>
              <DropdownMenuItem onClick={() => setRoleFilter("all")}>
                All Roles
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => setRoleFilter("vendor")}>
                Vendor
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => setRoleFilter("delivery_partner")}>
                Delivery Partner
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => setRoleFilter("user")}>
                User
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" size="sm" className="w-full sm:w-auto">
                <Filter className="h-4 w-4 mr-2" />
                Status: {readStatusFilter === "all" ? "All" : 
                        readStatusFilter === "read" ? "Read" : "Unread"}
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent>
              <DropdownMenuItem onClick={() => setReadStatusFilter("all")}>
                All
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => setReadStatusFilter("read")}>
                Read
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => setReadStatusFilter("unread")}>
                Unread
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>

      {/* Table */}
      <Card>
        <CardHeader>
          <CardTitle>Notification Management ({filteredNotifications.length})</CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>#</TableHead>
                <TableHead>Title & Message</TableHead>
                <TableHead>Recipient</TableHead>
                <TableHead>Role</TableHead>
                <TableHead>Created At</TableHead>
                <TableHead className="text-right">Status</TableHead>
                {/* <TableHead className="text-right">Actions</TableHead> */}
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredNotifications.map((notif) => (
                <TableRow key={notif.id} className="hover:bg-gray-50">
                  <TableCell>{filteredNotifications.indexOf(notif) + 1}</TableCell>
                  <TableCell>
                    <div>
                      <div className="font-medium">{notif.title}</div>
                      <div className="text-sm text-gray-500">{notif.message}</div>
                    </div>
                  </TableCell>
                  <TableCell>
                    {notif.name || "System Notification"}
                  </TableCell>
                  <TableCell>
                    <Badge variant="outline" className="capitalize">
                      {notif.role.toLowerCase().replace('_', ' ')}
                    </Badge>
                  </TableCell>
                  <TableCell>{formatDate(notif.createdAt)}</TableCell>
                  <TableCell className="text-right">
                    <Badge 
                      className={
                        notif.isRead ? "bg-green-100 text-green-800" : "bg-yellow-100 text-yellow-800"
                      }
                    >
                      {notif.isRead ? "Read" : "Unread"}
                    </Badge>
                  </TableCell>
                  {/* <TableCell className="text-right">
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="icon">
                          <MoreHorizontal className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        {!notif.isRead && (
                          <DropdownMenuItem onClick={() => markAsRead(notif.id)}>
                            <Eye className="mr-2 h-4 w-4" />
                            Mark as Read
                          </DropdownMenuItem>
                        )}
                        <DropdownMenuItem onClick={() => deleteNotification(notif.id)}>
                          <User className="mr-2 h-4 w-4" />
                          Delete
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </TableCell> */}
                </TableRow>
              ))}
              {filteredNotifications.length === 0 && (
                <TableRow>
                  <TableCell
                    colSpan={7}
                    className="text-center text-sm text-gray-500"
                  >
                    No notifications found.
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}
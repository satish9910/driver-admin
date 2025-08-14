// components/AssignDriverModal.tsx
import { useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { useToast } from "@/components/ui/use-toast";
import axios from "axios";
import Cookies from "js-cookie";

interface Driver {
  _id: string;
  name: string;
  email: string;
  mobile: string;
  vehicleNumber: string;
  isActive: boolean;
}

interface AssignDriverModalProps {
  bookingId: string;
  currentDriverId?: string;
  onSuccess: () => void;
  drivers: Driver[];
  action: "assign" | "change";
}

export function AssignDriverModal({
  bookingId,
  currentDriverId,
  onSuccess,
  drivers,
  action = "assign",
}: AssignDriverModalProps) {
  const [selectedDriver, setSelectedDriver] = useState<string>(currentDriverId || "");
  const [isOpen, setIsOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();

  const baseUrl = import.meta.env.VITE_BASE_UR || "http://localhost:3000";
  const api = axios.create({
    baseURL: baseUrl,
    headers: {
      "Content-Type": "application/json",
    },
  });

  const handleAssignDriver = async () => {
    if (!selectedDriver) {
      toast({
        title: "Error",
        description: "Please select a driver",
        variant: "destructive",
      });
      return;
    }

    setIsLoading(true);
    try {
      const token = Cookies.get("admin_token");
      if (!token) {
        throw new Error("No authentication token found");
      }

      await api.put(
        "admin/assign-driver",
        {
          bookingId,
          driverId: selectedDriver,
        },
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      toast({
        title: "Success",
        description: `Driver ${action === "assign" ? "assigned" : "changed"} successfully`,
      });
      onSuccess();
      setIsOpen(false);
    } catch (error) {
      console.error("Error assigning driver:", error);
      toast({
        title: "Error",
        description: `Failed to ${action === "assign" ? "assign" : "change"} driver`,
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button variant={action === "assign" ? "outline" : "outline"} size={action === "assign" ? "sm" : "sm"}>
          {action === "assign" ? "Assign Driver" : "Change"}
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>
            {action === "assign" ? "Assign Driver" : "Change Driver"}
          </DialogTitle>
        </DialogHeader>
        <div className="space-y-4">
          <div className="space-y-2">
            <h4 className="text-sm font-medium">Available Drivers</h4>
            <div className="border rounded-md divide-y max-h-60 overflow-y-auto">
              {drivers.map((driver) => (
                <div
                  key={driver._id}
                  className={`p-3 flex items-center justify-between cursor-pointer ${
                    selectedDriver === driver._id ? "bg-gray-100" : ""
                  }`}
                  onClick={() => setSelectedDriver(driver._id)}
                >
                  <div>
                    <p className="font-medium">{driver.name}</p>
                    <p className="text-sm text-gray-600">{driver.mobile}</p>
                    {driver.vehicleNumber && (
                      <p className="text-xs text-gray-500">
                        Vehicle: {driver.vehicleNumber}
                      </p>
                    )}
                  </div>
                  <input
                    type="radio"
                    checked={selectedDriver === driver._id}
                    onChange={() => setSelectedDriver(driver._id)}
                    className="h-4 w-4 text-primary focus:ring-primary"
                  />
                </div>
              ))}
            </div>
          </div>
          <div className="flex justify-end gap-2">
            <Button
              variant="outline"
              onClick={() => setIsOpen(false)}
              disabled={isLoading}
            >
              Cancel
            </Button>
            <Button
              onClick={handleAssignDriver}
              disabled={!selectedDriver || isLoading}
            >
              {isLoading 
                ? action === "assign" 
                  ? "Assigning..." 
                  : "Changing..."
                : action === "assign" 
                  ? "Assign Driver" 
                  : "Change Driver"}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
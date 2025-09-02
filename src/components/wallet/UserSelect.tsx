import { useEffect, useState, useCallback } from "react";
import Cookies from "js-cookie";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

type Props = {
  value: string;
  onChange: (v: string) => void;
  placeholder?: string;
  disabled?: boolean;
};

interface DriverBrief {
  _id: string;
  name: string;
  email: string;
  role: "user";
  wallet?: { balance?: number };
}

export function UserSelect({ value, onChange, placeholder = "Select a user", disabled }: Props) {
  const [drivers, setDrivers] = useState<DriverBrief[]>([]);
  const [loading, setLoading] = useState(false);
  const token = Cookies.get("admin_token");

  const fetchDrivers = useCallback(async () => {
    try {
      setLoading(true);
      const res = await fetch(`${import.meta.env.VITE_BASE_UR}admin/drivers`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      if (!res.ok) throw new Error("Failed to fetch drivers");
      const data = await res.json();
      if (data && Array.isArray(data.drivers)) {
        setDrivers(data.drivers as DriverBrief[]);
      } else {
        throw new Error(data.message || "Invalid drivers response");
      }
    } catch (err) {
      console.error("Error fetching drivers:", err);
    } finally {
      setLoading(false);
    }
  }, [token]);

  useEffect(() => {
    fetchDrivers();
  }, [fetchDrivers]);

  return (
    <Select value={value} onValueChange={onChange} disabled={disabled || loading}>
      <SelectTrigger className="w-full">
        <SelectValue placeholder={loading ? "Loading..." : placeholder} />
      </SelectTrigger>
      <SelectContent>
        {drivers.map((d) => (
          <SelectItem key={d._id} value={d._id}>
            {d.name} ({d.email}) — ₹{(d.wallet?.balance ?? 0).toFixed(2)}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
}

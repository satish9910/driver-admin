import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Switch } from "@/components/ui/switch";
import { useToast } from "@/components/ui/use-toast";
import axios from "axios";
import Cookies from "js-cookie";

export function SettingsManagement() {
  const { toast } = useToast();
  const [settings, setSettings] = useState({
    vendorCommission: 15,
    platformCharge: 5,
    gst: 5,
    deliveryChargePerKm: 40,
    adminCommission: 5,
    deliveryPartnerCommission: 15,
  });
  const [loading, setLoading] = useState(false);

  const token = Cookies.get("admin_token");

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { id, value } = e.target;
    setSettings((prev) => ({
      ...prev,
      [id]: parseFloat(value) || 0,
    }));
  };

  const handleSubmit = async () => {
    setLoading(true);
    try {
      const response = await axios.post(
        `${import.meta.env.VITE_BASE_UR}admin/update-settings`,
        {
          gst: settings.gst,
          vendorCommission: settings.vendorCommission,
          deliveryPartnerCommission: settings.deliveryPartnerCommission,
          adminCommission: settings.adminCommission,
          deliveryChargePerKm: settings.deliveryChargePerKm,
          platformCharge: settings.platformCharge,
        },
        {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        }
      );
      
      toast({
        title: "Success",
        description: response.data.message || "Settings saved successfully",
        variant: "default",
      });
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.response?.data?.message || "Failed to save settings",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <Tabs defaultValue="general" className="w-full">
        <TabsList className="grid w-full grid-cols-5">
          <TabsTrigger value="general">General</TabsTrigger>
          {/* <TabsTrigger value="payment">Payment</TabsTrigger> */}
          {/* <TabsTrigger value="delivery">Delivery</TabsTrigger> */}
          {/* <TabsTrigger value="email">Email/SMS</TabsTrigger> */}
          {/* <TabsTrigger value="appearance">Appearance</TabsTrigger> */}
        </TabsList>

        <TabsContent value="general" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>General Settings</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="vendorCommission">
                    Vendor Commission (%)
                  </Label>
                  <Input
                    id="vendorCommission"
                    type="number"
                    value={settings.vendorCommission}
                    onChange={handleChange}
                  />
                </div>
                <div>
                  <Label htmlFor="platformCharge">Platform Charge (%)</Label>
                  <Input
                    id="platformCharge"
                    type="number"
                    value={settings.platformCharge}
                    onChange={handleChange}
                  />
                </div>
                <div>
                  <Label htmlFor="gst">GST (%)</Label>
                  <Input
                    id="gst"
                    type="number"
                    value={settings.gst}
                    onChange={handleChange}
                  />
                </div>
                <div>
                  <Label htmlFor="deliveryChargePerKm">Delivery Charge Per Km (₹)</Label>
                  <Input
                    id="deliveryChargePerKm"
                    type="number"
                    value={settings.deliveryChargePerKm}
                    onChange={handleChange}
                  />
                </div>
                <div>
                  <Label htmlFor="adminCommission">Admin Commission (%)</Label>
                  <Input
                    id="adminCommission"
                    type="number"
                    value={settings.adminCommission}
                    onChange={handleChange}
                  />
                </div>
                <div>
                  <Label htmlFor="deliveryPartnerCommission">Delivery Partner Commission (%)</Label>
                  <Input
                    id="deliveryPartnerCommission"
                    type="number"
                    value={settings.deliveryPartnerCommission}
                    onChange={handleChange}
                  />
                </div>
              </div>
              <Button onClick={handleSubmit} disabled={loading}>
                {loading ? "Saving..." : "Save General Settings"}
              </Button>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Other tabs remain unchanged */}
      </Tabs>
    </div>
  );
}

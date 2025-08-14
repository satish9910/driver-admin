import { useEffect, useState } from "react";
import { Truck } from "lucide-react";
import { Button } from "../ui/button";
import axios from "axios";
import { toast } from "../ui/use-toast";
import Cookies from "js-cookie";
import { useParams } from "react-router-dom";

interface Order {
  id: number;
  userId: number;
  vendorId: number;
  orderType: string;
  status: string;
  subtotal: number;
  deliveryCharges: number;
  taxes: number;
  discount: number;
  totalAmount: number;
  paymentType: string;
  paymentId: string;
  paymentStatus: string;
  deliveryAddress: string;
  deliveryCity: string;
  deliveryState: string;
  deliveryZipCode: string;
  deliveryPhone: string;
  deliveryLat: number;
  deliveryLng: number;
  subscriptionStartDate: string;
  subscriptionEndDate: string;
  totalMealsInSubscription: number;
  deliveryPartnerId: number | null;
  orderNotes: string | null;
  cancelReason: string | null;
  createdAt: string;
  updatedAt: string;
  user: {
    id: number;
    name: string;
    email: string;
    phoneNumber: string | null;
    profileImage: string | null;
    isActive: boolean;
    isVerified: boolean;
  };
  vendor: {
    id: number;
    name: string;
    businessName: string;
    logo: string;
    phoneNumber: string;
    address: string;
    city: string;
    state: string;
    latitude: number | null;
    longitude: number | null;
    isActive: boolean;
    status: string;
  };
  deliveryPartner: any | null;
  orderItems: OrderItem[];
  mealSchedules: MealSchedule[];
}

interface OrderItem {
  id: number;
  orderId: number;
  mealId: number;
  mealTitle: string;
  mealDescription: string;
  mealImage: string | null;
  mealType: string;
  mealCuisine: string;
  isVeg: boolean;
  quantity: number;
  unitPrice: number;
  totalPrice: number;
  createdAt: string;
  meal: {
    id: number;
    title: string;
    description: string;
    image: string | null;
    type: string;
    cuisine: string;
    isVeg: boolean;
    basePrice: number;
    isAvailable: boolean;
  };
  selectedOptions: any[];
}

interface MealSchedule {
  id: number;
  orderId: number;
  orderItemId: number;
  vendorId: number;
  scheduledDate: string;
  scheduledTimeSlot: string;
  mealType: string;
  mealTitle: string;
  mealImage: string | null;
  quantity: number;
  status: string;
  actualDeliveryTime: string | null;
  deliveryPartnerId: number | null;
  notes: string | null;
  createdAt: string;
  updatedAt: string;
  vendor: {
    id: number;
    name: string;
    businessName: string;
    phoneNumber: string;
  };
  deliveryPartner: any | null;
}

const OrderDetails = () => {
  const [showInvoice, setShowInvoice] = useState(false);
  const [order, setOrder] = useState<Order | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const token = Cookies.get("admin_token");
  const { orderId } = useParams();

  const fetchOrderDetails = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await axios.get(
        `${import.meta.env.VITE_BASE_UR}admin/orders/${orderId}`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );
      if (response.data.success) {
        setOrder(response.data.data);
      } else {
        setError("Failed to fetch order details");
        toast({
          title: "Error",
          description: "Failed to fetch order details.",
          variant: "destructive",
        });
      }
    } catch (error) {
      console.error("Error fetching order details:", error);
      setError("Failed to fetch order details");
      toast({
        title: "Error",
        description: "Failed to fetch order details.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (orderId) {
      fetchOrderDetails();
    }
  }, [orderId]);

  const formatDate = (dateString: string) => {
    const options: Intl.DateTimeFormatOptions = {
      year: "numeric",
      month: "long",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    };
    return new Date(dateString).toLocaleDateString("en-US", options);
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "SCHEDULED":
        return "bg-blue-100 text-blue-800";
      case "PREPARING":
        return "bg-yellow-100 text-yellow-800";
      case "OUT_FOR_DELIVERY":
        return "bg-indigo-100 text-indigo-800";
      case "DELIVERED":
        return "bg-green-100 text-green-800";
      case "CANCELLED":
        return "bg-red-100 text-red-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 p-6 flex items-center justify-center">
        <div className="text-center">
          <p>Loading order details...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 p-6 flex items-center justify-center">
        <div className="text-center">
          <p className="text-red-500">{error}</p>
          <Button
            onClick={fetchOrderDetails}
            className="mt-4"
            variant="outline"
          >
            Retry
          </Button>
        </div>
      </div>
    );
  }

  if (!order) {
    return (
      <div className="min-h-screen bg-gray-50 p-6 flex items-center justify-center">
        <div className="text-center">
          <p>No order data found</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-3xl font-bold text-gray-800">Order Details</h1>
          <div className="flex gap-2 items-center">
            <span
              className={`px-4 py-2 rounded-full text-sm font-semibold ${getStatusColor(
                order.status
              )}`}
            >
              {order.status}
            </span>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setShowInvoice(true)}
              className="bg-green-600 text-white hover:bg-green-700 hover:text-white"
            >
              Download Invoice
            </Button>
            <Button
              variant="outline"
              size="sm"
              className="flex items-center gap-2"
            >
              <Truck size={16} />
              Create Shipment
            </Button>
          </div>
        </div>

        {/* Order Summary Card */}
        <div className="bg-white rounded-xl shadow-lg overflow-hidden mb-8 border border-gray-100">
          <div className="p-6 bg-gradient-to-r from-gray-800 to-gray-700 text-white">
            <h2 className="text-xl font-semibold">Order #{order.id}</h2>
            <p className="text-gray-300">
              Placed on {formatDate(order.createdAt)}
            </p>
          </div>

          <div className="p-6 grid grid-cols-1 md:grid-cols-3 gap-6">
            <div>
              <h3 className="text-sm font-medium text-gray-500 mb-2">
                PAYMENT METHOD
              </h3>
              <p className="font-medium capitalize">{order.paymentType}</p>
              <p className="text-sm text-gray-500 mt-1">
                Status: {order.paymentStatus}
              </p>
            </div>

            <div>
              <h3 className="text-sm font-medium text-gray-500 mb-2">
                ORDER TOTAL
              </h3>
              <p className="font-medium">₹{order.totalAmount.toFixed(2)}</p>
              <div className="flex text-sm text-gray-500 mt-1 space-x-2">
                <span>Subtotal: ₹{order.subtotal.toFixed(2)}</span>
                <span>Delivery: ₹{order.deliveryCharges.toFixed(2)}</span>
              </div>
            </div>

            <div>
              <h3 className="text-sm font-medium text-gray-500 mb-2">
                CUSTOMER
              </h3>
              <p className="font-medium">{order.user.name}</p>
              <p className="text-sm text-gray-500">{order.user.email}</p>
              <p className="text-sm text-gray-500">{order.deliveryPhone}</p>
            </div>
          </div>
        </div>

        {/* Shipping and Billing */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
          <div className="bg-white rounded-xl shadow-lg p-6 border border-gray-100">
            <h3 className="text-lg font-semibold mb-4 text-gray-800 border-b pb-2">
              Delivery Address
            </h3>
            <div className="space-y-2">
              <p className="font-medium">{order.deliveryAddress}</p>
              <p>
                {order.deliveryCity}, {order.deliveryState}
              </p>
              <p>ZIP: {order.deliveryZipCode}</p>
              <p>Phone: {order.deliveryPhone}</p>
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-lg p-6 border border-gray-100">
            <h3 className="text-lg font-semibold mb-4 text-gray-800 border-b pb-2">
              Vendor Information
            </h3>
            <div className="space-y-2">
              <p className="font-medium">{order.vendor.businessName}</p>
              <p>{order.vendor.address}</p>
              <p>
                {order.vendor.city}, {order.vendor.state}
              </p>
              <p>Phone: {order.vendor.phoneNumber}</p>
            </div>
          </div>
        </div>

        {/* Order Items */}
        <div className="bg-white rounded-xl shadow-lg overflow-hidden border border-gray-100 mb-8">
          <div className="p-6 border-b border-gray-100">
            <h3 className="text-lg font-semibold text-gray-800">Order Items</h3>
          </div>

          <div className="divide-y divide-gray-100">
            {order.orderItems.map((item) => (
              <div key={item.id} className="p-6">
                <div className="flex flex-col md:flex-row">
                  <div className="w-24 h-24 flex-shrink-0 overflow-hidden rounded-lg bg-gray-100 mb-4 md:mb-0">
                    {item.mealImage && (
                      <img
                        src={`${import.meta.env.VITE_BASE_URL_IMG}${item.mealImage}`}
                        alt={item.mealTitle}
                        className="w-full h-full object-contain object-top"
                      />
                    )}
                  </div>

                  <div className="ml-0 md:ml-6 flex-1">
                    <div className="flex flex-col md:flex-row md:justify-between">
                      <div>
                        <h4 className="text-lg font-medium text-gray-900">
                          {item.mealTitle}
                        </h4>
                        <p className="text-sm text-gray-500 mt-1">
                          {item.mealDescription}
                        </p>
                        <p className="text-sm text-gray-500">
                          Type: {item.mealType} • {item.mealCuisine}
                        </p>
                        <p className="text-sm text-gray-500">
                          {item.isVeg ? "Vegetarian" : "Non-Vegetarian"}
                        </p>
                      </div>

                      <div className="mt-4 md:mt-0 text-right">
                        <p className="text-gray-900 font-medium">
                          ₹{item.unitPrice.toFixed(2)}
                        </p>
                        <p className="text-sm text-gray-500">
                          Qty: {item.quantity}
                        </p>
                        <p className="text-sm text-gray-500">
                          Total: ₹{item.totalPrice.toFixed(2)}
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Meal Schedules */}
        <div className="bg-white rounded-xl shadow-lg overflow-hidden border border-gray-100 mb-8">
          <div className="p-6 border-b border-gray-100">
            <h3 className="text-lg font-semibold text-gray-800">
              Delivery Schedule
            </h3>
          </div>

          <div className="divide-y divide-gray-100">
            {order.mealSchedules.map((schedule) => (
              <div key={schedule.id} className="p-6">
                <div className="flex flex-col md:flex-row md:justify-between">
                  <div>
                    <h4 className="text-lg font-medium text-gray-900">
                      {schedule.mealTitle} ({schedule.mealType})
                    </h4>
                    <p className="text-sm text-gray-500 mt-1">
                      Scheduled for {formatDate(schedule.scheduledDate)} •{" "}
                      {schedule.scheduledTimeSlot}
                    </p>
                  </div>

                  <div className="mt-4 md:mt-0 flex items-center space-x-4">
                    <span
                      className={`px-3 py-1 rounded-full text-xs font-semibold ${getStatusColor(
                        schedule.status
                      )}`}
                    >
                      {schedule.status}
                    </span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Timeline */}
        <div className="bg-white rounded-xl shadow-lg overflow-hidden border border-gray-100">
          <div className="p-6 border-b border-gray-100">
            <h3 className="text-lg font-semibold text-gray-800">
              Order Timeline
            </h3>
          </div>
          <div className="p-6">
            <div className="relative">
              <div className="mb-6 ml-6">
                <div className="absolute w-4 h-4 bg-blue-500 rounded-full mt-1.5 -left-2 border-4 border-white"></div>
                <div className="flex flex-col sm:flex-row sm:justify-between">
                  <div>
                    <h4 className="text-base font-medium text-gray-900">
                      Order Created
                    </h4>
                    <p className="text-sm text-gray-500">
                      Your order has been placed
                    </p>
                  </div>
                  <time className="text-sm text-gray-500 sm:mt-0 mt-1">
                    {formatDate(order.createdAt)}
                  </time>
                </div>
              </div>

              <div className="mb-6 ml-6">
                <div className="absolute w-4 h-4 bg-green-500 rounded-full mt-1.5 -left-2 border-4 border-white"></div>
                <div className="flex flex-col sm:flex-row sm:justify-between">
                  <div>
                    <h4 className="text-base font-medium text-gray-900">
                      Payment Received
                    </h4>
                    <p className="text-sm text-gray-500">
                      Payment successful via {order.paymentType}
                    </p>
                  </div>
                  <time className="text-sm text-gray-500 sm:mt-0 mt-1">
                    {formatDate(order.createdAt)}
                  </time>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default OrderDetails;
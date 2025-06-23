import { useState, useEffect } from "react";
import { useParams } from "react-router-dom";
import axios from "axios";
import Cookies from "js-cookie";

const OrderDetails = () => {
  const { orderId } = useParams();
  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const token = Cookies.get("admin_token");

  useEffect(() => {
    const fetchOrderDetails = async () => {
      try {
        const response = await axios.get(
          `${import.meta.env.VITE_BASE_UR}admin/get-order/${orderId}`,
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        );
        setOrder(response.data);
        setLoading(false);
      } catch (err) {
        setError(err.message);
        setLoading(false);
      }
    };

    fetchOrderDetails();
  }, [orderId, token]);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen bg-gray-50">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-gold-500"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center h-screen bg-gray-50">
        <div className="text-red-500 text-xl">{error}</div>
      </div>
    );
  }

  if (!order) {
    return (
      <div className="flex items-center justify-center h-screen bg-gray-50">
        <div className="text-gray-600 text-xl">Order not found</div>
      </div>
    );
  }

  const formatDate = (dateString) => {
    const options = {
      year: "numeric" as const,
      month: "long" as const,
      day: "numeric" as const,
      hour: "2-digit" as const,
      minute: "2-digit" as const,
    };
    return new Date(dateString).toLocaleDateString("en-US", options);
  };

  const getStatusColor = (status) => {
    switch (status) {
      case "CONFIRMED":
        return "bg-blue-100 text-blue-800";
      case "DELIVERED":
        return "bg-green-100 text-green-800";
      case "SUCCESS":
        return "bg-purple-100 text-purple-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-3xl font-bold text-gray-800">Order Details</h1>
          <div className="flex space-x-4">
            <span
              className={`px-4 py-2 rounded-full text-sm font-semibold ${getStatusColor(
                order.status
              )}`}
            >
              {order.status}
            </span>
            <span
              className={`px-4 py-2 rounded-full text-sm font-semibold ${getStatusColor(
                order.orderStatus
              )}`}
            >
              {order.orderStatus}
            </span>
          </div>
        </div>

        {/* Order Summary Card */}
        <div className="bg-white rounded-xl shadow-lg overflow-hidden mb-8 border border-gray-100">
          <div className="p-6 bg-gradient-to-r from-gray-800 to-gray-700 text-white">
            <h2 className="text-xl font-semibold">Order :{order.id}</h2>
            <p className="text-gray-300">
              Placed on {formatDate(order.createdAt)}
            </p>
          </div>

          <div className="p-6 grid grid-cols-1 md:grid-cols-3 gap-6">
            <div>
              <h3 className="text-sm font-medium text-gray-500 mb-2">
                PAYMENT METHOD
              </h3>
              <p className="font-medium capitalize">{order.paymentMode}</p>
              <p className="text-sm text-gray-500 mt-1">
                ID: {order.paymentOrderId}
              </p>
            </div>

            <div>
              <h3 className="text-sm font-medium text-gray-500 mb-2">
                ORDER TOTAL
              </h3>
              <p className="font-medium">₹{order.totalAmount}</p>
              <div className="flex text-sm text-gray-500 mt-1 space-x-2">
                <span>GST: ₹{order.gst}</span>
                <span>Discount: ₹{order.discount}</span>
              </div>
            </div>

            <div>
              <h3 className="text-sm font-medium text-gray-500 mb-2">
                CUSTOMER
              </h3>
              <p className="font-medium">{order.user.name}</p>
              <p className="text-sm text-gray-500">{order.user.email}</p>
              <p className="text-sm text-gray-500">{order.user.phone}</p>
            </div>
          </div>
        </div>

        {/* Shipping and Billing */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
          <div className="bg-white rounded-xl shadow-lg p-6 border border-gray-100">
            <h3 className="text-lg font-semibold mb-4 text-gray-800 border-b pb-2">
              Shipping Address
            </h3>
            <div className="space-y-2">
              <p className="font-medium">{order.user.name}</p>
              <p>
                {order.address.houseNo}, {order.address.street}
              </p>
              <p>
                {order.address.city}, {order.address.district}
              </p>
              <p>PIN: {order.address.pincode}</p>
              {order.notes && (
                <div className="mt-4 pt-4 border-t border-gray-100">
                  <p className="text-sm font-medium text-gray-500">
                    DELIVERY NOTES
                  </p>
                  <p className="italic">"{order.notes}"</p>
                </div>
              )}
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-lg p-6 border border-gray-100">
            <h3 className="text-lg font-semibold mb-4 text-gray-800 border-b pb-2">
              Order Summary
            </h3>
            <div className="space-y-3">
              <div className="flex justify-between">
                <span className="text-gray-600">Subtotal</span>
                <span className="font-medium">
                  ₹
                  {(
                    parseFloat(order.totalAmount) +
                    parseFloat(order.discount) -
                    parseFloat(order.gst)
                  ).toFixed(2)}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">GST</span>
                <span className="font-medium">₹{order.gst}</span>
              </div>
              {order.discount !== "0" && (
                <div className="flex justify-between">
                  <span className="text-gray-600">
                    Discount ({order.couponCode})
                  </span>
                  <span className="font-medium text-green-600">
                    -₹{order.discount}
                  </span>
                </div>
              )}
              <div className="border-t border-gray-200 pt-3 mt-3 flex justify-between">
                <span className="font-semibold">Total</span>
                <span className="font-bold text-lg">₹{order.totalAmount}</span>
              </div>
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
                    <img
                      src={`${import.meta.env.VITE_BASE_URL_IMG}${item.variant.images[0]}`}
                      alt={item.variant.product.name}
                      className="w-full h-full object-cover object-center"
                    />
                  </div>

                  <div className="ml-0 md:ml-6 flex-1">
                    <div className="flex flex-col md:flex-row md:justify-between">
                      <div>
                        <h4 className="text-lg font-medium text-gray-900">
                          {item.variant.product.name}
                        </h4>
                        <p className="text-sm text-gray-500 mt-1">
                          Vendor: {item.vendor.name}
                        </p>
                        {item.attributes.map((attr, idx) => (
                          <p key={idx} className="text-sm text-gray-500">
                            {attr.key}: {attr.value}
                          </p>
                        ))}
                      </div>

                      <div className="mt-4 md:mt-0 text-right">
                        <p className="text-gray-900 font-medium">
                          ₹{item.price}
                        </p>
                        <p className="text-sm text-gray-500">
                          Qty: {item.quantity}
                        </p>
                        <p className="text-sm text-gray-500">
                          Total: ₹
                          {(parseFloat(item.price) * item.quantity).toFixed(2)}
                        </p>
                      </div>
                    </div>

                    <div className="mt-4 flex items-center">
                      <span
                        className={`px-3 py-1 rounded-full text-xs font-semibold ${getStatusColor(
                          item.orderItemStatus
                        )}`}
                      >
                        {item.orderItemStatus}
                      </span>
                    </div>
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
              {/* Timeline items would go here */}
              <div className="mb-6 ml-6">
                <div className="absolute w-4 h-4 bg-blue-500 rounded-full mt-1.5 -left-2 border-4 border-white"></div>
                <div className="flex flex-col sm:flex-row sm:justify-between">
                  <div>
                    <h4 className="text-base font-medium text-gray-900">
                      Order Confirmed
                    </h4>
                    <p className="text-sm text-gray-500">
                      Your order has been confirmed
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
                      Payment successful via {order.paymentMode}
                    </p>
                  </div>
                  <time className="text-sm text-gray-500 sm:mt-0 mt-1">
                    {formatDate(order.createdAt)}
                  </time>
                </div>
              </div>

              {order.orderItems.some(
                (item) => item.orderItemStatus === "DELIVERED"
              ) && (
                <div className="ml-6">
                  <div className="absolute w-4 h-4 bg-purple-500 rounded-full mt-1.5 -left-2 border-4 border-white"></div>
                  <div className="flex flex-col sm:flex-row sm:justify-between">
                    <div>
                      <h4 className="text-base font-medium text-gray-900">
                        Items Delivered
                      </h4>
                      <p className="text-sm text-gray-500">
                        Your items have been delivered
                      </p>
                    </div>
                    <time className="text-sm text-gray-500 sm:mt-0 mt-1">
                      May 15, 2025
                    </time>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default OrderDetails;

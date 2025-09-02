import { useEffect, useState } from "react";
import axios from "axios";
import Cookies from "js-cookie";
import { useParams } from "react-router-dom";

const DriverProfile = () => {
  const { driverId } = useParams();
  const [driverData, setDriverData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const token = Cookies.get("admin_token");

  useEffect(() => {
    const fetchDriverData = async () => {
      try {
        const response = await axios.get(
          `${import.meta.env.VITE_BASE_UR}admin/driver/${driverId}`,
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        );
        setDriverData(response.data.driver);
        setLoading(false);
      } catch (err) {
        setError(err.message);
        setLoading(false);
      }
    };

    fetchDriverData();
  }, [driverId, token]);

  if (loading) {
    return (
      <div className="flex justify-center items-center h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-6">
        <div
          className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative"
          role="alert"
        >
          <strong className="font-bold">Error: </strong>
          <span className="block sm:inline">{error}</span>
        </div>
      </div>
    );
  }

  if (!driverData) {
    return (
      <div className="p-6">
        <div
          className="bg-yellow-100 border border-yellow-400 text-yellow-700 px-4 py-3 rounded relative"
          role="alert"
        >
          <strong className="font-bold">Warning: </strong>
          <span className="block sm:inline">No driver data found</span>
        </div>
      </div>
    );
  }

  // Format date for display
  const formatDate = (dateString) => {
    if (!dateString) return "N/A";
    const date = new Date(dateString);
    return date.toLocaleString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  // Get status badge
  const getStatusBadge = () => {
    if (!driverData.isActive) {
      return (
        <span className="inline-block px-3 py-1 rounded-full text-center text-xs font-semibold bg-yellow-100 text-yellow-800">
          Inactive
        </span>
      );
    }
    return (
      <span className="inline-block px-3 py-1 rounded-full text-center text-xs font-semibold bg-green-100 text-green-800">
        Active
      </span>
    );
  };

  // Check if bookings exist and have data
  const hasBookings = driverData.bookings?.data?.length > 0;

  return (
    <div className="p-6">
      <div className="max-w-5xl mx-auto bg-white rounded-lg shadow-xl p-6">
        {/* Stats Section */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
          <div className="bg-blue-50 p-4 rounded-lg">
            <div className="flex justify-between items-center">
              <div className="flex flex-col gap-5 justify-center">
                <p className="text-sm text-blue-600 font-medium">Driver</p>
                <p className="text-2xl font-bold text-gray-800">
                  {driverData.name || "N/A"}
                </p>
                {getStatusBadge()}
              </div>
              <div className="bg-blue-100 p-3 rounded-full">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="h-6 w-6 text-blue-600"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
                  />
                </svg>
              </div>
            </div>
          </div>

          <div className="bg-green-50 p-4 rounded-lg">
            <div className="flex justify-between items-center">
              <div>
                <p className="text-sm text-green-600 font-medium">
                  Member Since
                </p>
                <p className="text-2xl font-bold text-gray-800">
                  {formatDate(driverData.createdAt)}
                </p>
              </div>
              <div className="bg-green-100 p-3 rounded-full">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="h-6 w-6 text-green-600"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"
                  />
                </svg>
              </div>
            </div>
          </div>

          <div className="bg-purple-50 p-4 rounded-lg">
            <div className="flex justify-between items-center">
              <div>
                <p className="text-sm text-purple-600 font-medium">
                  Vehicle Number
                </p>
                <p className="text-2xl font-bold text-gray-800">
                  {driverData.vehicleNumber || "N/A"}
                </p>
              </div>
              <div className="bg-purple-100 p-3 rounded-full">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="h-6 w-6 text-purple-600"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M8 7h12m0 0l-4-4m4 4l-4 4m0 6H4m0 0l4 4m-4-4l4-4"
                  />
                </svg>
              </div>
            </div>
          </div>
        </div>

        {/* Details Section */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
          <div className="bg-white border border-gray-200 rounded-lg p-6">
            <h2 className="text-lg font-semibold text-gray-800 mb-4">
              Personal Information
            </h2>
            <div className="space-y-4">
              <div>
                <p className="text-sm text-gray-500">Full Name</p>
                <p className="font-medium text-gray-800">
                  {driverData.name || "N/A"}
                </p>
              </div>
              <div>
                <p className="text-sm text-gray-500">Email Address</p>
                <p className="font-medium text-gray-800">
                  {driverData.email || "N/A"}
                </p>
              </div>
              <div>
                <p className="text-sm text-gray-500">Mobile Number</p>
                <p className="font-medium text-gray-800">
                  {driverData.mobile || "N/A"}
                </p>
              </div>
              <div>
                <p className="text-sm text-gray-500">Account Status</p>
                <div className="font-medium text-gray-800">
                  {getStatusBadge()}
                </div>
              </div>
            </div>
          </div>

          <div className="bg-white border border-gray-200 rounded-lg p-6">
            <h2 className="text-lg font-semibold text-gray-800 mb-4">
              Driver Details
            </h2>
            <div className="space-y-4">
              <div>
                <p className="text-sm text-gray-500">Vehicle Number</p>
                <p className="font-medium text-gray-800">
                  {driverData.vehicleNumber || "N/A"}
                </p>
              </div>
              <div>
                <p className="text-sm text-gray-500">License Number</p>
                <p className="font-medium text-gray-800">
                  {driverData.licenseNumber || "N/A"}
                </p>
              </div>
              <div>
                <p className="text-sm text-gray-500">Account Created</p>
                <p className="font-medium text-gray-800">
                  {formatDate(driverData.createdAt)}
                </p>
              </div>
              <div>
                <p className="text-sm text-gray-500">Last Updated</p>
                <p className="font-medium text-gray-800">
                  {formatDate(driverData.updatedAt)}
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Bookings Section */}
        <div className="bg-white border border-gray-200 rounded-lg p-6">
          <h2 className="text-lg font-semibold text-gray-800 mb-4">
            Driver Bookings
          </h2>
          {Array.isArray(driverData.bookings) && driverData.bookings.length > 0 ? (
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              {driverData.bookings[0].data.map((item) => (
                <th
            key={item.key}
            className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                >
            {item.key}
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {driverData.bookings.map((booking) => (
              <tr key={booking._id}>
                {booking.data.map((item) => (
            <td
              key={item._id}
              className="px-6 py-4 whitespace-nowrap text-sm text-gray-500"
            >
              {item.value !== "" && item.value !== null
                ? item.value.toString()
                : "N/A"}
            </td>
                ))}
              </tr>
            ))}
          </tbody>
              </table>
            </div>
          ) : (
            <div className="text-center py-4">
              <p className="text-gray-500">No bookings found for this driver</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default DriverProfile;
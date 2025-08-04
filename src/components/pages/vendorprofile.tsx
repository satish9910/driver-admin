import { useEffect, useState } from "react";
import axios from "axios";
import Cookies from "js-cookie";
import { useParams } from "react-router-dom";
import { toast } from "sonner";

const VendorProfile = () => {
  const { vendorId } = useParams();
  const [vendorData, setVendorData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [updatingStatus, setUpdatingStatus] = useState(false);
  const token = Cookies.get("admin_token");

  useEffect(() => {
    const fetchVendorData = async () => {
      try {
        const response = await axios.get(
          `${import.meta.env.VITE_BASE_UR}admin/get-vendor-by-id/${vendorId}`,
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        );
        setVendorData(response.data);
        setLoading(false);
      } catch (err: any) {
        setError(err.message || "Failed to fetch vendor data");
        toast.error(err.message || "Failed to fetch vendor data");
        setLoading(false);
      }
    };

    fetchVendorData();
  }, [vendorId, token]);

  const updateVendorStatus = async () => {
    if (!vendorData) return;

    setUpdatingStatus(true);
    try {
      const newStatus = vendorData.status === "APPROVED" ? "REJECTED" : "APPROVED";
      
      const response = await axios.patch(
        `${import.meta.env.VITE_BASE_UR}admin/update-vendor-status/${vendorId}`,
        { status: newStatus },
        {
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
        }
      );

      setVendorData(response.data);
      toast.success("Vendor status updated successfully");

    } catch (err: any) {
      setError(err.message || "Failed to update vendor status");
      toast.error(err.message || "Failed to update vendor status");
    } finally {
      setUpdatingStatus(false);
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex h-screen">
        <div className="flex-1 overflow-x-hidden overflow-y-auto">
          <div className="p-6">
            <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative" role="alert">
              <strong className="font-bold">Error: </strong>
              <span className="block sm:inline">{error}</span>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (!vendorData) {
    return (
      <div className="flex h-screen">
        <div className="flex-1 overflow-x-hidden overflow-y-auto">
          <div className="p-6">
            <div className="bg-yellow-100 border border-yellow-400 text-yellow-700 px-4 py-3 rounded relative" role="alert">
              <strong className="font-bold">Warning: </strong>
              <span className="block sm:inline">No vendor data found</span>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Helper function to construct full image URLs
  const getImageUrl = (path: string) => {
    if (!path) return "";
    return `${import.meta.env.VITE_BASE_URL_IMG}${path.replace(/\\/g, '/')}`;
  };

  return (
    <div className="flex h-screen">
      <div className="flex-1 overflow-x-hidden overflow-y-auto">
        <div className="p-6">
          <div className="max-w-6xl mx-auto bg-white rounded-lg shadow-xl overflow-hidden">
            {/* Header Section */}
            <div className="bg-gradient-to-r from-blue-600 to-blue-800 p-6 text-white">
              <div className="flex flex-col md:flex-row justify-between items-start md:items-center">
                <div className="flex items-center mb-4 md:mb-0">
                  <div className="relative mr-6">
                    <img
                      src={getImageUrl(vendorData.logo)}
                      alt="Vendor Logo"
                      className="w-24 h-24 rounded-full object-cover border-4 border-white shadow-md"
                      onError={(e) => {
                        (e.target as HTMLImageElement).src = "https://via.placeholder.com/150";
                      }}
                    />
                    <div className="absolute -bottom-2 -right-2 bg-white rounded-full p-1 shadow">
                      <div className={`h-6 w-6 rounded-full flex items-center justify-center ${
                        vendorData.status === "APPROVED" ? "bg-green-500" : 
                        vendorData.status === "REJECTED" ? "bg-red-500" : "bg-yellow-500"
                      }`}>
                        <span className="text-white text-xs font-bold">
                          {vendorData.status.charAt(0)}
                        </span>
                      </div>
                    </div>
                  </div>
                  <div>
                    <h1 className="text-2xl font-bold">{vendorData.name}</h1>
                    <p className="text-blue-100">{vendorData.businessName}</p>
                    <div className="flex items-center mt-2 space-x-2">
                      <span className="inline-block px-3 py-1 rounded-full text-xs font-semibold bg-blue-100 text-blue-800">
                        VENDOR
                      </span>
                      <span className={`inline-block px-3 py-1 rounded-full text-xs font-semibold ${
                        vendorData.status === "APPROVED" ? "bg-green-100 text-green-800" :
                        vendorData.status === "REJECTED" ? "bg-red-100 text-red-800" :
                        "bg-yellow-100 text-yellow-800"
                      }`}>
                        {vendorData.status}
                      </span>
                    </div>
                  </div>
                </div>
                <div className="flex space-x-3">
                  <button
                    onClick={updateVendorStatus}
                    disabled={updatingStatus}
                    className={`px-4 py-2 rounded-lg transition flex items-center ${
                      vendorData.status === "APPROVED"
                        ? "bg-red-600 hover:bg-red-700 text-white"
                        : "bg-green-600 hover:bg-green-700 text-white"
                    } ${updatingStatus ? "opacity-50 cursor-not-allowed" : ""}`}
                  >
                    {updatingStatus ? (
                      <>
                        <svg
                          className="animate-spin -ml-1 mr-2 h-4 w-4 text-white"
                          xmlns="http://www.w3.org/2000/svg"
                          fill="none"
                          viewBox="0 0 24 24"
                        >
                          <circle
                            className="opacity-25"
                            cx="12"
                            cy="12"
                            r="10"
                            stroke="currentColor"
                            strokeWidth="4"
                          ></circle>
                          <path
                            className="opacity-75"
                            fill="currentColor"
                            d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                          ></path>
                        </svg>
                        Updating...
                      </>
                    ) : (
                      <>
                        <svg
                          xmlns="http://www.w3.org/2000/svg"
                          className="h-5 w-5 mr-2"
                          viewBox="0 0 20 20"
                          fill="currentColor"
                        >
                          <path
                            fillRule="evenodd"
                            d="M4 2a1 1 0 011 1v2.101a7.002 7.002 0 0111.601 2.566 1 1 0 11-1.885.666A5.002 5.002 0 005.999 7H9a1 1 0 010 2H4a1 1 0 01-1-1V3a1 1 0 011-1zm.008 9.057a1 1 0 011.276.61A5.002 5.002 0 0014.001 13H11a1 1 0 110-2h5a1 1 0 011 1v5a1 1 0 11-2 0v-2.101a7.002 7.002 0 01-11.601-2.566 1 1 0 01.61-1.276z"
                            clipRule="evenodd"
                          />
                        </svg>
                        {vendorData.status === "APPROVED" ? "Reject" : "Approve"}
                      </>
                    )}
                  </button>
                </div>
              </div>
            </div>

            {/* Main Content */}
            <div className="p-6">
              {/* Stats Section */}
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
                <div className="bg-blue-50 p-4 rounded-lg">
                  <div className="flex justify-between items-center">
                    <div>
                      <p className="text-sm text-blue-600 font-medium">Business Name</p>
                      <p className="text-xl font-bold text-gray-800">
                        {vendorData.businessName || "N/A"}
                      </p>
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
                          d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4"
                        />
                      </svg>
                    </div>
                  </div>
                </div>

                <div className="bg-green-50 p-4 rounded-lg">
                  <div className="flex justify-between items-center">
                    <div>
                      <p className="text-sm text-green-600 font-medium">Member Since</p>
                      <p className="text-xl font-bold text-gray-800">
                        {new Date(vendorData.createdAt).toLocaleDateString("en-US", {
                          year: "numeric",
                          month: "short",
                        })}
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
                      <p className="text-sm text-purple-600 font-medium">Last Updated</p>
                      <p className="text-xl font-bold text-gray-800">
                        {new Date(vendorData.updatedAt).toLocaleDateString("en-US", {
                          year: "numeric",
                          month: "short",
                          day: "numeric",
                        })}
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
                          d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
                        />
                      </svg>
                    </div>
                  </div>
                </div>

                <div className={`p-4 rounded-lg ${
                  vendorData.status === "APPROVED" ? "bg-green-50" :
                  vendorData.status === "REJECTED" ? "bg-red-50" : "bg-yellow-50"
                }`}>
                  <div className="flex justify-between items-center">
                    <div>
                      <p className={`text-sm font-medium ${
                        vendorData.status === "APPROVED" ? "text-green-600" :
                        vendorData.status === "REJECTED" ? "text-red-600" : "text-yellow-600"
                      }`}>
                        Account Status
                      </p>
                      <p className="text-xl font-bold text-gray-800">
                        {vendorData.status}
                      </p>
                    </div>
                    <div className={`p-3 rounded-full ${
                      vendorData.status === "APPROVED" ? "bg-green-100" :
                      vendorData.status === "REJECTED" ? "bg-red-100" : "bg-yellow-100"
                    }`}>
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        className={`h-6 w-6 ${
                          vendorData.status === "APPROVED" ? "text-green-600" :
                          vendorData.status === "REJECTED" ? "text-red-600" : "text-yellow-600"
                        }`}
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                      >
                        {vendorData.status === "APPROVED" ? (
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
                          />
                        ) : vendorData.status === "REJECTED" ? (
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M18.364 5.636l-12.728 12.728M5.636 5.636l12.728 12.728"
                          />
                        ) : (
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                          />
                        )}
                      </svg>
                    </div>
                  </div>
                </div>
              </div>

              {/* Gallery Section */}
              {vendorData.gallery && vendorData.gallery.length > 0 && (
                <div className="mb-8">
                  <h2 className="text-xl font-semibold text-gray-800 mb-4">Gallery</h2>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    {vendorData.gallery.map((image: string, index: number) => (
                      <div key={index} className="rounded-lg overflow-hidden shadow-md">
                        <img
                          src={getImageUrl(image)}
                          alt={`Gallery ${index + 1}`}
                          className="w-full h-40 object-cover"
                          onError={(e) => {
                            (e.target as HTMLImageElement).src = "https://via.placeholder.com/300";
                          }}
                        />
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Details Section */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="bg-white border border-gray-200 rounded-lg p-6">
                  <h2 className="text-xl font-semibold text-gray-800 mb-4">
                    Business Information
                  </h2>
                  <div className="space-y-4">
                    <div>
                      <p className="text-sm text-gray-500">Business Name</p>
                      <p className="font-medium text-gray-800">
                        {vendorData.businessName || "N/A"}
                      </p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-500">Description</p>
                      <p className="font-medium text-gray-800">
                        {vendorData.description || "N/A"}
                      </p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-500">Primary Phone</p>
                      <p className="font-medium text-gray-800">
                        {vendorData.phoneNumber || "N/A"}
                      </p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-500">Secondary Phone</p>
                      <p className="font-medium text-gray-800">
                        {vendorData.phoneNumber2 || "N/A"}
                      </p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-500">GST Number</p>
                      <p className="font-medium text-gray-800">
                        {vendorData.gst_no || "N/A"}
                      </p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-500">EID Number</p>
                      <p className="font-medium text-gray-800">
                        {vendorData.eid_no || "N/A"}
                      </p>
                    </div>
                  </div>
                </div>

                <div className="bg-white border border-gray-200 rounded-lg p-6">
                  <h2 className="text-xl font-semibold text-gray-800 mb-4">
                    Financial Information
                  </h2>
                  <div className="space-y-4">
                    <div>
                      <p className="text-sm text-gray-500">Bank Name</p>
                      <p className="font-medium text-gray-800">
                        {vendorData.bank_name || "N/A"}
                      </p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-500">Bank Account No</p>
                      <p className="font-medium text-gray-800">
                        {vendorData.bank_account_no || "N/A"}
                      </p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-500">Bank IFSC</p>
                      <p className="font-medium text-gray-800">
                        {vendorData.bank_ifsc || "N/A"}
                      </p>
                    </div>
                  </div>

                  <h2 className="text-xl font-semibold text-gray-800 mt-8 mb-4">
                    Address Information
                  </h2>
                  <div className="space-y-4">
                    <div>
                      <p className="text-sm text-gray-500">Address</p>
                      <p className="font-medium text-gray-800">
                        {vendorData.address || "N/A"}
                      </p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-500">City</p>
                      <p className="font-medium text-gray-800">
                        {vendorData.city || "N/A"}
                      </p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-500">State</p>
                      <p className="font-medium text-gray-800">
                        {vendorData.state || "N/A"}
                      </p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Business Hours Section */}
              <div className="mt-8 bg-white border border-gray-200 rounded-lg p-6">
                <h2 className="text-xl font-semibold text-gray-800 mb-4">Business Hours</h2>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                  <div className="bg-gray-50 p-4 rounded-lg">
                    <h3 className="font-medium text-gray-700 mb-2">Breakfast</h3>
                    <p className="text-gray-800">
                      {vendorData.breakfastStart && vendorData.breakfastEnd 
                        ? `${new Date(`1970-01-01T${vendorData.breakfastStart}`).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})} - ${new Date(`1970-01-01T${vendorData.breakfastEnd}`).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}`
                        : "Not specified"}
                    </p>
                  </div>
                  <div className="bg-gray-50 p-4 rounded-lg">
                    <h3 className="font-medium text-gray-700 mb-2">Lunch</h3>
                    <p className="text-gray-800">
                      {vendorData.lunchStart && vendorData.lunchEnd 
                        ? `${new Date(`1970-01-01T${vendorData.lunchStart}`).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})} - ${new Date(`1970-01-01T${vendorData.lunchEnd}`).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}`
                        : "Not specified"}
                    </p>
                  </div>
                  <div className="bg-gray-50 p-4 rounded-lg">
                    <h3 className="font-medium text-gray-700 mb-2">Evening</h3>
                    <p className="text-gray-800">
                      {vendorData.eveningStart && vendorData.eveningEnd 
                        ? `${new Date(`1970-01-01T${vendorData.eveningStart}`).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})} - ${new Date(`1970-01-01T${vendorData.eveningEnd}`).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}`
                        : "Not specified"}
                    </p>
                  </div>
                  <div className="bg-gray-50 p-4 rounded-lg">
                    <h3 className="font-medium text-gray-700 mb-2">Dinner</h3>
                    <p className="text-gray-800">
                      {vendorData.dinnerStart && vendorData.dinnerEnd 
                        ? `${new Date(`1970-01-01T${vendorData.dinnerStart}`).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})} - ${new Date(`1970-01-01T${vendorData.dinnerEnd}`).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}`
                        : "Not specified"}
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default VendorProfile;
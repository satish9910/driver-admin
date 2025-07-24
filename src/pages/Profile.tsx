import { useState, useEffect } from 'react';
import axios from 'axios';
import Cookies from 'js-cookie';

interface VendorDetails {
  id: number;
  name: string;
  email: string;
  phone: string | null;
  shopname: string;
  gst_no: string;
  pickup_location: string;
  pickup_pin_code: string;
  bank_name: string;
  bank_account_no: string;
  bank_ifsc: string;
}

const VendorProfilePage = () => {
  const [vendor, setVendor] = useState<VendorDetails | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  // Fetch vendor details
  useEffect(() => {
    const fetchVendorDetails = async () => {
      try {
        const token = Cookies.get('vendor_token');
        const response = await axios.get(`${import.meta.env.VITE_BASE_UR}vendor/vendor-details`, {
          headers: {
            'Authorization': `Bearer ${token}`,
          },
        });
        
        if (response.data.success) {
          setVendor(response.data.vendor);
        } else {
          setError('Failed to fetch vendor details');
        }
      } catch (err) {
        console.error('Failed to fetch vendor details:', err);
        setError('Failed to fetch vendor details. Please try again.');
      } finally {
        setLoading(false);
      }
    };

    fetchVendorDetails();
  }, []);



  if (!vendor) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <p>No vendor data found</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-3xl mx-auto">
        <div className="bg-white shadow rounded-lg overflow-hidden">
          {/* Profile Header */}
          <div className="bg-orange-500 px-6 py-8">
            <div className="flex items-center">
              <div className="ml-4">
                <h1 className="text-2xl font-bold text-white">Vendor Profile</h1>
                <p className="text-white">View your account information</p>
              </div>
            </div>
          </div>

          {/* Vendor Information */}
          <div className="px-6 py-6">
            <h2 className="text-lg font-medium text-gray-900 mb-6">Basic Information</h2>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
              <div>
                <label className="block text-sm font-medium text-gray-500">Full Name</label>
                <p className="mt-1 text-sm text-gray-900">{vendor.name}</p>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-500">Email</label>
                <p className="mt-1 text-sm text-gray-900">{vendor.email}</p>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-500">Phone</label>
                <p className="mt-1 text-sm text-gray-900">{vendor.phone || 'Not provided'}</p>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-500">Shop Name</label>
                <p className="mt-1 text-sm text-gray-900">{vendor.shopname}</p>
              </div>
            </div>

            <h2 className="text-lg font-medium text-gray-900 mb-6">Business Information</h2>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
              <div>
                <label className="block text-sm font-medium text-gray-500">GST Number</label>
                <p className="mt-1 text-sm text-gray-900">{vendor.gst_no}</p>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-500">Pickup Location</label>
                <p className="mt-1 text-sm text-gray-900">{vendor.pickup_location}</p>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-500">Pickup PIN Code</label>
                <p className="mt-1 text-sm text-gray-900">{vendor.pickup_pin_code}</p>
              </div>
            </div>

            <h2 className="text-lg font-medium text-gray-900 mb-6">Bank Details</h2>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-500">Bank Name</label>
                <p className="mt-1 text-sm text-gray-900">{vendor.bank_name}</p>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-500">Account Number</label>
                <p className="mt-1 text-sm text-gray-900">{vendor.bank_account_no}</p>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-500">IFSC Code</label>
                <p className="mt-1 text-sm text-gray-900">{vendor.bank_ifsc}</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default VendorProfilePage;
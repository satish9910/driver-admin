import React, { useEffect, useState } from "react";
import {
  Eye,
  EyeOff,
  Check,
  ArrowLeft,
  MapPin,
  User,
  Smartphone,
  FileText,
  Banknote,
  Building2,
} from "lucide-react";
import { Link } from "react-router-dom";
import { Button } from "../ui/button";
import {toast} from "sonner";

// Step 1: Email, Phone & Password Component
const EmailPhoneStep = ({
  formData,
  updateFormData,
  onNext,
  isLoading,
  setIsLoading,
  error,
  setError,
}) => {
  const [showPassword, setShowPassword] = useState(false);
  const handleSubmit = async () => {
    if (!formData.email || !formData.phone || !formData.password) {
      setError("Please fill in all required fields");
      toast.error("Please fill in all required fields");
      return;
    }
    if (formData.password.length < 8) {
      setError("Password must be at least 8 characters");
      toast.error("Password must be at least 8 characters");
      return;
    }
    if (formData.phone.length !== 10) {
      setError("Please enter a valid 10-digit phone number");
      toast.error("Please enter a valid 10-digit phone number");
      return;
    }

    setIsLoading(true);
    setError("");

    try {
      // Call your registration API
      const response = await fetch(
        `${import.meta.env.VITE_BASE_UR}public/vendor-register-new`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/x-www-form-urlencoded",
          },
          body: new URLSearchParams({
            email: formData.email,
            phone: formData.phone,
            password: formData.password,
          }),
        }
      );

      const data = await response.json();
      // If Prisma error, show toast with formatted error
      if (data?.error && typeof data.error === "string" && data.error.includes("prisma")) {
        setError("A user with this email already exists.");
        toast.error(
          <div>
            <div className="font-semibold mb-1">Registration Error</div>
            <div>
              {data.error.includes("Admin_email_key")
                ? "A user with this email already exists."
                : <pre className="whitespace-pre-wrap text-xs">{data.error}</pre>}
            </div>
          </div>
        );
        setIsLoading(false);
        return;
      }

      if (response.ok) {
        onNext(data.vendor.id); // Pass vendorId to next step
      } else {
        setError(data.message || "Registration failed. Please try again.");
        toast.error(data.message || "Registration failed. Please try again.");
      }
    } catch (err) {
      setError("Something went wrong. Please try again.");
      toast.error("Something went wrong. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="text-center mb-6">
        <h2 className="text-2xl font-bold text-gray-800 mb-2">
          Welcome to Shopinger
        </h2>
        <p className="text-gray-600">Create your supplier account</p>
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Email ID
        </label>
        <input
          type="email"
          value={formData.email}
          onChange={(e) => updateFormData("email", e.target.value)}
          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-pink-500 focus:border-pink-500"
          placeholder="Enter your email"
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Mobile Number
        </label>
        <div className="flex">
          <span className="inline-flex items-center px-3 rounded-l-md border border-r-0 border-gray-300 bg-gray-50 text-gray-500 text-sm">
            +91
          </span>
          <input
            type="tel"
            value={formData.phone}
            onChange={(e) => updateFormData("phone", e.target.value)}
            className="flex-1 min-w-0 block w-full px-3 py-2 rounded-none rounded-r-md border border-gray-300 focus:ring-pink-500 focus:border-pink-500"
            placeholder="Enter mobile number"
            maxLength={10}
          />
        </div>
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Password
        </label>
        <div className="relative">
          <input
            type={showPassword ? "text" : "password"}
            value={formData.password}
            onChange={(e) => updateFormData("password", e.target.value)}
            className="w-full px-3 py-2 pr-10 border border-gray-300 rounded-md focus:ring-pink-500 focus:border-pink-500"
            placeholder="Create a strong password"
          />
          <button
            type="button"
            onClick={() => setShowPassword(!showPassword)}
            className="absolute right-3 top-1/2 transform -translate-y-1/2"
          >
            {showPassword ? (
              <EyeOff className="w-4 h-4" />
            ) : (
              <Eye className="w-4 h-4" />
            )}
          </button>
        </div>
        <div className="mt-2 text-sm text-gray-600">
          <p>Password requirements:</p>
          <div className="mt-1 space-y-1">
            <div className="flex items-center">
              <span
                className={`w-2 h-2 rounded-full mr-2 ${
                  formData.password.length >= 8 ? "bg-green-500" : "bg-gray-300"
                }`}
              />
              <span>Minimum 8 characters</span>
            </div>
            <div className="flex items-center">
              <span
                className={`w-2 h-2 rounded-full mr-2 ${
                  /[A-Z]/.test(formData.password)
                    ? "bg-green-500"
                    : "bg-gray-300"
                }`}
              />
              <span>One uppercase letter</span>
            </div>
            <div className="flex items-center">
              <span
                className={`w-2 h-2 rounded-full mr-2 ${
                  /[0-9]/.test(formData.password)
                    ? "bg-green-500"
                    : "bg-gray-300"
                }`}
              />
              <span>One number</span>
            </div>
          </div>
        </div>
      </div>

      <button
        onClick={handleSubmit}
        disabled={isLoading}
        className="w-full bg-black text-white py-3 px-4 rounded-md hover:bg-[#FF710B] disabled:opacity-50 font-medium"
      >
        {isLoading ? "Registering..." : "Register"}
      </button>
    </div>
  );
};

// Step 2: OTP Verification Component
const OtpVerificationStep = ({
  formData,
  updateFormData,
  onNext,
  isLoading,
  setIsLoading,
  error,
  setError,
  vendorId,
}) => {
  const handleSubmit = async () => {
    if (!formData.otp || formData.otp.length !== 4) {
      setError("Please enter a valid 4-digit OTP");
      toast.error("Please enter a valid 4-digit OTP");
      return;
    }

    setIsLoading(true);
    setError("");

    try {
      const response = await fetch(
        `${import.meta.env.VITE_BASE_UR}public/vendor-otp-verify`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/x-www-form-urlencoded",
          },
          body: new URLSearchParams({
            otp: formData.otp,
            phone: formData.phone,
            vendorId: vendorId,
          }),
        }
      );

      let data;
      try {
        data = await response.json();
      } catch (jsonErr) {
        setError("Invalid server response. Please try again.");
        toast.error("Invalid server response. Please try again.");
        setIsLoading(false);
        return;
      }

      if (!response.ok) {
        setError(data?.message || "OTP verification failed. Please try again.");
        toast.error(data?.message || "OTP verification failed. Please try again.");
        setIsLoading(false);
        return;
      }

      if (!data?.token) {
        setError("Verification succeeded but no token received. Please contact support.");
        toast.error("Verification succeeded but no token received. Please contact support.");
        setIsLoading(false);
        return;
      }

      try {
        localStorage.setItem("vendorToken", data.token);
      } catch (storageErr) {
        setError("Could not save authentication token. Please check your browser settings.");
        toast.error("Could not save authentication token. Please check your browser settings.");
        setIsLoading(false);
        return;
      }

      toast.success("OTP verified successfully!");
      onNext();
    } catch (err) {
      setError("Network error. Please check your connection and try again.");
      toast.error("Network error. Please check your connection and try again.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="text-center mb-6">
        <h2 className="text-2xl font-bold text-gray-800 mb-2">
          OTP Verification
        </h2>
        <p className="text-gray-600">Enter the OTP sent to {formData.phone}</p>
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Enter OTP
        </label>
        <input
          type="text"
          value={formData.otp}
          onChange={(e) => updateFormData("otp", e.target.value)}
          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-pink-500 focus:border-pink-500"
          placeholder="Enter 4-digit OTP"
          maxLength={4}
        />
      </div>

      <button
        onClick={handleSubmit}
        disabled={isLoading}
        className="w-full bg-black text-white py-3 px-4 rounded-md hover:bg-[#FF710B] disabled:opacity-50 font-medium"
      >
        {isLoading ? "Verifying..." : "Verify OTP"}
      </button>
    </div>
  );
};

// Step 3: GST Details Component
const GstDetailsStep = ({
  formData,
  updateFormData,
  onNext,
  isLoading,
  setError,
}) => {
  const handleSubmit = () => {
    if (!formData.gstinNumber && !formData.eidNumber) {
      setError("Please enter GSTIN number");
      return;
    }
    onNext();
  };

  return (
    <div className="space-y-6">
      <div className="text-center mb-6">
        <h2 className="text-2xl font-bold text-gray-800 mb-2">GST Details</h2>
        <p className="text-gray-600">Enter your GST information</p>
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          GSTIN Number
        </label>
        <input
          type="text"
          value={formData.gstinNumber}
          onChange={(e) => updateFormData("gstinNumber", e.target.value)}
          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-pink-500 focus:border-pink-500"
          placeholder="Enter GSTIN number"
        />
        <p className="text-sm text-gray-500 mt-1">
          15-digit GST identification number
        </p>
      </div>
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          EID Number (optional)
        </label>
        <input
          type="text"
          value={formData.eidNumber || ""}
          onChange={(e) => updateFormData("eidNumber", e.target.value)}
          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-pink-500 focus:border-pink-500"
          placeholder="Enter EID number (if available)"
        />
        <p className="text-sm text-gray-500 mt-1">
          21-digit Corporate Identification Number (optional)
        </p>
      </div>

      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
        <p className="text-sm text-blue-800">
          <strong>Note:</strong> Your GST number should be active and valid.
          This will be used for tax compliance.
        </p>
      </div>

      <button
        onClick={handleSubmit}
        disabled={isLoading}
        className="w-full bg-black text-white py-3 px-4 rounded-md hover:bg-[#FF710B] disabled:opacity-50 font-medium"
      >
        Continue
      </button>
    </div>
  );
};



// Step 4: Pickup Address Component
const PickupAddressStep = ({
  formData,
  updateFormData,
  onNext,
  isLoading,
  setError,
}) => {
  const [countries, setCountries] = useState([]);
  const [states, setStates] = useState([]);
  const [loadingCountries, setLoadingCountries] = useState(true);
  const [loadingStates, setLoadingStates] = useState(false);

  useEffect(() => {
    const fetchCountries = async () => {
      setLoadingCountries(true);
      try {
        const response = await fetch(
          "https://countriesnow.space/api/v0.1/countries/states"
        );
        
        if (!response.ok) {
          throw new Error("Failed to fetch countries");
        }
        
        const data = await response.json();
        
        if (data.error === false) {
          setCountries(data.data);
          
          // Set default country if not already set
          if (!formData.country) {
            const defaultCountry = data.data.find(c => c.name === '') || 
                                 data.data[0];
            if (defaultCountry) {
              updateFormData('country', defaultCountry.name);
              // Fetch states for default country
              fetchStates(defaultCountry.name);
            }
          }
        }
      } catch (error) {
        console.error('Error fetching countries:', error);
        setError('Failed to load countries. Please try again.');
        
        // Fallback data in case API fails
        setCountries([
          { name: 'India', states: [{ name: 'Delhi' }, { name: 'Maharashtra' }] },
          { name: 'United States', states: [{ name: 'California' }, { name: 'Texas' }] }
        ]);
      } finally {
        setLoadingCountries(false);
      }
    };

    fetchCountries();
  }, []);

  const fetchStates = async (countryName) => {
    if (!countryName) {
      setStates([]);
      return;
    }
    
    setLoadingStates(true);
    try {
      const response = await fetch(
        "https://countriesnow.space/api/v0.1/countries/states"
      );
      
      if (!response.ok) {
        throw new Error("Failed to fetch states");
      }
      
      const data = await response.json();
      
      if (data.error === false) {
        const country = data.data.find(c => c.name === countryName);
        if (country) {
          setStates(country.states || []);
        } else {
          setStates([]);
        }
      }
    } catch (error) {
      console.error('Error fetching states:', error);
      setError('Failed to load states. Please try again.');
      setStates([]);
    } finally {
      setLoadingStates(false);
    }
  };

  const handleCountryChange = (countryName) => {
    updateFormData('country', countryName);
    updateFormData('state', '');
    fetchStates(countryName);
  };

  const handleSubmit = () => {
    if (
      !formData.address ||
      !formData.city ||
      !formData.state ||
      !formData.pincode ||
      !formData.country
    ) {
      setError("Please fill in all address fields");
      return;
    }
    onNext();
  };

  return (
    <div className="space-y-6">
      <div className="text-center mb-6">
        <h2 className="text-2xl font-bold text-gray-800 mb-2">
          Pickup Address
        </h2>
        <p className="text-gray-600">Enter your business pickup address</p>
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Pickup Location
        </label>
        <input
          type="text"
          value={formData.pickupLocation || ""}
          onChange={(e) => updateFormData("pickupLocation", e.target.value)}
          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-pink-500 focus:border-pink-500"
          placeholder="Enter pickup location name"
        />
        <p className="text-sm text-gray-500 mt-1">
          This will be used as your pickup point name (e.g., Warehouse 1, Main
          Store, etc.)
        </p>
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Complete Address
        </label>
        <textarea
          value={formData.address}
          onChange={(e) => updateFormData("address", e.target.value)}
          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-pink-500 focus:border-pink-500"
          placeholder="Plot No. 12, New Palam Vihar, Phase 1, Gurugram,"
          rows={3}
        />
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Country
          </label>
          {loadingCountries ? (
            <div className="w-full px-3 py-2 border border-gray-300 rounded-md bg-gray-100 animate-pulse">
              Loading countries...
            </div>
          ) : (
            <select
              value={formData.country}
              required
              onChange={(e) => handleCountryChange(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-pink-500 focus:border-pink-500"
            >
              <option value="">Select Country</option>
              {countries.map((country) => (
                <option key={country.name} value={country.name}>
                  {country.name}
                </option>
              ))}
            </select>
          )}
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            State
          </label>
          {loadingStates ? (
            <div className="w-full px-3 py-2 border border-gray-300 rounded-md bg-gray-100 animate-pulse">
              Loading states...
            </div>
          ) : (
            <select
              value={formData.state}
              required
              onChange={(e) => updateFormData("state", e.target.value)}
              disabled={!formData.country || loadingStates}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-pink-500 focus:border-pink-500 disabled:bg-gray-100"
            >
              <option value="">Select State</option>
              {states.map((state) => (
                <option key={state.name} value={state.name}>
                  {state.name}
                </option>
              ))}
            </select>
          )}
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            City
          </label>
          <input
            type="text"
            required
            value={formData.city}
            onChange={(e) => updateFormData("city", e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-pink-500 focus:border-pink-500"
            placeholder="City"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            PIN Code
          </label>
          <input
            type="text"
            value={formData.pincode}
            onChange={(e) => updateFormData("pincode", e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-pink-500 focus:border-pink-500"
            placeholder="6-digit PIN code"
            maxLength={6}
          />
        </div>
      </div>

      <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
        <div className="flex items-start">
          <MapPin className="w-5 h-5 text-yellow-600 mr-2 mt-0.5" />
          <p className="text-sm text-yellow-800">
            This address will be used for product pickup. Make sure it's
            accurate and accessible.
          </p>
        </div>
      </div>

      <button
        onClick={handleSubmit}
        disabled={isLoading || loadingCountries}
        className="w-full bg-black text-white py-3 px-4 rounded-md hover:bg-[#FF710B] disabled:opacity-50 font-medium"
      >
        {isLoading ? 'Processing...' : 'Continue'}
      </button>
    </div>
  );
};


// Step 5: Bank Details Component
const BankDetailsStep = ({
  formData,
  updateFormData,
  onNext,
  isLoading,
  setError,
}) => {
  const handleSubmit = () => {
    if (
      !formData.accountNumber ||
      !formData.confirmAccountNumber ||
      !formData.ifscCode
    ) {
      setError("Please fill in all bank details");
      return;
    }
    if (formData.accountNumber !== formData.confirmAccountNumber) {
      setError("Account numbers do not match");
      return;
    }
    onNext();
  };

  return (
    <div className="space-y-6">
      <div className="text-center mb-6">
        <h2 className="text-2xl font-bold text-gray-800 mb-2">Bank Details</h2>
        <p className="text-gray-600">Enter your bank account information</p>
      </div>

      <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-3">
        <p className="text-sm text-yellow-800">
          ⚠️ Bank account should be in the name of registered business
        </p>
      </div>
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Bank Name
        </label>
        <input
          type="text"
          value={formData.bankName || ""}
          onChange={(e) => updateFormData("bankName", e.target.value)}
          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-[#FF710B] focus:border-[#FF710B]"
          placeholder="Enter bank name"
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Account Number
        </label>
        <input
          type="text"
          value={formData.accountNumber}
          onChange={(e) => updateFormData("accountNumber", e.target.value)}
          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-[#FF710B] focus:border-[#FF710B]"
          placeholder="Enter account number"
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Confirm Account Number
        </label>
        <input
          type="text"
          value={formData.confirmAccountNumber}
          onChange={(e) =>
            updateFormData("confirmAccountNumber", e.target.value)
          }
          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-[#FF710B] focus:border-[#FF710B]"
          placeholder="Re-enter account number"
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          IFSC Code
        </label>
        <input
          type="text"
          value={formData.ifscCode}
          onChange={(e) =>
        updateFormData("ifscCode", e.target.value.toUpperCase())
          }
          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-pink-500 focus:border-pink-500"
          placeholder="Enter IFSC code"
        />
      </div>

      <button
        onClick={handleSubmit}
        disabled={isLoading}
        className="w-full bg-black text-white py-3 px-4 rounded-md hover:bg-[#FF710B] disabled:opacity-50 font-medium"
      >
        Continue
      </button>
    </div>
  );
};

// Step 6: Supplier Details Component
const SupplierDetailsStep = ({
  formData,
  updateFormData,
  isLoading,
  setIsLoading,
  setError,
}) => {
  const handleSubmit = async () => {
    if (!formData.businessName || !formData.supplierName) {
      setError("Please fill in all required fields");
      return;
    }

    setIsLoading(true);
    try {
      // Get token from localStorage
      const token = localStorage.getItem("vendorToken");

      // Call your final registration API with all data
      const response = await fetch(
        `${import.meta.env.VITE_BASE_UR}vendor/vendor-details`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/x-www-form-urlencoded",
            Authorization: `Bearer ${token}`,
          },
          body: new URLSearchParams({
            name: formData.supplierName,
            shopname: formData.businessName,
            pickup_location: formData.pickupLocation || "",
            address: formData.address,
            city: formData.city,
            state: formData.state,
            country: formData.country || "",
            pin_code: formData.pincode,
            gst_no: formData.gstinNumber,
            eid_no: formData.eidNumber || "",
            bank_name: formData.bankName || "",
            bank_account_no: formData.accountNumber,
            bank_ifsc: formData.ifscCode,
          }),
        }
      );

      const data = await response.json();

      if (response.ok) {
        toast.success("Registration successful! Welcome to Shopinger!");

        // Redirect to dashboard or login page
        window.location.href = "https://shopinger.co.in/admin/login"; // Adjust the redirect as needed
      } else {
        // Try to parse error details if present
        let errorMessages = [];
        if (data.error) {
          try {
            const errorObj = JSON.parse(data.error);
            for (const key in errorObj) {
              if (Array.isArray(errorObj[key])) {
                errorMessages = errorMessages.concat(errorObj[key]);
              } else if (typeof errorObj[key] === "string") {
                errorMessages.push(errorObj[key]);
              }
            }
          } catch {
            errorMessages.push(data.error);
          }
        }
        const errorMsg =
          errorMessages.length > 0
            ? errorMessages.join(" ")
            : data.message || "Registration failed. Please try again.";
        setError(errorMsg);
        toast.error(
          <div>
            <div className="font-semibold mb-1">Registration Error</div>
            <div>
              {errorMessages.length > 0
                ? errorMessages.map((msg, idx) => (
                    <div key={idx} className="text-xs whitespace-pre-wrap">{msg}</div>
                  ))
                : errorMsg}
            </div>
          </div>
        );
      }
    } catch (err) {
      setError("Something went wrong. Please try again.");
      toast.error("Something went wrong. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="text-center mb-6">
        <h2 className="text-2xl font-bold text-gray-800 mb-2">
          Supplier Details
        </h2>
        <p className="text-gray-600">
          Final step - Enter your business details
        </p>
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Business Name
        </label>
        <input
          type="text"
          value={formData.businessName}
          onChange={(e) => updateFormData("businessName", e.target.value)}
          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-pink-500 focus:border-pink-500"
          placeholder="Enter your business name"
        />
        <p className="text-sm text-gray-500 mt-1">
          This will be visible to customers
        </p>
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Supplier Name
        </label>
        <input
          type="text"
          value={formData.supplierName}
          onChange={(e) => updateFormData("supplierName", e.target.value)}
          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-pink-500 focus:border-pink-500"
          placeholder="Enter supplier name"
        />
      </div>

      <button
        onClick={handleSubmit}
        disabled={isLoading}
        className="w-full bg-black text-white py-3 px-4 rounded-md hover:bg-[#FF710B] disabled:opacity-50 font-medium"
      >
        {isLoading ? "Submitting..." : "Complete Registration"}
      </button>
    </div>
  );
};

// Main Registration Component
const ShopingerRegistration = () => {
  const [currentStep, setCurrentStep] = useState(1);
  const [vendorId, setVendorId] = useState(null);
  const [formData, setFormData] = useState({
    email: "",
    phone: "",
    password: "",
    otp: "",
    gstinNumber: "",
    address: "",
    country: "",
    pickupLocation: "",
    bankName: "",
    city: "",
    state: "",
    pincode: "",
    accountNumber: "",
    confirmAccountNumber: "",
    ifscCode: "",
    businessName: "",
    supplierName: "",
  });

  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");

  const steps = [
    {
      number: 1,
      title: "Basic Info",
      completed: currentStep > 1,
      icon: <User className="w-3 h-3" />,
    },
    {
      number: 2,
      title: "OTP Verify",
      completed: currentStep > 2,
      icon: <Smartphone className="w-3 h-3" />,
    },
    {
      number: 3,
      title: "GST Details",
      completed: currentStep > 3,
      icon: <FileText className="w-3 h-3" />,
    },
    {
      number: 4,
      title: "Pickup Address",
      completed: currentStep > 4,
      icon: <MapPin className="w-3 h-3" />,
    },
    {
      number: 5,
      title: "Bank Details",
      completed: currentStep > 5,
      icon: <Banknote className="w-3 h-3" />,
    },
    {
      number: 6,
      title: "Supplier Details",
      completed: currentStep > 6,
      icon: <Building2 className="w-3 h-3" />,
    },
  ];

  const updateFormData = (field, value) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
    setError("");
  };

  const handleNext = (id = null) => {
    if (id) {
      setVendorId(id);
    }
    setCurrentStep(currentStep + 1);
  };

  const handlePrevious = () => {
    setCurrentStep(currentStep - 1);
  };

  const StepIndicator = () => (
    <div className="mb-8 w-full overflow-x-auto">
      <div className="flex items-center justify-center min-w-max px-4">
        {steps.map((step, index) => (
          <div key={step.number} className="flex items-center">
            {/* Step circle with icon/number */}
            <div
              className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium ${
                step.completed
                  ? "bg-[#FF710B] text-white"
                  : step.number === currentStep
                  ? "bg-gray-400 text-white"
                  : "bg-gray-200 text-gray-500"
              }`}
              title={step.title}
            >
              {step.completed ? (
                <Check className="w-4 h-4" />
              ) : (
                <div className="flex items-center justify-center">
                  {step.icon}
                </div>
              )}
            </div>

            {/* Connector line (except after last step) */}
            {index < steps.length - 1 && (
              <div
                className={`w-8 h-0.5 mx-2 ${
                  step.completed ? "bg-[#FF710B]" : "bg-gray-200"
                }`}
              />
            )}
          </div>
        ))}
      </div>

      {/* Optional: Step titles below indicators on mobile */}
      <div className="flex justify-between px-2 mt-2 md:hidden">
        {steps.map((step) => (
          <div
            key={`title-${step.number}`}
            className={`text-xs text-center w-8 truncate ${
              step.number === currentStep
                ? "font-medium text-gray-800"
                : "text-gray-500"
            }`}
          >
            {step.title}
          </div>
        ))}
      </div>
    </div>
  );

  const renderStep = () => {
    const commonProps = {
      formData,
      updateFormData,
      onNext: handleNext,
      isLoading,
      setIsLoading,
      setError,
    };

    switch (currentStep) {
      case 1:
        return <EmailPhoneStep {...commonProps} />;
      case 2:
        return <OtpVerificationStep {...commonProps} vendorId={vendorId} />;
      case 3:
        return <GstDetailsStep {...commonProps} />;
      case 4:
        return <PickupAddressStep {...commonProps} />;
      case 5:
        return <BankDetailsStep {...commonProps} />;
      case 6:
        return <SupplierDetailsStep {...commonProps} />;
      default:
        return null;
    }
  };

  return (
   <div className="min-h-screen bg-gray-50 flex justify-between items-start">
  {/* Left side with image */}
  <div className="hidden md:flex items-center justify-center">
    <div>
      <img
        src="loginSideBanner.png" // Replace with your actual image path
        alt="Signup illustration"
        className="w-full h-auto object-contain"
      />
    </div>
  </div>

  {/* Right side with form content */}
  <div className="w-full flex-1 p-8">
    <div className="text-center mb-8 relative">
      <div className="text-center mb-8">
        <img
          src="logo.png"
          alt="Shopinger Logo"
          className="mx-auto h-12 w-auto mb-2"
        />
      </div>
      {currentStep > 1 && (
        <button
          onClick={handlePrevious}
          className="absolute left-0 top-0 p-2 hover:bg-gray-200 rounded-full"
        >
          <ArrowLeft className="w-5 h-5" />
        </button>
      )}
    </div>

    <StepIndicator />

    <div className="bg-white rounded-lg shadow-sm p-6">
      {error && (
        <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-md">
          <p className="text-sm text-red-600">{error}</p>
        </div>
      )}

      {renderStep()}
    </div>

    <div className="mt-6 text-center">
      <p className="text-sm text-gray-600">
        Already have an account?{" "}
        <Link to="/login" className="text-blue-600">
          <Button variant="link" className="p-0">
            Vendor Login
          </Button>
        </Link>
      </p>
    </div>

    <div className="text-center mt-8 text-sm text-gray-500">
      <p>© 2025 Shopinger. All rights reserved.</p>
    </div>
  </div>
</div>
  );
};

export default ShopingerRegistration;

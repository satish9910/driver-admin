import React, { useState } from "react";
import { Eye, EyeOff, Check, ArrowLeft, MapPin } from "lucide-react";

// Step 1: Mobile OTP Component
const MobileOtpStep = ({ formData, updateFormData, onNext, isLoading, setIsLoading, error, setError }) => {
  const [otpSent, setOtpSent] = useState(false);

  const sendOTP = async () => {
    if (!formData.mobile || formData.mobile.length !== 10) {
      setError("Please enter a valid 10-digit mobile number");
      return;
    }

    setIsLoading(true);
    setError("");

    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1500));
      setOtpSent(true);
    } catch (err) {
      setError("Something went wrong. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  const verifyOTP = async () => {
    if (!formData.otp || formData.otp.length !== 6) {
      setError("Please enter a valid 6-digit OTP");
      return;
    }

    setIsLoading(true);
    setError("");

    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1500));
      onNext();
    } catch (err) {
      setError("Something went wrong. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="text-center mb-6">
        <h2 className="text-2xl font-bold text-gray-800 mb-2">Welcome to Shopinger</h2>
        <p className="text-gray-600">Enter your mobile number to get started</p>
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
            value={formData.mobile}
            onChange={(e) => updateFormData("mobile", e.target.value)}
            className="flex-1 min-w-0 block w-full px-3 py-2 rounded-none rounded-r-md border border-gray-300 focus:ring-pink-500 focus:border-pink-500"
            placeholder="Enter mobile number"
            maxLength={10}
          />
        </div>
      </div>

      {!otpSent ? (
        <button
          onClick={sendOTP}
          disabled={isLoading}
          className="w-full bg-black text-white py-3 px-4 rounded-md hover:bg-[#FF710B] disabled:opacity-50 font-medium"
        >
          {isLoading ? "Sending OTP..." : "Send OTP"}
        </button>
      ) : (
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Enter OTP
            </label>
            <input
              type="text"
              value={formData.otp}
              onChange={(e) => updateFormData("otp", e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-pink-500 focus:border-pink-500"
              placeholder="Enter 6-digit OTP"
              maxLength={6}
            />
          </div>
          <button
            onClick={verifyOTP}
            disabled={isLoading}
            className="w-full bg-black text-white py-3 px-4 rounded-md hover:bg-[#FF710B] disabled:opacity-50 font-medium"
          >
            {isLoading ? "Verifying..." : "Verify OTP"}
          </button>
        </div>
      )}
    </div>
  );
};

// Step 2: Email & Password Component
const EmailPasswordStep = ({ formData, updateFormData, onNext, isLoading, setError }) => {
  const [showPassword, setShowPassword] = useState(false);

  const handleSubmit = () => {
    if (!formData.email || !formData.password) {
      setError("Please fill in all required fields");
      return;
    }
    if (formData.password.length < 8) {
      setError("Password must be at least 8 characters");
      return;
    }
    onNext();
  };

  return (
    <div className="space-y-6">
      <div className="text-center mb-6">
        <h2 className="text-2xl font-bold text-gray-800 mb-2">Create Account</h2>
        <p className="text-gray-600">Set up your email and password</p>
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
            {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
          </button>
        </div>
        <div className="mt-2 text-sm text-gray-600">
          <p>Password requirements:</p>
          <div className="mt-1 space-y-1">
            <div className="flex items-center">
              <span className={`w-2 h-2 rounded-full mr-2 ${formData.password.length >= 8 ? 'bg-green-500' : 'bg-gray-300'}`} />
              <span>Minimum 8 characters</span>
            </div>
            <div className="flex items-center">
              <span className={`w-2 h-2 rounded-full mr-2 ${/[A-Z]/.test(formData.password) ? 'bg-green-500' : 'bg-gray-300'}`} />
              <span>One uppercase letter</span>
            </div>
            <div className="flex items-center">
              <span className={`w-2 h-2 rounded-full mr-2 ${/[0-9]/.test(formData.password) ? 'bg-green-500' : 'bg-gray-300'}`} />
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
        Create Account
      </button>
    </div>
  );
};

// Step 3: GST Details Component
const GstDetailsStep = ({ formData, updateFormData, onNext, isLoading, setError }) => {
  const handleSubmit = () => {
    if (!formData.gstinNumber) {
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

      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
        <p className="text-sm text-blue-800">
          <strong>Note:</strong> Your GST number should be active and valid. This will be used for tax compliance.
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
const PickupAddressStep = ({ formData, updateFormData, onNext, isLoading, setError }) => {
  const handleSubmit = () => {
    if (!formData.address || !formData.city || !formData.state || !formData.pincode) {
      setError("Please fill in all address fields");
      return;
    }
    onNext();
  };

  return (
    <div className="space-y-6">
      <div className="text-center mb-6">
        <h2 className="text-2xl font-bold text-gray-800 mb-2">Pickup Address</h2>
        <p className="text-gray-600">Enter your business pickup address</p>
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Complete Address
        </label>
        <textarea
          value={formData.address}
          onChange={(e) => updateFormData("address", e.target.value)}
          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-pink-500 focus:border-pink-500"
          placeholder="Enter your complete address"
          rows={3}
        />
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            City
          </label>
          <input
            type="text"
            value={formData.city}
            onChange={(e) => updateFormData("city", e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-pink-500 focus:border-pink-500"
            placeholder="City"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            State
          </label>
          <input
            type="text"
            value={formData.state}
            onChange={(e) => updateFormData("state", e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-pink-500 focus:border-pink-500"
            placeholder="State"
          />
        </div>
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

      <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
        <div className="flex items-start">
          <MapPin className="w-5 h-5 text-yellow-600 mr-2 mt-0.5" />
          <p className="text-sm text-yellow-800">
            This address will be used for product pickup. Make sure it's accurate and accessible.
          </p>
        </div>
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

// Step 5: Bank Details Component
const BankDetailsStep = ({ formData, updateFormData, onNext, isLoading, setError }) => {
  const handleSubmit = () => {
    if (!formData.accountNumber || !formData.confirmAccountNumber || !formData.ifscCode) {
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
          onChange={(e) => updateFormData("confirmAccountNumber", e.target.value)}
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
          onChange={(e) => updateFormData("ifscCode", e.target.value)}
          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-pink-500 focus:border-pink-500"
          placeholder="Enter IFSC code"
        />
      </div>

      <button
        onClick={handleSubmit}
        disabled={isLoading}
        className="w-full bg-pink-500 text-white py-3 px-4 rounded-md hover:bg-pink-600 disabled:opacity-50 font-medium"
      >
        Verify Bank Details
      </button>
    </div>
  );
};

// Step 6: Supplier Details Component
const SupplierDetailsStep = ({ formData, updateFormData, onNext, isLoading, setIsLoading, setError }) => {
  const handleSubmit = async () => {
    if (!formData.businessName || !formData.supplierName) {
      setError("Please fill in all required fields");
      return;
    }
    
    setIsLoading(true);
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 2000));
      alert("Registration successful! Welcome to Shopinger!");
    } catch (err) {
      setError("Something went wrong. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="text-center mb-6">
        <h2 className="text-2xl font-bold text-gray-800 mb-2">Supplier Details</h2>
        <p className="text-gray-600">Final step - Enter your business details</p>
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
        className="w-full bg-black text-white py-3 px-4 rounded-md hover:bg-pink-600 disabled:opacity-50 font-medium"
      >
        {isLoading ? "Submitting..." : "Complete Registration"}
      </button>
    </div>
  );
};

// Main Registration Component
const ShopingerRegistration = () => {
  const [currentStep, setCurrentStep] = useState(1);
  const [formData, setFormData] = useState({
    mobile: "",
    otp: "",
    email: "",
    password: "",
    gstinNumber: "",
    address: "",
    city: "",
    state: "",
    pincode: "",
    accountNumber: "",
    confirmAccountNumber: "",
    ifscCode: "",
    businessName: "",
    supplierName: ""
  });

  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");

  const steps = [
    { number: 1, title: "Mobile & OTP", completed: currentStep > 1 },
    { number: 2, title: "Email & Password", completed: currentStep > 2 },
    { number: 3, title: "GST Details", completed: currentStep > 3 },
    { number: 4, title: "Pickup Address", completed: currentStep > 4 },
    { number: 5, title: "Bank Details", completed: currentStep > 5 },
    { number: 6, title: "Supplier Details", completed: currentStep > 6 }
  ];

  const updateFormData = (field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    setError("");
  };

  const handleNext = () => {
    setCurrentStep(currentStep + 1);
  };

  const handlePrevious = () => {
    setCurrentStep(currentStep - 1);
  };

  const StepIndicator = () => (
    <div className="flex items-center justify-center mb-8  w-full">
      {steps.map((step, index) => (
        <div key={step.number} className="flex items-center">
          <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium ${
            step.completed ? 'bg-[#FF710B] text-white' : 
            step.number === currentStep ? 'bg-gray-400 text-white' : 
            'bg-gray-200 text-gray-500'
          }`}>
            {step.completed ? <Check className="w-4 h-4" /> : step.number}
          </div>
          {index < steps.length - 1 && (
            <div className={`w-8 h-0.5 mx-2 ${
              step.completed ? 'bg-[#FF710B]' : 'bg-gray-200'
            }`} />
          )}
        </div>
      ))}
    </div>
  );

  const renderStep = () => {
    const commonProps = {
      formData,
      updateFormData,
      onNext: handleNext,
      isLoading,
      setIsLoading,
      setError
    };

    switch (currentStep) {
      case 1:
        return <MobileOtpStep {...commonProps} />;
      case 2:
        return <EmailPasswordStep {...commonProps} />;
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
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-md mx-auto px-4">
        <div className="text-center mb-8 relative">
          <div className="text-[#FF710B] text-2xl font-bold mb-2">Shopinger</div>
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

        <div className="text-center mt-8 text-sm text-gray-500">
          <p>© 2025 Shopinger. All rights reserved.</p>
        </div>
      </div>
    </div>
  );
};

export default ShopingerRegistration;
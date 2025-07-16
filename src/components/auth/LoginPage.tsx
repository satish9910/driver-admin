import React, { useState } from "react";
import Cookies from "js-cookie";
import { Link, useNavigate } from "react-router-dom";
import { Eye, EyeOff, ArrowLeft } from "lucide-react";
import { toast, Toaster } from "sonner";

// Replace these with your actual UI components or use plain HTML
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";

const LoginPage = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(false);
  const [userType, setUserType] = useState("vendor"); // 'admin' or 'vendor'
  const [error, setError] = useState("");
  const navigate = useNavigate();

  // Forgot password states
  const [showForgotPassword, setShowForgotPassword] = useState(false);
  const [phone, setPhone] = useState("");
  const [otp, setOtp] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [forgotPasswordStep, setForgotPasswordStep] = useState(1); // 1: phone, 2: otp and new password

  const handleLogin = async (e) => {
    e.preventDefault();
    setError("");

    try {
      const formData = new URLSearchParams();
      formData.append("email", email);
      formData.append("password", password);

      const endpoint = userType === "admin" 
        ? `${import.meta.env.VITE_BASE_UR}public/admin-login`
        : `${import.meta.env.VITE_BASE_UR}public/vendor-login`;

      const response = await fetch(endpoint, {
        method: "POST",
        headers: {
          "Content-Type": "application/x-www-form-urlencoded",
        },
        body: formData.toString(),
      });

      const data = await response.json();

      if (response.ok && data.token) {
        // Save token and role in cookies
        Cookies.set(`${userType}_token`, data.token, {
          expires: rememberMe ? 7 : undefined,
        });
        Cookies.set("user_role", userType, {
          expires: rememberMe ? 7 : undefined,
        });

        // Save user data in cookies if needed
        const userData = data[userType];
        if (userData) {
          Cookies.set("user_data", JSON.stringify(userData), {
            expires: rememberMe ? 7 : undefined,
          });
        }

        // Redirect based on role
        toast.success("Login successful!");
        navigate(userType === "admin" ? "/dashboard" : "/vendor/dashboard");
      } else {
        setError(data?.message || "Invalid credentials.");
        toast.error(data?.message || "Invalid credentials.");
      }
    } catch (err) {
      console.error(err);
      setError("Something went wrong.");
      toast.error("Something went wrong.");
    }
  };

  const handleForgotPassword = async () => {
    if (userType !== "vendor") {
      toast.error("Forgot password is only available for vendors");
      return;
    }

    if (forgotPasswordStep === 1) {
      if (!phone) {
        toast.error("Please enter your phone number");
        return;
      }

      try {
        const response = await fetch(`${import.meta.env.VITE_BASE_UR}public/vendor-forgot-password`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ phone }),
        });

        const data = await response.json();

        if (response.ok) {
          toast.success("OTP sent to your phone number");
          setForgotPasswordStep(2);
        } else {
          toast.error(data?.message || "Failed to send OTP");
        }
      } catch (err) {
        console.error(err);
        toast.error("Something went wrong");
      }
    } else if (forgotPasswordStep === 2) {
      if (!otp || !newPassword || !confirmPassword) {
        toast.error("Please fill all fields");
        return;
      }

      if (newPassword !== confirmPassword) {
        toast.error("Passwords do not match");
        return;
      }

      try {
        const response = await fetch(`${import.meta.env.VITE_BASE_UR}public/vendor-forgot-password-otp-verify`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            phone,
            otp,
            newpassword: newPassword
          }),
        });

        const data = await response.json();

        if (response.ok) {
          toast.success("Password reset successfully");
          setShowForgotPassword(false);
          setForgotPasswordStep(1);
          // Clear all fields
          setPhone("");
          setOtp("");
          setNewPassword("");
          setConfirmPassword("");
        } else {
          toast.error(data?.message || "Failed to reset password");
        }
      } catch (err) {
        console.error(err);
        toast.error("Something went wrong");
      }
    }
  };

  return (
    <>
      <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
        <div className="w-full max-w-md">
          <div className="text-center mb-8">
            <img src="logo.png" alt="Shopinger Logo" className="mx-auto h-12 w-auto mb-2" />
            <p className="text-gray-600">
              {showForgotPassword ? "Reset your password" : "Sign in to your account"}
            </p>
          </div>

          {!showForgotPassword ? (
            <Card>
              <CardHeader>
                <CardTitle className="text-center">Login</CardTitle>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleLogin} className="space-y-4">
                  <div>
                    <Label>Login As</Label>
                    <RadioGroup 
                      defaultValue="vendor" 
                      className="flex gap-4 mt-2"
                      onValueChange={(value) => setUserType(value)}
                    >
                      <div className="flex items-center space-x-2">
                        <RadioGroupItem value="admin" id="admin" />
                        <Label htmlFor="admin">Admin</Label>
                      </div>
                      <div className="flex items-center space-x-2">
                        <RadioGroupItem value="vendor" id="vendor" />
                        <Label htmlFor="vendor">Vendor</Label>
                      </div>
                    </RadioGroup>
                  </div>

                  <div>
                    <Label htmlFor="email">Email</Label>
                    <Input
                      id="email"
                      type="email"
                      placeholder="Enter your email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      required
                    />
                  </div>

                  <div>
                    <Label htmlFor="password">Password</Label>
                    <div className="relative">
                      <Input
                        id="password"
                        type={showPassword ? "text" : "password"}
                        placeholder="Enter your password"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        required
                      />
                      <button
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        className="absolute right-2 top-1/2 transform -translate-y-1/2 h-8 w-8"
                      >
                        {showPassword ? (
                          <EyeOff className="h-4 w-4" />
                        ) : (
                          <Eye className="h-4 w-4" />
                        )}
                      </button>
                    </div>
                  </div>

                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-2">
                      <Checkbox
                        id="remember"
                        checked={rememberMe}
                        onCheckedChange={(checked) =>
                          setRememberMe(checked === true)
                        }
                      />
                      <Label htmlFor="remember" className="text-sm">
                        Remember me
                      </Label>
                    </div>
                    <button 
                      type="button" 
                      className="text-sm text-blue-600"
                      onClick={() => setShowForgotPassword(true)}
                    >
                      Forgot password?
                    </button>
                  </div>

                  <Button type="submit" className="w-full">
                    Sign In
                  </Button>
                </form>

                <div className="mt-6 text-center">
                  <p className="text-sm text-gray-600">
                    Don&apos;t have an account?{" "}
                    <Link to="/register" className="text-blue-600">
                      <Button variant="link" className="p-0">
                        Vendor Register
                      </Button>
                    </Link>
                  </p>
                </div>
              </CardContent>
            </Card>
          ) : (
            <Card>
              <CardHeader>
                <div className="flex items-center space-x-2">
                  <Button 
                    variant="ghost" 
                    size="icon" 
                    onClick={() => {
                      setShowForgotPassword(false);
                      setForgotPasswordStep(1);
                    }}
                  >
                    <ArrowLeft className="h-4 w-4" />
                  </Button>
                  <CardTitle className="text-center flex-1">
                    Forgot Password
                  </CardTitle>
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {forgotPasswordStep === 1 ? (
                    <div>
                      <Label htmlFor="phone">Phone Number</Label>
                      <div className="flex items-center gap-2">
                        <span className="text-gray-600 text-sm">+91</span>
                        <Input
                          id="phone"
                          type="tel"
                          placeholder="Enter your registered phone number"
                          value={phone}
                          onChange={(e) => {
                            // Only allow numbers, max 10 digits
                            const val = e.target.value.replace(/\D/g, "").slice(0, 10);
                            setPhone(val);
                          }}
                          required
                          maxLength={10}
                          inputMode="numeric"
                          pattern="[0-9]{10}"
                          className="flex-1"
                        />
                      </div>
                      <p className="text-sm text-gray-500 mt-2">
                        We'll send an OTP to this number to verify your identity.
                      </p>
                    </div>
                  ) : (
                    <>
                      <div>
                        <Label htmlFor="otp">OTP</Label>
                        <Input
                          id="otp"
                          type="text"
                          placeholder="Enter the OTP you received"
                          value={otp}
                          onChange={(e) => setOtp(e.target.value)}
                          required
                        />
                      </div>
                      <div>
                        <Label htmlFor="newPassword">New Password</Label>
                        <div className="relative">
                          <Input
                            id="newPassword"
                            type={showNewPassword ? "text" : "password"}
                            placeholder="Enter your new password"
                            value={newPassword}
                            onChange={(e) => setNewPassword(e.target.value)}
                            required
                          />
                          <button
                            type="button"
                            onClick={() => setShowNewPassword(!showNewPassword)}
                            className="absolute right-2 top-1/2 transform -translate-y-1/2 h-8 w-8"
                          >
                            {showNewPassword ? (
                              <EyeOff className="h-4 w-4" />
                            ) : (
                              <Eye className="h-4 w-4" />
                            )}
                          </button>
                        </div>
                      </div>
                      <div>
                        <Label htmlFor="confirmPassword">Confirm Password</Label>
                        <div className="relative">
                          <Input
                            id="confirmPassword"
                            type={showConfirmPassword ? "text" : "password"}
                            placeholder="Confirm your new password"
                            value={confirmPassword}
                            onChange={(e) => setConfirmPassword(e.target.value)}
                            required
                          />
                          <button
                            type="button"
                            onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                            className="absolute right-2 top-1/2 transform -translate-y-1/2 h-8 w-8"
                          >
                            {showConfirmPassword ? (
                              <EyeOff className="h-4 w-4" />
                            ) : (
                              <Eye className="h-4 w-4" />
                            )}
                          </button>
                        </div>
                      </div>
                    </>
                  )}

                  <Button 
                    type="button" 
                    className="w-full"
                    onClick={handleForgotPassword}
                  >
                    {forgotPasswordStep === 1 ? "Send OTP" : "Reset Password"}
                  </Button>
                </div>
              </CardContent>
            </Card>
          )}

          <div className="mt-8 text-center text-sm text-gray-500">
            <p>© 2025 Shopinger. All rights reserved.</p>
          </div>
        </div>
      </div>
   
    </>
  );
};

export default LoginPage;
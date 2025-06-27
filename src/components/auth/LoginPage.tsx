import React, { useState } from "react";
import Cookies from "js-cookie";
import { Link, useNavigate } from "react-router-dom";
import { Eye, EyeOff } from "lucide-react";

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
  const [userType, setUserType] = useState("admin"); // 'admin' or 'vendor'
  const [error, setError] = useState("");
  const navigate = useNavigate();

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
        
        // Save user role in cookies
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
        navigate(userType === "admin" ? "/dashboard" : "/vendor/dashboard");
      } else {
        setError(data?.message || "Invalid credentials.");
      }
    } catch (err) {
      console.error(err);
      setError("Something went wrong.");
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
       <img src="logo.png" alt="Shopinger Logo" className="mx-auto h-12 w-auto mb-2" />
          <p className="text-gray-600">Sign in to your account</p>
        </div>

        <Card>
          <CardHeader>
            <CardTitle className="text-center">Login</CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleLogin} className="space-y-4">
              {error && (
                <p className="text-sm text-red-500 text-center">{error}</p>
              )}
              
              <div>
                <Label>Login As</Label>
                <RadioGroup 
                  defaultValue="admin" 
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
                {/* <button type="button" className="text-sm text-blue-600">
                  Forgot password?
                </button> */}
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

        <div className="mt-8 text-center text-sm text-gray-500">
          <p>© 2024 Shopinger. All rights reserved.</p>
        </div>
      </div>
    </div>
  );
};

export default LoginPage;
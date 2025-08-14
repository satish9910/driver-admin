import React, { useState } from "react";
import Cookies from "js-cookie";
import { Link, useNavigate } from "react-router-dom";
import { Car, Eye, EyeOff } from "lucide-react";
import { toast, Toaster } from "sonner";
import axios from "axios";

// Replace these with your actual UI components or use plain HTML
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";

const LoginPage = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(false);
  const [error, setError] = useState("");
  const navigate = useNavigate();

  const handleLogin = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError("");

    try {
      const formData = new URLSearchParams();
      formData.append("email", email);
      formData.append("password", password);

      const response = await axios.post(
        `${import.meta.env.VITE_BASE_UR}public/admin-login`,
        formData,
        {
          headers: {
        "Content-Type": "application/x-www-form-urlencoded",
          },
        }
      );

      const data = response.data;

      // const data = await response.json();

      if (response.status === 200 && data.token) {
        // Save token in cookies
        Cookies.set("admin_token", data.token, {
          expires: rememberMe ? 7 : undefined,
        });
        Cookies.set("user_role", "admin", {
          expires: rememberMe ? 7 : undefined,
        });

        // Save admin data in cookies if needed
        if (data.admin) {
          Cookies.set("user_data", JSON.stringify(data.admin), {
            expires: rememberMe ? 7 : undefined,
          });
        }

        // Redirect to dashboard
        toast.success("Login successful!");
        navigate("/dashboard");
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

  return (
    <>
      <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
        <div className="w-full max-w-md">
          <div className="text-center mb-8">
            <Car className="h-12 w-12 mx-auto text-gray-500" />
            <p className="text-gray-600">Sign in to your admin account</p>
          </div>

          <Card>
            <CardHeader>
              <CardTitle className="text-center">Admin Login</CardTitle>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleLogin} className="space-y-4">
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

                <Button type="submit" className="w-full">
                  Sign In
                </Button>
              </form>
            </CardContent>
          </Card>

          <div className="mt-8 text-center text-sm text-gray-500">
            <p>© {new Date().getFullYear()} Drivero. All rights reserved.</p>
          </div>
        </div>
      </div>
      <Toaster position="top-center" />
    </>
  );
};

export default LoginPage;
import { StatsCard } from "@/components/dashboard/StatsCard";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  User,
  Building,
  UserCheck,
  IndianRupee,
} from "lucide-react";
import { useEffect, useState } from "react";
import axios from "axios";
import Cookies from "js-cookie";
import { useNavigate } from "react-router-dom";

interface AdminStats {
  jobSeekerCount: number;
  employerCount: number;
  activeJobSeekers: number;
  activeEmployers: number;
}

export function AdminDashboard() {
  const [data, setData] = useState<AdminStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const role = Cookies.get("user_role");
  
  const token = role === "superadmin" ? Cookies.get("admin_token") : Cookies.get("vendor_token");
  const navigate = useNavigate();

  useEffect(() => {
    const fetchAdminStats = async () => {
      try {
        const baseUrl = import.meta.env.VITE_BASE_UR;
        const response = await axios.get(
          `${baseUrl}admin/stats`,
          {
            headers: {
              Authorization: `Bearer ${token}`,
              "Content-Type": "application/json",
            },
          }
        );

        if (response.data) {
          setData(response.data);
        } else {
          setError("Failed to fetch dashboard data");
        }
      } catch (err) {
        setError("Error fetching dashboard data");
        console.error("Error fetching dashboard data:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchAdminStats();
  }, [token]);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <p className="text-lg">Loading dashboard...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center text-red-500">
          <p className="text-lg">{error}</p>
          <Button
            variant="outline"
            className="mt-4"
            onClick={() => window.location.reload()}
          >
            Retry
          </Button>
        </div>
      </div>
    );
  }

  if (!data) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <p className="text-lg">No data available</p>
        </div>
      </div>
    );
  }

  const dashboardStats = [
    {
      title: "Total Job Seekers",
      value: data.jobSeekerCount.toString(),
      change: `${data.activeJobSeekers} active`,
      changeType: "positive" as const,
      icon: User,
      iconColor: "text-blue-600",
    },
    {
      title: "Total Employers",
      value: data.employerCount.toString(),
      change: `${data.activeEmployers} active`,
      changeType: "positive" as const,
      icon: Building,
      iconColor: "text-green-600",
    },
    {
      title: "Active Job Seekers",
      value: data.activeJobSeekers.toString(),
      change: `${Math.round((data.activeJobSeekers / data.jobSeekerCount) * 100 || 0)}% of total`,
      changeType: "neutral" as const,
      icon: UserCheck,
      iconColor: "text-purple-600",
    },
    {
      title: "Active Employers",
      value: data.activeEmployers.toString(),
      change: `${Math.round((data.activeEmployers / data.employerCount) * 100 || 0)}% of total`,
      changeType: "neutral" as const,
      icon: Building,
      iconColor: "text-orange-600",
    },
  ];

  return (
    <div className="space-y-6 p-6">
      {/* Stats Grid */}
      <div className="grid gap-4 md:grid-cols-1 lg:grid-cols-4">
        {dashboardStats.map((stat, index) => (
          <StatsCard key={index} {...stat} />
        ))}
      </div>

      {/* Additional Cards */}
      {role === "admin" && (
        <div className="grid gap-4 md:grid-cols-2">
          <Card>
            <CardHeader>
              <CardTitle>Job Seeker Statistics</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex justify-between">
                  <span>Total Job Seekers</span>
                  <span className="font-medium">{data.jobSeekerCount}</span>
                </div>
                <div className="flex justify-between">
                  <span>Active Job Seekers</span>
                  <span className="font-medium text-green-600">
                    {data.activeJobSeekers}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span>Inactive Job Seekers</span>
                  <span className="font-medium text-red-600">
                    {data.jobSeekerCount - data.activeJobSeekers}
                  </span>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Employer Statistics</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex justify-between">
                  <span>Total Employers</span>
                  <span className="font-medium">{data.employerCount}</span>
                </div>
                <div className="flex justify-between">
                  <span>Active Employers</span>
                  <span className="font-medium text-green-600">
                    {data.activeEmployers}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span>Inactive Employers</span>
                  <span className="font-medium text-red-600">
                    {data.employerCount - data.activeEmployers}
                  </span>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Quick Actions */}
      <Card>
        <CardHeader>
          <CardTitle>Quick Actions</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-wrap gap-4">
            <Button onClick={() => navigate("/job-seekers")}>
              Manage Job Seekers
            </Button>
            <Button variant="outline" onClick={() => navigate("/employers")}>
              Manage Employers
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
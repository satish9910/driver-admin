import { useState, useEffect } from "react";
import { useParams } from "react-router-dom";
import axios from "axios";
import Cookies from "js-cookie";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { toast } from "@/components/ui/use-toast";
import { ArrowLeft, Calendar, MapPin, Mail, Phone, User, GraduationCap, Briefcase, FileText, DollarSign } from "lucide-react";
import { useNavigate } from "react-router-dom";

interface JobPreference {
  jobType: string[];
  preferredLocations: string[];
}

interface Education {
  _id: string;
  degree: string;
  institution: string;
  yearOfCompletion: number;
}

interface Experience {
  _id: string;
  company: string;
  role: string;
  startDate: string;
  endDate?: string;
  description: string;
}

interface Location {
  city: string;
  state: string;
  country: string;
  pincode: string;
}

interface JobSeekerDetail {
  _id: string;
  fullName: string;
  email: string;
  mobile: string;
  dob: string;
  gender: string;
  role: string;
  isActive: boolean;
  isProfileComplete: boolean;
  profilePhoto: string;
  resumeUrl: string;
  expectedSalary: number;
  skills: string[];
  jobPreferences: JobPreference;
  education: Education[];
  experience: Experience[];
  location: Location;
  createdAt: string;
  updatedAt: string;
}

export function JobSeekerDetail() {
  const { id } = useParams<{ id: string }>();
  const [jobSeeker, setJobSeeker] = useState<JobSeekerDetail | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const navigate = useNavigate();
  const token = Cookies.get("admin_token");

  useEffect(() => {
    const fetchJobSeekerDetail = async () => {
      try {
        setIsLoading(true);
        const baseUrl = import.meta.env.VITE_BASE_UR;
        const response = await axios.get(`${baseUrl}admin/jobseekers/${id}`, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

        if (response.data && response.data.seeker) {
          setJobSeeker(response.data.seeker);
        } else {
          toast({
            title: "Error",
            description: "Failed to fetch job seeker details.",
            variant: "destructive",
          });
        }
      } catch (error) {
        console.error("Failed to fetch job seeker details:", error);
        let errorMessage = "Failed to fetch job seeker details. Please try again.";
        if (axios.isAxiosError(error)) {
          errorMessage =
            error.response?.data?.message || error.message || errorMessage;
        }
        toast({
          title: "Error",
          description: errorMessage,
          variant: "destructive",
        });
      } finally {
        setIsLoading(false);
      }
    };

    if (id) {
      fetchJobSeekerDetail();
    }
  }, [id, token]);

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString();
  };

  const formatSalary = (salary: number) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      maximumFractionDigits: 0
    }).format(salary);
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <p>Loading job seeker details...</p>
      </div>
    );
  }

  if (!jobSeeker) {
    return (
      <div className="flex items-center justify-center h-64">
        <p>Job seeker not found.</p>
      </div>
    );
  }

  return (
    <div className="space-y-6 p-6">
      <div className="flex items-center gap-4">
        <Button variant="outline" size="icon" onClick={() => navigate(-1)}>
          <ArrowLeft className="h-4 w-4" />
        </Button>
        <h1 className="text-2xl font-bold">Job Seeker Details</h1>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Personal Information */}
        <div className="lg:col-span-2 space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <User className="h-5 w-5" />
                Personal Information
              </CardTitle>
            </CardHeader>
            <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <p className="text-sm text-gray-500">Full Name</p>
                <p className="font-medium">{jobSeeker.fullName}</p>
              </div>
              <div>
                <p className="text-sm text-gray-500">Email</p>
                <p className="font-medium">{jobSeeker.email}</p>
              </div>
              <div>
                <p className="text-sm text-gray-500">Mobile</p>
                <p className="font-medium">{jobSeeker.mobile}</p>
              </div>
              <div>
                <p className="text-sm text-gray-500">Date of Birth</p>
                <p className="font-medium">{formatDate(jobSeeker.dob)}</p>
              </div>
              <div>
                <p className="text-sm text-gray-500">Gender</p>
                <p className="font-medium">{jobSeeker.gender}</p>
              </div>
              <div>
                <p className="text-sm text-gray-500">Status</p>
                <Badge className={jobSeeker.isActive ? "bg-green-100 text-green-800" : "bg-red-100 text-red-800"}>
                  {jobSeeker.isActive ? "Active" : "Inactive"}
                </Badge>
              </div>
              <div>
                <p className="text-sm text-gray-500">Profile Complete</p>
                <Badge className={jobSeeker.isProfileComplete ? "bg-green-100 text-green-800" : "bg-yellow-100 text-yellow-800"}>
                  {jobSeeker.isProfileComplete ? "Complete" : "Incomplete"}
                </Badge>
              </div>
              <div>
                <p className="text-sm text-gray-500">Expected Salary</p>
                <p className="font-medium flex items-center gap-1">
                  <DollarSign className="h-4 w-4" />
                  {formatSalary(jobSeeker.expectedSalary)}
                </p>
              </div>
            </CardContent>
          </Card>

          {/* Location Information */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <MapPin className="h-5 w-5" />
                Location
              </CardTitle>
            </CardHeader>
            <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <p className="text-sm text-gray-500">City</p>
                <p className="font-medium">{jobSeeker.location.city}</p>
              </div>
              <div>
                <p className="text-sm text-gray-500">State</p>
                <p className="font-medium">{jobSeeker.location.state}</p>
              </div>
              <div>
                <p className="text-sm text-gray-500">Country</p>
                <p className="font-medium">{jobSeeker.location.country}</p>
              </div>
              <div>
                <p className="text-sm text-gray-500">Pincode</p>
                <p className="font-medium">{jobSeeker.location.pincode}</p>
              </div>
            </CardContent>
          </Card>

          {/* Job Preferences */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Briefcase className="h-5 w-5" />
                Job Preferences
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <p className="text-sm text-gray-500">Preferred Job Types</p>
                <div className="flex flex-wrap gap-2 mt-1">
                  {jobSeeker.jobPreferences.jobType.map((type, index) => (
                    <Badge key={index} variant="secondary">{type}</Badge>
                  ))}
                </div>
              </div>
              <div>
                <p className="text-sm text-gray-500">Preferred Locations</p>
                <div className="flex flex-wrap gap-2 mt-1">
                  {jobSeeker.jobPreferences.preferredLocations.map((location, index) => (
                    <Badge key={index} variant="secondary">{location}</Badge>
                  ))}
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Skills */}
          <Card>
            <CardHeader>
              <CardTitle>Skills</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex flex-wrap gap-2">
                {jobSeeker.skills.map((skill, index) => (
                  <Badge key={index}>{skill}</Badge>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Education */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <GraduationCap className="h-5 w-5" />
                Education
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {jobSeeker.education.map((edu) => (
                <div key={edu._id} className="border rounded-lg p-4">
                  <h3 className="font-medium">{edu.degree}</h3>
                  <p className="text-sm text-gray-600">{edu.institution}</p>
                  <p className="text-sm text-gray-500">Completed: {edu.yearOfCompletion}</p>
                </div>
              ))}
            </CardContent>
          </Card>

          {/* Work Experience */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Briefcase className="h-5 w-5" />
                Work Experience
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {jobSeeker.experience.map((exp) => (
                <div key={exp._id} className="border rounded-lg p-4">
                  <div className="flex justify-between">
                    <h3 className="font-medium">{exp.role}</h3>
                    <Badge variant="outline">
                      {formatDate(exp.startDate)} - {exp.endDate ? formatDate(exp.endDate) : 'Present'}
                    </Badge>
                  </div>
                  <p className="text-sm font-medium text-gray-600">{exp.company}</p>
                  <p className="text-sm text-gray-500 mt-2">{exp.description}</p>
                </div>
              ))}
            </CardContent>
          </Card>
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Profile Photo */}
          <Card>
            <CardHeader>
              <CardTitle>Profile Photo</CardTitle>
            </CardHeader>
            <CardContent>
              {jobSeeker.profilePhoto ? (
                <img 
                  src={jobSeeker.profilePhoto} 
                  alt={jobSeeker.fullName} 
                  className="w-full rounded-lg object-cover aspect-square"
                />
              ) : (
                <div className="bg-gray-200 border-2 border-dashed rounded-xl w-full h-48 flex items-center justify-center">
                  <User className="h-12 w-12 text-gray-400" />
                </div>
              )}
            </CardContent>
          </Card>

          {/* Resume */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <FileText className="h-5 w-5" />
                Resume
              </CardTitle>
            </CardHeader>
            <CardContent>
              {jobSeeker.resumeUrl ? (
                <Button className="w-full" onClick={() => window.open(jobSeeker.resumeUrl, '_blank')}>
                  View Resume
                </Button>
              ) : (
                <p className="text-sm text-gray-500">No resume uploaded</p>
              )}
            </CardContent>
          </Card>

          {/* Account Information */}
          <Card>
            <CardHeader>
              <CardTitle>Account Information</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              <div className="flex justify-between">
                <span className="text-sm text-gray-500">Member Since</span>
                <span className="text-sm font-medium">{formatDate(jobSeeker.createdAt)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm text-gray-500">Last Updated</span>
                <span className="text-sm font-medium">{formatDate(jobSeeker.updatedAt)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm text-gray-500">User ID</span>
                <span className="text-sm font-medium text-ellipsis overflow-hidden max-w-[120px]">{jobSeeker._id}</span>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
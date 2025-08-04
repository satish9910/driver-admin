import { useState, useEffect } from "react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import axios from "axios";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogFooter,
} from "@/components/ui/dialog";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Search, Plus, MoreHorizontal, Edit, Trash2 } from "lucide-react";
import { Label } from "@/components/ui/label";
import Cookies from "js-cookie";
import { useToast } from "@/components/ui/use-toast";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

interface Banner {
  id: number;
  image: string;
  title: string;
  description: string;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export function BannerManagement() {
  const { toast } = useToast();
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState<boolean | "all">("all");
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [currentBanner, setCurrentBanner] = useState<Banner | null>(null);
  const [banners, setBanners] = useState<Banner[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const token = Cookies.get("admin_token");

  // Form state for add/edit
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    isActive: "true",
    image: null as File | null,
  });

  useEffect(() => {
    if (token) {
      fetchBanners();
    } else {
      setError("You are not authorized to view this page.");
    }
  }, [token]);

  const fetchBanners = async () => {
    try {
      setLoading(true);
      const response = await axios.get(
        `${import.meta.env.VITE_BASE_UR}admin/banners`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      const data = response.data;
      if (data.success) {
        setBanners(data.data);
      } else {
        throw new Error(data.message || "Failed to fetch banners");
      }
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "An unknown error occurred"
      );
    } finally {
      setLoading(false);
    }
  };

  const getStatusText = (isActive: boolean) => {
    return isActive ? "active" : "inactive";
  };

  const getStatusColor = (isActive: boolean) => {
    return isActive
      ? "bg-green-100 text-green-800"
      : "bg-gray-100 text-gray-800";
  };

  const handleDelete = async (bannerId: number) => {
    try {
      const response = await axios.delete(
        `${import.meta.env.VITE_BASE_UR}admin/banners/${bannerId}`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      const data = response.data;
      if (data.success) {
        toast({
          title: "Success",
          description: "Banner deleted successfully",
          variant: "default",
        });
        fetchBanners();
      } else {
        throw new Error(data.message || "Failed to delete banner");
      }
    } catch (err) {
      toast({
        title: "Error",
        description:
          err instanceof Error ? err.message : "Failed to delete banner",
        variant: "destructive",
      });
    }
  };

  const handleEditClick = (banner: Banner) => {
    setCurrentBanner(banner);
    setFormData({
      title: banner.title,
      description: banner.description,
      isActive: banner.isActive.toString(),
      image: null,
    });
    setIsEditDialogOpen(true);
  };

  const handleEditSubmit = async () => {
    if (!currentBanner) return;

    try {
      const formDataToSend = new FormData();
      formDataToSend.append("title", formData.title);
      formDataToSend.append("description", formData.description);
      formDataToSend.append("isActive", formData.isActive);
      if (formData.image) {
        formDataToSend.append("image", formData.image);
      }

      const response = await axios.put(
        `${import.meta.env.VITE_BASE_UR}admin/banners/${currentBanner.id}`,
        formDataToSend,
        {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "multipart/form-data",
          },
        }
      );

      const data = response.data;
      if (data.success) {
        toast({
          title: "Success",
          description: "Banner updated successfully",
          variant: "default",
        });
        setIsEditDialogOpen(false);
        fetchBanners();
      } else {
        throw new Error(data.message || "Failed to update banner");
      }
    } catch (err) {
      toast({
        title: "Error",
        description:
          err instanceof Error ? err.message : "Failed to update banner",
        variant: "destructive",
      });
    }
  };

  const handleAddSubmit = async () => {
    try {
      const formDataToSend = new FormData();
      formDataToSend.append("title", formData.title);
      formDataToSend.append("description", formData.description);
      // formDataToSend.append("isActive", formData.isActive);
      if (formData.image) {
        formDataToSend.append("image", formData.image);
      }

      const response = await axios.post(
        `${import.meta.env.VITE_BASE_UR}admin/add-banner`,
        formDataToSend,
        {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "multipart/form-data",
          },
        }
      );

      const data = response.data;
      if (data.success) {
        toast({
          title: "Success",
          description: "Banner added successfully",
          variant: "default",
        });
        setIsAddDialogOpen(false);
        setFormData({
          title: "",
          description: "",
          isActive: "true",
          image: null,
        });
        fetchBanners();
      } else {
        throw new Error(data.message || "Failed to add banner");
      }
    } catch (err) {
      toast({
        title: "Error",
        description:
          err instanceof Error ? err.message : "Failed to add banner",
        variant: "destructive",
      });
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setFormData((prev) => ({
        ...prev,
        image: e.target.files![0],
      }));
    }
  };

  const filteredBanners = banners.filter((banner) => {
    const matchesSearch = banner.title
      .toLowerCase()
      .includes(searchTerm.toLowerCase());
    const matchesStatus =
      statusFilter === "all" || banner.isActive === statusFilter;
    return matchesSearch && matchesStatus;
  });

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        Loading banners...
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex justify-center items-center h-64 text-red-500">
        {error}
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header with Search and Add Button */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between space-y-4 sm:space-y-0">
        <div className="relative w-full sm:w-64">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
          <Input
            placeholder="Search banners..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10"
          />
        </div>
        <div className="flex space-x-2">
          <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
            <DialogTrigger asChild>
              <Button>
                <Plus className="h-4 w-4 mr-2" />
                Add Banner
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Add New Banner</DialogTitle>
              </DialogHeader>
              <div className="space-y-4">
                <div>
                  <Label htmlFor="title">Banner Title*</Label>
                  <Input
                    id="title"
                    name="title"
                    placeholder="Enter banner title"
                    value={formData.title}
                    onChange={handleInputChange}
                    required
                  />
                </div>
                <div>
                  <Label htmlFor="description">Description*</Label>
                  <Input
                    id="description"
                    name="description"
                    placeholder="Enter banner description"
                    value={formData.description}
                    onChange={handleInputChange}
                    required
                  />
                </div>
                <div>
                  <Label htmlFor="image">Banner Image*</Label>
                  <Input
                    id="image"
                    type="file"
                    accept="image/*"
                    onChange={handleFileChange}
                    required
                  />
                </div>
                {/* <div>
                  <Label>Status</Label>
                  <Select
                    value={formData.isActive}
                    onValueChange={(value) =>
                      setFormData({ ...formData, isActive: value })
                    }
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select status" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="true">Active</SelectItem>
                      <SelectItem value="false">Inactive</SelectItem>
                    </SelectContent>
                  </Select>
                </div> */}
                <DialogFooter>
                  <Button
                    variant="outline"
                    onClick={() => setIsAddDialogOpen(false)}
                  >
                    Cancel
                  </Button>
                  <Button onClick={handleAddSubmit}>Add Banner</Button>
                </DialogFooter>
              </div>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      {/* Banners Table */}
      <div className="border rounded-lg">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Image</TableHead>
              <TableHead>Title</TableHead>
              <TableHead>Description</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Created At</TableHead>
              <TableHead>Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredBanners.length > 0 ? (
              filteredBanners.map((banner) => (
                <TableRow key={banner.id}>
                  <TableCell>
                    <img
                      src={`${import.meta.env.VITE_BASE_URL_IMG}/${banner.image}`}
                      alt={banner.title}
                      className="w-16 h-10 object-cover rounded"
                    />
                  </TableCell>
                  <TableCell className="font-medium">{banner.title}</TableCell>
                  <TableCell className="max-w-xs truncate">
                    {banner.description}
                  </TableCell>
                  <TableCell>
                    <Badge className={getStatusColor(banner.isActive)}>
                      {getStatusText(banner.isActive)}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    {new Date(banner.createdAt).toLocaleDateString()}
                  </TableCell>
                  <TableCell>
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="icon">
                          <MoreHorizontal className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem onClick={() => handleEditClick(banner)}>
                          <Edit className="mr-2 h-4 w-4" />
                          Edit
                        </DropdownMenuItem>
                        <DropdownMenuItem
                          className="text-red-600"
                          onClick={() => handleDelete(banner.id)}
                        >
                          <Trash2 className="mr-2 h-4 w-4" />
                          Delete
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </TableCell>
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell colSpan={6} className="text-center py-8">
                  No banners found
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>

      {/* Edit Banner Dialog */}
      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Edit Banner</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label htmlFor="edit-title">Banner Title*</Label>
              <Input
                id="edit-title"
                name="title"
                placeholder="Enter banner title"
                value={formData.title}
                onChange={handleInputChange}
                required
              />
            </div>
            <div>
              <Label htmlFor="edit-description">Description*</Label>
              <Input
                id="edit-description"
                name="description"
                placeholder="Enter banner description"
                value={formData.description}
                onChange={handleInputChange}
                required
              />
            </div>
            {/* <div>
              <Label>Status</Label>
              <Select
                value={formData.isActive}
                onValueChange={(value) =>
                  setFormData({ ...formData, isActive: value })
                }
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="true">Active</SelectItem>
                  <SelectItem value="false">Inactive</SelectItem>
                </SelectContent>
              </Select>
            </div> */}
            <div>
              <Label htmlFor="edit-image">Banner Image</Label>
              <Input
                id="edit-image"
                type="file"
                accept="image/*"
                onChange={handleFileChange}
              />
              {currentBanner && (
                <div className="mt-2">
                  <p className="text-sm text-gray-500">Current Image:</p>
                  <img
                    src={`${import.meta.env.VITE_BASE_URL_IMG}/${currentBanner.image}`}
                    alt="Current banner"
                    className="w-32 h-20 object-cover mt-1"
                  />
                </div>
              )}
            </div>
            <DialogFooter>
              <Button
                variant="outline"
                onClick={() => setIsEditDialogOpen(false)}
              >
                Cancel
              </Button>
              <Button onClick={handleEditSubmit}>Save Changes</Button>
            </DialogFooter>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
import { useState, useEffect } from "react";
import axios from "axios";
import Cookies from "js-cookie";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";

import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { toast } from "@/components/ui/use-toast";
import { Search, MoreHorizontal, Trash2, Plus, Palette } from "lucide-react";

// Form schema for label creation
const formSchema = z.object({
  name: z.string().min(1, {
    message: "Label name is required.",
  }),
  color: z.string().min(1, {
    message: "Color is required.",
  }),
});

export function LabelManagement() {
  const [labels, setLabels] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const token = Cookies.get("admin_token");

  const form = useForm({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: "",
      color: "#3b82f6", // Default blue color
    },
  });

  // Fetch all labels
  const fetchLabels = async () => {
    try {
      const response = await axios.get(
        `${import.meta.env.VITE_BASE_UR}admin/get-labels`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      if (response.data) {
        setLabels(response.data.labels || response.data);
      } else {
        toast({
          title: "Error",
          description: response.data.message || "Failed to fetch labels.",
          variant: "destructive",
        });
      }
    } catch (error) {
      console.error("Failed to fetch labels:", error);
      let errorMessage = "Failed to fetch labels. Please try again.";
      if (axios.isAxiosError(error)) {
        errorMessage =
          error.response?.data?.message || error.message || errorMessage;
      }
      toast({
        title: "Error",
        description: errorMessage,
        variant: "destructive",
      });
    }
  };

  useEffect(() => {
    fetchLabels();
  }, []);

  // Filter labels based on search term
  const filteredLabels = labels.filter((label) =>
    label.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // Handle form submission (create new label)
  const onSubmit = async (values) => {
    setIsLoading(true);
    try {
      const response = await axios.post(
        `${import.meta.env.VITE_BASE_UR}admin/labels`,
        values,
        {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        }
      );

      if (response.data) {
        toast({
          title: "Label Created",
          description: "The label was created successfully.",
        });
        await fetchLabels();
        setIsDialogOpen(false);
        form.reset();
      }
    } catch (error) {
      console.error("Failed to create label:", error);
      toast({
        title: "Error",
        description: error.response?.data?.message || "An error occurred",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  // Delete a label
  const handleDeleteLabel = async (labelId) => {
    try {
      const response = await axios.delete(
        `${import.meta.env.VITE_BASE_UR}admin/labels/${labelId}`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      if (response.data) {
        toast({
          title: "Label Deleted",
          description: "The label has been deleted successfully.",
        });
        await fetchLabels();
      }
    } catch (error) {
      console.error("Failed to delete label:", error);
      toast({
        title: "Error",
        description: error.response?.data?.message || "Failed to delete label",
        variant: "destructive",
      });
    }
  };

  // Color options for the color picker
  const colorOptions = [
    "#3b82f6", // blue
    "#ef4444", // red
    "#10b981", // green
    "#f59e0b", // amber
    "#8b5cf6", // violet
    "#ec4899", // pink
    "#06b6d4", // cyan
    "#84cc16", // lime
    "#f97316", // orange
    "#64748b", // slate
  ];

  return (
    <div className="space-y-6 p-6">
      {/* Header with Search and Add Button */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between space-y-4 sm:space-y-0">
        <div className="flex items-center space-x-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
            <Input
              placeholder="Search labels..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-64 pl-10"
            />
          </div>
        </div>
        <Button onClick={() => setIsDialogOpen(true)}>
          <Plus className="h-4 w-4 mr-2" />
          Add Label
        </Button>
      </div>

      {/* Add Label Dialog */}
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle>Add New Label</DialogTitle>
            <DialogDescription>
              Create a new label with a name and color.
            </DialogDescription>
          </DialogHeader>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
              <FormField
                control={form.control}
                name="name"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Label Name</FormLabel>
                    <FormControl>
                      <Input placeholder="Enter label name" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="color"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Color</FormLabel>
                    <FormControl>
                      <div className="space-y-4">
                        <div className="flex items-center space-x-2">
                          <Input 
                            type="color" 
                            value={field.value}
                            onChange={field.onChange}
                            className="w-12 h-12 p-1"
                          />
                          <Input 
                            value={field.value}
                            onChange={field.onChange}
                            placeholder="#3b82f6"
                            className="flex-1"
                          />
                        </div>
                        
                        <div className="grid grid-cols-5 gap-2">
                          {colorOptions.map((color) => (
                            <button
                              key={color}
                              type="button"
                              className="w-8 h-8 rounded-full border-2"
                              style={{
                                backgroundColor: color,
                                borderColor: field.value === color ? '#000' : 'transparent'
                              }}
                              onClick={() => form.setValue('color', color)}
                            />
                          ))}
                        </div>
                      </div>
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <div className="flex justify-end space-x-2 pt-4">
                <Button
                  variant="outline"
                  type="button"
                  onClick={() => setIsDialogOpen(false)}
                >
                  Cancel
                </Button>
                <Button type="submit" disabled={isLoading}>
                  {isLoading ? "Creating..." : "Create Label"}
                </Button>
              </div>
            </form>
          </Form>
        </DialogContent>
      </Dialog>

      {/* Labels Table */}
      <Card>
        <CardHeader>
          <CardTitle>Label Management</CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>#</TableHead>
                <TableHead>Name</TableHead>
                <TableHead>Color</TableHead>
                <TableHead>Created At</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredLabels.map((label, index) => (
                <TableRow key={label._id} className="hover:bg-gray-50">
                  <TableCell>{index + 1}</TableCell>
                  <TableCell className="font-medium">{label.name}</TableCell>
                  <TableCell>
                    <div className="flex items-center space-x-2">
                      <div 
                        className="w-6 h-6 rounded-full border"
                        style={{ backgroundColor: label.color }}
                      />
                      <span className="text-sm text-gray-600">
                        {label.color}
                      </span>
                    </div>
                  </TableCell>
                  <TableCell>
                    {new Date(label.createdAt).toLocaleDateString()}
                  </TableCell>
                  <TableCell className="text-right">
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="icon">
                          <MoreHorizontal className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem
                          className="text-red-600"
                          onClick={() => handleDeleteLabel(label._id)}
                        >
                          <Trash2 className="mr-2 h-4 w-4" />
                          Delete
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}
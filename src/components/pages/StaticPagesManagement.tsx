import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Search,
  Filter,
  Plus,
  MoreHorizontal,
  Edit,
  Trash2,
  Eye,
} from "lucide-react";
import { Label } from "@/components/ui/label";

const pages = [
  {
    id: 1,
    title: "About Us",
    slug: "about-us",
    status: "published",
    lastModified: "2024-01-15",
    author: "Admin",
    views: 1234,
    path: "/aboutus",
  },
  {
    id: 2,
    title: "Privacy Policy",
    slug: "privacy-policy",
    status: "published",
    lastModified: "2024-01-10",
    author: "Admin",
    views: 856,
    path: "/privacypolicy",
  },
  {
    id: 3,
    title: "Terms of Service",
    slug: "terms-of-service",
    status: "published",
    lastModified: "2024-01-08",
    author: "Admin",
    views: 723,
    path: "/termsofservice",
  },
  {
    id: 4,
    title: "Refund Policy",
    slug: "refund-policy",
    status: "draft",
    lastModified: "2024-01-05",
    author: "Admin",
    views: 0,
    path: "/refundpolicy",
  },
  // {
  //   id: 5,
  //   title: "Shipping Information",
  //   slug: "shipping-info",
  //   status: "published",
  //   lastModified: "2024-01-03",
  //   author: "Admin",
  //   views: 421,
  //   path: "/shipping-info",
  // },
];

export function StaticPagesManagement() {
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const navigate = useNavigate();

  const getStatusColor = (status) => {
    switch (status) {
      case "published":
        return "bg-green-100 text-green-800";
      case "draft":
        return "bg-yellow-100 text-yellow-800";
      case "archived":
        return "bg-gray-100 text-gray-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  const filteredPages = pages.filter((page) => {
    const matchesSearch =
      page.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      page.slug.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus =
      statusFilter === "all" || page.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const handlePreview = (path) => {
    navigate(path);
  };

  return (
    <div className="space-y-6 px-2 mx-auto ml-64 mt-14">
      {/* Header with Search and Filters */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div className="flex flex-col sm:flex-row sm:items-center gap-4 w-full">
          <div className="relative w-full max-w-xs">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
            <Input
              placeholder="Search pages..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10"
            />
          </div>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" size="sm" className="w-full sm:w-auto">
                <Filter className="h-4 w-4 mr-2" />
                Status: {statusFilter === "all" ? "All" : statusFilter}
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent>
              <DropdownMenuItem onClick={() => setStatusFilter("all")}>
                All
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => setStatusFilter("published")}>
                Published
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => setStatusFilter("draft")}>
                Draft
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => setStatusFilter("archived")}>
                Archived
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
        <div className="flex gap-2 w-full md:w-auto">
          {/* <Button variant="outline" className="w-full md:w-auto">
            Analytics
          </Button> */}
          <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
            <DialogTrigger asChild>
              <Button className="w-full md:w-auto">
                <Plus className="h-4 w-4 mr-2" />
                Add Page
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-lg w-full">
              <DialogHeader>
                <DialogTitle>Add New Page</DialogTitle>
              </DialogHeader>
              <div className="space-y-4">
                <div>
                  <Label htmlFor="pageTitle">Page Title</Label>
                  <Input id="pageTitle" placeholder="Enter page title" />
                </div>
                <div>
                  <Label htmlFor="slug">Slug</Label>
                  <Input id="slug" placeholder="Enter page slug" />
                </div>
                <div className="flex justify-end gap-2">
                  <Button
                    variant="outline"
                    onClick={() => setIsAddDialogOpen(false)}
                  >
                    Cancel
                  </Button>
                  <Button onClick={() => setIsAddDialogOpen(false)}>
                    Create Page
                  </Button>
                </div>
              </div>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      {/* Pages Table */}
      <Card className="overflow-x-auto w-full">
        <CardHeader>
          <CardTitle>Static Pages ({filteredPages.length})</CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <Table className="min-w-[700px]">
              <TableHeader>
                <TableRow>
                  <TableHead>#</TableHead>
                  <TableHead>Title</TableHead>
                  <TableHead>Slug</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Views</TableHead>
                  <TableHead>Last Modified</TableHead>
                  <TableHead>Author</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredPages.map((page) => (
                  <TableRow key={page.id} className="hover:bg-gray-50">
                    <TableCell>{filteredPages.indexOf(page) + 1}</TableCell>
                    <TableCell className="font-medium">
                      <a
                        href={page.path}
                        className="text-blue-600 hover:underline"
                        target="_blank"
                        rel="noopener noreferrer"
                      >
                        {page.title}
                      </a>
                    </TableCell>
                    <TableCell className="text-gray-500">
                      <a
                        href={page.path}
                        className="hover:underline"
                        target="_blank"
                        rel="noopener noreferrer"
                      >
                        /{page.slug}
                      </a>
                    </TableCell>
                    <TableCell>
                      <Badge className={getStatusColor(page.status)}>
                        {page.status}
                      </Badge>
                    </TableCell>
                    <TableCell>{page.views}</TableCell>
                    <TableCell>{page.lastModified}</TableCell>
                    <TableCell>{page.author}</TableCell>
                    <TableCell className="text-right">
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="icon">
                            <MoreHorizontal className="h-4 w-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuItem
                            onClick={() => handlePreview(page.path)}
                          >
                            <Edit className="mr-2 h-4 w-4" />
                            ADD
                          </DropdownMenuItem>
                          <DropdownMenuItem>
                            <Eye className="mr-2 h-4 w-4" />
                            preview
                          </DropdownMenuItem>
                          <DropdownMenuItem className="text-red-600">
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
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

import React, { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { DataGrid } from "@/components/ui/data-grid";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { useToast } from "@/hooks/use-toast";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
} from "@/components/ui/dropdown-menu";
import {
  Plus,
  MoreHorizontal,
  Shield,
  Eye,
  Edit,
  Trash2,
  Settings,
  FileSpreadsheet,
  FileText,
  Import,
  PenTool,
  Bot,
  RotateCcw,
  Activity,
  Calendar,
  Users,
} from "lucide-react";
import { useNavigate } from "react-router-dom";
import permissionsData from "@/data/permissions.json";

const Permissions = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const { permissions } = permissionsData;
  const [activeFilters, setActiveFilters] = useState<Record<string, string[]>>({});
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [editingPermission, setEditingPermission] = useState<any>(null);
  const [formData, setFormData] = useState({
    name: "",
    slug: "",
    permissionGroup: "",
    description: ""
  });

  const handleAddPermission = () => {
    if (!formData.name || !formData.slug) {
      toast({
        title: "Error",
        description: "Please fill in all required fields",
        variant: "destructive"
      });
      return;
    }
    
    toast({
      title: "Success",
      description: "Permission created successfully"
    });
    
    setIsAddDialogOpen(false);
    setFormData({ name: "", slug: "", permissionGroup: "", description: "" });
  };

  const handleEditPermission = (permission: any) => {
    setEditingPermission(permission);
    setFormData({
      name: permission.name,
      slug: permission.slug,
      permissionGroup: permission.permissionGroup || "",
      description: permission.description
    });
    setIsEditDialogOpen(true);
  };

  const handleUpdatePermission = () => {
    if (!formData.name || !formData.slug) {
      toast({
        title: "Error", 
        description: "Please fill in all required fields",
        variant: "destructive"
      });
      return;
    }
    
    toast({
      title: "Success",
      description: "Permission updated successfully"
    });
    
    setIsEditDialogOpen(false);
    setEditingPermission(null);
    setFormData({ name: "", slug: "", permissionGroup: "", description: "" });
  };

  const handleDeletePermission = (permission: any) => {
    toast({
      title: "Success",
      description: `Permission "${permission.name}" deleted successfully`
    });
  };

  const handleCreateRoleTemplate = () => {
    toast({
      title: "Creating Role Template",
      description: "Role template creation feature will be available soon"
    });
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-GB", {
      day: "2-digit",
      month: "2-digit", 
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
      second: "2-digit"
    });
  };

  const columns = [
    {
      field: 'id',
      headerName: '',
      width: 50,
      sortable: false,
      filterable: false,
      renderCell: () => (
        <div className="flex items-center">
          <input type="checkbox" className="w-4 h-4 text-blue-600 border-gray-300 rounded" />
        </div>
      )
    },
    {
      field: 'name',
      headerName: 'Permission',
      width: 200,
      renderCell: (value: string) => (
        <span className="text-gray-900 font-medium font-poppins text-sm">{value}</span>
      )
    },
    {
      field: 'slug',
      headerName: 'Slug',
      width: 200,
      renderCell: (value: string) => (
        <span className="text-gray-700 font-poppins text-sm">{value}</span>
      )
    },
    {
      field: 'description',
      headerName: 'Description',
      width: 300,
      renderCell: (value: string) => (
        <span className="text-gray-700 font-poppins text-sm">{value || '-'}</span>
      )
    },
    {
      field: 'createdAt',
      headerName: 'Created At',
      width: 180,
      renderCell: (value: string) => (
        <span className="text-gray-700 font-poppins text-sm">{formatDate(value)}</span>
      )
    },
    {
      field: 'actions',
      headerName: 'Actions',
      width: 80,
      sortable: false,
      filterable: false,
      renderCell: (value: any, row: any) => (
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" size="sm" className="h-6 w-6 p-0 hover:bg-gray-100">
              <MoreHorizontal className="w-4 h-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="bg-white border-gray-200">
            <DropdownMenuItem onClick={() => handleEditPermission(row)}>
              <Eye className="w-4 h-4 mr-2" />
              View Details
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => handleEditPermission(row)}>
              <Edit className="w-4 h-4 mr-2" />
              Edit Permission
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem className="text-red-600" onClick={() => handleDeletePermission(row)}>
              <Trash2 className="w-4 h-4 mr-2" />
              Delete Permission
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      )
    }
  ];

  return (
    <div className="space-y-4 px-1 sm:px-0">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start gap-4">
        <h1 className="text-2xl font-bold text-gray-900 font-roboto-slab">Permissions</h1>
      </div>

      {/* Search and Actions */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div className="flex items-center gap-4 w-full sm:w-auto">
          <div className="relative flex-1 sm:flex-none">
            <input
              type="text"
              placeholder="Search permissions"
              className="w-full sm:w-80 px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>
          <select className="px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500">
            <option>Role templates</option>
            <option>All permissions</option>
          </select>
        </div>
        
        <div className="flex gap-2">
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button className="button-gradient text-white shadow-lg hover:shadow-xl transition-all duration-300">
                <Plus className="w-4 h-4 mr-2" />
                Create
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="bg-white border-gray-200 z-[60]">
              <DropdownMenuItem onClick={() => setIsAddDialogOpen(true)}>
                <PenTool className="w-4 h-4 mr-2" />
                Permission
              </DropdownMenuItem>
              <DropdownMenuItem onClick={handleCreateRoleTemplate}>
                <Users className="w-4 h-4 mr-2" />
                Role Template
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
           
          <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
            <DialogContent className="bg-white">
              <DialogHeader>
                <DialogTitle>Add New Permission</DialogTitle>
              </DialogHeader>
              <div className="space-y-4">
                <div>
                  <Label htmlFor="name">Permission Name *</Label>
                  <Input
                    id="name"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    placeholder="Enter permission name"
                  />
                </div>
                <div>
                  <Label htmlFor="slug">Slug *</Label>
                  <Input
                    id="slug"
                    value={formData.slug}
                    onChange={(e) => setFormData({ ...formData, slug: e.target.value })}
                    placeholder="Enter permission slug (e.g., jobs.create)"
                  />
                </div>
                <div>
                  <Label htmlFor="permissionGroup">Permission Group</Label>
                  <Input
                    id="permissionGroup"
                    value={formData.permissionGroup || ""}
                    onChange={(e) => setFormData({ ...formData, permissionGroup: e.target.value })}
                    placeholder="Enter permission group (e.g., Jobs, Candidates)"
                  />
                </div>
                <div>
                  <Label htmlFor="description">Description</Label>
                  <Textarea
                    id="description"
                    value={formData.description}
                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                    placeholder="Enter permission description"
                    rows={3}
                  />
                </div>
                <div className="flex justify-end gap-2">
                  <Button variant="outline" onClick={() => setIsAddDialogOpen(false)}>
                    Cancel
                  </Button>
                  <Button onClick={handleAddPermission} className="button-gradient text-white">
                    Create Permission
                  </Button>
                </div>
              </div>
            </DialogContent>
          </Dialog>
        </div>
        
        {/* Edit Dialog */}
        <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
          <DialogContent className="bg-white">
            <DialogHeader>
              <DialogTitle>Edit Permission</DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              <div>
                <Label htmlFor="edit-name">Permission Name *</Label>
                <Input
                  id="edit-name"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  placeholder="Enter permission name"
                />
              </div>
              <div>
                <Label htmlFor="edit-slug">Slug *</Label>
                <Input
                  id="edit-slug"
                  value={formData.slug}
                  onChange={(e) => setFormData({ ...formData, slug: e.target.value })}
                  placeholder="Enter permission slug"
                />
              </div>
              <div>
                <Label htmlFor="edit-permissionGroup">Permission Group</Label>
                <Input
                  id="edit-permissionGroup"
                  value={formData.permissionGroup || ""}
                  onChange={(e) => setFormData({ ...formData, permissionGroup: e.target.value })}
                  placeholder="Enter permission group"
                />
              </div>
              <div>
                <Label htmlFor="edit-description">Description</Label>
                <Textarea
                  id="edit-description"
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  placeholder="Enter permission description"
                  rows={3}
                />
              </div>
              <div className="flex justify-end gap-2">
                <Button variant="outline" onClick={() => setIsEditDialogOpen(false)}>
                  Cancel
                </Button>
                <Button onClick={handleUpdatePermission} className="button-gradient text-white">
                  Update Permission
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      {/* Data Table */}
      <Card className="border-gray-200 shadow-sm overflow-hidden">
        <CardContent className="p-0">
          <div className="overflow-x-auto min-h-0">
            <div className="min-w-full">
              <DataGrid
                rows={permissions}
                columns={columns}
                pageSizeOptions={[10, 25, 50]}
                checkboxSelection={false}
                onRowClick={(row) => console.log('Row clicked:', row)}
                initialFilters={activeFilters}
              />
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default Permissions;
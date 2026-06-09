import React, { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { DataGrid } from "@/components/ui/data-grid";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Checkbox } from "@/components/ui/checkbox";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
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
  Crown,
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
  User,
  Copy,
} from "lucide-react";
import { useNavigate } from "react-router-dom";
import rolesData from "@/data/roles.json";
import permissionsData from "@/data/permissions.json";

const Roles = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const { roles } = rolesData;
  const { permissions: availablePermissions } = permissionsData;
  const [activeFilters, setActiveFilters] = useState<Record<string, string[]>>({});
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [editingRole, setEditingRole] = useState<any>(null);
  const [formData, setFormData] = useState({
    name: "",
    slug: "",
    permissions: [] as string[],
    isDefault: false
  });

  const handleAddRole = () => {
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
      description: "Role created successfully"
    });
    
    setIsAddDialogOpen(false);
    setFormData({ name: "", slug: "", permissions: [], isDefault: false });
  };

  const handleEditRole = (role: any) => {
    setEditingRole(role);
    setFormData({
      name: role.name,
      slug: role.slug,
      permissions: role.permissions,
      isDefault: role.isDefault
    });
    setIsEditDialogOpen(true);
  };

  const handleUpdateRole = () => {
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
      description: "Role updated successfully"
    });
    
    setIsEditDialogOpen(false);
    setEditingRole(null);
    setFormData({ name: "", slug: "", permissions: [], isDefault: false });
  };

  const handleDeleteRole = (role: any) => {
    toast({
      title: "Success",
      description: `Role "${role.name}" deleted successfully`
    });
  };

  const handleCloneRole = (role: any) => {
    setFormData({
      name: `${role.name} Copy`,
      slug: `${role.slug}-copy`,
      permissions: [...role.permissions],
      isDefault: false
    });
    setIsAddDialogOpen(true);
    toast({
      title: "Role Cloned",
      description: "Role data has been loaded for editing"
    });
  };

  const handleCreateFromTemplate = () => {
    setFormData({
      name: "",
      slug: "",
      permissions: ["jobs.view", "candidates.view"], // Default template permissions
      isDefault: false
    });
    setIsAddDialogOpen(true);
    toast({
      title: "Template Loaded",
      description: "Basic role template has been loaded"
    });
  };

  const togglePermission = (permissionSlug: string) => {
    setFormData(prev => ({
      ...prev,
      permissions: prev.permissions.includes(permissionSlug)
        ? prev.permissions.filter(p => p !== permissionSlug)
        : [...prev.permissions, permissionSlug]
    }));
  };

  const columns = [
    {
      field: 'name',
      headerName: 'Role',
      width: 200,
      renderCell: (value: string, row: any) => (
        <div className="flex items-center gap-3">
          {row.isDefault && (
            <User className="w-4 h-4 text-blue-500" />
          )}
          <div className="flex flex-col">
            <span className="text-gray-900 font-medium font-poppins text-sm">{value}</span>
            {row.isDefault && (
              <Badge className="bg-blue-100 text-blue-700 text-xs w-fit">default</Badge>
            )}
          </div>
        </div>
      )
    },
    {
      field: 'slug',
      headerName: 'Slug',
      width: 180,
      renderCell: (value: string) => (
        <span className="text-gray-700 font-poppins text-sm">{value}</span>
      )
    },
    {
      field: 'permissions',
      headerName: 'Permissions',
      width: 400,
      renderCell: (value: string[], row: any) => (
        <TooltipProvider>
          <div className="flex items-center gap-2 flex-wrap">
            {value.length === 0 ? (
              <span className="text-gray-500">-</span>
            ) : (
              <>
                {value.slice(0, 3).map((permission, index) => (
                  <Badge 
                    key={index}
                    className="bg-gray-100 text-gray-700 text-xs border border-gray-200"
                  >
                    {permission}
                  </Badge>
                ))}
                {row.morePermissions > 0 && (
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <Badge className="bg-blue-100 text-blue-700 text-xs border border-blue-200 cursor-help">
                        +{row.morePermissions} more
                      </Badge>
                    </TooltipTrigger>
                    <TooltipContent side="top" className="max-w-xs">
                      <div className="space-y-1">
                        <p className="font-medium">Additional permissions:</p>
                        {value.slice(3).map((permission, index) => (
                          <p key={index} className="text-xs">{permission}</p>
                        ))}
                      </div>
                    </TooltipContent>
                  </Tooltip>
                )}
              </>
            )}
          </div>
        </TooltipProvider>
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
            <DropdownMenuItem onClick={() => handleEditRole(row)}>
              <Eye className="w-4 h-4 mr-2" />
              View Details
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => handleEditRole(row)}>
              <Edit className="w-4 h-4 mr-2" />
              Edit Role
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => handleCloneRole(row)}>
              <Copy className="w-4 h-4 mr-2" />
              Clone Role
            </DropdownMenuItem>
            <DropdownMenuItem onClick={handleCreateFromTemplate}>
              <PenTool className="w-4 h-4 mr-2" />
              Create from Template
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem className="text-red-600" onClick={() => handleDeleteRole(row)}>
              <Trash2 className="w-4 h-4 mr-2" />
              Delete Role
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
        <h1 className="text-2xl font-bold text-gray-900 font-roboto-slab">Roles</h1>
      </div>

      {/* Search and Actions */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div className="relative flex-1 sm:flex-none">
          <input
            type="text"
            placeholder="Search users"
            className="w-full sm:w-80 px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
        </div>
        
        <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
          <DialogTrigger asChild>
            <Button className="button-gradient text-white shadow-lg hover:shadow-xl transition-all duration-300">
              <Plus className="w-4 h-4 mr-2" />
              Add Role
            </Button>
          </DialogTrigger>
          <DialogContent className="bg-white max-w-2xl max-h-[80vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>Add New Role</DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="role-name">Role Name *</Label>
                  <Input
                    id="role-name"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    placeholder="Enter role name"
                  />
                </div>
                <div>
                  <Label htmlFor="role-slug">Slug *</Label>
                  <Input
                    id="role-slug"
                    value={formData.slug}
                    onChange={(e) => setFormData({ ...formData, slug: e.target.value })}
                    placeholder="Enter role slug"
                  />
                </div>
              </div>
              
              <div className="flex items-center space-x-2">
                <Checkbox
                  id="default-role"
                  checked={formData.isDefault}
                  onCheckedChange={(checked) => setFormData({ ...formData, isDefault: !!checked })}
                />
                <Label htmlFor="default-role">Set as default role</Label>
              </div>
              
              <div>
                <Label>Permissions</Label>
                <div className="border rounded-lg p-4 max-h-60 overflow-y-auto space-y-3">
                  {availablePermissions.map((permission) => (
                    <div key={permission.slug} className="flex items-start space-x-3">
                      <Checkbox
                        id={permission.slug}
                        checked={formData.permissions.includes(permission.slug)}
                        onCheckedChange={() => togglePermission(permission.slug)}
                      />
                      <div className="flex-1">
                        <Label htmlFor={permission.slug} className="font-medium">{permission.name}</Label>
                        <p className="text-sm text-gray-500">{permission.description}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
              
              <div className="flex justify-end gap-2">
                <Button variant="outline" onClick={() => setIsAddDialogOpen(false)}>
                  Cancel
                </Button>
                <Button onClick={handleAddRole} className="button-gradient text-white">
                  Create Role
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
        
        {/* Edit Dialog */}
        <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
          <DialogContent className="bg-white max-w-2xl max-h-[80vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>Edit Role</DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="edit-role-name">Role Name *</Label>
                  <Input
                    id="edit-role-name"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    placeholder="Enter role name"
                  />
                </div>
                <div>
                  <Label htmlFor="edit-role-slug">Slug *</Label>
                  <Input
                    id="edit-role-slug"
                    value={formData.slug}
                    onChange={(e) => setFormData({ ...formData, slug: e.target.value })}
                    placeholder="Enter role slug"
                  />
                </div>
              </div>
              
              <div className="flex items-center space-x-2">
                <Checkbox
                  id="edit-default-role"
                  checked={formData.isDefault}
                  onCheckedChange={(checked) => setFormData({ ...formData, isDefault: !!checked })}
                />
                <Label htmlFor="edit-default-role">Set as default role</Label>
              </div>
              
              <div>
                <Label>Permissions</Label>
                <div className="border rounded-lg p-4 max-h-60 overflow-y-auto space-y-3">
                  {availablePermissions.map((permission) => (
                    <div key={permission.slug} className="flex items-start space-x-3">
                      <Checkbox
                        id={`edit-${permission.slug}`}
                        checked={formData.permissions.includes(permission.slug)}
                        onCheckedChange={() => togglePermission(permission.slug)}
                      />
                      <div className="flex-1">
                        <Label htmlFor={`edit-${permission.slug}`} className="font-medium">{permission.name}</Label>
                        <p className="text-sm text-gray-500">{permission.description}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
              
              <div className="flex justify-end gap-2">
                <Button variant="outline" onClick={() => setIsEditDialogOpen(false)}>
                  Cancel
                </Button>
                <Button onClick={handleUpdateRole} className="button-gradient text-white">
                  Update Role
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
                rows={roles}
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

export default Roles;
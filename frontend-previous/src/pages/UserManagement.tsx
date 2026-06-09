import React, { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { DataGrid } from "@/components/ui/data-grid";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
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
  Users,
  UserCheck,
  UserX,
  Shield,
  Crown,
  Eye,
  Edit,
  Trash2,
  Settings,
  Mail,
  Calendar,
  FileSpreadsheet,
  FileText,
  Import,
  PenTool,
  Bot,
  RotateCcw,
  Activity,
  UserPlus,
  TrendingUp,
} from "lucide-react";
import { useNavigate } from "react-router-dom";
import usersData from "@/data/users.json";

const UserManagement = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const { users } = usersData;
  const [activeFilters, setActiveFilters] = useState<Record<string, string[]>>({});
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [editingUser, setEditingUser] = useState<any>(null);
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    role: "",
    userType: "",
    organization: "",
    status: "Active"
  });

  const handleAddUser = () => {
    if (!formData.name || !formData.email || !formData.role) {
      toast({
        title: "Error",
        description: "Please fill in all required fields",
        variant: "destructive"
      });
      return;
    }
    
    toast({
      title: "Success",
      description: "User created successfully"
    });
    
    setIsAddDialogOpen(false);
    setFormData({ name: "", email: "", role: "", userType: "", organization: "", status: "Active" });
  };

  const handleEditUser = (user: any) => {
    setEditingUser(user);
    setFormData({
      name: user.name,
      email: user.email,
      role: user.role,
      userType: user.userType || "",
      organization: user.organization || "",
      status: user.status
    });
    setIsEditDialogOpen(true);
  };

  const handleUpdateUser = () => {
    if (!formData.name || !formData.email || !formData.role) {
      toast({
        title: "Error",
        description: "Please fill in all required fields",
        variant: "destructive"
      });
      return;
    }
    
    toast({
      title: "Success",
      description: "User updated successfully"
    });
    
    setIsEditDialogOpen(false);
    setEditingUser(null);
    setFormData({ name: "", email: "", role: "", userType: "", organization: "", status: "Active" });
  };

  const handleDeleteUser = (user: any) => {
    toast({
      title: "Success",
      description: `User "${user.name}" moved to trash successfully`
    });
  };

  const totalUsers = users.length;
  const activeUsers = users.filter(user => user.status === "Active").length;
  const inactiveUsers = users.filter(user => user.status === "Inactive").length;
  const administrators = users.filter(user => user.role === "Administrator").length;
  const trashedUsers = users.filter(user => user.trashed).length;

  const handleActiveUsersClick = () => {
    setActiveFilters({
      status: ["Active"]
    });
  };

  const handleInactiveUsersClick = () => {
    setActiveFilters({
      status: ["Inactive"]
    });
  };

  const handleAdminsClick = () => {
    setActiveFilters({
      role: ["Administrator"]
    });
  };

  const handleTrashedClick = () => {
    setActiveFilters({
      trashed: ["true"]
    });
  };

  const navigationCards = [
    {
      title: "Total Users",
      value: totalUsers.toString(),
      icon: Users,
      color: "text-blue-700",
      gradientOverlay: "bg-gradient-to-br from-blue-400/30 via-blue-500/20 to-blue-600/30",
      onClick: () => setActiveFilters({})
    },
    {
      title: "Active Users",
      value: activeUsers.toString(),
      icon: UserCheck,
      color: "text-green-700",
      gradientOverlay: "bg-gradient-to-br from-green-400/30 via-green-500/20 to-green-600/30",
      onClick: handleActiveUsersClick
    },
    {
      title: "Inactive Users",
      value: inactiveUsers.toString(),
      icon: UserX,
      color: "text-amber-700",
      gradientOverlay: "bg-gradient-to-br from-amber-400/30 via-amber-500/20 to-amber-600/30",
      onClick: handleInactiveUsersClick
    },
    {
      title: "Administrators",
      value: administrators.toString(),
      icon: Crown,
      color: "text-purple-700",
      gradientOverlay: "bg-gradient-to-br from-purple-400/30 via-purple-500/20 to-purple-600/30",
      onClick: handleAdminsClick
    },
    {
      title: "Trashed",
      value: trashedUsers.toString(),
      icon: Trash2,
      color: "text-red-700",
      gradientOverlay: "bg-gradient-to-br from-red-400/30 via-red-500/20 to-red-600/30",
      onClick: handleTrashedClick
    }
  ];

  const getStatusColor = (status: string, trashed?: boolean) => {
    if (trashed) return 'bg-red-100 text-red-800 border-red-200';
    switch (status) {
      case 'Active': return 'bg-green-100 text-green-800 border-green-200';
      case 'Inactive': return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      default: return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const getRoleColor = (role: string) => {
    switch (role) {
      case 'Administrator': return 'bg-purple-100 text-purple-800 border-purple-200';
      case 'admin': return 'bg-purple-100 text-purple-800 border-purple-200';
      case 'Customer': return 'bg-blue-100 text-blue-800 border-blue-200';
      default: return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString();
  };

  const columns = [
    {
      field: 'id',
      headerName: 'ID',
      width: 60,
      renderCell: (value: number) => (
        <span className="text-gray-600 font-medium font-poppins text-xs">#{value}</span>
      )
    },
    {
      field: 'user',
      headerName: 'User',
      width: 250,
      renderCell: (value: any, row: any) => (
        <div className="flex items-center gap-3">
          <Avatar className="h-8 w-8">
            <AvatarFallback className="bg-green-100 text-green-700 text-xs font-medium">
              {row.avatar}
            </AvatarFallback>
          </Avatar>
          <div className="flex flex-col">
            <button
              onClick={(e) => {
                e.stopPropagation();
                navigate(`/dashboard/users/${row.id}`);
              }}
              className="font-medium text-blue-600 hover:text-blue-800 hover:underline font-poppins text-xs text-left"
            >
              {row.name}
            </button>
            <span className="text-gray-500 font-poppins text-xs">{row.email}</span>
          </div>
        </div>
      )
    },
    {
      field: 'role',
      headerName: 'Role',
      width: 120,
      renderCell: (value: string) => (
        <Badge className={`${getRoleColor(value)} border font-medium font-poppins text-xs whitespace-nowrap`}>{value}</Badge>
      )
    },
    {
      field: 'organization',
      headerName: 'Organization',
      width: 150,
      renderCell: (value: string) => (
        <span className="text-gray-700 font-poppins text-xs">{value || '-'}</span>
      )
    },
    {
      field: 'status',
      headerName: 'Status',
      width: 100,
      renderCell: (value: string, row: any) => {
        if (row.trashed) {
          return (
            <div className="flex items-center gap-2">
              <Badge className="bg-red-100 text-red-800 border-red-200 border font-medium font-poppins text-xs whitespace-nowrap">Trashed</Badge>
            </div>
          );
        }
        return (
          <Badge className={`${getStatusColor(value)} border font-medium font-poppins text-xs whitespace-nowrap`}>{value}</Badge>
        );
      }
    },
    {
      field: 'joinedDate',
      headerName: 'Joined',
      width: 100,
      renderCell: (value: string) => (
        <span className="text-gray-700 font-poppins text-xs whitespace-nowrap">{formatDate(value)}</span>
      )
    },
    {
      field: 'lastSignIn',
      headerName: 'Last Sign In',
      width: 120,
      renderCell: (value: string | null) => (
        <span className="text-gray-700 font-poppins text-xs whitespace-nowrap">{value ? formatDate(value) : '-'}</span>
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
              <MoreHorizontal className="w-3 h-3" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="bg-white border-gray-200">
            <DropdownMenuItem onClick={() => navigate(`/dashboard/users/${row.id}`)}>
              <Eye className="w-4 h-4 mr-2" />
              View Details
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => handleEditUser(row)}>
              <Edit className="w-4 h-4 mr-2" />
              Edit User
            </DropdownMenuItem>
            <DropdownMenuItem>
              <Mail className="w-4 h-4 mr-2" />
              Send Email
            </DropdownMenuItem>
            <DropdownMenuItem>
              <Shield className="w-4 h-4 mr-2" />
              Permissions
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem className="text-red-600" onClick={() => handleDeleteUser(row)}>
              <Trash2 className="w-4 h-4 mr-2" />
              {row.trashed ? 'Delete Permanently' : 'Move to Trash'}
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      )
    }
  ];

  return (
    <div className="space-y-2 sm:space-y-3 md:space-y-4 px-1 sm:px-0">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2 sm:gap-3">
        <div>
          <h1 className="text-lg sm:text-xl md:text-2xl font-bold text-gray-900 font-roboto-slab">
            User Management
          </h1>
        </div>
        <div className="flex items-center gap-1 sm:gap-2 w-full sm:w-auto">
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" size="sm" className="border-green-200 hover:bg-green-50 hover:border-green-300 text-xs flex-1 sm:flex-none px-2 sm:px-3">
                <Calendar className="w-3 h-3 mr-1" />
                <span className="hidden sm:inline">Export</span>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="bg-white border-gray-200 z-50">
              <DropdownMenuItem>
                <FileText className="w-4 h-4 mr-2" />
                Export as PDF
              </DropdownMenuItem>
              <DropdownMenuItem>
                <FileSpreadsheet className="w-4 h-4 mr-2" />
                Export as Excel
              </DropdownMenuItem>
              <DropdownMenuItem>
                <FileSpreadsheet className="w-4 h-4 mr-2" />
                Export to Google Sheets
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
          
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" size="sm" className="border-blue-200 hover:bg-blue-50 hover:border-blue-300 text-xs flex-1 sm:flex-none px-2 sm:px-3">
                <Settings className="w-3 h-3 mr-1" />
                <span className="hidden sm:inline">Actions</span>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="bg-white border-gray-200 z-50">
              <DropdownMenuItem>
                <UserCheck className="w-4 h-4 mr-2" />
                Activate Selected
              </DropdownMenuItem>
              <DropdownMenuItem>
                <UserX className="w-4 h-4 mr-2" />
                Deactivate Selected
              </DropdownMenuItem>
              <DropdownMenuItem>
                <Mail className="w-4 h-4 mr-2" />
                Send Bulk Email
              </DropdownMenuItem>
              <DropdownMenuItem>
                <Activity className="w-4 h-4 mr-2" />
                Change Role
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem onClick={() => navigate('/dashboard/settings?tab=application-usage')}>
                <TrendingUp className="w-4 h-4 mr-2" />
                Monitor Application Usage
              </DropdownMenuItem>
              <DropdownMenuItem>
                <RotateCcw className="w-4 h-4 mr-2" />
                Mass Changes
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>

          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button className="button-gradient text-white shadow-lg hover:shadow-xl transition-all duration-300 text-xs flex-1 sm:flex-none px-2 sm:px-3">
                <Plus className="w-3 h-3 mr-1" />
                <span className="hidden sm:inline">Add User</span>
                <span className="sm:hidden">Add</span>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="bg-white border-gray-200 z-50">
              <DropdownMenuItem onClick={() => setIsAddDialogOpen(true)}>
                <PenTool className="w-4 h-4 mr-2" />
                Manual User
              </DropdownMenuItem>
              <DropdownMenuItem>
                <Import className="w-4 h-4 mr-2" />
                Import from CSV
              </DropdownMenuItem>
              <DropdownMenuItem>
                <Bot className="w-4 h-4 mr-2" />
                AI Assistant
              </DropdownMenuItem>
              <DropdownMenuItem>
                <Mail className="w-4 h-4 mr-2" />
                Invite via Email
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>

      {/* Navigation Cards - Mobile Optimized */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-1 sm:gap-2">
        {navigationCards.map((card) => {
          const IconComponent = card.icon;
          return (
            <Card 
              key={card.title} 
              className="relative overflow-hidden border-0 shadow-sm hover:shadow-md transition-all duration-300 hover:-translate-y-0.5 group cursor-pointer backdrop-blur-xl bg-white/20"
              onClick={card.onClick}
            >
              <div className={`absolute inset-0 ${card.gradientOverlay}`}></div>
              <div className="absolute inset-0 bg-gradient-to-br from-white/40 via-white/20 to-transparent"></div>
              <CardContent className="relative p-1.5 sm:p-2">
                <div className="flex flex-col items-center space-y-1">
                  <div className="p-1 sm:p-1.5 rounded-full bg-white/30 backdrop-blur-sm shadow-sm group-hover:bg-white/40 transition-all border border-white/20">
                    <IconComponent className={`h-2.5 w-2.5 sm:h-3 sm:w-3 ${card.color}`} />
                  </div>
                  <div className="text-center">
                    <p className="text-xs font-semibold text-gray-600 font-roboto-slab truncate">{card.title}</p>
                    <p className="text-xs sm:text-sm font-bold text-gray-900 font-roboto-slab">{card.value}</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* Add User Dialog */}
      <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
        <DialogContent className="bg-white">
          <DialogHeader>
            <DialogTitle>Add New User</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="user-name">Full Name *</Label>
                <Input
                  id="user-name"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  placeholder="Enter full name"
                />
              </div>
              <div>
                <Label htmlFor="user-email">Email Address *</Label>
                <Input
                  id="user-email"
                  type="email"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  placeholder="Enter email address"
                />
              </div>
            </div>
            
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="user-role">Role *</Label>
                <Select value={formData.role} onValueChange={(value) => setFormData({ ...formData, role: value })}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select role" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Administrator">Administrator</SelectItem>
                    <SelectItem value="HR Manager">HR Manager</SelectItem>
                    <SelectItem value="Recruiter">Recruiter</SelectItem>
                    <SelectItem value="Account Manager">Account Manager</SelectItem>
                    <SelectItem value="Team Lead">Team Lead</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label htmlFor="user-status">Status</Label>
                <Select value={formData.status} onValueChange={(value) => setFormData({ ...formData, status: value })}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Active">Active</SelectItem>
                    <SelectItem value="Inactive">Inactive</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            
            <div>
              <Label htmlFor="user-type">User type</Label>
              <Select value={formData.userType} onValueChange={(value) => setFormData({ ...formData, userType: value })}>
                <SelectTrigger>
                  <SelectValue placeholder="Select user type" />
                </SelectTrigger>
                  <SelectContent className="z-[70]">
                  <SelectItem value="Recruiter">Recruiter</SelectItem>
                  <SelectItem value="Hiring Manager/Account manager (Light users)">Hiring Manager/Account manager (Light users)</SelectItem>
                  <SelectItem value="Client">Client</SelectItem>
                  <SelectItem value="Vendor">Vendor</SelectItem>
                  <SelectItem value="Candidate">Candidate</SelectItem>
                  <SelectItem value="Employee">Employee</SelectItem>
                </SelectContent>
              </Select>
            </div>
            
            <div>
              <Label htmlFor="user-organization">Organization</Label>
              <Select value={formData.organization} onValueChange={(value) => setFormData({ ...formData, organization: value })}>
                <SelectTrigger>
                  <SelectValue placeholder="Select organization" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Executive Team">Executive Team</SelectItem>
                  <SelectItem value="Human Resources">Human Resources</SelectItem>
                  <SelectItem value="Engineering">Engineering</SelectItem>
                  <SelectItem value="Sales">Sales</SelectItem>
                  <SelectItem value="Marketing">Marketing</SelectItem>
                  <SelectItem value="Finance">Finance</SelectItem>
                  <SelectItem value="Operations">Operations</SelectItem>
                </SelectContent>
              </Select>
            </div>
            
            <div className="flex justify-end gap-2">
              <Button variant="outline" onClick={() => setIsAddDialogOpen(false)}>
                Cancel
              </Button>
              <Button onClick={handleAddUser} className="button-gradient text-white">
                Create User
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
      
      {/* Edit User Dialog */}
      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent className="bg-white">
          <DialogHeader>
            <DialogTitle>Edit User</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="edit-user-name">Full Name *</Label>
                <Input
                  id="edit-user-name"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  placeholder="Enter full name"
                />
              </div>
              <div>
                <Label htmlFor="edit-user-email">Email Address *</Label>
                <Input
                  id="edit-user-email"
                  type="email"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  placeholder="Enter email address"
                />
              </div>
            </div>
            
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="edit-user-role">Role *</Label>
                <Select value={formData.role} onValueChange={(value) => setFormData({ ...formData, role: value })}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select role" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Administrator">Administrator</SelectItem>
                    <SelectItem value="HR Manager">HR Manager</SelectItem>
                    <SelectItem value="Recruiter">Recruiter</SelectItem>
                    <SelectItem value="Account Manager">Account Manager</SelectItem>
                    <SelectItem value="Team Lead">Team Lead</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label htmlFor="edit-user-status">Status</Label>
                <Select value={formData.status} onValueChange={(value) => setFormData({ ...formData, status: value })}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Active">Active</SelectItem>
                    <SelectItem value="Inactive">Inactive</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            
            <div>
              <Label htmlFor="edit-user-type">User type</Label>
              <Select value={formData.userType} onValueChange={(value) => setFormData({ ...formData, userType: value })}>
                <SelectTrigger>
                  <SelectValue placeholder="Select user type" />
                </SelectTrigger>
                <SelectContent className="z-[70]">
                  <SelectItem value="Recruiter">Recruiter</SelectItem>
                  <SelectItem value="Hiring Manager/Account manager (Light users)">Hiring Manager/Account manager (Light users)</SelectItem>
                  <SelectItem value="Client">Client</SelectItem>
                  <SelectItem value="Vendor">Vendor</SelectItem>
                  <SelectItem value="Candidate">Candidate</SelectItem>
                  <SelectItem value="Employee">Employee</SelectItem>
                </SelectContent>
              </Select>
            </div>
            
            <div>
              <Label htmlFor="edit-user-organization">Organization</Label>
              <Select value={formData.organization} onValueChange={(value) => setFormData({ ...formData, organization: value })}>
                <SelectTrigger>
                  <SelectValue placeholder="Select organization" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Executive Team">Executive Team</SelectItem>
                  <SelectItem value="Human Resources">Human Resources</SelectItem>
                  <SelectItem value="Engineering">Engineering</SelectItem>
                  <SelectItem value="Sales">Sales</SelectItem>
                  <SelectItem value="Marketing">Marketing</SelectItem>
                  <SelectItem value="Finance">Finance</SelectItem>
                  <SelectItem value="Operations">Operations</SelectItem>
                </SelectContent>
              </Select>
            </div>
            
            <div className="flex justify-end gap-2">
              <Button variant="outline" onClick={() => setIsEditDialogOpen(false)}>
                Cancel
              </Button>
              <Button onClick={handleUpdateUser} className="button-gradient text-white">
                Update User
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Data Table - Mobile Optimized */}
      <Card className="border-gray-200 shadow-sm overflow-hidden">
        <CardContent className="p-0">
          <div className="overflow-x-auto min-h-0">
            <div className="min-w-full">
              <DataGrid
                rows={users}
                columns={columns}
                pageSizeOptions={[5, 10, 25, 50]}
                checkboxSelection
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

export default UserManagement;
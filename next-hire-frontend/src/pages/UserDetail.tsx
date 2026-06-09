import React, { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  ArrowLeft,
  Edit,
  Mail,
  Shield,
  Calendar,
  Activity,
  Clock,
  User,
  RefreshCw,
  Settings,
  Globe,
  Search,
  Filter,
  Eye,
  LogIn,
  LogOut,
  Trash2,
  UserPlus,
  Lock,
  Unlock,
  AlertTriangle,
  CheckCircle,
  XCircle,
  RotateCcw,
  History,
  Database,
  Key,
  FileText,
  CreditCard,
  Zap,
  Plus,
  ExternalLink,
  Coins,
  DollarSign,
  TrendingUp,
  Briefcase,
  Building2,
  ChevronDown,
} from "lucide-react";
import { useNavigate, useParams, useLocation } from "react-router-dom";
import usersData from "@/data/users.json";

const UserDetail = () => {
  const navigate = useNavigate();
  const { id } = useParams();
  const [activeTab, setActiveTab] = useState("profile");
  const [activityFilter, setActivityFilter] = useState("all");
  const [activitySearch, setActivitySearch] = useState("");
  const location = useLocation();
  
  const user = usersData.users.find(u => u.id === Number(id));

  React.useEffect(() => {
    const params = new URLSearchParams(location.search);
    const tab = params.get('tab') || 'profile';
    setActiveTab(tab);
  }, [location.search]);
  
  // Mock activity data - In real app, this would come from API
  const activityLogs = [
    {
      id: 1,
      type: 'login',
      title: 'User logged in',
      description: 'Successful login from Chrome on Windows',
      timestamp: '2024-01-15T10:30:00Z',
      ip: '192.168.1.100',
      location: 'New York, US',
      risk: 'low'
    },
    {
      id: 2,
      type: 'profile_update',
      title: 'Profile updated',
      description: 'Changed email address and phone number',
      timestamp: '2024-01-14T15:45:00Z',
      ip: '192.168.1.100',
      changes: ['email', 'phone'],
      risk: 'low'
    },
    {
      id: 3,
      type: 'password_change',
      title: 'Password changed',
      description: 'User changed their password',
      timestamp: '2024-01-12T09:15:00Z',
      ip: '192.168.1.100',
      risk: 'medium'
    },
    {
      id: 4,
      type: 'logout',
      title: 'User logged out',
      description: 'Session ended normally',
      timestamp: '2024-01-11T18:20:00Z',
      ip: '192.168.1.100',
      risk: 'low'
    },
    {
      id: 5,
      type: 'failed_login',
      title: 'Failed login attempt',
      description: 'Invalid password attempt from Chrome',
      timestamp: '2024-01-10T14:30:00Z',
      ip: '203.0.113.195',
      location: 'Unknown',
      risk: 'high'
    },
    {
      id: 6,
      type: 'account_lock',
      title: 'Account temporarily locked',
      description: 'Account locked due to multiple failed attempts',
      timestamp: '2024-01-10T14:35:00Z',
      ip: '203.0.113.195',
      risk: 'high'
    },
    {
      id: 7,
      type: 'permission_change',
      title: 'Role permissions updated',
      description: 'Admin updated user role permissions',
      timestamp: '2024-01-08T11:00:00Z',
      admin: 'System Admin',
      risk: 'medium'
    },
    {
      id: 8,
      type: 'data_export',
      title: 'Data exported',
      description: 'User exported their personal data',
      timestamp: '2024-01-05T16:45:00Z',
      ip: '192.168.1.100',
      risk: 'medium'
    }
  ];

  if (!user) {
    return (
      <div className="flex items-center justify-center h-64">
        <p className="text-gray-500">User not found</p>
      </div>
    );
  }

  const getStatusColor = (status: string, trashed?: boolean) => {
    if (trashed) return 'bg-red-100 text-red-800 border-red-200';
    switch (status) {
      case 'Active': return 'bg-green-100 text-green-800 border-green-200';
      case 'Inactive': return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      default: return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString();
  };

  const formatTimestamp = (timestamp: string) => {
    const date = new Date(timestamp);
    return {
      date: date.toLocaleDateString(),
      time: date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    };
  };

  const getActivityIcon = (type: string) => {
    switch (type) {
      case 'login': return LogIn;
      case 'logout': return LogOut;
      case 'profile_update': return Edit;
      case 'password_change': return Key;
      case 'failed_login': return XCircle;
      case 'account_lock': return Lock;
      case 'permission_change': return Shield;
      case 'data_export': return Database;
      default: return Activity;
    }
  };

  const getActivityColor = (type: string, risk: string) => {
    if (risk === 'high') return 'bg-red-100 text-red-600';
    if (risk === 'medium') return 'bg-yellow-100 text-yellow-600';
    
    switch (type) {
      case 'login': return 'bg-green-100 text-green-600';
      case 'logout': return 'bg-blue-100 text-blue-600';
      case 'profile_update': return 'bg-purple-100 text-purple-600';
      case 'password_change': return 'bg-orange-100 text-orange-600';
      case 'failed_login': return 'bg-red-100 text-red-600';
      case 'account_lock': return 'bg-red-100 text-red-600';
      case 'permission_change': return 'bg-indigo-100 text-indigo-600';
      case 'data_export': return 'bg-cyan-100 text-cyan-600';
      default: return 'bg-gray-100 text-gray-600';
    }
  };

  const getRiskBadgeColor = (risk: string) => {
    switch (risk) {
      case 'high': return 'bg-red-100 text-red-800 border-red-200';
      case 'medium': return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'low': return 'bg-green-100 text-green-800 border-green-200';
      default: return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const filteredActivities = activityLogs.filter(activity => {
    const matchesFilter = activityFilter === 'all' || activity.type === activityFilter;
    const matchesSearch = activity.title.toLowerCase().includes(activitySearch.toLowerCase()) ||
                         activity.description.toLowerCase().includes(activitySearch.toLowerCase());
    return matchesFilter && matchesSearch;
  });

  return (
    <div className="space-y-4 px-1 sm:px-0">
      {/* Header with Breadcrumb */}
      <div className="flex flex-col sm:flex-row justify-between items-start gap-4">
        <div className="space-y-2">
          <Breadcrumb>
            <BreadcrumbList>
              <BreadcrumbItem>
                <BreadcrumbLink href="/dashboard" className="text-muted-foreground">Home</BreadcrumbLink>
              </BreadcrumbItem>
              <BreadcrumbSeparator />
              <BreadcrumbItem>
                <BreadcrumbLink href="/dashboard/users" className="text-muted-foreground">User Management</BreadcrumbLink>
              </BreadcrumbItem>
              <BreadcrumbSeparator />
              <BreadcrumbItem>
                <BreadcrumbPage>Users</BreadcrumbPage>
              </BreadcrumbItem>
            </BreadcrumbList>
          </Breadcrumb>
          
          <div className="flex items-center gap-4">
            <Avatar className="h-16 w-16">
              <AvatarFallback className="bg-green-100 text-green-700 text-lg font-semibold">
                {user.avatar}
              </AvatarFallback>
            </Avatar>
            <div>
              <h1 className="text-2xl font-bold text-gray-900 font-roboto-slab flex items-center gap-3">
                {user.name}
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="outline" size="sm" className="h-8 px-3 border-green-200 text-gray-700 hover:bg-green-50">
                      Sections
                      <ChevronDown className="w-4 h-4 ml-1" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="start" className="bg-white border-green-200 z-[60]">
                    <DropdownMenuItem onClick={() => navigate(`/dashboard/users/${id}?tab=profile`)}>Profile</DropdownMenuItem>
                    <DropdownMenuItem onClick={() => navigate(`/dashboard/users/${id}?tab=preferences`)}>Preferences</DropdownMenuItem>
                    <DropdownMenuItem onClick={() => navigate(`/dashboard/users/${id}?tab=defaults`)}>Defaults</DropdownMenuItem>
                    <DropdownMenuItem onClick={() => navigate(`/dashboard/users/${id}?tab=integrations`)}>Integrations</DropdownMenuItem>
                    <DropdownMenuItem onClick={() => navigate(`/dashboard/users/${id}?tab=credits`)}>Credits</DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </h1>
              <p className="text-gray-600">{user.email}</p>
              <p className="text-sm text-gray-500">User ID: {user.id.toString().padStart(8, '0')}-a5a3-43ce-8374-a04e28b6855b</p>
            </div>
          </div>
        </div>
        
      </div>

      {/* Tabs */}
      <Tabs value={activeTab} onValueChange={(val) => { setActiveTab(val); const params = new URLSearchParams(location.search); params.set('tab', val); navigate(`/dashboard/users/${id}?${params.toString()}`); }} className="w-full">
        <TabsList className="grid w-full grid-cols-5 max-w-3xl">
          <TabsTrigger value="profile" className="flex items-center gap-2">
            <User className="w-4 h-4" />
            Profile
          </TabsTrigger>
          <TabsTrigger value="preferences" className="flex items-center gap-2">
            <Settings className="w-4 h-4" />
            Preferences
          </TabsTrigger>
          <TabsTrigger value="defaults" className="flex items-center gap-2">
            <Building2 className="w-4 h-4" />
            Defaults
          </TabsTrigger>
          <TabsTrigger value="integrations" className="flex items-center gap-2">
            <Zap className="w-4 h-4" />
            Integrations
          </TabsTrigger>
          <TabsTrigger value="credits" className="flex items-center gap-2">
            <CreditCard className="w-4 h-4" />
            Credits
          </TabsTrigger>
        </TabsList>

        <TabsContent value="profile" className="space-y-6">
          {/* Profile Information */}
          <Card className="border-gray-200 shadow-sm">
            <CardContent className="p-6 space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-4">
                  <div>
                    <label className="text-sm font-medium text-gray-500">Full name:</label>
                    <p className="text-base font-medium text-gray-900">{user.name}</p>
                  </div>
                  
                  <div>
                    <label className="text-sm font-medium text-gray-500">Email address:</label>
                    <div className="flex items-center gap-2">
                      <p className="text-base text-gray-900">{user.email}</p>
                      <Badge className="bg-yellow-100 text-yellow-800 border-yellow-200 text-xs">
                        Not verified
                      </Badge>
                    </div>
                  </div>
                  
                  <div>
                    <label className="text-sm font-medium text-gray-500">Role:</label>
                    <p className="text-base text-gray-900">{user.role}</p>
                  </div>
                </div>
                
                <div className="space-y-4">
                  <div>
                    <label className="text-sm font-medium text-gray-500">Status:</label>
                    <div className="flex items-center gap-2">
                      <Badge className={`${getStatusColor(user.status)} border text-sm`}>
                        {user.status}
                      </Badge>
                      {user.trashed && (
                        <Badge className="bg-red-100 text-red-800 border-red-200 text-sm">
                          Trashed
                        </Badge>
                      )}
                    </div>
                  </div>
                  
                  <div>
                    <label className="text-sm font-medium text-gray-500">Last Sign In:</label>
                    <p className="text-base text-gray-900">
                      {user.lastSignIn ? formatDate(user.lastSignIn) : 'Never'}
                    </p>
                  </div>
                  
                  <div>
                    <label className="text-sm font-medium text-gray-500">Joined:</label>
                    <p className="text-base text-gray-900">{formatDate(user.joinedDate)}</p>
                  </div>
                </div>
              </div>
              
              <div className="pt-4 border-t">
                <Button className="button-gradient text-white">
                  <Edit className="w-4 h-4 mr-2" />
                  Edit user details
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* Restore Account Section - Only show for trashed users */}
          {user.trashed && (
            <Card className="border-red-200 shadow-sm">
              <CardHeader>
                <CardTitle className="text-red-600 text-lg font-roboto-slab">Restore Account</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <h3 className="font-semibold text-gray-900 mb-2">Restore user account</h3>
                  <p className="text-gray-600 text-sm mb-4">
                    This account is currently trashed. Restoring the account will reactivate the user and all related data.
                  </p>
                  <Button variant="outline" className="border-red-200 text-red-600 hover:bg-red-50">
                    <RefreshCw className="w-4 h-4 mr-2" />
                    Restore user
                  </Button>
                </div>
              </CardContent>
            </Card>
          )}
        </TabsContent>

        <TabsContent value="preferences" className="space-y-6">
          {/* User Defaults Settings */}
          <Card className="border-gray-200 shadow-sm bg-gradient-to-br from-green-50/30 to-white">
            <CardHeader className="border-b border-green-100/50">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-gradient-to-br from-green-500 to-green-600 rounded-xl flex items-center justify-center shadow-lg shadow-green-500/20">
                  <Settings className="w-5 h-5 text-white" />
                </div>
                <div>
                  <CardTitle className="text-lg font-roboto-slab text-gray-900">
                    User Default Settings
                  </CardTitle>
                  <p className="text-sm text-green-600/70 font-medium">Configure your default preferences</p>
                </div>
              </div>
            </CardHeader>
            <CardContent className="p-0">
              <div className="space-y-0">
                {/* Time Zone Setting */}
                <div className="flex items-center justify-between p-4 hover:bg-green-50/30 transition-colors border-b border-gray-100/50 group">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 bg-green-100 rounded-lg flex items-center justify-center group-hover:bg-green-200 transition-colors">
                      <Globe className="w-4 h-4 text-green-600" />
                    </div>
                    <div>
                      <p className="font-medium text-gray-900">Time Zone</p>
                      <p className="text-sm text-gray-500">Set your default timezone</p>
                    </div>
                  </div>
                  <Select defaultValue="america/new_york">
                    <SelectTrigger className="w-48 border-green-200 focus:border-green-500 focus:ring-green-500/20">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent className="bg-white border-green-200 shadow-xl z-50">
                      <SelectItem value="america/new_york">Eastern Time (UTC-5)</SelectItem>
                      <SelectItem value="america/chicago">Central Time (UTC-6)</SelectItem>
                      <SelectItem value="america/denver">Mountain Time (UTC-7)</SelectItem>
                      <SelectItem value="america/los_angeles">Pacific Time (UTC-8)</SelectItem>
                      <SelectItem value="europe/london">London (UTC+0)</SelectItem>
                      <SelectItem value="europe/paris">Paris (UTC+1)</SelectItem>
                      <SelectItem value="asia/tokyo">Tokyo (UTC+9)</SelectItem>
                      <SelectItem value="australia/sydney">Sydney (UTC+11)</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                {/* Date Format Setting */}
                <div className="flex items-center justify-between p-4 hover:bg-green-50/30 transition-colors border-b border-gray-100/50 group">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 bg-green-100 rounded-lg flex items-center justify-center group-hover:bg-green-200 transition-colors">
                      <Calendar className="w-4 h-4 text-green-600" />
                    </div>
                    <div>
                      <p className="font-medium text-gray-900">Date Format</p>
                      <p className="text-sm text-gray-500">Choose your preferred date format</p>
                    </div>
                  </div>
                  <Select defaultValue="mm-dd-yyyy">
                    <SelectTrigger className="w-48 border-green-200 focus:border-green-500 focus:ring-green-500/20">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent className="bg-white border-green-200 shadow-xl z-50">
                      <SelectItem value="mm-dd-yyyy">MM/DD/YYYY (US)</SelectItem>
                      <SelectItem value="dd-mm-yyyy">DD/MM/YYYY (EU)</SelectItem>
                      <SelectItem value="yyyy-mm-dd">YYYY-MM-DD (ISO)</SelectItem>
                      <SelectItem value="dd-mmm-yyyy">DD-MMM-YYYY</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                {/* Currency Setting */}
                <div className="flex items-center justify-between p-4 hover:bg-green-50/30 transition-colors border-b border-gray-100/50 group">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 bg-green-100 rounded-lg flex items-center justify-center group-hover:bg-green-200 transition-colors">
                      <span className="text-green-600 font-bold text-sm">$</span>
                    </div>
                    <div>
                      <p className="font-medium text-gray-900">Currency</p>
                      <p className="text-sm text-gray-500">Default currency for financial data</p>
                    </div>
                  </div>
                  <Select defaultValue="usd">
                    <SelectTrigger className="w-48 border-green-200 focus:border-green-500 focus:ring-green-500/20">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent className="bg-white border-green-200 shadow-xl z-50">
                      <SelectItem value="usd">USD - US Dollar ($)</SelectItem>
                      <SelectItem value="eur">EUR - Euro (€)</SelectItem>
                      <SelectItem value="gbp">GBP - British Pound (£)</SelectItem>
                      <SelectItem value="jpy">JPY - Japanese Yen (¥)</SelectItem>
                      <SelectItem value="cad">CAD - Canadian Dollar (C$)</SelectItem>
                      <SelectItem value="aud">AUD - Australian Dollar (A$)</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                {/* Language Setting */}
                <div className="flex items-center justify-between p-4 hover:bg-green-50/30 transition-colors border-b border-gray-100/50 group">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 bg-green-100 rounded-lg flex items-center justify-center group-hover:bg-green-200 transition-colors">
                      <Globe className="w-4 h-4 text-green-600" />
                    </div>
                    <div>
                      <p className="font-medium text-gray-900">Language</p>
                      <p className="text-sm text-gray-500">Interface language preference</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-sm text-gray-600">English</span>
                    <div className="w-6 h-6 bg-green-500 rounded-full flex items-center justify-center">
                      <div className="w-3 h-3 bg-white rounded-full"></div>
                    </div>
                  </div>
                </div>

                {/* Items Per Page Setting */}
                <div className="flex items-center justify-between p-4 hover:bg-green-50/30 transition-colors border-b border-gray-100/50 group">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 bg-green-100 rounded-lg flex items-center justify-center group-hover:bg-green-200 transition-colors">
                      <span className="text-green-600 font-bold text-xs">#</span>
                    </div>
                    <div>
                      <p className="font-medium text-gray-900">Items Per Page</p>
                      <p className="text-sm text-gray-500">Default pagination size</p>
                    </div>
                  </div>
                  <Select defaultValue="25">
                    <SelectTrigger className="w-32 border-green-200 focus:border-green-500 focus:ring-green-500/20">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent className="bg-white border-green-200 shadow-xl z-50">
                      <SelectItem value="10">10</SelectItem>
                      <SelectItem value="25">25</SelectItem>
                      <SelectItem value="50">50</SelectItem>
                      <SelectItem value="100">100</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

              </div>

              {/* Action Buttons */}
              <div className="p-4 bg-green-50/20 border-t border-green-100/50">
                <div className="flex justify-end gap-3">
                  <Button variant="outline" className="border-green-200 text-green-700 hover:bg-green-50 hover:border-green-300">
                    Reset to Default
                  </Button>
                  <Button className="bg-gradient-to-r from-green-500 to-green-600 text-white hover:from-green-600 hover:to-green-700 shadow-lg shadow-green-500/30">
                    Save Changes
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="defaults" className="space-y-6">
          {/* User Defaults */}
          <Card className="border-gray-200 shadow-sm bg-gradient-to-br from-slate-50/30 to-white">
            <CardHeader className="border-b border-slate-100/50">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-gradient-to-br from-slate-600 to-slate-700 rounded-xl flex items-center justify-center shadow-lg shadow-slate-500/20">
                  <Building2 className="w-5 h-5 text-white" />
                </div>
                <div>
                  <CardTitle className="text-lg font-roboto-slab text-gray-900">
                    Default Settings
                  </CardTitle>
                  <p className="text-sm text-slate-600/70 font-medium">Configure default user settings</p>
                </div>
              </div>
            </CardHeader>
            <CardContent className="p-0">
              <div className="space-y-0">
                {/* Team Setting */}
                <div className="flex items-center justify-between p-4 hover:bg-slate-50/30 transition-colors border-b border-gray-100/50 group">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 bg-blue-100 rounded-lg flex items-center justify-center group-hover:bg-blue-200 transition-colors">
                      <User className="w-4 h-4 text-blue-600" />
                    </div>
                    <div>
                      <p className="font-medium text-gray-900">Default Team</p>
                      <p className="text-sm text-gray-500">Primary team assignment</p>
                    </div>
                  </div>
                  <Select defaultValue="engineering">
                    <SelectTrigger className="w-48 border-slate-200 focus:border-slate-500 focus:ring-slate-500/20">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent className="bg-white border-slate-200 shadow-xl z-50">
                      <SelectItem value="engineering">Engineering Team</SelectItem>
                      <SelectItem value="hr">HR Team</SelectItem>
                      <SelectItem value="sales">Sales Team</SelectItem>
                      <SelectItem value="marketing">Marketing Team</SelectItem>
                      <SelectItem value="finance">Finance Team</SelectItem>
                      <SelectItem value="operations">Operations Team</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                {/* Email Setting */}
                <div className="flex items-center justify-between p-4 hover:bg-slate-50/30 transition-colors border-b border-gray-100/50 group">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 bg-green-100 rounded-lg flex items-center justify-center group-hover:bg-green-200 transition-colors">
                      <Mail className="w-4 h-4 text-green-600" />
                    </div>
                    <div>
                      <p className="font-medium text-gray-900">Default Email</p>
                      <p className="text-sm text-gray-500">Primary contact email</p>
                    </div>
                  </div>
                  <Input 
                    defaultValue={user.email}
                    className="w-48 border-slate-200 focus:border-slate-500 focus:ring-slate-500/20"
                    placeholder="Enter email address"
                  />
                </div>

                {/* Signature Setting */}
                <div className="flex items-center justify-between p-4 hover:bg-slate-50/30 transition-colors border-b border-gray-100/50 group">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 bg-orange-100 rounded-lg flex items-center justify-center group-hover:bg-orange-200 transition-colors">
                      <FileText className="w-4 h-4 text-orange-600" />
                    </div>
                    <div>
                      <p className="font-medium text-gray-900">Email Signature</p>
                      <p className="text-sm text-gray-500">Default email signature</p>
                    </div>
                  </div>
                  <Select defaultValue="professional">
                    <SelectTrigger className="w-48 border-slate-200 focus:border-slate-500 focus:ring-slate-500/20">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent className="bg-white border-slate-200 shadow-xl z-50">
                      <SelectItem value="professional">Professional</SelectItem>
                      <SelectItem value="minimal">Minimal</SelectItem>
                      <SelectItem value="detailed">Detailed</SelectItem>
                      <SelectItem value="custom">Custom</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                {/* Reporting To Setting */}
                <div className="flex items-center justify-between p-4 hover:bg-slate-50/30 transition-colors border-b border-gray-100/50 group">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 bg-indigo-100 rounded-lg flex items-center justify-center group-hover:bg-indigo-200 transition-colors">
                      <Briefcase className="w-4 h-4 text-indigo-600" />
                    </div>
                    <div>
                      <p className="font-medium text-gray-900">Reporting To</p>
                      <p className="text-sm text-gray-500">Direct manager or supervisor</p>
                    </div>
                  </div>
                  <Select defaultValue="john_smith">
                    <SelectTrigger className="w-48 border-slate-200 focus:border-slate-500 focus:ring-slate-500/20">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent className="bg-white border-slate-200 shadow-xl z-50">
                      <SelectItem value="john_smith">John Smith - VP Engineering</SelectItem>
                      <SelectItem value="sarah_johnson">Sarah Johnson - HR Director</SelectItem>
                      <SelectItem value="mike_davis">Mike Davis - Team Lead</SelectItem>
                      <SelectItem value="lisa_brown">Lisa Brown - Department Head</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                {/* Department Setting */}
                <div className="flex items-center justify-between p-4 hover:bg-slate-50/30 transition-colors border-b border-gray-100/50 group">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 bg-teal-100 rounded-lg flex items-center justify-center group-hover:bg-teal-200 transition-colors">
                      <Building2 className="w-4 h-4 text-teal-600" />
                    </div>
                    <div>
                      <p className="font-medium text-gray-900">Department</p>
                      <p className="text-sm text-gray-500">Primary department</p>
                    </div>
                  </div>
                  <Select defaultValue="technology">
                    <SelectTrigger className="w-48 border-slate-200 focus:border-slate-500 focus:ring-slate-500/20">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent className="bg-white border-slate-200 shadow-xl z-50">
                      <SelectItem value="technology">Technology</SelectItem>
                      <SelectItem value="human_resources">Human Resources</SelectItem>
                      <SelectItem value="sales">Sales</SelectItem>
                      <SelectItem value="marketing">Marketing</SelectItem>
                      <SelectItem value="finance">Finance</SelectItem>
                      <SelectItem value="operations">Operations</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                {/* Location Setting */}
                <div className="flex items-center justify-between p-4 hover:bg-slate-50/30 transition-colors border-b border-gray-100/50 group">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 bg-rose-100 rounded-lg flex items-center justify-center group-hover:bg-rose-200 transition-colors">
                      <Globe className="w-4 h-4 text-rose-600" />
                    </div>
                    <div>
                      <p className="font-medium text-gray-900">Office Location</p>
                      <p className="text-sm text-gray-500">Primary work location</p>
                    </div>
                  </div>
                  <Select defaultValue="new_york">
                    <SelectTrigger className="w-48 border-slate-200 focus:border-slate-500 focus:ring-slate-500/20">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent className="bg-white border-slate-200 shadow-xl z-50">
                      <SelectItem value="new_york">New York Office</SelectItem>
                      <SelectItem value="san_francisco">San Francisco Office</SelectItem>
                      <SelectItem value="london">London Office</SelectItem>
                      <SelectItem value="toronto">Toronto Office</SelectItem>
                      <SelectItem value="remote">Remote</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                {/* Job Title Setting */}
                <div className="flex items-center justify-between p-4 hover:bg-slate-50/30 transition-colors group">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 bg-amber-100 rounded-lg flex items-center justify-center group-hover:bg-amber-200 transition-colors">
                      <Badge className="w-4 h-4 text-amber-600" />
                    </div>
                    <div>
                      <p className="font-medium text-gray-900">Job Title</p>
                      <p className="text-sm text-gray-500">Current position title</p>
                    </div>
                  </div>
                  <Input 
                    defaultValue={user.role}
                    className="w-48 border-slate-200 focus:border-slate-500 focus:ring-slate-500/20"
                    placeholder="Enter job title"
                  />
                </div>
              </div>

              <div className="p-6 border-t border-gray-100/50 bg-slate-50/20">
                <Button className="bg-gradient-to-r from-slate-600 to-slate-700 text-white hover:from-slate-700 hover:to-slate-800 shadow-lg shadow-slate-500/30">
                  Save Defaults
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="integrations" className="space-y-6">
          {/* User Integrations */}
          <Card className="border-gray-200 shadow-sm bg-gradient-to-br from-blue-50/30 to-white">
            <CardHeader className="border-b border-blue-100/50">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-blue-600 rounded-xl flex items-center justify-center shadow-lg shadow-blue-500/20">
                    <Zap className="w-5 h-5 text-white" />
                  </div>
                  <div>
                    <CardTitle className="text-lg font-roboto-slab text-gray-900">
                      User Integrations
                    </CardTitle>
                    <p className="text-sm text-blue-600/70 font-medium">Manage connected services and APIs</p>
                  </div>
                </div>
                <Button className="bg-gradient-to-r from-blue-500 to-blue-600 text-white hover:from-blue-600 hover:to-blue-700">
                  <Plus className="w-4 h-4 mr-2" />
                  Add Integration
                </Button>
              </div>
            </CardHeader>
            <CardContent className="p-6">
              <div className="grid gap-4">
                {/* Active Integrations */}
                <div className="space-y-4">
                  <h3 className="font-semibold text-gray-900">Active Integrations</h3>
                  
                  <div className="grid gap-3">
                    {/* LinkedIn Integration */}
                    <div className="flex items-center justify-between p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                          <Briefcase className="w-5 h-5 text-blue-600" />
                        </div>
                        <div>
                          <h4 className="font-medium text-gray-900">LinkedIn Recruiter</h4>
                          <p className="text-sm text-gray-500">Connected for talent sourcing</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <Badge className="bg-green-100 text-green-800 border-green-200">Active</Badge>
                        <Button variant="ghost" size="sm">
                          <Settings className="w-4 h-4" />
                        </Button>
                      </div>
                    </div>

                    {/* Email Integration */}
                    <div className="flex items-center justify-between p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-orange-100 rounded-lg flex items-center justify-center">
                          <Mail className="w-5 h-5 text-orange-600" />
                        </div>
                        <div>
                          <h4 className="font-medium text-gray-900">Email Marketing</h4>
                          <p className="text-sm text-gray-500">Automated email campaigns</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <Badge className="bg-green-100 text-green-800 border-green-200">Active</Badge>
                        <Button variant="ghost" size="sm">
                          <Settings className="w-4 h-4" />
                        </Button>
                      </div>
                    </div>

                    {/* Calendar Integration */}
                    <div className="flex items-center justify-between p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-purple-100 rounded-lg flex items-center justify-center">
                          <Calendar className="w-5 h-5 text-purple-600" />
                        </div>
                        <div>
                          <h4 className="font-medium text-gray-900">Google Calendar</h4>
                          <p className="text-sm text-gray-500">Interview scheduling</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <Badge className="bg-yellow-100 text-yellow-800 border-yellow-200">Limited</Badge>
                        <Button variant="ghost" size="sm">
                          <Settings className="w-4 h-4" />
                        </Button>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Available Integrations */}
                <div className="space-y-4 pt-6 border-t border-gray-200">
                  <h3 className="font-semibold text-gray-900">Available Integrations</h3>
                  
                  <div className="grid md:grid-cols-2 gap-3">
                    <div className="flex items-center justify-between p-4 border border-dashed border-gray-300 rounded-lg hover:border-gray-400 transition-colors">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-gray-100 rounded-lg flex items-center justify-center">
                          <Database className="w-5 h-5 text-gray-500" />
                        </div>
                        <div>
                          <h4 className="font-medium text-gray-900">CRM System</h4>
                          <p className="text-sm text-gray-500">Sync candidate data</p>
                        </div>
                      </div>
                      <Button variant="outline" size="sm">
                        Connect
                      </Button>
                    </div>

                    <div className="flex items-center justify-between p-4 border border-dashed border-gray-300 rounded-lg hover:border-gray-400 transition-colors">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-gray-100 rounded-lg flex items-center justify-center">
                          <Building2 className="w-5 h-5 text-gray-500" />
                        </div>
                        <div>
                          <h4 className="font-medium text-gray-900">HRIS Platform</h4>
                          <p className="text-sm text-gray-500">Employee data sync</p>
                        </div>
                      </div>
                      <Button variant="outline" size="sm">
                        Connect
                      </Button>
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* API Access */}
          <Card className="border-gray-200 shadow-sm">
            <CardHeader>
              <CardTitle className="text-lg font-roboto-slab flex items-center gap-2">
                <Key className="w-5 h-5 text-gray-700" />
                API Access
              </CardTitle>
              <p className="text-sm text-gray-600">Manage API keys and access tokens</p>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-3">
                <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                  <div>
                    <p className="font-medium text-gray-900">Personal API Key</p>
                    <p className="text-sm text-gray-500">Last used: 2 hours ago</p>
                  </div>
                  <div className="flex items-center gap-2">
                    <Badge variant="outline">Active</Badge>
                    <Button variant="ghost" size="sm">
                      <Eye className="w-4 h-4" />
                    </Button>
                  </div>
                </div>

                <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                  <div>
                    <p className="font-medium text-gray-900">Webhook Token</p>
                    <p className="text-sm text-gray-500">For automated notifications</p>
                  </div>
                  <div className="flex items-center gap-2">
                    <Badge variant="outline">Active</Badge>
                    <Button variant="ghost" size="sm">
                      <Eye className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
              </div>

              <div className="pt-4 border-t">
                <Button variant="outline" className="mr-2">
                  <Plus className="w-4 h-4 mr-2" />
                  Generate New Key
                </Button>
                <Button variant="outline">
                  <ExternalLink className="w-4 h-4 mr-2" />
                  API Documentation
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="credits" className="space-y-6">
          {/* Credit Allocation Overview */}
          <Card className="border-gray-200 shadow-sm bg-gradient-to-br from-green-50/30 to-white">
            <CardHeader className="border-b border-green-100/50">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-gradient-to-br from-green-500 to-green-600 rounded-xl flex items-center justify-center shadow-lg shadow-green-500/20">
                    <CreditCard className="w-5 h-5 text-white" />
                  </div>
                  <div>
                    <CardTitle className="text-lg font-roboto-slab text-gray-900">
                      Credit Allocation
                    </CardTitle>
                    <p className="text-sm text-green-600/70 font-medium">Manage user credits and spending limits</p>
                  </div>
                </div>
                <Button className="bg-gradient-to-r from-green-500 to-green-600 text-white hover:from-green-600 hover:to-green-700">
                  <Plus className="w-4 h-4 mr-2" />
                  Add Credits
                </Button>
              </div>
            </CardHeader>
            <CardContent className="p-6">
              {/* Credit Summary Cards */}
              <div className="grid md:grid-cols-3 gap-4 mb-6">
                <div className="text-center p-4 bg-blue-50 rounded-lg border border-blue-100">
                  <div className="text-2xl font-bold text-blue-600 mb-1">2,450</div>
                  <div className="text-sm text-blue-600 font-medium">Available Credits</div>
                  <div className="text-xs text-gray-500 mt-1">Current balance</div>
                </div>
                <div className="text-center p-4 bg-orange-50 rounded-lg border border-orange-100">
                  <div className="text-2xl font-bold text-orange-600 mb-1">750</div>
                  <div className="text-sm text-orange-600 font-medium">Used This Month</div>
                  <div className="text-xs text-gray-500 mt-1">30% of limit</div>
                </div>
                <div className="text-center p-4 bg-green-50 rounded-lg border border-green-100">
                  <div className="text-2xl font-bold text-green-600 mb-1">2,500</div>
                  <div className="text-sm text-green-600 font-medium">Monthly Limit</div>
                  <div className="text-xs text-gray-500 mt-1">Resets in 12 days</div>
                </div>
              </div>

              {/* Credit Usage by Service */}
              <div className="space-y-4">
                <h3 className="font-semibold text-gray-900">Credit Usage by Service</h3>
                
                <div className="space-y-3">
                  <div className="flex items-center justify-between p-3 border border-gray-200 rounded-lg">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 bg-blue-100 rounded-lg flex items-center justify-center">
                        <Briefcase className="w-4 h-4 text-blue-600" />
                      </div>
                      <div>
                        <p className="font-medium text-gray-900">Job Posting</p>
                        <p className="text-sm text-gray-500">Premium job listings</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="font-semibold text-gray-900">450 credits</p>
                      <p className="text-sm text-gray-500">18% of usage</p>
                    </div>
                  </div>

                  <div className="flex items-center justify-between p-3 border border-gray-200 rounded-lg">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 bg-purple-100 rounded-lg flex items-center justify-center">
                        <Search className="w-4 h-4 text-purple-600" />
                      </div>
                      <div>
                        <p className="font-medium text-gray-900">Advanced Search</p>
                        <p className="text-sm text-gray-500">Candidate database queries</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="font-semibold text-gray-900">200 credits</p>
                      <p className="text-sm text-gray-500">8% of usage</p>
                    </div>
                  </div>

                  <div className="flex items-center justify-between p-3 border border-gray-200 rounded-lg">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 bg-green-100 rounded-lg flex items-center justify-center">
                        <Mail className="w-4 h-4 text-green-600" />
                      </div>
                      <div>
                        <p className="font-medium text-gray-900">Email Campaigns</p>
                        <p className="text-sm text-gray-500">Bulk messaging services</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="font-semibold text-gray-900">100 credits</p>
                      <p className="text-sm text-gray-500">4% of usage</p>
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Credit History */}
          <Card className="border-gray-200 shadow-sm">
            <CardHeader>
              <CardTitle className="text-lg font-roboto-slab flex items-center gap-2">
                <History className="w-5 h-5 text-gray-700" />
                Credit History
              </CardTitle>
              <p className="text-sm text-gray-600">Recent credit transactions and usage</p>
            </CardHeader>
            <CardContent className="p-0">
              <div className="divide-y divide-gray-100">
                <div className="flex items-center justify-between p-4 hover:bg-gray-50">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center">
                      <Plus className="w-4 h-4 text-green-600" />
                    </div>
                    <div>
                      <p className="font-medium text-gray-900">Credits Added</p>
                      <p className="text-sm text-gray-500">Monthly allocation</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="font-semibold text-green-600">+2,500</p>
                    <p className="text-sm text-gray-500">Jan 1, 2025</p>
                  </div>
                </div>

                <div className="flex items-center justify-between p-4 hover:bg-gray-50">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                      <Briefcase className="w-4 h-4 text-blue-600" />
                    </div>
                    <div>
                      <p className="font-medium text-gray-900">Job Posting</p>
                      <p className="text-sm text-gray-500">Senior Developer Role</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="font-semibold text-red-600">-150</p>
                    <p className="text-sm text-gray-500">Jan 14, 2025</p>
                  </div>
                </div>

                <div className="flex items-center justify-between p-4 hover:bg-gray-50">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 bg-purple-100 rounded-full flex items-center justify-center">
                      <Search className="w-4 h-4 text-purple-600" />
                    </div>
                    <div>
                      <p className="font-medium text-gray-900">Advanced Search</p>
                      <p className="text-sm text-gray-500">Candidate database query</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="font-semibold text-red-600">-25</p>
                    <p className="text-sm text-gray-500">Jan 13, 2025</p>
                  </div>
                </div>

                <div className="flex items-center justify-between p-4 hover:bg-gray-50">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 bg-orange-100 rounded-full flex items-center justify-center">
                      <TrendingUp className="w-4 h-4 text-orange-600" />
                    </div>
                    <div>
                      <p className="font-medium text-gray-900">Bonus Credits</p>
                      <p className="text-sm text-gray-500">Performance reward</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="font-semibold text-green-600">+500</p>
                    <p className="text-sm text-gray-500">Jan 10, 2025</p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Credit Settings */}
          <Card className="border-gray-200 shadow-sm">
            <CardHeader>
              <CardTitle className="text-lg font-roboto-slab flex items-center gap-2">
                <Settings className="w-5 h-5 text-gray-700" />
                Credit Settings
              </CardTitle>
              <p className="text-sm text-gray-600">Configure credit limits and notifications</p>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="monthly-limit">Monthly Credit Limit</Label>
                  <Input
                    id="monthly-limit"
                    type="number"
                    defaultValue="2500"
                    className="mt-1"
                  />
                  <p className="text-sm text-gray-500 mt-1">Maximum credits per month</p>
                </div>
                <div>
                  <Label htmlFor="alert-threshold">Low Balance Alert</Label>
                  <Input
                    id="alert-threshold"
                    type="number"
                    defaultValue="500"
                    className="mt-1"
                  />
                  <p className="text-sm text-gray-500 mt-1">Alert when credits drop below</p>
                </div>
              </div>

              <div className="pt-4 border-t">
                <div className="flex justify-between items-center">
                  <div>
                    <p className="font-medium text-gray-900">Auto-refill Credits</p>
                    <p className="text-sm text-gray-500">Automatically add credits when low</p>
                  </div>
                  <div className="w-12 h-6 bg-green-500 rounded-full relative cursor-pointer">
                    <div className="w-5 h-5 bg-white rounded-full absolute top-0.5 right-0.5 shadow-sm"></div>
                  </div>
                </div>
              </div>

              <div className="flex gap-3 pt-4">
                <Button variant="outline">
                  Reset Settings
                </Button>
                <Button className="bg-gradient-to-r from-green-500 to-green-600 text-white hover:from-green-600 hover:to-green-700">
                  Save Changes
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="activity" className="space-y-6">
          {/* Activity Logs Header with Stats */}
          <Card className="border-gray-200 shadow-sm bg-gradient-to-br from-blue-50/30 to-white">
            <CardHeader className="border-b border-blue-100/50">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-blue-600 rounded-xl flex items-center justify-center shadow-lg shadow-blue-500/20">
                    <History className="w-5 h-5 text-white" />
                  </div>
                  <div>
                    <CardTitle className="text-lg font-roboto-slab text-gray-900">
                      Security & Activity Logs
                    </CardTitle>
                    <p className="text-sm text-blue-600/70 font-medium">Monitor user actions and security events</p>
                  </div>
                </div>
                <div className="flex items-center gap-4">
                  <div className="text-center">
                    <div className="text-lg font-bold text-gray-900">{activityLogs.length}</div>
                    <div className="text-xs text-gray-500">Total Events</div>
                  </div>
                  <div className="text-center">
                    <div className="text-lg font-bold text-red-600">
                      {activityLogs.filter(a => a.risk === 'high').length}
                    </div>
                    <div className="text-xs text-gray-500">High Risk</div>
                  </div>
                </div>
              </div>
            </CardHeader>
            
            {/* Search and Filter Controls */}
            <CardContent className="p-4 border-b border-gray-100">
              <div className="flex flex-col sm:flex-row gap-4">
                <div className="relative flex-1">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                  <Input
                    placeholder="Search activities..."
                    value={activitySearch}
                    onChange={(e) => setActivitySearch(e.target.value)}
                    className="pl-10 border-blue-200 focus:border-blue-500 focus:ring-blue-500/20"
                  />
                </div>
                <div className="flex items-center gap-2">
                  <Filter className="w-4 h-4 text-gray-400" />
                  <Select value={activityFilter} onValueChange={setActivityFilter}>
                    <SelectTrigger className="w-48 border-blue-200 focus:border-blue-500 focus:ring-blue-500/20">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent className="bg-white border-blue-200 shadow-xl z-50">
                      <SelectItem value="all">All Activities</SelectItem>
                      <SelectItem value="login">Login Events</SelectItem>
                      <SelectItem value="logout">Logout Events</SelectItem>
                      <SelectItem value="profile_update">Profile Updates</SelectItem>
                      <SelectItem value="password_change">Password Changes</SelectItem>
                      <SelectItem value="failed_login">Failed Logins</SelectItem>
                      <SelectItem value="account_lock">Security Events</SelectItem>
                      <SelectItem value="permission_change">Permission Changes</SelectItem>
                      <SelectItem value="data_export">Data Exports</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Activity Timeline */}
          <Card className="border-gray-200 shadow-sm">
            <CardContent className="p-0">
              {filteredActivities.length > 0 ? (
                <div className="divide-y divide-gray-100">
                  {filteredActivities.map((activity, index) => {
                    const Icon = getActivityIcon(activity.type);
                    const timestamp = formatTimestamp(activity.timestamp);
                    
                    return (
                      <div key={activity.id} className="group hover:bg-gray-50/50 transition-colors">
                        <div className="flex items-start gap-4 p-4">
                          {/* Timeline line */}
                          <div className="relative">
                            <div className={`w-10 h-10 rounded-full flex items-center justify-center ${getActivityColor(activity.type, activity.risk)}`}>
                              <Icon className="w-5 h-5" />
                            </div>
                            {index < filteredActivities.length - 1 && (
                              <div className="absolute top-10 left-1/2 transform -translate-x-1/2 w-0.5 h-8 bg-gray-200"></div>
                            )}
                          </div>
                          
                          {/* Activity Content */}
                          <div className="flex-1 min-w-0">
                            <div className="flex items-start justify-between">
                              <div className="flex-1">
                                <div className="flex items-center gap-3 mb-1">
                                  <h4 className="font-medium text-gray-900">{activity.title}</h4>
                                  <Badge className={`text-xs ${getRiskBadgeColor(activity.risk)} border`}>
                                    {activity.risk} risk
                                  </Badge>
                                </div>
                                <p className="text-sm text-gray-600 mb-2">{activity.description}</p>
                                
                                {/* Activity Metadata */}
                                <div className="flex flex-wrap items-center gap-4 text-xs text-gray-500">
                                  <div className="flex items-center gap-1">
                                    <Clock className="w-3 h-3" />
                                    <span>{timestamp.date} at {timestamp.time}</span>
                                  </div>
                                  {activity.ip && (
                                    <div className="flex items-center gap-1">
                                      <Globe className="w-3 h-3" />
                                      <span>{activity.ip}</span>
                                    </div>
                                  )}
                                  {activity.location && (
                                    <div className="flex items-center gap-1">
                                      <span>📍</span>
                                      <span>{activity.location}</span>
                                    </div>
                                  )}
                                  {activity.admin && (
                                    <div className="flex items-center gap-1">
                                      <User className="w-3 h-3" />
                                      <span>by {activity.admin}</span>
                                    </div>
                                  )}
                                </div>
                                
                                {/* Additional Details */}
                                {activity.changes && (
                                  <div className="mt-2 flex items-center gap-2">
                                    <span className="text-xs text-gray-500">Changed:</span>
                                    {activity.changes.map((change) => (
                                      <Badge key={change} variant="outline" className="text-xs">
                                        {change}
                                      </Badge>
                                    ))}
                                  </div>
                                )}
                              </div>
                              
                              {/* Action Button */}
                              <div className="opacity-0 group-hover:opacity-100 transition-opacity">
                                <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                                  <Eye className="w-4 h-4" />
                                </Button>
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              ) : (
                <div className="text-center py-12">
                  <div className="w-16 h-16 mx-auto mb-4 bg-gray-100 rounded-full flex items-center justify-center">
                    <History className="w-8 h-8 text-gray-400" />
                  </div>
                  <h3 className="font-medium text-gray-900 mb-2">No activities found</h3>
                  <p className="text-sm text-gray-500 mb-4">
                    {activitySearch || activityFilter !== 'all' 
                      ? 'Try adjusting your search or filter criteria'
                      : 'No recent activity to display for this user'
                    }
                  </p>
                  {(activitySearch || activityFilter !== 'all') && (
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => {
                        setActivitySearch('');
                        setActivityFilter('all');
                      }}
                    >
                      Clear filters
                    </Button>
                  )}
                </div>
              )}
            </CardContent>
          </Card>

          {/* Risk Summary Card */}
          <Card className="border-gray-200 shadow-sm">
            <CardHeader>
              <CardTitle className="text-lg font-roboto-slab flex items-center gap-2">
                <AlertTriangle className="w-5 h-5 text-orange-500" />
                Security Summary
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="text-center p-4 bg-green-50 rounded-lg border border-green-100">
                  <div className="text-2xl font-bold text-green-600 mb-1">
                    {activityLogs.filter(a => a.risk === 'low').length}
                  </div>
                  <div className="text-sm text-green-600 font-medium">Low Risk Events</div>
                  <div className="text-xs text-gray-500 mt-1">Normal activity</div>
                </div>
                <div className="text-center p-4 bg-yellow-50 rounded-lg border border-yellow-100">
                  <div className="text-2xl font-bold text-yellow-600 mb-1">
                    {activityLogs.filter(a => a.risk === 'medium').length}
                  </div>
                  <div className="text-sm text-yellow-600 font-medium">Medium Risk Events</div>
                  <div className="text-xs text-gray-500 mt-1">Requires attention</div>
                </div>
                <div className="text-center p-4 bg-red-50 rounded-lg border border-red-100">
                  <div className="text-2xl font-bold text-red-600 mb-1">
                    {activityLogs.filter(a => a.risk === 'high').length}
                  </div>
                  <div className="text-sm text-red-600 font-medium">High Risk Events</div>
                  <div className="text-xs text-gray-500 mt-1">Immediate review needed</div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="activity" className="space-y-6">
          {/* Activity Logs Header with Stats */}
          <Card className="border-gray-200 shadow-sm bg-gradient-to-br from-blue-50/30 to-white">
            <CardHeader className="border-b border-blue-100/50">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-blue-600 rounded-xl flex items-center justify-center shadow-lg shadow-blue-500/20">
                    <History className="w-5 h-5 text-white" />
                  </div>
                  <div>
                    <CardTitle className="text-lg font-roboto-slab text-gray-900">
                      User Activity Logs
                    </CardTitle>
                    <p className="text-sm text-blue-600/70 font-medium">Monitor user actions and security events</p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <Button variant="outline" size="sm">
                    <FileText className="w-4 h-4 mr-2" />
                    Export
                  </Button>
                  <Button variant="outline" size="sm">
                    <RefreshCw className="w-4 h-4 mr-2" />
                    Refresh
                  </Button>
                </div>
              </div>
            </CardHeader>
            <CardContent className="p-6">
              {/* Activity Stats */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
                <div className="text-center p-3 bg-green-50 rounded-lg border border-green-100">
                  <div className="text-xl font-bold text-green-600 mb-1">24</div>
                  <div className="text-sm text-green-600 font-medium">Total Logins</div>
                </div>
                <div className="text-center p-3 bg-blue-50 rounded-lg border border-blue-100">
                  <div className="text-xl font-bold text-blue-600 mb-1">8</div>
                  <div className="text-sm text-blue-600 font-medium">Profile Updates</div>
                </div>
                <div className="text-center p-3 bg-orange-50 rounded-lg border border-orange-100">
                  <div className="text-xl font-bold text-orange-600 mb-1">2</div>
                  <div className="text-sm text-orange-600 font-medium">Security Events</div>
                </div>
                <div className="text-center p-3 bg-purple-50 rounded-lg border border-purple-100">
                  <div className="text-xl font-bold text-purple-600 mb-1">15</div>
                  <div className="text-sm text-purple-600 font-medium">Data Exports</div>
                </div>
              </div>

              {/* Activity Filters */}
              <div className="flex flex-col sm:flex-row gap-4 mb-6">
                <div className="flex-1">
                  <Label htmlFor="activity-search" className="sr-only">Search activities</Label>
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                    <Input
                      id="activity-search"
                      placeholder="Search activities..."
                      value={activitySearch}
                      onChange={(e) => setActivitySearch(e.target.value)}
                      className="pl-10"
                    />
                  </div>
                </div>
                <Select value={activityFilter} onValueChange={setActivityFilter}>
                  <SelectTrigger className="w-full sm:w-48">
                    <Filter className="w-4 h-4 mr-2" />
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent className="bg-white border-gray-200 shadow-xl z-50">
                    <SelectItem value="all">All Activities</SelectItem>
                    <SelectItem value="login">Login Events</SelectItem>
                    <SelectItem value="logout">Logout Events</SelectItem>
                    <SelectItem value="profile_update">Profile Updates</SelectItem>
                    <SelectItem value="password_change">Password Changes</SelectItem>
                    <SelectItem value="failed_login">Failed Logins</SelectItem>
                    <SelectItem value="permission_change">Permission Changes</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </CardContent>
          </Card>

          {/* Activity Timeline */}
          <Card className="border-gray-200 shadow-sm">
            <CardHeader>
              <CardTitle className="text-lg font-roboto-slab">Recent Activity</CardTitle>
              <p className="text-sm text-gray-600">Chronological list of user actions and events</p>
            </CardHeader>
            <CardContent className="p-0">
              <div className="divide-y divide-gray-100">
                {filteredActivities.map((activity) => {
                  const IconComponent = getActivityIcon(activity.type);
                  const { date, time } = formatTimestamp(activity.timestamp);
                  
                  return (
                    <div key={activity.id} className="p-4 hover:bg-gray-50 transition-colors">
                      <div className="flex items-start gap-4">
                        <div className={`w-10 h-10 rounded-full flex items-center justify-center ${getActivityColor(activity.type, activity.risk)}`}>
                          <IconComponent className="w-5 h-5" />
                        </div>
                        
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center justify-between mb-2">
                            <h4 className="font-medium text-gray-900">{activity.title}</h4>
                            <div className="flex items-center gap-2">
                              <Badge className={`${getRiskBadgeColor(activity.risk)} border text-xs`}>
                                {activity.risk} risk
                              </Badge>
                              <span className="text-xs text-gray-500">{time}</span>
                            </div>
                          </div>
                          
                          <p className="text-sm text-gray-600 mb-2">{activity.description}</p>
                          
                          <div className="flex items-center gap-4 text-xs text-gray-500">
                            <span>{date}</span>
                            {activity.ip && <span>IP: {activity.ip}</span>}
                            {activity.location && <span>Location: {activity.location}</span>}
                            {activity.admin && <span>By: {activity.admin}</span>}
                          </div>
                          
                          {activity.changes && (
                            <div className="mt-2">
                              <span className="text-xs text-gray-500 mr-2">Changed fields:</span>
                              {activity.changes.map((change, index) => (
                                <Badge key={index} variant="outline" className="mr-1 text-xs">
                                  {change}
                                </Badge>
                              ))}
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
              
              {filteredActivities.length === 0 && (
                <div className="p-8 text-center">
                  <Activity className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                  <h3 className="text-lg font-medium text-gray-900 mb-2">No activities found</h3>
                  <p className="text-gray-500">Try adjusting your search criteria or filter settings.</p>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default UserDetail;
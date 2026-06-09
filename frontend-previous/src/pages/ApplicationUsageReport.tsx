import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { DataGrid } from "@/components/ui/data-grid";
import { Badge } from "@/components/ui/badge";
import { 
  CalendarIcon, ArrowLeft, Download, RefreshCw, Activity, Users, TrendingUp, BarChart3,
  Settings, FileText, FileSpreadsheet, Filter, Columns, Save, Eye, Check
} from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
  DropdownMenuCheckboxItem,
} from "@/components/ui/dropdown-menu";
import { Checkbox } from "@/components/ui/checkbox";
import { format } from "date-fns";
import { cn } from "@/lib/utils";

interface UserTransaction {
  id: string;
  name: string;
  email: string;
  role: string;
  organizationalRole: string;
  userSince: string;
  lastLoggedIn: string;
  numberOfLogins: number;
  averageSessionDuration: string;
  numberOfJobsAdded: number;
  numberOfJobsChanged: number;
  numberOfCandidatesAdded: number;
  numberOfCandidatesChanged: number;
  numberOfSubmissionsCreated: number;
  numberOfSubmissionsChanged: number;
  numberOfInterviewsCreated: number;
  numberOfTasksCreated: number;
  numberOfTasksCompleted: number;
  numberOfPlacementsCreated: number;
  numberOfPlacementsCompleted: number;
  numberOfEmailsSent: number;
  numberOfTextsSent: number;
  numberOfPhoneCalls: number;
  numberOfAIAgentCalls: number;
  searchScreenUsage: number;
  numberOfTicketsCreated: number;
  numberOfTimeSheetsCreated: number;
  settingsPageUsage: number;
  status: "active" | "inactive";
}

interface ColumnDefinition {
  field: string;
  headerName: string;
  width: number;
  category: 'basic' | 'login' | 'jobs' | 'candidates' | 'submissions' | 'interviews' | 'tasks' | 'placements' | 'communication' | 'other';
  renderCell: (value: any, row?: UserTransaction) => React.ReactNode;
}

const ApplicationUsageReport = () => {
  const navigate = useNavigate();
  const [startDate, setStartDate] = useState<Date>();
  const [endDate, setEndDate] = useState<Date>();
  const [isLoading, setIsLoading] = useState(false);
  const [reportData, setReportData] = useState<UserTransaction[]>([]);
  const [selectedRows, setSelectedRows] = useState<string[]>([]);
  const [columnVisibility, setColumnVisibility] = useState<Record<string, boolean>>({
    // Basic Information - Always visible
    name: true,
    role: true,
    organizationalRole: true,
    userSince: true,
    lastLoggedIn: true,
    status: true,
    
    // Login Activity - Visible by default
    numberOfLogins: true,
    averageSessionDuration: true,
    
    // Jobs - Visible by default
    numberOfJobsAdded: true,
    numberOfJobsChanged: false,
    
    // Candidates - Visible by default
    numberOfCandidatesAdded: true,
    numberOfCandidatesChanged: false,
    
    // Submissions - Visible by default
    numberOfSubmissionsCreated: true,
    numberOfSubmissionsChanged: false,
    
    // Interviews & Tasks - Hidden by default
    numberOfInterviewsCreated: false,
    numberOfTasksCreated: false,
    numberOfTasksCompleted: false,
    
    // Placements - Hidden by default
    numberOfPlacementsCreated: false,
    numberOfPlacementsCompleted: false,
    
    // Communication - Hidden by default
    numberOfEmailsSent: false,
    numberOfTextsSent: false,
    numberOfPhoneCalls: false,
    numberOfAIAgentCalls: false,
    
    // Other - Hidden by default
    searchScreenUsage: false,
    numberOfTicketsCreated: false,
    numberOfTimeSheetsCreated: false,
    settingsPageUsage: false,
  });

  // Mock data for demonstration
  const mockData: UserTransaction[] = [
    {
      id: "1",
      name: "John Smith",
      email: "john.smith@company.com",
      role: "Recruiter",
      organizationalRole: "Senior Recruiter",
      userSince: "2024-03-15",
      lastLoggedIn: "2025-01-14T10:30:00Z",
      numberOfLogins: 342,
      averageSessionDuration: "2h 15m",
      numberOfJobsAdded: 28,
      numberOfJobsChanged: 145,
      numberOfCandidatesAdded: 67,
      numberOfCandidatesChanged: 234,
      numberOfSubmissionsCreated: 89,
      numberOfSubmissionsChanged: 156,
      numberOfInterviewsCreated: 43,
      numberOfTasksCreated: 78,
      numberOfTasksCompleted: 65,
      numberOfPlacementsCreated: 12,
      numberOfPlacementsCompleted: 8,
      numberOfEmailsSent: 456,
      numberOfTextsSent: 89,
      numberOfPhoneCalls: 123,
      numberOfAIAgentCalls: 34,
      searchScreenUsage: 567,
      numberOfTicketsCreated: 8,
      numberOfTimeSheetsCreated: 24,
      settingsPageUsage: 15,
      status: "active"
    },
    {
      id: "2",
      name: "Sarah Johnson",
      email: "sarah.johnson@company.com",
      role: "HR Manager",
      organizationalRole: "Regional HR Manager",
      userSince: "2024-01-10",
      lastLoggedIn: "2025-01-14T09:15:00Z",
      numberOfLogins: 289,
      averageSessionDuration: "1h 45m",
      numberOfJobsAdded: 15,
      numberOfJobsChanged: 98,
      numberOfCandidatesAdded: 34,
      numberOfCandidatesChanged: 178,
      numberOfSubmissionsCreated: 56,
      numberOfSubmissionsChanged: 89,
      numberOfInterviewsCreated: 32,
      numberOfTasksCreated: 45,
      numberOfTasksCompleted: 38,
      numberOfPlacementsCreated: 9,
      numberOfPlacementsCompleted: 7,
      numberOfEmailsSent: 345,
      numberOfTextsSent: 45,
      numberOfPhoneCalls: 87,
      numberOfAIAgentCalls: 23,
      searchScreenUsage: 423,
      numberOfTicketsCreated: 12,
      numberOfTimeSheetsCreated: 18,
      settingsPageUsage: 28,
      status: "active"
    },
    {
      id: "3",
      name: "Mike Davis",
      email: "mike.davis@company.com",
      role: "Senior Recruiter",
      organizationalRole: "Lead Technical Recruiter",
      userSince: "2024-05-20",
      lastLoggedIn: "2025-01-13T16:45:00Z",
      numberOfLogins: 198,
      averageSessionDuration: "3h 12m",
      numberOfJobsAdded: 22,
      numberOfJobsChanged: 87,
      numberOfCandidatesAdded: 45,
      numberOfCandidatesChanged: 167,
      numberOfSubmissionsCreated: 72,
      numberOfSubmissionsChanged: 123,
      numberOfInterviewsCreated: 38,
      numberOfTasksCreated: 56,
      numberOfTasksCompleted: 48,
      numberOfPlacementsCreated: 8,
      numberOfPlacementsCompleted: 6,
      numberOfEmailsSent: 289,
      numberOfTextsSent: 67,
      numberOfPhoneCalls: 145,
      numberOfAIAgentCalls: 45,
      searchScreenUsage: 678,
      numberOfTicketsCreated: 5,
      numberOfTimeSheetsCreated: 16,
      settingsPageUsage: 12,
      status: "active"
    },
    {
      id: "4",
      name: "Emily Chen",
      email: "emily.chen@company.com",
      role: "Coordinator",
      organizationalRole: "Operations Coordinator",
      userSince: "2024-08-01",
      lastLoggedIn: "2025-01-12T14:20:00Z",
      numberOfLogins: 156,
      averageSessionDuration: "1h 30m",
      numberOfJobsAdded: 8,
      numberOfJobsChanged: 52,
      numberOfCandidatesAdded: 23,
      numberOfCandidatesChanged: 89,
      numberOfSubmissionsCreated: 34,
      numberOfSubmissionsChanged: 67,
      numberOfInterviewsCreated: 18,
      numberOfTasksCreated: 89,
      numberOfTasksCompleted: 78,
      numberOfPlacementsCreated: 4,
      numberOfPlacementsCompleted: 3,
      numberOfEmailsSent: 178,
      numberOfTextsSent: 23,
      numberOfPhoneCalls: 45,
      numberOfAIAgentCalls: 12,
      searchScreenUsage: 234,
      numberOfTicketsCreated: 15,
      numberOfTimeSheetsCreated: 45,
      settingsPageUsage: 8,
      status: "inactive"
    },
    {
      id: "5",
      name: "David Wilson",
      email: "david.wilson@company.com",
      role: "Director",
      organizationalRole: "Director of Talent Acquisition",
      userSince: "2023-11-15",
      lastLoggedIn: "2025-01-14T11:00:00Z",
      numberOfLogins: 456,
      averageSessionDuration: "1h 15m",
      numberOfJobsAdded: 45,
      numberOfJobsChanged: 234,
      numberOfCandidatesAdded: 89,
      numberOfCandidatesChanged: 345,
      numberOfSubmissionsCreated: 123,
      numberOfSubmissionsChanged: 234,
      numberOfInterviewsCreated: 67,
      numberOfTasksCreated: 134,
      numberOfTasksCompleted: 112,
      numberOfPlacementsCreated: 23,
      numberOfPlacementsCompleted: 18,
      numberOfEmailsSent: 678,
      numberOfTextsSent: 145,
      numberOfPhoneCalls: 234,
      numberOfAIAgentCalls: 67,
      searchScreenUsage: 890,
      numberOfTicketsCreated: 23,
      numberOfTimeSheetsCreated: 34,
      settingsPageUsage: 45,
      status: "active"
    }
  ];

  const handleRunReport = () => {
    if (!startDate || !endDate) return;
    
    setIsLoading(true);
    // Simulate API call
    setTimeout(() => {
      setReportData(mockData);
      setIsLoading(false);
    }, 1500);
  };

  const handleExport = () => {
    // Simulate export functionality
    const csvContent = [
      "Name,Email,Role,Organizational Role,User Since,Last Logged In,Number of Logins,Average Session Duration,Jobs Added,Jobs Changed,Candidates Added,Candidates Changed,Submissions Created,Submissions Changed,Interviews Created,Tasks Created,Tasks Completed,Placements Created,Placements Completed,Emails Sent,Texts Sent,Phone Calls,AI Agent Calls,Search Screen Usage,Tickets Created,Time Sheets Created,Settings Page Usage,Status",
      ...reportData.map(user => 
        `${user.name},${user.email},${user.role},${user.organizationalRole},${user.userSince},${user.lastLoggedIn},${user.numberOfLogins},${user.averageSessionDuration},${user.numberOfJobsAdded},${user.numberOfJobsChanged},${user.numberOfCandidatesAdded},${user.numberOfCandidatesChanged},${user.numberOfSubmissionsCreated},${user.numberOfSubmissionsChanged},${user.numberOfInterviewsCreated},${user.numberOfTasksCreated},${user.numberOfTasksCompleted},${user.numberOfPlacementsCreated},${user.numberOfPlacementsCompleted},${user.numberOfEmailsSent},${user.numberOfTextsSent},${user.numberOfPhoneCalls},${user.numberOfAIAgentCalls},${user.searchScreenUsage},${user.numberOfTicketsCreated},${user.numberOfTimeSheetsCreated},${user.settingsPageUsage},${user.status}`
      )
    ].join("\n");
    
    const blob = new Blob([csvContent], { type: "text/csv" });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `application-usage-report-${format(startDate!, "yyyy-MM-dd")}-to-${format(endDate!, "yyyy-MM-dd")}.csv`;
    a.click();
    window.URL.revokeObjectURL(url);
  };

  const handleSaveFilters = () => {
    // Save current filters to localStorage or send to backend
    console.log("Saving current view and filters");
  };

  const toggleColumnVisibility = (columnId: string) => {
    setColumnVisibility(prev => ({
      ...prev,
      [columnId]: !prev[columnId]
    }));
  };

  const resetColumnsToDefault = () => {
    setColumnVisibility({
      name: true,
      role: true,
      organizationalRole: true,
      userSince: true,
      lastLoggedIn: true,
      status: true,
      numberOfLogins: true,
      averageSessionDuration: true,
      numberOfJobsAdded: true,
      numberOfJobsChanged: false,
      numberOfCandidatesAdded: true,
      numberOfCandidatesChanged: false,
      numberOfSubmissionsCreated: true,
      numberOfSubmissionsChanged: false,
      numberOfInterviewsCreated: false,
      numberOfTasksCreated: false,
      numberOfTasksCompleted: false,
      numberOfPlacementsCreated: false,
      numberOfPlacementsCompleted: false,
      numberOfEmailsSent: false,
      numberOfTextsSent: false,
      numberOfPhoneCalls: false,
      numberOfAIAgentCalls: false,
      searchScreenUsage: false,
      numberOfTicketsCreated: false,
      numberOfTimeSheetsCreated: false,
      settingsPageUsage: false,
    });
  };

  const showAllColumns = () => {
    const allVisible = Object.keys(columnVisibility).reduce((acc, key) => {
      acc[key] = true;
      return acc;
    }, {} as Record<string, boolean>);
    setColumnVisibility(allVisible);
  };

  const hideAllOptionalColumns = () => {
    setColumnVisibility({
      name: true,
      role: true,
      organizationalRole: true,
      userSince: true,
      lastLoggedIn: true,
      status: true,
      numberOfLogins: true,
      averageSessionDuration: true,
      numberOfJobsAdded: false,
      numberOfJobsChanged: false,
      numberOfCandidatesAdded: false,
      numberOfCandidatesChanged: false,
      numberOfSubmissionsCreated: false,
      numberOfSubmissionsChanged: false,
      numberOfInterviewsCreated: false,
      numberOfTasksCreated: false,
      numberOfTasksCompleted: false,
      numberOfPlacementsCreated: false,
      numberOfPlacementsCompleted: false,
      numberOfEmailsSent: false,
      numberOfTextsSent: false,
      numberOfPhoneCalls: false,
      numberOfAIAgentCalls: false,
      searchScreenUsage: false,
      numberOfTicketsCreated: false,
      numberOfTimeSheetsCreated: false,
      settingsPageUsage: false,
    });
  };

  const allColumns: ColumnDefinition[] = [
    {
      field: 'name',
      headerName: 'User Name',
      width: 200,
      category: 'basic',
      renderCell: (value: string, row: UserTransaction) => (
        <div>
          <div className="font-medium text-sm">{row?.name}</div>
          <div className="text-xs text-muted-foreground">{row?.email}</div>
        </div>
      )
    },
    {
      field: 'role',
      headerName: 'User Role',
      width: 120,
      category: 'basic',
      renderCell: (value: string) => (
        <span className="text-sm">{value}</span>
      )
    },
    {
      field: 'organizationalRole',
      headerName: 'Organizational Role',
      width: 150,
      category: 'basic',
      renderCell: (value: string) => (
        <span className="text-sm">{value}</span>
      )
    },
    {
      field: 'userSince',
      headerName: 'User Since',
      width: 120,
      category: 'basic',
      renderCell: (value: string) => (
        <span className="text-sm">{format(new Date(value), "MMM dd, yyyy")}</span>
      )
    },
    {
      field: 'lastLoggedIn',
      headerName: 'Last Logged In',
      width: 140,
      category: 'login',
      renderCell: (value: string) => (
        <span className="text-sm">{format(new Date(value), "MMM dd HH:mm")}</span>
      )
    },
    {
      field: 'numberOfLogins',
      headerName: 'Logins',
      width: 80,
      category: 'login',
      renderCell: (value: number) => (
        <span className="text-sm font-semibold">{value.toLocaleString()}</span>
      )
    },
    {
      field: 'averageSessionDuration',
      headerName: 'Avg Session',
      width: 100,
      category: 'login',
      renderCell: (value: string) => (
        <span className="text-sm">{value}</span>
      )
    },
    {
      field: 'numberOfJobsAdded',
      headerName: 'Jobs Added',
      width: 90,
      category: 'jobs',
      renderCell: (value: number) => (
        <span className="text-sm">{value}</span>
      )
    },
    {
      field: 'numberOfJobsChanged',
      headerName: 'Jobs Changed',
      width: 100,
      category: 'jobs',
      renderCell: (value: number) => (
        <span className="text-sm">{value}</span>
      )
    },
    {
      field: 'numberOfCandidatesAdded',
      headerName: 'Candidates Added',
      width: 120,
      category: 'candidates',
      renderCell: (value: number) => (
        <span className="text-sm">{value}</span>
      )
    },
    {
      field: 'numberOfCandidatesChanged',
      headerName: 'Candidates Changed',
      width: 130,
      category: 'candidates',
      renderCell: (value: number) => (
        <span className="text-sm">{value}</span>
      )
    },
    {
      field: 'numberOfSubmissionsCreated',
      headerName: 'Submissions Created',
      width: 130,
      category: 'submissions',
      renderCell: (value: number) => (
        <span className="text-sm">{value}</span>
      )
    },
    {
      field: 'numberOfSubmissionsChanged',
      headerName: 'Submissions Changed',
      width: 130,
      category: 'submissions',
      renderCell: (value: number) => (
        <span className="text-sm">{value}</span>
      )
    },
    {
      field: 'numberOfInterviewsCreated',
      headerName: 'Interviews',
      width: 90,
      category: 'interviews',
      renderCell: (value: number) => (
        <span className="text-sm">{value}</span>
      )
    },
    {
      field: 'numberOfTasksCreated',
      headerName: 'Tasks Created',
      width: 100,
      category: 'tasks',
      renderCell: (value: number) => (
        <span className="text-sm">{value}</span>
      )
    },
    {
      field: 'numberOfTasksCompleted',
      headerName: 'Tasks Completed',
      width: 110,
      category: 'tasks',
      renderCell: (value: number) => (
        <span className="text-sm">{value}</span>
      )
    },
    {
      field: 'numberOfPlacementsCreated',
      headerName: 'Placements Created',
      width: 120,
      category: 'placements',
      renderCell: (value: number) => (
        <span className="text-sm">{value}</span>
      )
    },
    {
      field: 'numberOfPlacementsCompleted',
      headerName: 'Placements Completed',
      width: 130,
      category: 'placements',
      renderCell: (value: number) => (
        <span className="text-sm">{value}</span>
      )
    },
    {
      field: 'numberOfEmailsSent',
      headerName: 'Emails Sent',
      width: 90,
      category: 'communication',
      renderCell: (value: number) => (
        <span className="text-sm">{value}</span>
      )
    },
    {
      field: 'numberOfTextsSent',
      headerName: 'Texts Sent',
      width: 90,
      category: 'communication',
      renderCell: (value: number) => (
        <span className="text-sm">{value}</span>
      )
    },
    {
      field: 'numberOfPhoneCalls',
      headerName: 'Phone Calls',
      width: 90,
      category: 'communication',
      renderCell: (value: number) => (
        <span className="text-sm">{value}</span>
      )
    },
    {
      field: 'numberOfAIAgentCalls',
      headerName: 'AI Agent Calls',
      width: 100,
      category: 'communication',
      renderCell: (value: number) => (
        <span className="text-sm">{value}</span>
      )
    },
    {
      field: 'searchScreenUsage',
      headerName: 'Search Usage',
      width: 100,
      category: 'other',
      renderCell: (value: number) => (
        <span className="text-sm">{value}</span>
      )
    },
    {
      field: 'numberOfTicketsCreated',
      headerName: 'Tickets',
      width: 80,
      category: 'other',
      renderCell: (value: number) => (
        <span className="text-sm">{value}</span>
      )
    },
    {
      field: 'numberOfTimeSheetsCreated',
      headerName: 'Time Sheets',
      width: 90,
      category: 'other',
      renderCell: (value: number) => (
        <span className="text-sm">{value}</span>
      )
    },
    {
      field: 'settingsPageUsage',
      headerName: 'Settings Usage',
      width: 100,
      category: 'other',
      renderCell: (value: number) => (
        <span className="text-sm">{value}</span>
      )
    },
    {
      field: 'status',
      headerName: 'Status',
      width: 80,
      category: 'basic',
      renderCell: (value: string) => (
        <Badge 
          variant={value === "active" ? "default" : "secondary"}
          className={value === "active" ? "bg-green-100 text-green-800" : ""}
        >
          {value}
        </Badge>
      )
    }
  ];

  // Filter columns based on visibility
  const visibleColumns = allColumns.filter(column => columnVisibility[column.field]);

  // Group columns by category for better organization
  const columnCategories = {
    basic: { label: 'Basic Information', columns: allColumns.filter(c => c.category === 'basic') },
    login: { label: 'Login Activity', columns: allColumns.filter(c => c.category === 'login') },
    jobs: { label: 'Jobs', columns: allColumns.filter(c => c.category === 'jobs') },
    candidates: { label: 'Candidates', columns: allColumns.filter(c => c.category === 'candidates') },
    submissions: { label: 'Submissions', columns: allColumns.filter(c => c.category === 'submissions') },
    interviews: { label: 'Interviews', columns: allColumns.filter(c => c.category === 'interviews') },
    tasks: { label: 'Tasks', columns: allColumns.filter(c => c.category === 'tasks') },
    placements: { label: 'Placements', columns: allColumns.filter(c => c.category === 'placements') },
    communication: { label: 'Communication', columns: allColumns.filter(c => c.category === 'communication') },
    other: { label: 'Other', columns: allColumns.filter(c => c.category === 'other') },
  };
  const totalLogins = reportData.reduce((sum, user) => sum + user.numberOfLogins, 0);
  const activeUsers = reportData.filter(user => user.status === "active").length;
  const totalJobsAdded = reportData.reduce((sum, user) => sum + user.numberOfJobsAdded, 0);
  const totalSubmissions = reportData.reduce((sum, user) => sum + user.numberOfSubmissionsCreated, 0);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-foreground">Application Usage Monitor</h1>
        <p className="text-muted-foreground">Track user transactions and application usage patterns</p>
      </div>

      {/* Date Range Selection */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Activity className="w-5 h-5" />
            Report Parameters
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col md:flex-row gap-4 items-end">
            <div className="space-y-2">
              <Label htmlFor="start-date">Start Date</Label>
              <Popover>
                <PopoverTrigger asChild>
                  <Button
                    variant="outline"
                    className={cn(
                      "w-[240px] justify-start text-left font-normal",
                      !startDate && "text-muted-foreground"
                    )}
                  >
                    <CalendarIcon className="mr-2 h-4 w-4" />
                    {startDate ? format(startDate, "PPP") : "Pick start date"}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0" align="start">
                  <Calendar
                    mode="single"
                    selected={startDate}
                    onSelect={setStartDate}
                    initialFocus
                    className="pointer-events-auto"
                  />
                </PopoverContent>
              </Popover>
            </div>

            <div className="space-y-2">
              <Label htmlFor="end-date">End Date</Label>
              <Popover>
                <PopoverTrigger asChild>
                  <Button
                    variant="outline"
                    className={cn(
                      "w-[240px] justify-start text-left font-normal",
                      !endDate && "text-muted-foreground"
                    )}
                  >
                    <CalendarIcon className="mr-2 h-4 w-4" />
                    {endDate ? format(endDate, "PPP") : "Pick end date"}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0" align="start">
                  <Calendar
                    mode="single"
                    selected={endDate}
                    onSelect={setEndDate}
                    initialFocus
                    className="pointer-events-auto"
                  />
                </PopoverContent>
              </Popover>
            </div>

            <Button 
              onClick={handleRunReport} 
              disabled={!startDate || !endDate || isLoading}
              className="flex items-center gap-2"
            >
              {isLoading ? (
                <RefreshCw className="w-4 h-4 animate-spin" />
              ) : (
                <BarChart3 className="w-4 h-4" />
              )}
              {isLoading ? "Generating..." : "Run Report"}
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Summary Statistics */}
      {reportData.length > 0 && (
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-blue-100 rounded-lg">
                  <Users className="w-5 h-5 text-blue-600" />
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Total Users</p>
                  <p className="text-2xl font-bold">{reportData.length}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-green-100 rounded-lg">
                  <Activity className="w-5 h-5 text-green-600" />
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Active Users</p>
                  <p className="text-2xl font-bold">{activeUsers}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-purple-100 rounded-lg">
                  <TrendingUp className="w-5 h-5 text-purple-600" />
                </div>
                 <div>
                   <p className="text-sm text-muted-foreground">Total Logins</p>
                   <p className="text-2xl font-bold">{totalLogins.toLocaleString()}</p>
                 </div>
               </div>
             </CardContent>
           </Card>

           <Card>
             <CardContent className="p-4">
               <div className="flex items-center gap-3">
                 <div className="p-2 bg-orange-100 rounded-lg">
                   <BarChart3 className="w-5 h-5 text-orange-600" />
                 </div>
                 <div>
                   <p className="text-sm text-muted-foreground">Total Submissions</p>
                   <p className="text-2xl font-bold">{totalSubmissions.toLocaleString()}</p>
                 </div>
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Report Actions */}
      {reportData.length > 0 && (
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2 sm:gap-3">
          <div>
            <h2 className="text-lg font-semibold">Usage Report Results</h2>
            <p className="text-sm text-muted-foreground">
              {selectedRows.length > 0 ? `${selectedRows.length} selected` : `${reportData.length} total users`}
            </p>
          </div>
          
          <div className="flex items-center gap-1 sm:gap-2 w-full sm:w-auto">
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="outline" size="sm" className="text-xs flex-1 sm:flex-none px-2 sm:px-3">
                  <Download className="w-3 h-3 mr-1" />
                  <span className="hidden sm:inline">Export</span>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="bg-white border-gray-200 z-50">
                <DropdownMenuItem onClick={handleExport}>
                  <FileText className="w-4 h-4 mr-2" />
                  Export as CSV
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
            

            <Button 
              onClick={handleRunReport} 
              disabled={!startDate || !endDate || isLoading}
              className="text-xs flex-1 sm:flex-none px-2 sm:px-3"
            >
              {isLoading ? (
                <RefreshCw className="w-3 h-3 mr-1 animate-spin" />
              ) : (
                <RefreshCw className="w-3 h-3 mr-1" />
              )}
              {isLoading ? "Refreshing..." : "Refresh"}
            </Button>
          </div>
        </div>
      )}

      {/* Report Results */}
      {reportData.length > 0 && (
        <Card className="border-gray-200 shadow-sm overflow-hidden">
          <CardContent className="p-0">
            <div className="overflow-x-auto min-h-0">
              <div className="min-w-full">
                <DataGrid
                  rows={reportData}
                  columns={allColumns}
                  pageSizeOptions={[10, 25, 50, 100]}
                  checkboxSelection
                  onRowClick={(row) => navigate(`/dashboard/users/${row.id}`)}
                />
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* No Data State */}
      {reportData.length === 0 && startDate && endDate && !isLoading && (
        <Card>
          <CardContent className="p-12 text-center">
            <Activity className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
            <h3 className="text-lg font-semibold mb-2">No Data Found</h3>
            <p className="text-muted-foreground">
              No user transactions found for the selected date range.
            </p>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default ApplicationUsageReport;
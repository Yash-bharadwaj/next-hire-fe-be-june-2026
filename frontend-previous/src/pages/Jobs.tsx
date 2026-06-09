import React, { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { DataGrid } from "@/components/ui/data-grid";
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
  Calendar,
  Building,
  User,
  MapPin,
  DollarSign,
  Users2,
  Eye,
  Edit,
  Trash2,
  Briefcase,
  Users,
  Clock,
  FileText,
  CheckCircle,
  AlertCircle,
  Settings,
  Share2,
  UserCheck,
  Activity,
  Mail,
  Bot,
  RotateCcw,
  FileSpreadsheet,
  Import,
  PenTool,
  Pencil,
} from "lucide-react";
import { useNavigate } from "react-router-dom";
import jobsData from "@/data/jobs.json";

const Jobs = () => {
  const navigate = useNavigate();
  const { jobs } = jobsData;
  const [activeFilters, setActiveFilters] = useState<Record<string, string[]>>({});
  const [editMode, setEditMode] = useState(false);

  const myJobs = jobs.filter(job => job.assignedTo === "Mike Johnson" || job.accountManager === "Mike Johnson").length;
  const activeJobs = jobs.filter(job => job.jobStatus === "Active").length;
  const onHoldJobs = jobs.filter(job => job.jobStatus === "On Hold").length;
  const totalSubmissions = jobs.reduce((sum, job) => sum + job.submissions, 0);
  const highPriorityJobs = jobs.filter(job => job.priority === "High").length;

  const handleMyJobsClick = () => {
    setActiveFilters({
      assignedTo: ["Mike Johnson"],
      accountManager: ["Mike Johnson"]
    });
  };

  const handleActiveJobsClick = () => {
    setActiveFilters({
      jobStatus: ["Active"]
    });
  };

  const handleOnHoldClick = () => {
    setActiveFilters({
      jobStatus: ["On Hold"]
    });
  };

  const handleHighPriorityClick = () => {
    setActiveFilters({
      priority: ["High"]
    });
  };

  const handleEditModeToggle = () => {
    setEditMode(!editMode);
  };

  const navigationCards = [
    {
      title: "My Jobs",
      value: myJobs.toString(),
      icon: Briefcase,
      color: "text-green-700",
      gradientOverlay: "bg-gradient-to-br from-green-400/30 via-green-500/20 to-green-600/30",
      onClick: handleMyJobsClick
    },
    {
      title: "Active Jobs",
      value: activeJobs.toString(),
      icon: CheckCircle,
      color: "text-emerald-700",
      gradientOverlay: "bg-gradient-to-br from-emerald-400/30 via-emerald-500/20 to-emerald-600/30",
      onClick: handleActiveJobsClick
    },
    {
      title: "On Hold",
      value: onHoldJobs.toString(),
      icon: Clock,
      color: "text-amber-700",
      gradientOverlay: "bg-gradient-to-br from-amber-400/30 via-amber-500/20 to-amber-600/30",
      onClick: handleOnHoldClick
    },
    {
      title: "Total Submissions",
      value: totalSubmissions.toString(),
      icon: FileText,
      color: "text-purple-700",
      gradientOverlay: "bg-gradient-to-br from-purple-400/30 via-purple-500/20 to-purple-600/30",
      onClick: () => navigate("/dashboard/submissions")
    },
    {
      title: "High Priority",
      value: highPriorityJobs.toString(),
      icon: AlertCircle,
      color: "text-red-700",
      gradientOverlay: "bg-gradient-to-br from-red-400/30 via-red-500/20 to-red-600/30",
      onClick: handleHighPriorityClick
    }
  ];

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'High': return 'bg-red-100 text-red-800 border-red-200';
      case 'Medium': return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'Low': return 'bg-green-100 text-green-800 border-green-200';
      default: return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'Active': return 'bg-green-100 text-green-800 border-green-200';
      case 'On Hold': return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'Closed': return 'bg-gray-100 text-gray-800 border-gray-200';
      case 'Filled': return 'bg-blue-100 text-blue-800 border-blue-200';
      default: return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const formatSalary = (salary: string) => {
    return salary?.includes('$') ? salary : `$${salary}`;
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString();
  };

  const columns = [
    {
      field: 'id',
      headerName: 'Job ID',
      width: 80,
      renderCell: (value: number, row: any) => (
        <button
          onClick={(e) => {
            e.stopPropagation();
            navigate(`/dashboard/jobs/${row.id}`);
          }}
          className="text-blue-600 hover:text-blue-800 hover:underline font-medium font-poppins text-xs"
        >
          #{value}
        </button>
      )
    },
    {
      field: 'jobTitle',
      headerName: 'Job Title',
      width: 200,
      renderCell: (value: string, row: any) => (
        <div className="flex items-center gap-2">
          <button
            onClick={(e) => {
              e.stopPropagation();
              navigate(`/dashboard/jobs/${row.id}`);
            }}
            className="font-medium text-blue-600 hover:text-blue-800 hover:underline font-poppins text-xs whitespace-nowrap overflow-hidden text-ellipsis text-left flex-1"
            title={value}
          >
            {value}
          </button>
          <button
            onClick={(e) => {
              e.stopPropagation();
              navigate(`/dashboard/jobs/${row.id}?edit=true`);
            }}
            className="p-1 hover:bg-gray-100 rounded transition-colors"
            title="Edit job"
          >
            <Pencil className="w-3 h-3 text-gray-500 hover:text-blue-600" />
          </button>
        </div>
      )
    },
    {
      field: 'customer',
      headerName: 'Company',
      width: 150,
      renderCell: (value: string) => (
        <span className="text-gray-700 font-poppins text-xs whitespace-nowrap overflow-hidden text-ellipsis" title={value}>{value}</span>
      )
    },
    {
      field: 'assignedTo',
      headerName: 'Assigned To',
      width: 120,
      renderCell: (value: string) => (
        <span className="text-gray-700 font-poppins text-xs whitespace-nowrap overflow-hidden text-ellipsis" title={value}>{value}</span>
      )
    },
    {
      field: 'jobStatus',
      headerName: 'Status',
      width: 80,
      renderCell: (value: string) => (
        <Badge className={`${getStatusColor(value)} border font-medium font-poppins text-xs whitespace-nowrap`}>{value}</Badge>
      )
    },
    {
      field: 'priority',
      headerName: 'Priority',
      width: 80,
      renderCell: (value: string) => (
        <Badge className={`${getPriorityColor(value)} border font-medium font-poppins text-xs whitespace-nowrap`}>{value}</Badge>
      )
    },
    {
      field: 'location',
      headerName: 'Location',
      width: 120,
      renderCell: (value: any, row: any) => (
        <span className="text-gray-700 font-poppins text-xs whitespace-nowrap overflow-hidden text-ellipsis" title={`${row.state}, USA`}>{row.state}, USA</span>
      )
    },
    {
      field: 'salary',
      headerName: 'Salary',
      width: 100,
      renderCell: (value: string) => (
        <span className="text-gray-700 font-medium font-poppins text-xs whitespace-nowrap">{formatSalary(value)}</span>
      )
    },
    {
      field: 'submissions',
      headerName: 'Submissions',
      width: 80,
      renderCell: (value: number) => (
        <span className="text-gray-700 font-medium font-poppins text-xs whitespace-nowrap">{value}</span>
      )
    },
    {
      field: 'createdOn',
      headerName: 'Date Posted',
      width: 100,
      renderCell: (value: string) => (
        <span className="text-gray-700 font-poppins text-xs whitespace-nowrap">{formatDate(value)}</span>
      )
    },
  ];

  return (
    <div className="space-y-2 sm:space-y-3 md:space-y-4 px-1 sm:px-0">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2 sm:gap-3">
        <div>
          <h1 className="text-lg sm:text-xl md:text-2xl font-bold text-gray-900 font-roboto-slab">
            Jobs {editMode && <span className="text-orange-600 text-sm">(Edit Mode)</span>}
          </h1>
        </div>
        <div className="flex items-center gap-1 sm:gap-2 w-full sm:w-auto">
          {editMode && (
            <Button 
              onClick={handleEditModeToggle}
              variant="outline" 
              size="sm" 
              className="border-orange-200 hover:bg-orange-50 hover:border-orange-300 text-xs flex-1 sm:flex-none px-2 sm:px-3"
            >
              <CheckCircle className="w-3 h-3 mr-1" />
              <span className="hidden sm:inline">Exit Edit</span>
            </Button>
          )}
          
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
                <Share2 className="w-4 h-4 mr-2" />
                Post to Job Boards
              </DropdownMenuItem>
              <DropdownMenuItem>
                <UserCheck className="w-4 h-4 mr-2" />
                Assign to recruiter
              </DropdownMenuItem>
              <DropdownMenuItem>
                <Activity className="w-4 h-4 mr-2" />
                Change status
              </DropdownMenuItem>
              <DropdownMenuItem>
                <Trash2 className="w-4 h-4 mr-2" />
                Mark for deletion
              </DropdownMenuItem>
              <DropdownMenuItem>
                <Users className="w-4 h-4 mr-2" />
                Send to Vendors
              </DropdownMenuItem>
              <DropdownMenuItem>
                <Mail className="w-4 h-4 mr-2" />
                Send Hotlist email
              </DropdownMenuItem>
              <DropdownMenuItem>
                <Bot className="w-4 h-4 mr-2" />
                AI Recruiter
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem>
                <RotateCcw className="w-4 h-4 mr-2" />
                Mass changes
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>

          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button className="button-gradient text-white shadow-lg hover:shadow-xl transition-all duration-300 text-xs flex-1 sm:flex-none px-2 sm:px-3">
                <Plus className="w-3 h-3 mr-1" />
                <span className="hidden sm:inline">New Job</span>
                <span className="sm:hidden">New</span>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="bg-white border-gray-200 z-50">
              <DropdownMenuItem>
                <PenTool className="w-4 h-4 mr-2" />
                Manual Job
              </DropdownMenuItem>
              <DropdownMenuItem>
                <Import className="w-4 h-4 mr-2" />
                Import from a file
              </DropdownMenuItem>
              <DropdownMenuItem>
                <Bot className="w-4 h-4 mr-2" />
                AI Assistant
              </DropdownMenuItem>
              <DropdownMenuItem>
                <Mail className="w-4 h-4 mr-2" />
                From Email
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

      {/* Data Table - Mobile Optimized */}
      <Card className="border-gray-200 shadow-sm overflow-hidden">
        <CardContent className="p-0">
          <div className="overflow-x-auto min-h-0">
            <div className="min-w-full">
              <DataGrid
                rows={jobs}
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

export default Jobs;

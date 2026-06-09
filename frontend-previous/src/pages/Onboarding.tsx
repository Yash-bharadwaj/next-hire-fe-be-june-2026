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
  UserCheck,
  Clock,
  CheckCircle,
  User,
  Building,
  FileText,
  Eye,
  Edit,
  Trash2,
  Settings,
  FileSpreadsheet,
  Pencil,
  AlertTriangle,
  UserX,
  Users,
  ClipboardCheck,
  Mail,
  Phone,
} from "lucide-react";
import { useNavigate } from "react-router-dom";

// Mock onboarding data
const onboardingData = [
  {
    id: "1",
    candidateName: "Jack Collins",
    candidateId: "1",
    jobTitle: "Senior React Developer",
    jobId: "1",
    companyName: "TechCorp Solutions",
    companyId: "1",
    startDate: "2024-02-01",
    onboardingDate: "2024-01-28",
    status: "In Progress",
    completedSteps: 3,
    totalSteps: 8,
    progress: 38,
    assignedTo: "Sarah Johnson",
    priority: "High",
    documentsStatus: "Pending",
    backgroundCheck: "Complete",
    equipmentStatus: "Ordered",
    accessCreated: "Yes"
  },
  {
    id: "2",
    candidateName: "Maria Garcia",
    candidateId: "4",
    jobTitle: "Data Scientist",
    jobId: "3",
    companyName: "DataFlow Inc",
    companyId: "3",
    startDate: "2024-01-15",
    onboardingDate: "2024-01-12",
    status: "Complete",
    completedSteps: 8,
    totalSteps: 8,
    progress: 100,
    assignedTo: "Alex Chen",
    priority: "Medium",
    documentsStatus: "Complete",
    backgroundCheck: "Complete",
    equipmentStatus: "Delivered",
    accessCreated: "Yes"
  },
  {
    id: "3",
    candidateName: "David Wilson",
    candidateId: "5",
    jobTitle: "DevOps Engineer",
    jobId: "4",
    companyName: "CloudTech Systems",
    companyId: "4",
    startDate: "2024-02-15",
    onboardingDate: "2024-02-10",
    status: "Not Started",
    completedSteps: 0,
    totalSteps: 8,
    progress: 0,
    assignedTo: "Emily Davis",
    priority: "Medium",
    documentsStatus: "Not Started",
    backgroundCheck: "Pending",
    equipmentStatus: "Not Ordered",
    accessCreated: "No"
  },
  {
    id: "4",
    candidateName: "Jennifer Lee",
    candidateId: "6",
    jobTitle: "UX Designer",
    jobId: "5",
    companyName: "Design Studio Pro",
    companyId: "5",
    startDate: "2024-02-08",
    onboardingDate: "2024-02-05",
    status: "Delayed",
    completedSteps: 2,
    totalSteps: 8,
    progress: 25,
    assignedTo: "Tom Anderson",
    priority: "High",
    documentsStatus: "Incomplete",
    backgroundCheck: "Pending",
    equipmentStatus: "Pending",
    accessCreated: "No"
  }
];

const Onboarding = () => {
  const navigate = useNavigate();
  const [activeFilters, setActiveFilters] = useState<Record<string, string[]>>({});

  const inProgressCount = onboardingData.filter(item => item.status === "In Progress").length;
  const completeCount = onboardingData.filter(item => item.status === "Complete").length;
  const notStartedCount = onboardingData.filter(item => item.status === "Not Started").length;
  const delayedCount = onboardingData.filter(item => item.status === "Delayed").length;
  const totalOnboarding = onboardingData.length;
  const avgProgress = Math.round(onboardingData.reduce((sum, item) => sum + item.progress, 0) / onboardingData.length);

  const handleInProgressClick = () => {
    setActiveFilters({ status: ["In Progress"] });
  };

  const handleCompleteClick = () => {
    setActiveFilters({ status: ["Complete"] });
  };

  const handleNotStartedClick = () => {
    setActiveFilters({ status: ["Not Started"] });
  };

  const handleDelayedClick = () => {
    setActiveFilters({ status: ["Delayed"] });
  };

  const navigationCards = [
    {
      title: "In Progress",
      value: inProgressCount.toString(),
      icon: Clock,
      color: "text-blue-700",
      gradientOverlay: "bg-gradient-to-br from-blue-400/30 via-blue-500/20 to-blue-600/30",
      onClick: handleInProgressClick
    },
    {
      title: "Complete",
      value: completeCount.toString(),
      icon: CheckCircle,
      color: "text-green-700",
      gradientOverlay: "bg-gradient-to-br from-green-400/30 via-green-500/20 to-green-600/30",
      onClick: handleCompleteClick
    },
    {
      title: "Not Started",
      value: notStartedCount.toString(),
      icon: UserX,
      color: "text-gray-700",
      gradientOverlay: "bg-gradient-to-br from-gray-400/30 via-gray-500/20 to-gray-600/30",
      onClick: handleNotStartedClick
    },
    {
      title: "Delayed",
      value: delayedCount.toString(),
      icon: AlertTriangle,
      color: "text-red-700",
      gradientOverlay: "bg-gradient-to-br from-red-400/30 via-red-500/20 to-red-600/30",
      onClick: handleDelayedClick
    },
    {
      title: "Total Onboarding",
      value: totalOnboarding.toString(),
      icon: Users,
      color: "text-purple-700",
      gradientOverlay: "bg-gradient-to-br from-purple-400/30 via-purple-500/20 to-purple-600/30",
      onClick: () => {}
    },
    {
      title: "Avg Progress",
      value: `${avgProgress}%`,
      icon: ClipboardCheck,
      color: "text-indigo-700",
      gradientOverlay: "bg-gradient-to-br from-indigo-400/30 via-indigo-500/20 to-indigo-600/30",
      onClick: () => {}
    }
  ];

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'In Progress': return 'bg-blue-100 text-blue-800 border-blue-200';
      case 'Complete': return 'bg-green-100 text-green-800 border-green-200';
      case 'Not Started': return 'bg-gray-100 text-gray-800 border-gray-200';
      case 'Delayed': return 'bg-red-100 text-red-800 border-red-200';
      default: return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'High': return 'bg-red-100 text-red-800 border-red-200';
      case 'Medium': return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'Low': return 'bg-green-100 text-green-800 border-green-200';
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
      width: 80,
      renderCell: (value: string, row: any) => (
        <button
          onClick={(e) => {
            e.stopPropagation();
            console.log('Navigate to onboarding:', row.id);
          }}
          className="text-blue-600 hover:text-blue-800 hover:underline font-medium font-poppins text-xs"
        >
          #{value}
        </button>
      )
    },
    {
      field: 'candidateName',
      headerName: 'Candidate',
      width: 150,
      renderCell: (value: string, row: any) => (
        <div className="flex items-center gap-2">
          <button
            onClick={(e) => {
              e.stopPropagation();
              navigate(`/dashboard/candidates/${row.candidateId}`);
            }}
            className="font-medium text-blue-600 hover:text-blue-800 hover:underline font-poppins text-xs whitespace-nowrap overflow-hidden text-ellipsis text-left flex-1"
            title={value}
          >
            {value}
          </button>
        </div>
      )
    },
    {
      field: 'jobTitle',
      headerName: 'Job Title',
      width: 180,
      renderCell: (value: string, row: any) => (
        <button
          onClick={(e) => {
            e.stopPropagation();
            navigate(`/dashboard/jobs/${row.jobId}`);
          }}
          className="text-blue-600 hover:text-blue-800 hover:underline font-poppins text-xs whitespace-nowrap overflow-hidden text-ellipsis text-left"
          title={value}
        >
          {value}
        </button>
      )
    },
    {
      field: 'companyName',
      headerName: 'Company',
      width: 140,
      renderCell: (value: string, row: any) => (
        <button
          onClick={(e) => {
            e.stopPropagation();
            navigate(`/dashboard/business-partners/${row.companyId}`);
          }}
          className="text-blue-600 hover:text-blue-800 hover:underline font-poppins text-xs whitespace-nowrap overflow-hidden text-ellipsis text-left"
          title={value}
        >
          {value}
        </button>
      )
    },
    {
      field: 'startDate',
      headerName: 'Start Date',
      width: 110,
      renderCell: (value: string) => (
        <span className="text-gray-700 font-poppins text-xs whitespace-nowrap">{formatDate(value)}</span>
      )
    },
    {
      field: 'status',
      headerName: 'Status',
      width: 100,
      renderCell: (value: string) => (
        <Badge className={`${getStatusColor(value)} border font-medium font-poppins text-xs whitespace-nowrap`}>{value}</Badge>
      )
    },
    {
      field: 'progress',
      headerName: 'Progress',
      width: 120,
      renderCell: (value: number, row: any) => (
        <div className="flex items-center gap-2">
          <div className="w-12 bg-gray-200 rounded-full h-2">
            <div 
              className="bg-blue-600 h-2 rounded-full" 
              style={{ width: `${value}%` }}
            ></div>
          </div>
          <span className="text-gray-700 font-poppins text-xs">{row.completedSteps}/{row.totalSteps}</span>
        </div>
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
      field: 'assignedTo',
      headerName: 'Assigned To',
      width: 120,
      renderCell: (value: string) => (
        <span className="text-gray-700 font-poppins text-xs whitespace-nowrap overflow-hidden text-ellipsis" title={value}>{value}</span>
      )
    },
    {
      field: 'documentsStatus',
      headerName: 'Documents',
      width: 100,
      renderCell: (value: string) => (
        <span className={`font-poppins text-xs whitespace-nowrap ${
          value === 'Complete' ? 'text-green-700' :
          value === 'Pending' ? 'text-yellow-700' :
          value === 'Incomplete' ? 'text-red-700' : 'text-gray-700'
        }`}>{value}</span>
      )
    },
    {
      field: 'backgroundCheck',
      headerName: 'Background',
      width: 100,
      renderCell: (value: string) => (
        <span className={`font-poppins text-xs whitespace-nowrap ${
          value === 'Complete' ? 'text-green-700' :
          value === 'Pending' ? 'text-yellow-700' : 'text-gray-700'
        }`}>{value}</span>
      )
    },
  ];

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 font-roboto-slab">Onboarding</h1>
          <p className="text-lg text-gray-600 font-roboto-slab">Manage candidate onboarding process</p>
        </div>
        <div className="flex items-center gap-2">
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" size="sm" className="border-green-200 hover:bg-green-50 hover:border-green-300 text-xs">
                <Calendar className="w-3 h-3 mr-1" />
                Export
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
              <Button variant="outline" size="sm" className="border-blue-200 hover:bg-blue-50 hover:border-blue-300 text-xs">
                <Settings className="w-3 h-3 mr-1" />
                Actions
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="bg-white border-gray-200 z-50">
              <DropdownMenuItem>
                <Mail className="w-4 h-4 mr-2" />
                Send Bulk Reminders
              </DropdownMenuItem>
              <DropdownMenuItem>
                <ClipboardCheck className="w-4 h-4 mr-2" />
                Update Progress
              </DropdownMenuItem>
              <DropdownMenuItem>
                <FileText className="w-4 h-4 mr-2" />
                Generate Report
              </DropdownMenuItem>
              <DropdownMenuItem>
                <UserCheck className="w-4 h-4 mr-2" />
                Change Assignment
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>

          <Button className="button-gradient text-white shadow-lg hover:shadow-xl transition-all duration-300 text-xs">
            <Plus className="w-3 h-3 mr-1" />
            Start Onboarding
          </Button>
        </div>
      </div>

      {/* Navigation Cards */}
      <div className="grid grid-cols-6 gap-2">
        {navigationCards.map((card) => {
          const IconComponent = card.icon;
          return (
            <Card 
              key={card.title} 
              className="relative overflow-hidden border-0 shadow-md hover:shadow-lg transition-all duration-500 hover:-translate-y-1 group cursor-pointer backdrop-blur-xl bg-white/20"
              onClick={card.onClick}
            >
              <div className={`absolute inset-0 ${card.gradientOverlay}`}></div>
              <div className="absolute inset-0 bg-gradient-to-br from-white/40 via-white/20 to-transparent"></div>
              <CardContent className="relative p-2">
                <div className="flex items-center space-x-2">
                  <div className="p-1.5 rounded-full bg-white/30 backdrop-blur-sm shadow-sm group-hover:bg-white/40 transition-all border border-white/20">
                    <IconComponent className={`h-3 w-3 ${card.color}`} />
                  </div>
                  <div>
                    <p className="text-xs font-semibold text-gray-600 font-roboto-slab">{card.title}</p>
                    <p className="text-sm font-bold text-gray-900 font-roboto-slab">{card.value}</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* Data Table */}
      <Card className="border-gray-200 shadow-sm overflow-hidden">
        <CardContent className="p-0">
          <DataGrid
            rows={onboardingData}
            columns={columns}
            pageSizeOptions={[10, 25, 50, 100]}
            checkboxSelection
            onRowClick={(row) => console.log('Row clicked:', row)}
            initialFilters={activeFilters}
          />
        </CardContent>
      </Card>
    </div>
  );
};

export default Onboarding;
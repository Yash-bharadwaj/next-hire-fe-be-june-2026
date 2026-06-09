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
  Trophy,
  DollarSign,
  User,
  Building,
  Star,
  FileText,
  Eye,
  Edit,
  Trash2,
  CheckCircle,
  Clock,
  Settings,
  FileSpreadsheet,
  Pencil,
  TrendingUp,
  Target,
  Award,
} from "lucide-react";
import { useNavigate } from "react-router-dom";
import { CompanyFilter } from "@/components/CompanyFilter";

// Mock placements data
const placementsData = [
  {
    id: "1",
    candidateName: "Jack Collins",
    candidateId: "1",
    jobTitle: "Senior React Developer",
    jobId: "1",
    companyName: "TechCorp Solutions",
    companyId: "1",
    startDate: "2024-02-01",
    placementDate: "2024-01-25",
    salary: "$120,000",
    commission: "$12,000",
    status: "Active",
    duration: "Permanent",
    recruiter: "Sarah Johnson",
    clientManager: "Mike Chen",
    location: "Toledo, MT",
    billingRate: "$80/hour",
    margin: "25%"
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
    placementDate: "2024-01-10",
    salary: "$125,000",
    commission: "$12,500",
    status: "Active",
    duration: "Permanent",
    recruiter: "Alex Chen",
    clientManager: "Linda Rodriguez",
    location: "Austin, TX",
    billingRate: "$85/hour",
    margin: "28%"
  },
  {
    id: "3",
    candidateName: "David Wilson",
    candidateId: "5",
    jobTitle: "DevOps Engineer",
    jobId: "4",
    companyName: "CloudTech Systems",
    companyId: "4",
    startDate: "2024-01-08",
    placementDate: "2024-01-03",
    salary: "$110,000",
    commission: "$11,000",
    status: "Completed",
    duration: "Contract",
    recruiter: "Emily Davis",
    clientManager: "Robert Kim",
    location: "Seattle, WA",
    billingRate: "$75/hour",
    margin: "22%"
  },
  {
    id: "4",
    candidateName: "Jennifer Lee",
    candidateId: "6",
    jobTitle: "UX Designer",
    jobId: "5",
    companyName: "Design Studio Pro",
    companyId: "5",
    startDate: "2023-12-15",
    placementDate: "2023-12-10",
    salary: "$95,000",
    commission: "$9,500",
    status: "Completed",
    duration: "Permanent",
    recruiter: "Tom Anderson",
    clientManager: "Rachel Green",
    location: "San Francisco, CA",
    billingRate: "$70/hour",
    margin: "30%"
  }
];

const Placements = () => {
  const navigate = useNavigate();
  const [activeFilters, setActiveFilters] = useState<Record<string, string[]>>({});

  const activePlacements = placementsData.filter(placement => placement.status === "Active").length;
  const completedPlacements = placementsData.filter(placement => placement.status === "Completed").length;
  const totalCommission = placementsData.reduce((sum, placement) => sum + parseFloat(placement.commission.replace(/[$,]/g, '')), 0);
  const avgSalary = placementsData.reduce((sum, placement) => sum + parseFloat(placement.salary.replace(/[$,]/g, '')), 0) / placementsData.length;
  const totalPlacements = placementsData.length;
  const avgMargin = (placementsData.reduce((sum, placement) => sum + parseFloat(placement.margin.replace('%', '')), 0) / placementsData.length).toFixed(1);

  const handleActiveClick = () => {
    setActiveFilters({ status: ["Active"] });
  };

  const handleCompletedClick = () => {
    setActiveFilters({ status: ["Completed"] });
  };

  const navigationCards = [
    {
      title: "Active Placements",
      value: activePlacements.toString(),
      icon: CheckCircle,
      color: "text-green-700",
      gradientOverlay: "bg-gradient-to-br from-green-400/30 via-green-500/20 to-green-600/30",
      onClick: handleActiveClick
    },
    {
      title: "Completed",
      value: completedPlacements.toString(),
      icon: Trophy,
      color: "text-blue-700",
      gradientOverlay: "bg-gradient-to-br from-blue-400/30 via-blue-500/20 to-blue-600/30",
      onClick: handleCompletedClick
    },
    {
      title: "Total Commission",
      value: `$${(totalCommission / 1000).toFixed(0)}K`,
      icon: DollarSign,
      color: "text-purple-700",
      gradientOverlay: "bg-gradient-to-br from-purple-400/30 via-purple-500/20 to-purple-600/30",
      onClick: () => {}
    },
    {
      title: "Avg Salary",
      value: `$${(avgSalary / 1000).toFixed(0)}K`,
      icon: TrendingUp,
      color: "text-indigo-700",
      gradientOverlay: "bg-gradient-to-br from-indigo-400/30 via-indigo-500/20 to-indigo-600/30",
      onClick: () => {}
    },
    {
      title: "Total Placements",
      value: totalPlacements.toString(),
      icon: Target,
      color: "text-orange-700",
      gradientOverlay: "bg-gradient-to-br from-orange-400/30 via-orange-500/20 to-orange-600/30",
      onClick: () => {}
    },
    {
      title: "Avg Margin",
      value: `${avgMargin}%`,
      icon: Award,
      color: "text-amber-700",
      gradientOverlay: "bg-gradient-to-br from-amber-400/30 via-amber-500/20 to-amber-600/30",
      onClick: () => {}
    }
  ];

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'Active': return 'bg-green-100 text-green-800 border-green-200';
      case 'Completed': return 'bg-blue-100 text-blue-800 border-blue-200';
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
      headerName: 'ID',
      width: 80,
      renderCell: (value: string, row: any) => (
        <button
          onClick={(e) => {
            e.stopPropagation();
            navigate(`/dashboard/placements/${row.id}`);
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
              navigate(`/dashboard/placements/${row.id}`);
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
            navigate(`/dashboard/placements/${row.id}`);
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
            navigate(`/dashboard/placements/${row.id}`);
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
      field: 'salary',
      headerName: 'Salary',
      width: 100,
      renderCell: (value: string) => (
        <span className="text-gray-700 font-medium font-poppins text-xs whitespace-nowrap">{formatSalary(value)}</span>
      )
    },
    {
      field: 'commission',
      headerName: 'Commission',
      width: 100,
      renderCell: (value: string) => (
        <span className="text-green-700 font-medium font-poppins text-xs whitespace-nowrap">{formatSalary(value)}</span>
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
      field: 'duration',
      headerName: 'Duration',
      width: 100,
      renderCell: (value: string) => (
        <span className="text-gray-700 font-poppins text-xs whitespace-nowrap">{value}</span>
      )
    },
    {
      field: 'recruiter',
      headerName: 'Recruiter',
      width: 120,
      renderCell: (value: string) => (
        <span className="text-gray-700 font-poppins text-xs whitespace-nowrap overflow-hidden text-ellipsis" title={value}>{value}</span>
      )
    },
    {
      field: 'margin',
      headerName: 'Margin',
      width: 80,
      renderCell: (value: string) => (
        <span className="text-purple-700 font-medium font-poppins text-xs whitespace-nowrap">{value}</span>
      )
    },
  ];

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div className="flex items-center gap-6">
          <div>
            <h1 className="text-2xl font-bold text-gray-900 font-roboto-slab">Placements</h1>
            <p className="text-lg text-gray-600 font-roboto-slab">Track successful placements and revenue</p>
          </div>
          <CompanyFilter 
            onCompanyChange={(companyId) => console.log("Selected company:", companyId)}
          />
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
                <FileText className="w-4 h-4 mr-2" />
                Generate Revenue Report
              </DropdownMenuItem>
              <DropdownMenuItem>
                <Trophy className="w-4 h-4 mr-2" />
                Performance Summary
              </DropdownMenuItem>
              <DropdownMenuItem>
                <DollarSign className="w-4 h-4 mr-2" />
                Commission Report
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>

          <Button className="button-gradient text-white shadow-lg hover:shadow-xl transition-all duration-300 text-xs">
            <Plus className="w-3 h-3 mr-1" />
            Record Placement
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
            rows={placementsData}
            columns={columns}
            pageSizeOptions={[10, 25, 50, 100]}
            checkboxSelection
            onRowClick={(row) => navigate(`/dashboard/placements/${row.id}`)}
            initialFilters={activeFilters}
          />
        </CardContent>
      </Card>
    </div>
  );
};

export default Placements;
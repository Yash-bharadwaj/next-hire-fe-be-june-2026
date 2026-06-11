import React, { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { DataGrid } from "@/components/ui/data-grid";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
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
  Search,
  RefreshCw,
  Loader2,
  AlertCircle,
  X,
} from "lucide-react";
import { useNavigate } from "react-router-dom";
import { usePlacements, usePlacementStats } from "@/hooks/usePlacements";
import { placementService, PlacementStatus, PlacementType } from "@/services/placementService";
import { useAuth } from "@/contexts/AuthContext";
import { downloadCsv } from "@/utils/csv";
import { toast } from "sonner";

const _placementsStatsCache = {
  activePlacements: 0, completedPlacements: 0, totalPlacements: 0,
  totalCommission: 0, avgSalary: 0, avgMargin: 0,
};

const Placements = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  
  // Hooks
  const { 
    placements, 
    loading, 
    error, 
    pagination, 
    fetchPlacements, 
    refresh 
  } = usePlacements();
  
  const { 
    stats, 
    loading: statsLoading, 
    refresh: refreshStats 
  } = usePlacementStats();

  // Filters
  const [statusFilter, setStatusFilter] = useState<PlacementStatus | "">("");
  const [typeFilter, setTypeFilter] = useState<PlacementType | "">("");
  const [searchQuery, setSearchQuery] = useState("");
  const [exporting, setExporting] = useState(false);

  // Apply filters
  const handleApplyFilters = () => {
    const filters: any = {};
    if (statusFilter) filters.status = statusFilter;
    if (typeFilter) filters.placement_type = typeFilter;
    if (searchQuery) filters.search = searchQuery;
    
    fetchPlacements(filters);
  };

  // Clear filters
  const handleClearFilters = () => {
    setStatusFilter("");
    setTypeFilter("");
    setSearchQuery("");
    fetchPlacements({});
  };

  const handleExport = () => {
    if (user?.role !== "recruiter") {
      toast.error("Only recruiters can export placements");
      return;
    }
    if (!placements.length) {
      toast.error("No placements to export");
      return;
    }
    try {
      setExporting(true);
      const columns = [
        { header: "Placement ID", accessor: (p: any) => p.placement_id || p.id },
        { header: "Job", accessor: (p: any) => p.job?.title || "" },
        { header: "Candidate", accessor: (p: any) => `${p.candidate?.first_name || ""} ${p.candidate?.last_name || ""}`.trim() },
        { header: "Status", accessor: (p: any) => p.status },
        { header: "Start Date", accessor: (p: any) => p.start_date || "" },
        { header: "Salary", accessor: (p: any) => p.salary },
        { header: "Currency", accessor: (p: any) => p.salary_currency || "USD" },
        { header: "Location", accessor: (p: any) => p.location || "" },
        { header: "Work Arrangement", accessor: (p: any) => p.work_arrangement || "" },
      ];
      const timestamp = new Date().toISOString().replace(/[:.]/g, "-");
      downloadCsv(`placements-${timestamp}.csv`, placements, columns);
      toast.success("Placements exported");
    } catch (err: any) {
      toast.error(err?.message || "Failed to export placements");
    } finally {
      setExporting(false);
    }
  };

  // Snapshot stats only when no filter is active so card counts never
  // recompute against a filtered subset. Also fixes the stale-state bug where
  // handleApplyFilters() read the old statusFilter value before useState settled.
  const [baseStats, setBaseStats] = useState({ ..._placementsStatsCache });

  useEffect(() => {
    if (!statusFilter && !typeFilter) {
      const commission = placements.reduce((sum, p) => {
        const c = typeof p.commission === 'string'
          ? parseFloat(p.commission.replace(/[^0-9.]/g, '')) || 0
          : (p.commission || 0);
        return sum + c;
      }, 0);
      const salaryList = placements
        .map(p => typeof p.salary === 'string'
          ? parseFloat(p.salary.replace(/[^0-9.]/g, '')) || 0
          : (p.salary || 0))
        .filter(s => s > 0);
      const marginList = placements
        .map(p => typeof p.margin === 'string'
          ? parseFloat(p.margin.replace(/[^0-9.]/g, '')) || 0
          : (p.margin || 0))
        .filter(m => m > 0);
      const next = {
        activePlacements: stats?.activePlacements ?? placements.filter(p => p.status === "active").length,
        completedPlacements: stats?.completedPlacements ?? placements.filter(p => p.status === "completed").length,
        totalPlacements: stats?.totalPlacements ?? placements.length,
        totalCommission: commission,
        avgSalary: salaryList.length > 0 ? salaryList.reduce((s, v) => s + v, 0) / salaryList.length : 0,
        avgMargin: marginList.length > 0 ? Math.round(marginList.reduce((s, v) => s + v, 0) / marginList.length) : 0,
      };
      Object.assign(_placementsStatsCache, next);
      setBaseStats(next);
    }
  }, [placements, stats, statusFilter, typeFilter]);

  const activeCardId =
    statusFilter === "active" ? "active" :
    statusFilter === "completed" ? "completed" : "all";

  const handleActiveClick = () => {
    setStatusFilter("active");
    fetchPlacements({ status: "active" });
  };

  const handleCompletedClick = () => {
    setStatusFilter("completed");
    fetchPlacements({ status: "completed" });
  };

  const clearFilter = () => { setStatusFilter(""); setTypeFilter(""); fetchPlacements({}); };

  // Different navigation cards for recruiter vs candidate
  const recruiterCards = [
    {
      id: "active",
      title: "Active Placements",
      value: baseStats.activePlacements.toString(),
      icon: CheckCircle,
      color: "text-green-700",
      gradientOverlay: "bg-gradient-to-br from-green-400/30 via-green-500/20 to-green-600/30",
      onClick: handleActiveClick,
    },
    {
      id: "completed",
      title: "Completed",
      value: baseStats.completedPlacements.toString(),
      icon: Trophy,
      color: "text-blue-700",
      gradientOverlay: "bg-gradient-to-br from-blue-400/30 via-blue-500/20 to-blue-600/30",
      onClick: handleCompletedClick,
    },
    {
      id: "commission",
      title: "Total Commission",
      value: `$${(baseStats.totalCommission / 1000).toFixed(0)}K`,
      icon: DollarSign,
      color: "text-purple-700",
      gradientOverlay: "bg-gradient-to-br from-purple-400/30 via-purple-500/20 to-purple-600/30",
      onClick: clearFilter,
    },
    {
      id: "salary",
      title: "Avg Salary",
      value: `$${(baseStats.avgSalary / 1000).toFixed(0)}K`,
      icon: TrendingUp,
      color: "text-indigo-700",
      gradientOverlay: "bg-gradient-to-br from-indigo-400/30 via-indigo-500/20 to-indigo-600/30",
      onClick: clearFilter,
    },
    {
      id: "all",
      title: "Total Placements",
      value: baseStats.totalPlacements.toString(),
      icon: Target,
      color: "text-orange-700",
      gradientOverlay: "bg-gradient-to-br from-orange-400/30 via-orange-500/20 to-orange-600/30",
      onClick: clearFilter,
    },
    {
      id: "margin",
      title: "Avg Margin",
      value: `${baseStats.avgMargin}%`,
      icon: Award,
      color: "text-amber-700",
      gradientOverlay: "bg-gradient-to-br from-amber-400/30 via-amber-500/20 to-amber-600/30",
      onClick: clearFilter,
    },
  ];

  const candidateCards = [
    {
      id: "active",
      title: "Active Placements",
      value: baseStats.activePlacements.toString(),
      icon: CheckCircle,
      color: "text-green-700",
      gradientOverlay: "bg-gradient-to-br from-green-400/30 via-green-500/20 to-green-600/30",
      onClick: handleActiveClick,
    },
    {
      id: "completed",
      title: "Completed",
      value: baseStats.completedPlacements.toString(),
      icon: Trophy,
      color: "text-blue-700",
      gradientOverlay: "bg-gradient-to-br from-blue-400/30 via-blue-500/20 to-blue-600/30",
      onClick: handleCompletedClick,
    },
    {
      id: "all",
      title: "Total Placements",
      value: baseStats.totalPlacements.toString(),
      icon: Target,
      color: "text-orange-700",
      gradientOverlay: "bg-gradient-to-br from-orange-400/30 via-orange-500/20 to-orange-600/30",
      onClick: clearFilter,
    },
  ];

  const navigationCards = user?.role === "recruiter" ? recruiterCards : candidateCards;

  const getStatusColor = (status: string) => {
    const normalizedStatus = status?.toLowerCase() || '';
    switch (normalizedStatus) {
      case 'active': return 'bg-green-100 text-green-800 border-green-200';
      case 'completed': return 'bg-blue-100 text-blue-800 border-blue-200';
      case 'terminated': return 'bg-red-100 text-red-800 border-red-200';
      default: return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const formatSalary = (salary: string | number) => {
    if (!salary) return '$0';
    if (typeof salary === 'number') {
      return new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', minimumFractionDigits: 0 }).format(salary);
    }
    return salary?.includes('$') ? salary : `$${salary}`;
  };

  const formatDate = (dateString: string) => {
    if (!dateString) return 'N/A';
    try {
      return new Date(dateString).toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'short',
        day: 'numeric'
      });
    } catch {
      return dateString;
    }
  };

  // Base columns
  const baseColumns = [
    {
      field: 'id',
      headerName: 'ID',
      width: 110,
      renderCell: (value: string, row: any) => {
        const truncated = value && value.length > 10 ? value.slice(0, 10) + "…" : value;
        return (
          <TooltipProvider delayDuration={100}>
            <Tooltip>
              <TooltipTrigger asChild>
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    navigate(`/dashboard/placements/${row.id}`);
                  }}
                  className="text-blue-600 hover:text-blue-800 hover:underline font-medium font-poppins text-xs truncate max-w-[100px] block"
                >
                  {truncated}
                </button>
              </TooltipTrigger>
              <TooltipContent side="top" className="font-mono text-xs">
                {value}
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
        );
      }
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
  ];

  // Recruiter-only columns
  const recruiterColumns = [
    {
      field: 'commission',
      headerName: 'Commission',
      width: 100,
      renderCell: (value: string) => (
        <span className="text-green-700 font-medium font-poppins text-xs whitespace-nowrap">{formatSalary(value)}</span>
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

  const columns = user?.role === "recruiter" 
    ? [...baseColumns, ...recruiterColumns]
    : baseColumns;

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div className="flex items-center gap-6">
          <div>
            <div className="flex items-center gap-2 flex-wrap">
              <h1 className="text-2xl font-bold text-gray-900 font-roboto-slab">
                {user?.role === "candidate" ? "My Placements" : "Placements"}
              </h1>
              {statusFilter && (
                <span className="inline-flex items-center gap-1 pl-2.5 pr-1.5 py-0.5 rounded-full text-xs font-medium bg-green-50 text-green-700 border border-green-200">
                  {statusFilter.charAt(0).toUpperCase() + statusFilter.slice(1)}
                  <button onClick={clearFilter} className="hover:bg-green-100 rounded-full p-0.5 transition-colors">
                    <X className="w-3 h-3" />
                  </button>
                </span>
              )}
            </div>
            <p className="text-sm text-gray-600 font-roboto-slab">
              {user?.role === "candidate"
                ? "View your successful placements"
                : "Track successful placements and revenue"}
            </p>
          </div>
        </div>
        {user?.role === "recruiter" && (
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={handleExport}
              disabled={exporting}
              className="border-green-200 hover:bg-green-50 hover:border-green-300 text-xs"
            >
              <FileSpreadsheet className="w-3 h-3 mr-1" />
              {exporting ? "Exporting..." : "Export CSV"}
            </Button>
          
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
        )}
      </div>

      {/* Navigation Cards */}
      <div className={`grid gap-2 ${user?.role === "recruiter" ? "grid-cols-6" : "grid-cols-3"}`}>
        {navigationCards.map((card) => {
          const IconComponent = card.icon;
          const isActive = activeCardId === card.id;
          return (
            <Card
              key={card.title}
              className={`relative overflow-hidden border-0 shadow-md hover:shadow-lg transition-all duration-500 hover:-translate-y-1 group cursor-pointer backdrop-blur-xl bg-white/20 ${
                isActive ? "ring-2 ring-green-500 ring-offset-2 -translate-y-1 shadow-lg" : ""
              }`}
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

      {/* Loading State */}
      {loading && (
        <Card className="border-gray-200 shadow-sm">
          <CardContent className="p-8 text-center">
            <Loader2 className="h-8 w-8 animate-spin mx-auto mb-4 text-blue-600" />
            <p className="text-gray-600">Loading placements...</p>
          </CardContent>
        </Card>
      )}

      {/* Error State */}
      {error && !loading && (
        <Card className="border-red-200 shadow-sm">
          <CardContent className="p-8 text-center">
            <AlertCircle className="h-8 w-8 text-red-500 mx-auto mb-4" />
            <p className="text-red-600 mb-4">{error}</p>
            <Button onClick={refresh} variant="outline">
              <RefreshCw className="w-4 h-4 mr-2" />
              Retry
            </Button>
          </CardContent>
        </Card>
      )}

      {/* Data Table */}
      {!loading && !error && (
        <Card className="border-gray-200 shadow-sm overflow-hidden">
          <CardContent className="p-0">
            {placements.length > 0 ? (
              <DataGrid
                rows={placements.map(p => ({
                  id: p.id,
                  candidateName: `${p.candidate?.first_name || ''} ${p.candidate?.last_name || ''}`.trim() || 'Unknown',
                  jobTitle: p.job?.title || 'Unknown',
                  companyName: p.job?.company_name || p.company?.name || 'Unknown',
                  startDate: p.start_date || '',
                  placementDate: p.created_at || '',
                  salary: p.salary || p.salary_amount || '0',
                  commission: p.commission || p.commission_amount || '0',
                  status: p.status || 'active',
                  duration: p.placement_type || 'Permanent',
                  recruiter: p.recruiter?.name || p.created_by_user?.name || 'Unknown',
                  margin: p.margin || '0%',
                }))}
                columns={columns}
                pageSizeOptions={[10, 25, 50, 100]}
                checkboxSelection
                onRowClick={(row) => navigate(`/dashboard/placements/${row.id}`)}
                initialFilters={{}}
              />
            ) : (
              <div className="p-8 text-center">
                <Trophy className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                <p className="text-gray-600">No placements found</p>
                {user?.role === "recruiter" && (
                  <Button 
                    onClick={() => navigate('/dashboard/jobs')} 
                    className="mt-4"
                    variant="outline"
                  >
                    View Jobs
                  </Button>
                )}
              </div>
            )}
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default Placements;
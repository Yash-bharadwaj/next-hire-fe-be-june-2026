import React, { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { DataGrid } from "@/components/ui/data-grid";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Plus,
  Calendar,
  Trophy,
  DollarSign,
  User,
  Building,
  Star,
  Eye,
  Edit,
  Trash2,
  CheckCircle,
  Clock,
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
import { usePlacements, usePlacementStats, usePlacementManagement } from "@/hooks/usePlacements";
import {
  placementService,
  PlacementStatus,
  PlacementType,
  WorkArrangement,
  OnboardingStatus,
  CreatePlacementRequest,
  UpdatePlacementRequest,
  Placement,
} from "@/services/placementService";
import { jobService, Job } from "@/services/jobService";
import { submissionService, Submission } from "@/services/submissionService";
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

  const { createPlacement, updatePlacement, deletePlacement } = usePlacementManagement();

  // Filters
  const [statusFilter, setStatusFilter] = useState<PlacementStatus | "">("");
  const [typeFilter, setTypeFilter] = useState<PlacementType | "">("");
  const [searchQuery, setSearchQuery] = useState("");
  const [exporting, setExporting] = useState(false);

  // Record Placement dialog state
  const [showCreateDialog, setShowCreateDialog] = useState(false);
  const [creating, setCreating] = useState(false);
  const [recruiterJobs, setRecruiterJobs] = useState<Job[]>([]);
  const [loadingJobs, setLoadingJobs] = useState(false);
  const [jobSubmissions, setJobSubmissions] = useState<Submission[]>([]);
  const [loadingSubmissions, setLoadingSubmissions] = useState(false);
  const [newPlacement, setNewPlacement] = useState({
    job_id: "",
    submission_id: "",
    start_date: "",
    end_date: "",
    salary: "",
    salary_currency: "USD",
    location: "",
    placement_type: "permanent" as PlacementType,
    work_arrangement: "onsite" as WorkArrangement,
    commission_percentage: "",
    notes: "",
  });

  // Edit Placement dialog state
  const [editingPlacement, setEditingPlacement] = useState<Placement | null>(null);
  const [savingEdit, setSavingEdit] = useState(false);
  const [editForm, setEditForm] = useState({
    status: "active" as PlacementStatus,
    onboarding_status: "pending" as OnboardingStatus,
    salary: "",
    end_date: "",
    performance_rating: "",
    notes: "",
  });
  const [deletingId, setDeletingId] = useState<string | null>(null);

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

  const resetNewPlacementForm = () => {
    setNewPlacement({
      job_id: "",
      submission_id: "",
      start_date: "",
      end_date: "",
      salary: "",
      salary_currency: "USD",
      location: "",
      placement_type: "permanent",
      work_arrangement: "onsite",
      commission_percentage: "",
      notes: "",
    });
    setJobSubmissions([]);
  };

  const openCreateDialog = async () => {
    setShowCreateDialog(true);
    if (recruiterJobs.length === 0) {
      try {
        setLoadingJobs(true);
        const response = await jobService.getRecruiterJobs({ limit: 100 });
        setRecruiterJobs(response.data.jobs);
      } catch (err: any) {
        toast.error(err.response?.data?.message || err.message || "Failed to load jobs");
      } finally {
        setLoadingJobs(false);
      }
    }
  };

  const handleJobSelect = async (jobId: string) => {
    const job = recruiterJobs.find((j) => j.id === jobId);
    setNewPlacement((prev) => ({
      ...prev,
      job_id: jobId,
      submission_id: "",
      location: prev.location || job?.location || "",
    }));
    setJobSubmissions([]);
    if (!jobId) return;
    try {
      setLoadingSubmissions(true);
      const response = await submissionService.getJobSubmissions(jobId, { limit: 100 });
      setJobSubmissions(response.data.submissions);
    } catch (err: any) {
      toast.error(err.response?.data?.message || err.message || "Failed to load submissions");
    } finally {
      setLoadingSubmissions(false);
    }
  };

  const handleCreatePlacement = async () => {
    const { job_id, submission_id, start_date, salary, location } = newPlacement;
    if (!job_id || !submission_id || !start_date || !salary || !location.trim()) {
      toast.error("Job, candidate, start date, salary, and location are required");
      return;
    }
    const submission = jobSubmissions.find((s) => s.id === submission_id);
    if (!submission) {
      toast.error("Please select a valid candidate submission");
      return;
    }
    try {
      setCreating(true);
      const data: CreatePlacementRequest = {
        job_id,
        candidate_id: submission.candidate_id,
        submission_id,
        start_date,
        end_date: newPlacement.end_date || undefined,
        salary: Number(salary),
        salary_currency: newPlacement.salary_currency || "USD",
        location: location.trim(),
        placement_type: newPlacement.placement_type,
        work_arrangement: newPlacement.work_arrangement,
        commission_percentage: newPlacement.commission_percentage
          ? Number(newPlacement.commission_percentage)
          : undefined,
        notes: newPlacement.notes.trim() || undefined,
      };
      const result = await createPlacement(data);
      if (result) {
        setShowCreateDialog(false);
        resetNewPlacementForm();
        refresh();
        refreshStats();
      }
    } finally {
      setCreating(false);
    }
  };

  const openEditDialog = (placement: Placement) => {
    setEditingPlacement(placement);
    setEditForm({
      status: placement.status || "active",
      onboarding_status: placement.onboarding_status || "pending",
      salary: placement.salary != null ? String(placement.salary) : "",
      end_date: placement.end_date ? placement.end_date.slice(0, 10) : "",
      performance_rating: placement.performance_rating != null ? String(placement.performance_rating) : "",
      notes: placement.notes || "",
    });
  };

  const handleUpdatePlacement = async () => {
    if (!editingPlacement) return;
    try {
      setSavingEdit(true);
      const data: UpdatePlacementRequest = {
        status: editForm.status,
        onboarding_status: editForm.onboarding_status,
        salary: editForm.salary ? Number(editForm.salary) : undefined,
        end_date: editForm.end_date || undefined,
        performance_rating: editForm.performance_rating ? Number(editForm.performance_rating) : undefined,
        notes: editForm.notes.trim() || undefined,
      };
      const result = await updatePlacement(editingPlacement.id, data);
      if (result) {
        setEditingPlacement(null);
        refresh();
        refreshStats();
      }
    } finally {
      setSavingEdit(false);
    }
  };

  const handleDeletePlacement = async (placementId: string, label: string) => {
    if (!window.confirm(`Are you sure you want to delete the placement for ${label}? This cannot be undone.`)) {
      return;
    }
    try {
      setDeletingId(placementId);
      const ok = await deletePlacement(placementId);
      if (ok) {
        refresh();
        refreshStats();
      }
    } finally {
      setDeletingId(null);
    }
  };

  // Headline counts (active/completed/total) always sync from the stats API,
  // since that reflects the recruiter's full placement set regardless of the
  // currently active status/type filter on the placements list below. The
  // commission/salary/margin aggregates, however, are derived from the
  // placements list itself, so they're only recomputed when no filter is
  // active (otherwise they'd reflect a filtered subset).
  const [baseStats, setBaseStats] = useState({ ..._placementsStatsCache });

  useEffect(() => {
    setBaseStats((prev) => {
      const next = { ...prev };

      if (stats) {
        next.activePlacements = stats.activePlacements ?? next.activePlacements;
        next.completedPlacements = stats.completedPlacements ?? next.completedPlacements;
        next.totalPlacements = stats.totalPlacements ?? next.totalPlacements;
      }

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

        next.totalCommission = commission;
        next.avgSalary = salaryList.length > 0 ? salaryList.reduce((s, v) => s + v, 0) / salaryList.length : 0;
        next.avgMargin = marginList.length > 0 ? Math.round(marginList.reduce((s, v) => s + v, 0) / marginList.length) : 0;

        if (!stats) {
          next.activePlacements = placements.filter(p => p.status === "active").length;
          next.completedPlacements = placements.filter(p => p.status === "completed").length;
          next.totalPlacements = placements.length;
        }
      }

      Object.assign(_placementsStatsCache, next);
      return next;
    });
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
    {
      field: 'actions',
      headerName: 'Actions',
      width: 80,
      renderCell: (_value: string, row: any) => {
        const placement = placements.find((p) => p.id === row.id);
        return (
          <div className="flex items-center gap-1">
            <button
              onClick={(e) => {
                e.stopPropagation();
                if (placement) openEditDialog(placement);
              }}
              className="p-1 hover:bg-gray-100 rounded transition-colors"
              title="Edit placement"
            >
              <Pencil className="w-3 h-3 text-gray-500 hover:text-blue-600" />
            </button>
            <button
              onClick={(e) => {
                e.stopPropagation();
                handleDeletePlacement(row.id, row.candidateName);
              }}
              disabled={deletingId === row.id}
              className="p-1 hover:bg-gray-100 rounded transition-colors disabled:opacity-50"
              title="Delete placement"
            >
              <Trash2 className="w-3 h-3 text-gray-500 hover:text-red-600" />
            </button>
          </div>
        );
      }
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
          
            <Button
              className="button-gradient text-white shadow-lg hover:shadow-xl transition-all duration-300 text-xs"
              onClick={openCreateDialog}
            >
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

      {/* Record Placement Dialog */}
      <Dialog
        open={showCreateDialog}
        onOpenChange={(open) => {
          setShowCreateDialog(open);
          if (!open) resetNewPlacementForm();
        }}
      >
        <DialogContent className="max-w-2xl max-h-[85vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Record Placement</DialogTitle>
            <DialogDescription>
              Convert a candidate's submission into a placement. The submission's status will be updated to "Hired".
            </DialogDescription>
          </DialogHeader>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="text-sm font-medium text-gray-700 mb-1 block">Job *</label>
              <Select
                value={newPlacement.job_id}
                onValueChange={handleJobSelect}
                disabled={loadingJobs}
              >
                <SelectTrigger>
                  <SelectValue placeholder={loadingJobs ? "Loading jobs..." : "Select a job"} />
                </SelectTrigger>
                <SelectContent>
                  {recruiterJobs.map((job) => (
                    <SelectItem key={job.id} value={job.id}>
                      {job.title} ({job.job_id})
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div>
              <label className="text-sm font-medium text-gray-700 mb-1 block">Candidate *</label>
              <Select
                value={newPlacement.submission_id}
                onValueChange={(value) =>
                  setNewPlacement((prev) => ({ ...prev, submission_id: value }))
                }
                disabled={!newPlacement.job_id || loadingSubmissions}
              >
                <SelectTrigger>
                  <SelectValue
                    placeholder={
                      !newPlacement.job_id
                        ? "Select a job first"
                        : loadingSubmissions
                        ? "Loading submissions..."
                        : jobSubmissions.length === 0
                        ? "No submissions for this job"
                        : "Select a candidate"
                    }
                  />
                </SelectTrigger>
                <SelectContent>
                  {jobSubmissions.map((submission) => (
                    <SelectItem key={submission.id} value={submission.id}>
                      {submission.candidate?.first_name} {submission.candidate?.last_name} — {submission.status}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div>
              <label className="text-sm font-medium text-gray-700 mb-1 block">Start Date *</label>
              <Input
                type="date"
                value={newPlacement.start_date}
                onChange={(e) =>
                  setNewPlacement((prev) => ({ ...prev, start_date: e.target.value }))
                }
              />
            </div>
            <div>
              <label className="text-sm font-medium text-gray-700 mb-1 block">End Date</label>
              <Input
                type="date"
                value={newPlacement.end_date}
                onChange={(e) =>
                  setNewPlacement((prev) => ({ ...prev, end_date: e.target.value }))
                }
              />
            </div>
            <div>
              <label className="text-sm font-medium text-gray-700 mb-1 block">Salary *</label>
              <Input
                type="number"
                min="0"
                value={newPlacement.salary}
                onChange={(e) =>
                  setNewPlacement((prev) => ({ ...prev, salary: e.target.value }))
                }
              />
            </div>
            <div>
              <label className="text-sm font-medium text-gray-700 mb-1 block">Currency</label>
              <Input
                value={newPlacement.salary_currency}
                maxLength={3}
                onChange={(e) =>
                  setNewPlacement((prev) => ({ ...prev, salary_currency: e.target.value.toUpperCase() }))
                }
              />
            </div>
            <div className="md:col-span-2">
              <label className="text-sm font-medium text-gray-700 mb-1 block">Location *</label>
              <Input
                value={newPlacement.location}
                onChange={(e) =>
                  setNewPlacement((prev) => ({ ...prev, location: e.target.value }))
                }
              />
            </div>
            <div>
              <label className="text-sm font-medium text-gray-700 mb-1 block">Placement Type</label>
              <Select
                value={newPlacement.placement_type}
                onValueChange={(value) =>
                  setNewPlacement((prev) => ({ ...prev, placement_type: value as PlacementType }))
                }
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="permanent">Permanent</SelectItem>
                  <SelectItem value="contract">Contract</SelectItem>
                  <SelectItem value="temporary">Temporary</SelectItem>
                  <SelectItem value="temp_to_perm">Temp to Perm</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <label className="text-sm font-medium text-gray-700 mb-1 block">Work Arrangement</label>
              <Select
                value={newPlacement.work_arrangement}
                onValueChange={(value) =>
                  setNewPlacement((prev) => ({ ...prev, work_arrangement: value as WorkArrangement }))
                }
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="onsite">Onsite</SelectItem>
                  <SelectItem value="remote">Remote</SelectItem>
                  <SelectItem value="hybrid">Hybrid</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <label className="text-sm font-medium text-gray-700 mb-1 block">Commission %</label>
              <Input
                type="number"
                min="0"
                max="100"
                value={newPlacement.commission_percentage}
                onChange={(e) =>
                  setNewPlacement((prev) => ({ ...prev, commission_percentage: e.target.value }))
                }
              />
            </div>
            <div className="md:col-span-2">
              <label className="text-sm font-medium text-gray-700 mb-1 block">Notes</label>
              <Textarea
                value={newPlacement.notes}
                onChange={(e) =>
                  setNewPlacement((prev) => ({ ...prev, notes: e.target.value }))
                }
                rows={3}
              />
            </div>
          </div>
          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => setShowCreateDialog(false)}>
              Cancel
            </Button>
            <Button onClick={handleCreatePlacement} disabled={creating}>
              {creating ? "Saving..." : "Save Placement"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Edit Placement Dialog */}
      <Dialog
        open={!!editingPlacement}
        onOpenChange={(open) => {
          if (!open) setEditingPlacement(null);
        }}
      >
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>Edit Placement</DialogTitle>
            <DialogDescription>
              {editingPlacement?.placement_id} — {editingPlacement?.candidate?.first_name}{" "}
              {editingPlacement?.candidate?.last_name}
            </DialogDescription>
          </DialogHeader>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="text-sm font-medium text-gray-700 mb-1 block">Status</label>
              <Select
                value={editForm.status}
                onValueChange={(value) =>
                  setEditForm((prev) => ({ ...prev, status: value as PlacementStatus }))
                }
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="active">Active</SelectItem>
                  <SelectItem value="completed">Completed</SelectItem>
                  <SelectItem value="terminated">Terminated</SelectItem>
                  <SelectItem value="on_hold">On Hold</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <label className="text-sm font-medium text-gray-700 mb-1 block">Onboarding Status</label>
              <Select
                value={editForm.onboarding_status}
                onValueChange={(value) =>
                  setEditForm((prev) => ({ ...prev, onboarding_status: value as OnboardingStatus }))
                }
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="pending">Pending</SelectItem>
                  <SelectItem value="in_progress">In Progress</SelectItem>
                  <SelectItem value="completed">Completed</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <label className="text-sm font-medium text-gray-700 mb-1 block">Salary</label>
              <Input
                type="number"
                min="0"
                value={editForm.salary}
                onChange={(e) => setEditForm((prev) => ({ ...prev, salary: e.target.value }))}
              />
            </div>
            <div>
              <label className="text-sm font-medium text-gray-700 mb-1 block">End Date</label>
              <Input
                type="date"
                value={editForm.end_date}
                onChange={(e) => setEditForm((prev) => ({ ...prev, end_date: e.target.value }))}
              />
            </div>
            <div>
              <label className="text-sm font-medium text-gray-700 mb-1 block">Performance Rating</label>
              <Select
                value={editForm.performance_rating}
                onValueChange={(value) =>
                  setEditForm((prev) => ({ ...prev, performance_rating: value }))
                }
              >
                <SelectTrigger>
                  <SelectValue placeholder="Not rated" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="1">1 - Poor</SelectItem>
                  <SelectItem value="2">2 - Below Average</SelectItem>
                  <SelectItem value="3">3 - Average</SelectItem>
                  <SelectItem value="4">4 - Good</SelectItem>
                  <SelectItem value="5">5 - Excellent</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="md:col-span-2">
              <label className="text-sm font-medium text-gray-700 mb-1 block">Notes</label>
              <Textarea
                value={editForm.notes}
                onChange={(e) => setEditForm((prev) => ({ ...prev, notes: e.target.value }))}
                rows={3}
              />
            </div>
          </div>
          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => setEditingPlacement(null)}>
              Cancel
            </Button>
            <Button onClick={handleUpdatePlacement} disabled={savingEdit}>
              {savingEdit ? "Saving..." : "Save Changes"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default Placements;
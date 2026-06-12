import React, {
  useState,
  useEffect,
  useMemo,
  useCallback,
  useRef,
} from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { DataGrid } from "@/components/ui/data-grid";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import {
  Plus,
  Eye,
  Edit,
  Trash2,
  Briefcase,
  Users,
  Clock,
  FileText,
  CheckCircle,
  AlertCircle,
  Search,
  RefreshCw,
  Loader2,
} from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useJobs, useJobManagement } from "@/hooks/useJobs";
import { useAuth } from "@/contexts/AuthContext";
import { jobService } from "@/services/jobService";
import { toast } from "sonner";

// Module-level cache — survives component remount so cards never flash 0
const _jobsStatsCache = {
  myJobs: 0, activeJobs: 0, onHoldJobs: 0, totalSubmissions: 0, highPriorityJobs: 0,
};

const Jobs = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const {
    jobs,
    loading,
    error,
    pagination,
    filters,
    searchJobs,
    refresh,
    setFilters,
  } = useJobs();
  const { deleteJob } = useJobManagement();

  const defaultPageSize = 50;
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [priorityFilter, setPriorityFilter] = useState("all");
  const [exporting, setExporting] = useState(false);

  // Initialize from module-level cache so last-known values show instantly on remount
  const [baseStats, setBaseStats] = useState({ ..._jobsStatsCache });

  useEffect(() => {
    if (statusFilter === "all" && priorityFilter === "all") {
      const next = {
        myJobs: jobs.length,
        activeJobs: jobs.filter((j) => j.status === "active").length,
        onHoldJobs: jobs.filter((j) => j.status === "paused").length,
        totalSubmissions: jobs.reduce((sum, j) => sum + (j.submission_count || 0), 0),
        highPriorityJobs: jobs.filter((j) => j.priority === "high").length,
      };
      Object.assign(_jobsStatsCache, next);
      setBaseStats(next);
    }
  }, [jobs, statusFilter, priorityFilter]);

  const activeCardId =
    statusFilter === "active" ? "active" :
    statusFilter === "paused" ? "on-hold" :
    priorityFilter === "high" ? "high-priority" : "all";

  const buildFilterPayload = useCallback(
    (overrides: Record<string, any> = {}) => {
      const nextStatus =
        overrides.status !== undefined
          ? overrides.status
          : statusFilter === "all"
          ? undefined
          : statusFilter;
      const nextPriority =
        overrides.priority !== undefined
          ? overrides.priority
          : priorityFilter === "all"
          ? undefined
          : priorityFilter;

      return {
        ...filters,
        search: overrides.search ?? (searchTerm.trim() || undefined),
        status: nextStatus,
        priority: nextPriority,
        page: overrides.page ?? 1,
        limit: overrides.limit ?? defaultPageSize,
      };
    },
    [filters, priorityFilter, searchTerm, statusFilter, defaultPageSize]
  );

  const runSearch = useCallback(
    (overrides: Record<string, any> = {}) => {
      const payload = buildFilterPayload(overrides);
      setFilters(payload);
      searchJobs(payload);
    },
    [buildFilterPayload, searchJobs, setFilters]
  );

  const handleSearch = () => {
    runSearch();
  };

  const handleFilterChange = (key: string, value: string) => {
    const nextStatus = key === "status" ? value : statusFilter;
    const nextPriority = key === "priority" ? value : priorityFilter;

    if (key === "status") {
      setStatusFilter(value);
    }
    if (key === "priority") {
      setPriorityFilter(value);
    }

    runSearch({
      status: nextStatus === "all" ? undefined : nextStatus,
      priority: nextPriority === "all" ? undefined : nextPriority,
    });
  };

  const navigationCards = useMemo(
    () => [
      {
        id: "all",
        title: "My Jobs",
        value: baseStats.myJobs.toString(),
        icon: Briefcase,
        color: "text-green-700",
        gradientOverlay: "bg-gradient-to-br from-green-400/30 via-green-500/20 to-green-600/30",
        onClick: () => {
          setStatusFilter("all");
          setPriorityFilter("all");
          runSearch({ status: undefined, priority: undefined });
        },
      },
      {
        id: "active",
        title: "Active Jobs",
        value: baseStats.activeJobs.toString(),
        icon: CheckCircle,
        color: "text-emerald-700",
        gradientOverlay: "bg-gradient-to-br from-emerald-400/30 via-emerald-500/20 to-emerald-600/30",
        onClick: () => {
          setStatusFilter("active");
          setPriorityFilter("all");
          runSearch({ status: "active", priority: undefined });
        },
      },
      {
        id: "on-hold",
        title: "On Hold",
        value: baseStats.onHoldJobs.toString(),
        icon: Clock,
        color: "text-amber-700",
        gradientOverlay: "bg-gradient-to-br from-amber-400/30 via-amber-500/20 to-amber-600/30",
        onClick: () => {
          setStatusFilter("paused");
          setPriorityFilter("all");
          runSearch({ status: "paused", priority: undefined });
        },
      },
      {
        id: "submissions",
        title: "Total Submissions",
        value: baseStats.totalSubmissions.toString(),
        icon: FileText,
        color: "text-purple-700",
        gradientOverlay: "bg-gradient-to-br from-purple-400/30 via-purple-500/20 to-purple-600/30",
        onClick: () => {
          setStatusFilter("all");
          setPriorityFilter("all");
          runSearch({ status: undefined, priority: undefined });
        },
      },
      {
        id: "high-priority",
        title: "High Priority",
        value: baseStats.highPriorityJobs.toString(),
        icon: AlertCircle,
        color: "text-red-700",
        gradientOverlay: "bg-gradient-to-br from-red-400/30 via-red-500/20 to-red-600/30",
        onClick: () => {
          setStatusFilter("all");
          setPriorityFilter("high");
          runSearch({ status: undefined, priority: "high" });
        },
      },
    ],
    [runSearch, baseStats]
  );

  const handleDeleteJob = async (jobId: string) => {
    if (
      window.confirm(
        "Are you sure you want to delete this job? This action cannot be undone."
      )
    ) {
      const success = await deleteJob(jobId);
      if (success) {
        refresh();
      }
    }
  };

  const handleEditJob = (jobId: string) => {
    navigate(`/dashboard/jobs/${jobId}/edit`);
  };

  const handleViewJob = (jobId: string) => {
    navigate(`/dashboard/jobs/${jobId}`);
  };

  const handleExport = async () => {
    if (user?.role !== "recruiter") {
      toast.error("Only recruiters can export jobs");
      return;
    }
    try {
      setExporting(true);
      const blob = await jobService.exportRecruiterJobs({
        search: searchTerm || undefined,
        status: statusFilter === "all" ? undefined : (statusFilter as any),
        priority:
          priorityFilter === "all" ? undefined : (priorityFilter as any),
      });
      const timestamp = new Date().toISOString().replace(/[:.]/g, "-");
      const url = window.URL.createObjectURL(blob as any);
      const link = document.createElement("a");
      link.href = url;
      link.download = `jobs-export-${timestamp}.csv`;
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(url);
      toast.success("Jobs exported");
    } catch (error: any) {
      const msg = error?.message || "Failed to export jobs";
      toast.error(msg);
    } finally {
      setExporting(false);
    }
  };

  const getStatusColor = (status: string) => {
    const colors = {
      active: "bg-green-100 text-green-800",
      draft: "bg-gray-100 text-gray-800",
      paused: "bg-yellow-100 text-yellow-800",
      closed: "bg-red-100 text-red-800",
    };
    return colors[status as keyof typeof colors] || "bg-gray-100 text-gray-800";
  };

  const getPriorityColor = (priority: string) => {
    const colors = {
      high: "bg-red-100 text-red-800",
      medium: "bg-yellow-100 text-yellow-800",
      low: "bg-green-100 text-green-800",
    };
    return (
      colors[priority as keyof typeof colors] || "bg-gray-100 text-gray-800"
    );
  };

  const formatSalary = (min?: number, max?: number) => {
    if (!min && !max) return "Not specified";
    if (min && max)
      return `$${min.toLocaleString()} - $${max.toLocaleString()}`;
    if (min) return `$${min.toLocaleString()}+`;
    return `Up to $${max?.toLocaleString()}`;
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  };

  const tableRows = useMemo(
    () =>
      jobs.map((job) => ({
        id: job.id,
        jobId: job.job_id,
        title: job.title,
        company: job.company_name,
        location:
          job.location ||
          [job.city, job.state, job.country].filter(Boolean).join(", "),
        type: jobService.formatJobType(job.job_type),
        salary: formatSalary(job.salary_min, job.salary_max),
        status: job.status,
        priority: job.priority,
        submissions: job.submission_count || 0,
        createdAt: job.created_at ? formatDate(job.created_at) : "—",
        deadline: job.application_deadline
          ? formatDate(job.application_deadline)
          : "—",
        vendorEligible: job.vendor_eligible ? "Yes" : "No",
        remote: job.remote_work_allowed ? "Yes" : "No",
      })),
    [jobs]
  );

  const columns = [
    {
      field: "jobId",
      headerName: "Job ID",
      width: 110,
      renderCell: (value: string, row: any) => {
        const full = value || row.id;
        const truncated = full && full.length > 10 ? full.slice(0, 10) + "…" : full;
        return (
          <TooltipProvider delayDuration={100}>
            <Tooltip>
              <TooltipTrigger asChild>
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    handleViewJob(row.id);
                  }}
                  className="text-blue-600 hover:text-blue-800 hover:underline font-medium text-xs truncate max-w-[100px] block"
                >
                  {truncated}
                </button>
              </TooltipTrigger>
              <TooltipContent side="top" className="font-mono text-xs">
                {full}
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
        );
      },
    },
    {
      field: "title",
      headerName: "Title",
      width: 200,
      renderCell: (value: string, row: any) => (
        <button
          onClick={(e) => {
            e.stopPropagation();
            handleViewJob(row.id);
          }}
          className="text-gray-900 font-semibold hover:text-blue-800 hover:underline text-xs"
        >
          {value}
        </button>
      ),
    },
    {
      field: "company",
      headerName: "Company",
      width: 170,
    },
    {
      field: "location",
      headerName: "Location",
      width: 160,
    },
    {
      field: "type",
      headerName: "Type",
      width: 120,
    },
    {
      field: "status",
      headerName: "Status",
      width: 120,
      renderCell: (value: string) => (
        <Badge
          className={`${getStatusColor(value)} border font-medium text-xs`}
        >
          {value}
        </Badge>
      ),
    },
    {
      field: "priority",
      headerName: "Priority",
      width: 110,
      renderCell: (value: string) => (
        <Badge
          className={`${getPriorityColor(value)} border font-medium text-xs`}
        >
          {value}
        </Badge>
      ),
    },
    {
      field: "salary",
      headerName: "Salary",
      width: 150,
    },
    {
      field: "submissions",
      headerName: "Applications",
      width: 120,
      renderCell: (value: number) => (
        <span className="font-medium text-gray-800 text-xs">{value}</span>
      ),
    },
    {
      field: "deadline",
      headerName: "Deadline",
      width: 130,
    },
    {
      field: "createdAt",
      headerName: "Created",
      width: 130,
    },
    {
      field: "actions",
      headerName: "Actions",
      width: 120,
      sortable: false,
      filterable: false,
      renderCell: (_: any, row: any) => (
        <TooltipProvider delayDuration={100}>
          <div className="flex items-center gap-1">
            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  variant="ghost"
                  size="sm"
                  className="h-7 w-7 p-0"
                  onClick={(e) => {
                    e.stopPropagation();
                    handleViewJob(row.id);
                  }}
                >
                  <Eye className="h-4 w-4" />
                </Button>
              </TooltipTrigger>
              <TooltipContent side="top" className="text-xs">
                View
              </TooltipContent>
            </Tooltip>
            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  variant="ghost"
                  size="sm"
                  className="h-7 w-7 p-0"
                  onClick={(e) => {
                    e.stopPropagation();
                    handleEditJob(row.id);
                  }}
                >
                  <Edit className="h-4 w-4" />
                </Button>
              </TooltipTrigger>
              <TooltipContent side="top" className="text-xs">
                Edit
              </TooltipContent>
            </Tooltip>
            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  variant="ghost"
                  size="sm"
                  className="h-7 w-7 p-0 text-red-600 hover:text-red-700"
                  onClick={(e) => {
                    e.stopPropagation();
                    handleDeleteJob(row.id);
                  }}
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              </TooltipTrigger>
              <TooltipContent side="top" className="text-xs">
                Delete
              </TooltipContent>
            </Tooltip>
          </div>
        </TooltipProvider>
      ),
    },
  ];

  // Load initial data (once per role change)
  const hasLoadedInitial = useRef(false);
  useEffect(() => {
    if (user?.role === "recruiter" && !hasLoadedInitial.current) {
      const initialPayload = { page: 1, limit: defaultPageSize };
      setFilters(initialPayload);
      searchJobs(initialPayload);
      hasLoadedInitial.current = true;
    }
  }, [user?.role, defaultPageSize, searchJobs, setFilters]);

  if (user?.role !== "recruiter") {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <AlertCircle className="h-8 w-8 text-red-500 mx-auto mb-2" />
          <p className="text-gray-600">
            Access denied. Only recruiters can manage jobs.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header with title */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
        <div>
          <h1 className="text-lg sm:text-xl md:text-2xl font-bold text-gray-900 font-roboto-slab">
            Jobs{typeof pagination.totalItems === "number" && pagination.totalItems > 0 ? ` (${pagination.totalItems})` : ""}
          </h1>
        </div>
        <div className="flex items-center gap-3">
          <Button
            onClick={() => navigate("/dashboard/jobs/new")}
            className="flex items-center space-x-2"
          >
            <Plus className="h-4 w-4" />
            <span>Create Job</span>
          </Button>
        </div>
      </div>

      {/* Navigation Cards - updated to match previous UI */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-2">
        {navigationCards.map((card) => {
          const IconComponent = card.icon;
          return (
            <Card
              key={card.title}
              className={`relative overflow-hidden border-0 shadow-sm hover:shadow-md transition-all duration-300 hover:-translate-y-0.5 group cursor-pointer backdrop-blur-xl bg-white/20 ${
                activeCardId === card.id ? "ring-2 ring-green-500 ring-offset-2 -translate-y-0.5 shadow-md" : ""
              }`}
              onClick={card.onClick}
            >
              <div className={`absolute inset-0 ${card.gradientOverlay}`}></div>
              <div className="absolute inset-0 bg-gradient-to-br from-white/40 via-white/20 to-transparent"></div>
              <CardContent className="relative p-2">
                <div className="flex flex-col items-center space-y-1">
                  <div className="p-1.5 rounded-full bg-white/30 backdrop-blur-sm shadow-sm group-hover:bg-white/40 transition-all border border-white/20">
                    <IconComponent className={`h-3 w-3 ${card.color}`} />
                  </div>
                  <div className="text-center">
                    <p className="text-xs font-semibold text-gray-600 font-roboto-slab truncate">
                      {card.title}
                    </p>
                    <p className="text-sm font-bold text-gray-900 font-roboto-slab">
                      {card.value}
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* Jobs Table */}
      <Card>
        <CardContent className="p-0">
          {loading ? (
            <div className="p-6 text-center">
              <Loader2 className="h-6 w-6 animate-spin mx-auto text-blue-600 mb-2" />
              <p className="text-gray-600 text-sm">Loading jobs...</p>
            </div>
          ) : error ? (
            <div className="p-6 text-center">
              <AlertCircle className="h-6 w-6 text-red-500 mx-auto mb-2" />
              <p className="text-gray-600 text-sm">{error}</p>
              <Button
                onClick={() => runSearch()}
                variant="outline"
                className="mt-3"
              >
                Try Again
              </Button>
            </div>
          ) : tableRows.length === 0 ? (
            <div className="p-8 text-center">
              <Briefcase className="h-10 w-10 text-gray-400 mx-auto mb-3" />
              <p className="text-gray-600">No jobs found</p>
              <Button
                onClick={() => navigate("/dashboard/jobs/new")}
                className="mt-3"
              >
                Create Job
              </Button>
            </div>
          ) : (
            <DataGrid
              rows={tableRows}
              columns={columns}
              checkboxSelection
              pageSizeOptions={[10, 25, 50, 100]}
              onRowClick={(row) => handleViewJob(row.id)}
              initialFilters={{}}
              onExport={handleExport}
              exportLoading={exporting}
            />
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default Jobs;

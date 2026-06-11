import React, {
  useMemo,
  useState,
  useEffect,
  useCallback,
  useRef,
} from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { DataGrid } from "@/components/ui/data-grid";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
} from "@/components/ui/dropdown-menu";
import {
  Plus,

  User,
  Mail,
  Phone,
  Star,
  FileText,
  Briefcase,
  Users,
  Eye,
  Edit,
  Trash2,
  CheckCircle,
  AlertCircle,
  Clock,
  Settings,
  UserCheck,
  Send,
  Bot,
  FileSpreadsheet,
  Pencil,
  RefreshCw,
} from "lucide-react";
import { useNavigate } from "react-router-dom";
import {
  useCandidateSearch,
  useCandidateStats,
} from "@/hooks/useCandidateSearch";
import { useAuth } from "@/contexts/AuthContext";
import { candidateSearchService } from "@/services/candidateSearchService";
import { downloadCsv } from "@/utils/csv";
import { toast } from "sonner";

const Candidates = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const {
    candidates,
    loading,
    error,
    pagination,
    filters,
    searchCandidates,
    refresh,
    setFilters,
  } = useCandidateSearch();
  const { stats } = useCandidateStats();

  const [exporting, setExporting] = useState(false);
  const [activeFilters, setActiveFilters] = useState<Record<string, string[]>>(
    {}
  );
  const hasLoadedInitial = useRef(false);

  const handleViewCandidate = (candidateId: string) => {
    navigate(`/dashboard/candidates/${candidateId}`);
  };

  const handleEditCandidate = (candidateId: string) => {
    navigate(`/dashboard/candidates/${candidateId}?edit=true`);
  };

  const handleExport = async () => {
    if (user?.role !== "recruiter") {
      toast.error("Only recruiters can export candidates");
      return;
    }
    if (!candidates.length) {
      toast.error("No candidates to export");
      return;
    }
    try {
      setExporting(true);
      const columns = [
        { header: "Candidate ID", accessor: (c: any) => c.id },
        {
          header: "Name",
          accessor: (c: any) =>
            `${c.first_name || ""} ${c.last_name || ""}`.trim(),
        },
        { header: "Email", accessor: (c: any) => c.user?.email || "" },
        { header: "Phone", accessor: (c: any) => c.phone || "" },
        { header: "Location", accessor: (c: any) => c.location || "" },
        {
          header: "Availability",
          accessor: (c: any) =>
            candidateSearchService.getAvailabilityLabel(c.availability_status),
        },
        {
          header: "Experience (yrs)",
          accessor: (c: any) => c.experience_years ?? "",
        },
        {
          header: "Expected Salary",
          accessor: (c: any) => c.expected_salary ?? "",
        },
      ];
      const timestamp = new Date().toISOString().replace(/[:.]/g, "-");
      downloadCsv(`candidates-${timestamp}.csv`, candidates, columns);
      toast.success("Candidates exported");
    } catch (err: any) {
      toast.error(err?.message || "Failed to export candidates");
    } finally {
      setExporting(false);
    }
  };

  // Load initial data once per role (avoid repeated calls)
  useEffect(() => {
    if (user?.role === "recruiter" && !hasLoadedInitial.current) {
      const initial = { page: 1, limit: 50 };
      setFilters(initial);
      searchCandidates(initial);
      hasLoadedInitial.current = true;
    }
  }, [user?.role, searchCandidates, setFilters]);

  const availabilityCounts = useMemo(() => {
    const counts: Record<string, number> = {
      available: 0,
      not_available: 0,
      interviewing: 0,
      employed: 0,
    };
    candidates.forEach((c) => {
      counts[c.availability_status] = (counts[c.availability_status] || 0) + 1;
    });
    return counts;
  }, [candidates]);

  const totalSubmissions = useMemo(
    () =>
      candidates.reduce((sum, c) => sum + (c as any).submissions_count || 0, 0),
    [candidates]
  );

  const tableRows = useMemo(
    () =>
      candidates.map((c) => ({
        id: c.id,
        name: candidateSearchService.formatCandidateName(c),
        title: c.experiences?.[0]?.job_title || c.bio || "Role not specified",
        location: c.location || "—",
        experience:
          c.experience_years !== undefined
            ? candidateSearchService.formatExperience(c.experience_years)
            : "No experience specified",
        status: candidateSearchService.getAvailabilityLabel(
          c.availability_status
        ),
        status_raw: c.availability_status,
        currentSalary: c.current_salary
          ? candidateSearchService.formatSalary(c.current_salary)
          : "—",
        expectedSalary: c.expected_salary
          ? candidateSearchService.formatSalary(c.expected_salary)
          : "—",
        submissions: (c as any).submissions_count || 0,
        rating: (c as any).rating || "—",
        lastContact: c.updated_at || c.created_at,
        email: c.user?.email,
        phone: c.phone,
      })),
    [candidates]
  );

  const columns = [
    {
      field: "id",
      headerName: "ID",
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
                    handleViewCandidate(row.id);
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
      },
    },
    {
      field: "name",
      headerName: "Name",
      width: 160,
      renderCell: (value: string, row: any) => (
        <div className="flex items-center gap-2">
          <button
            onClick={(e) => {
              e.stopPropagation();
              handleViewCandidate(row.id);
            }}
            className="font-medium text-blue-600 hover:text-blue-800 hover:underline font-poppins text-xs whitespace-nowrap overflow-hidden text-ellipsis text-left flex-1"
            title={value}
          >
            {value}
          </button>
          <button
            onClick={(e) => {
              e.stopPropagation();
              handleEditCandidate(row.id);
            }}
            className="p-1 hover:bg-gray-100 rounded transition-colors"
            title="Edit candidate"
          >
            <Pencil className="w-3 h-3 text-gray-500 hover:text-blue-600" />
          </button>
        </div>
      ),
    },
    {
      field: "title",
      headerName: "Title",
      width: 180,
      renderCell: (value: string) => (
        <span
          className="text-gray-700 font-poppins text-xs whitespace-nowrap overflow-hidden text-ellipsis"
          title={value}
        >
          {value}
        </span>
      ),
    },
    {
      field: "location",
      headerName: "Location",
      width: 140,
      renderCell: (value: string) => (
        <span className="text-gray-700 font-poppins text-xs whitespace-nowrap overflow-hidden text-ellipsis">
          {value}
        </span>
      ),
    },
    {
      field: "experience",
      headerName: "Experience",
      width: 110,
    },
    {
      field: "status",
      headerName: "Status",
      width: 110,
      renderCell: (value: string, row: any) => (
        <Badge
          className={`${candidateSearchService.getAvailabilityColor(
            row.status_raw
          )} border font-medium font-poppins text-xs whitespace-nowrap`}
        >
          {value}
        </Badge>
      ),
    },
    {
      field: "currentSalary",
      headerName: "Current Salary",
      width: 130,
    },
    {
      field: "expectedSalary",
      headerName: "Expected Salary",
      width: 140,
    },
    {
      field: "submissions",
      headerName: "Submissions",
      width: 110,
    },
    {
      field: "rating",
      headerName: "Rating",
      width: 90,
      renderCell: (value: any) => (
        <div className="flex items-center gap-1">
          <Star className="w-3 h-3 text-yellow-500 fill-current" />
          <span className="text-gray-700 font-medium font-poppins text-xs">
            {value ?? "—"}
          </span>
        </div>
      ),
    },
    {
      field: "lastContact",
      headerName: "Last Updated",
      width: 130,
      renderCell: (value: string) => (
        <span className="text-gray-700 font-poppins text-xs whitespace-nowrap">
          {value ? new Date(value).toLocaleDateString() : "—"}
        </span>
      ),
    },
  ];

  if (user?.role !== "recruiter") {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <AlertCircle className="h-8 w-8 text-red-500 mx-auto mb-2" />
          <p className="text-gray-600">
            Access denied. Only recruiters can search candidates.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 font-roboto-slab">
            Candidates{pagination.totalItems ? ` (${pagination.totalItems})` : ""}
          </h1>
        </div>
        <div className="flex items-center gap-2">
          <Button
            onClick={refresh}
            variant="outline"
            size="sm"
            disabled={loading}
            className="text-xs"
          >
            <RefreshCw className={`h-3 w-3 mr-1 ${loading ? "animate-spin" : ""}`} />
            Refresh
          </Button>

          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button
                variant="outline"
                size="sm"
                className="border-blue-200 hover:bg-blue-50 hover:border-blue-300 text-xs"
              >
                <Settings className="w-3 h-3 mr-1" />
                Actions
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent
              align="end"
              className="bg-white border-gray-200 z-50"
            >
              <DropdownMenuItem>
                <Mail className="w-4 h-4 mr-2" />
                Send a Followup
              </DropdownMenuItem>
              <DropdownMenuItem>
                <UserCheck className="w-4 h-4 mr-2" />
                Change Ownership
              </DropdownMenuItem>
              <DropdownMenuItem>
                <CheckCircle className="w-4 h-4 mr-2" />
                Change status
              </DropdownMenuItem>
              <DropdownMenuItem>
                <Send className="w-4 h-4 mr-2" />
                Send to Vendors
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem>
                <Bot className="w-4 h-4 mr-2" />
                AI Recruiter
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>

          <Button className="button-gradient text-white shadow-lg hover:shadow-xl transition-all duration-300 text-xs">
            <Plus className="w-3 h-3 mr-1" />
            Add Candidate
          </Button>
        </div>
      </div>

      {/* Navigation Cards */}
      <div className="grid grid-cols-6 gap-2">
        {[
          {
            title: "Available",
            value: availabilityCounts.available.toString(),
            icon: User,
            color: "text-blue-700",
            gradientOverlay:
              "bg-gradient-to-br from-blue-400/30 via-blue-500/20 to-blue-600/30",
            onClick: () => setActiveFilters({ status: ["Available"] }),
          },
          {
            title: "Not Available",
            value: availabilityCounts.not_available.toString(),
            icon: Trash2,
            color: "text-red-700",
            gradientOverlay:
              "bg-gradient-to-br from-red-400/30 via-red-500/20 to-red-600/30",
            onClick: () => setActiveFilters({ status: ["Not Available"] }),
          },
          {
            title: "Interviewing",
            value: availabilityCounts.interviewing.toString(),
            icon: Clock,
            color: "text-amber-700",
            gradientOverlay:
              "bg-gradient-to-br from-amber-400/30 via-amber-500/20 to-amber-600/30",
            onClick: () => setActiveFilters({ status: ["Interviewing"] }),
          },
          {
            title: "Employed",
            value: availabilityCounts.employed.toString(),
            icon: Briefcase,
            color: "text-purple-700",
            gradientOverlay:
              "bg-gradient-to-br from-purple-400/30 via-purple-500/20 to-purple-600/30",
            onClick: () => setActiveFilters({ status: ["Employed"] }),
          },
          {
            title: "Total Candidates",
            value: (stats?.totalCandidates ?? candidates.length).toString(),
            icon: Users,
            color: "text-green-700",
            gradientOverlay:
              "bg-gradient-to-br from-green-400/30 via-green-500/20 to-green-600/30",
            onClick: () => setActiveFilters({}),
          },
          {
            title: "Submissions",
            value: totalSubmissions.toString(),
            icon: FileText,
            color: "text-indigo-700",
            gradientOverlay:
              "bg-gradient-to-br from-indigo-400/30 via-indigo-500/20 to-indigo-600/30",
            onClick: () => {},
          },
        ].map((card) => {
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
                    <p className="text-xs font-semibold text-gray-600 font-roboto-slab">
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

      {/* Candidates Table */}
      <Card className="border-gray-200 shadow-sm overflow-hidden">
        <CardContent className="p-0">
          {loading ? (
            <div className="p-6 text-center">
              <RefreshCw className="h-6 w-6 animate-spin mx-auto text-blue-600 mb-2" />
              <p className="text-gray-600 text-sm">Loading candidates...</p>
            </div>
          ) : error ? (
            <div className="p-6 text-center">
              <AlertCircle className="h-6 w-6 text-red-500 mx-auto mb-2" />
              <p className="text-gray-600 text-sm">{error}</p>
              <Button onClick={refresh} variant="outline" className="mt-3">
                Try Again
              </Button>
            </div>
          ) : tableRows.length === 0 ? (
            <div className="p-8 text-center">
              <Users className="h-10 w-10 text-gray-400 mx-auto mb-3" />
              <p className="text-gray-600">No candidates found</p>
            </div>
          ) : (
            <DataGrid
              rows={tableRows}
              columns={columns}
              pageSizeOptions={[10, 25, 50, 100]}
              checkboxSelection
              onRowClick={(row) => handleViewCandidate(row.id)}
              initialFilters={activeFilters}
              onExport={handleExport}
              exportLoading={exporting}
            />
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default Candidates;

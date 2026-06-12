import React, { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
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
import { Textarea } from "@/components/ui/textarea";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
} from "@/components/ui/dropdown-menu";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";
import {
  Plus,
  MoreHorizontal,
  ChevronDown,
  ChevronRight,
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
  Star,
  TrendingUp,
  PlusCircle,
  Send,
  RefreshCw,
  Trash,
  Zap,
  ListChecks,
  FileSpreadsheet,
  Search,
  Filter,
  MessageSquare,
  Phone,
  Video,
  ExternalLink,
  Paperclip,
} from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useSubmissions } from "@/hooks/useSubmissions";
import { useRecruiterSubmissions } from "@/hooks/useRecruiterSubmissions";
import { useAuth } from "@/contexts/AuthContext";
import { submissionService } from "@/services/submissionService";
import { recruiterService } from "@/services/recruiterService";
import { downloadCsv } from "@/utils/csv";
import { toast } from "sonner";
import { ScheduleInterviewDialog } from "@/components/ScheduleInterviewDialog";

const Submissions = () => {
  const navigate = useNavigate();
  const { user } = useAuth();

  // Use different hooks based on user role
  const candidateVendorSubmissions = useSubmissions();
  const recruiterSubmissions = useRecruiterSubmissions();

  // Select the appropriate hook data based on role
  const submissionsData =
    user?.role === "recruiter"
      ? recruiterSubmissions
      : candidateVendorSubmissions;

  // Get the appropriate data based on role
  const submissions = submissionsData.submissions || [];
  const loading = submissionsData.loading || false;
  const error = submissionsData.error || null;
  const pagination = submissionsData.pagination || {
    currentPage: 1,
    totalPages: 1,
    totalItems: 0,
    itemsPerPage: 10,
    hasNextPage: false,
    hasPrevPage: false,
  };
  const filters = submissionsData.filters || {};
  const refresh = submissionsData.refresh || (() => {});
  const setFilters = submissionsData.setFilters || (() => {});
  const updateStatus = (submissionsData as any).updateSubmissionStatus;

  // Handle different method names
  const fetchSubmissions =
    (submissionsData as any).searchSubmissions ||
    (submissionsData as any).fetchSubmissions ||
    (() => {});

  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [jobFilter, setJobFilter] = useState("all");
  const [expandedSubmissions, setExpandedSubmissions] = useState<Set<string>>(
    new Set()
  );
  const [selectedSubmission, setSelectedSubmission] = useState<any>(null);
  const [showStatusDialog, setShowStatusDialog] = useState(false);
  const [showNoteDialog, setShowNoteDialog] = useState(false);
  const [showAttachmentDialog, setShowAttachmentDialog] = useState(false);
  const [showScheduleDialog, setShowScheduleDialog] = useState(false);
  const [showTimelineDialog, setShowTimelineDialog] = useState(false);
  const [newStatus, setNewStatus] = useState("");
  const [newNote, setNewNote] = useState("");
  const [attachmentUrl, setAttachmentUrl] = useState("");
  const [attachmentName, setAttachmentName] = useState("");
  const [recruiterJobs, setRecruiterJobs] = useState<any[]>([]);
  const [jobsLoading, setJobsLoading] = useState(false);
  const [exporting, setExporting] = useState(false);

  // Group submissions by job for better organization
  const submissionsByJob = submissions.reduce((acc, submission) => {
    const jobKey = submission.job?.id || "unknown";
    if (!acc[jobKey]) {
      acc[jobKey] = {
        job: submission.job,
        submissions: [],
      };
    }
    acc[jobKey].submissions.push(submission);
    return acc;
  }, {} as Record<string, any>);

  // Calculate nav stats (align with previous UI)
  const totalSubmissions = submissions.length;
  const activeJobs = Object.keys(submissionsByJob).length;
  const inProgress = submissions.filter(
    (s) => !["rejected", "withdrawn", "hired"].includes(s.status || "")
  ).length;
  const interviewCount = submissions.filter((s) =>
    ["interview_scheduled", "interviewed"].includes(s.status || "")
  ).length;

  const navigationCards = [
    {
      title: "Total Submissions",
      value: totalSubmissions.toString(),
      icon: FileText,
      color: "text-blue-700",
      gradientOverlay:
        "bg-gradient-to-br from-blue-400/30 via-blue-500/20 to-blue-600/30",
    },
    {
      title: "Active Jobs",
      value: activeJobs.toString(),
      icon: Briefcase,
      color: "text-green-700",
      gradientOverlay:
        "bg-gradient-to-br from-green-400/30 via-green-500/20 to-green-600/30",
    },
    {
      title: "In Progress",
      value: inProgress.toString(),
      icon: Clock,
      color: "text-amber-700",
      gradientOverlay:
        "bg-gradient-to-br from-amber-400/30 via-amber-500/20 to-amber-600/30",
    },
    {
      title: "Interviews",
      value: interviewCount.toString(),
      icon: Users,
      color: "text-purple-700",
      gradientOverlay:
        "bg-gradient-to-br from-purple-400/30 via-purple-500/20 to-purple-600/30",
    },
  ];

  const handleSearch = () => {
    if (user?.role === "recruiter" && jobFilter === "all") {
      toast.error("Select a job to view submissions");
      return;
    }

    const newFilters = {
      ...filters,
      search: searchTerm || undefined,
      status: statusFilter === "all" ? undefined : statusFilter,
      job_id: jobFilter === "all" ? undefined : jobFilter,
      page: 1,
    };
    fetchSubmissions(newFilters);
  };

  const handleExport = async () => {
    if (user?.role !== "recruiter") {
      toast.error("Only recruiters can export submissions");
      return;
    }
    if (!submissions.length) {
      toast.error("No submissions to export");
      return;
    }
    try {
      setExporting(true);
      const columns = [
        { header: "Submission ID", accessor: (s: any) => s.id },
        { header: "Job", accessor: (s: any) => s.job?.title || "" },
        {
          header: "Candidate",
          accessor: (s: any) =>
            `${s.candidate?.first_name || ""} ${
              s.candidate?.last_name || ""
            }`.trim(),
        },
        { header: "Status", accessor: (s: any) => s.status },
        { header: "Submitted At", accessor: (s: any) => s.submitted_at || "" },
      ];
      const timestamp = new Date().toISOString().replace(/[:.]/g, "-");
      downloadCsv(`submissions-${timestamp}.csv`, submissions, columns);
      toast.success("Submissions exported");
    } catch (err: any) {
      toast.error(err?.message || "Failed to export submissions");
    } finally {
      setExporting(false);
    }
  };

  const handleStatusUpdate = async () => {
    if (!selectedSubmission || !newStatus) return;

    try {
      if (user?.role === "recruiter" && updateStatus) {
        const result = await updateStatus(selectedSubmission.id, {
          status: newStatus as any,
          notes: newNote || undefined,
        });
        if (result) {
          setShowStatusDialog(false);
          setSelectedSubmission(null);
          setNewStatus("");
          setNewNote("");
        }
      } else {
        toast.error("Only recruiters can update submission status");
      }
    } catch (error: any) {
      toast.error(error.message || "Failed to update submission status");
    }
  };

  const handleAddNote = async () => {
    if (!selectedSubmission || !newNote.trim()) return;

    try {
      if (user?.role !== "recruiter") {
        toast.error("Only recruiters can add notes to submissions");
        return;
      }
      await recruiterService.addSubmissionNote(
        selectedSubmission.id,
        newNote.trim()
      );
      toast.success("Note added");
      setNewNote("");
      setShowNoteDialog(false);
      refresh();
    } catch (error: any) {
      toast.error(error.message || "Failed to add note");
    }
  };

  const handleAddAttachment = async () => {
    if (!selectedSubmission || !attachmentUrl.trim()) return;
    try {
      if (user?.role !== "recruiter") {
        toast.error("Only recruiters can add attachments");
        return;
      }
      await recruiterService.addSubmissionAttachment(selectedSubmission.id, {
        url: attachmentUrl.trim(),
        name: attachmentName.trim() || undefined,
      });
      toast.success("Attachment added");
      setAttachmentUrl("");
      setAttachmentName("");
      setShowAttachmentDialog(false);
      refresh();
    } catch (error: any) {
      toast.error(error.message || "Failed to add attachment");
    }
  };

  const handleWithdrawApplication = async (submissionId: string) => {
    if (!window.confirm("Are you sure you want to withdraw this application?")) {
      return;
    }
    try {
      await submissionService.withdrawSubmission(submissionId);
      toast.success("Application withdrawn successfully");
      refresh();
    } catch (error: any) {
      toast.error(error.message || "Failed to withdraw application");
    }
  };

  const handleViewTimeline = (submission: any) => {
    setSelectedSubmission(submission);
    setShowTimelineDialog(true);
  };

  const toggleSubmissionExpansion = (submissionId: string) => {
    const newExpanded = new Set(expandedSubmissions);
    if (newExpanded.has(submissionId)) {
      newExpanded.delete(submissionId);
    } else {
      newExpanded.add(submissionId);
    }
    setExpandedSubmissions(newExpanded);
  };

  const getStatusColor = (status: string) => {
    const colors = {
      submitted: "bg-blue-100 text-blue-800",
      under_review: "bg-yellow-100 text-yellow-800",
      shortlisted: "bg-green-100 text-green-800",
      interview_scheduled: "bg-purple-100 text-purple-800",
      interviewed: "bg-indigo-100 text-indigo-800",
      offered: "bg-emerald-100 text-emerald-800",
      hired: "bg-green-100 text-green-800",
      rejected: "bg-red-100 text-red-800",
      withdrawn: "bg-gray-100 text-gray-800",
    };
    return colors[status as keyof typeof colors] || "bg-gray-100 text-gray-800";
  };

  const getStatusLabel = (status: string) => {
    const labels = {
      submitted: "Submitted",
      under_review: "Under Review",
      shortlisted: "Shortlisted",
      interview_scheduled: "Interview Scheduled",
      interviewed: "Interviewed",
      offered: "Offered",
      hired: "Hired",
      rejected: "Rejected",
      withdrawn: "Withdrawn",
    };
    return labels[status as keyof typeof labels] || status;
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const formatSalary = (amount?: number) => {
    if (!amount) return "Not specified";
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount);
  };

  // Load initial data
  useEffect(() => {
    if (user && ["candidate", "vendor"].includes(user.role)) {
      fetchSubmissions({ page: 1, limit: 50 });
    }
  }, [user?.role, fetchSubmissions]);

  // Load recruiter jobs once
  useEffect(() => {
    const loadJobs = async () => {
      if (user?.role !== "recruiter") return;
      try {
        setJobsLoading(true);
        const resp = await recruiterService.getJobs({ page: 1, limit: 100 });
        const jobs = resp.data.jobs || [];
        setRecruiterJobs(jobs);
        if (jobs.length > 0 && jobFilter === "all") {
          setJobFilter(jobs[0].id);
          fetchSubmissions({
            job_id: jobs[0].id,
            status: statusFilter === "all" ? undefined : statusFilter,
            search: searchTerm || undefined,
            page: 1,
            limit: 50,
          });
        }
      } catch (err: any) {
        toast.error(err.message || "Failed to load jobs");
      } finally {
        setJobsLoading(false);
      }
    };
    loadJobs();
  }, [user?.role, fetchSubmissions]);

  // Refetch when recruiter changes job filter
  useEffect(() => {
    if (user?.role !== "recruiter") return;
    if (jobFilter === "all") {
      fetchSubmissions({ job_id: undefined });
      return;
    }
    fetchSubmissions({
      job_id: jobFilter,
      status: statusFilter === "all" ? undefined : statusFilter,
      search: searchTerm || undefined,
      page: 1,
      limit: 50,
    });
  }, [jobFilter, statusFilter, searchTerm, fetchSubmissions, user?.role]);

  if (!user || !["recruiter", "candidate", "vendor"].includes(user.role)) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <AlertCircle className="h-8 w-8 text-red-500 mx-auto mb-2" />
          <p className="text-gray-600">
            Access denied. Only recruiters, candidates, and vendors can view
            submissions.
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
          <h1 className="text-2xl font-bold text-gray-900">
            {user.role === "recruiter"
              ? "Job Applications"
              : user.role === "candidate"
              ? "My Applications"
              : "My Submissions"}
          </h1>
          <p className="text-gray-600">
            {user.role === "recruiter"
              ? "Manage applications for your job postings"
              : user.role === "candidate"
              ? "Track your job applications"
              : "Track your candidate submissions"}
          </p>
        </div>
        {user.role === "recruiter" && (
          <div className="flex items-center space-x-2">
            <Button
              variant="outline"
              onClick={handleExport}
              disabled={exporting}
            >
              <FileSpreadsheet className="h-4 w-4 mr-2" />
              {exporting ? "Exporting..." : "Export CSV"}
            </Button>
            <Button variant="outline">
              <Bot className="h-4 w-4 mr-2" />
              AI Insights
            </Button>
          </div>
        )}
      </div>

      {/* Navigation Cards (from previous UI) */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-1 sm:gap-2">
        {navigationCards.map((card) => {
          const IconComponent = card.icon;
          return (
            <Card
              key={card.title}
              className="relative overflow-hidden border-0 shadow-sm hover:shadow-md transition-all duration-300 hover:-translate-y-0.5 group cursor-pointer backdrop-blur-xl bg-white/20"
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

      {/* Search and Filters */}
      <Card>
        <CardContent className="p-4">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                <Input
                  placeholder="Search by candidate name, job title, or company..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                  onKeyPress={(e) => e.key === "Enter" && handleSearch()}
                />
              </div>
            </div>
            <div className="flex gap-2">
              {user.role === "recruiter" && (
                <Select
                  value={jobFilter}
                  onValueChange={setJobFilter}
                  disabled={jobsLoading}
                >
                  <SelectTrigger className="w-48">
                    <SelectValue placeholder="Job" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Select Job</SelectItem>
                    {recruiterJobs.map((job) => (
                      <SelectItem key={job.id} value={job.id}>
                        {job.title}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              )}
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger className="w-40">
                  <SelectValue placeholder="Status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Status</SelectItem>
                  <SelectItem value="submitted">Submitted</SelectItem>
                  <SelectItem value="under_review">Under Review</SelectItem>
                  <SelectItem value="shortlisted">Shortlisted</SelectItem>
                  <SelectItem value="interview_scheduled">
                    Interview Scheduled
                  </SelectItem>
                  <SelectItem value="interviewed">Interviewed</SelectItem>
                  <SelectItem value="offered">Offered</SelectItem>
                  <SelectItem value="hired">Hired</SelectItem>
                  <SelectItem value="rejected">Rejected</SelectItem>
                </SelectContent>
              </Select>

              <Button onClick={handleSearch} variant="default">
                <Search className="h-4 w-4 mr-2" />
                Search
              </Button>

              <Button onClick={refresh} variant="outline" disabled={loading}>
                <RefreshCw
                  className={`h-4 w-4 ${loading ? "animate-spin" : ""}`}
                />
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Submissions List */}
      <Card>
        <CardHeader>
          <CardTitle>
            {user.role === "recruiter" ? "Applications by Job" : "Applications"}{" "}
            ({pagination.totalItems})
          </CardTitle>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="space-y-4">
              {[1, 2, 3].map((i) => (
                <div key={i} className="animate-pulse">
                  <div className="h-24 bg-gray-200 rounded-lg"></div>
                </div>
              ))}
            </div>
          ) : error ? (
            <div className="text-center py-8">
              <AlertCircle className="h-8 w-8 text-red-500 mx-auto mb-2" />
              <p className="text-gray-600">{error}</p>
              <Button onClick={refresh} variant="outline" className="mt-2">
                Try Again
              </Button>
            </div>
          ) : submissions.length === 0 ? (
            <div className="text-center py-8">
              <FileText className="h-8 w-8 text-gray-400 mx-auto mb-2" />
              <p className="text-gray-600">No submissions found</p>
              <p className="text-sm text-gray-500 mt-1">
                {user.role === "candidate"
                  ? "Start applying to jobs to see your applications here"
                  : user.role === "recruiter"
                  ? jobFilter === "all"
                    ? "Select a job to view its submissions."
                    : "No submissions for the selected job yet."
                  : "Submissions will appear here after you submit candidates to client jobs"}
              </p>
              {user.role === "recruiter" && (
                <Button
                  onClick={() => navigate("/dashboard/jobs")}
                  className="mt-4"
                  variant="outline"
                >
                  <Briefcase className="h-4 w-4 mr-2" />
                  Go to Jobs
                </Button>
              )}
            </div>
          ) : user.role === "recruiter" ? (
            // Group by job for recruiters
            <div className="space-y-6">
              {Object.entries(submissionsByJob).map(([jobKey, jobData]) => (
                <div key={jobKey} className="border rounded-lg">
                  <Collapsible>
                    <CollapsibleTrigger className="w-full p-4 hover:bg-gray-50 transition-colors">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-3">
                          <ChevronRight className="h-4 w-4" />
                          <div className="text-left">
                            <h3 className="font-semibold text-gray-900">
                              {jobData.job?.title}
                            </h3>
                            <p className="text-sm text-gray-600">
                              {jobData.job?.company_name}
                            </p>
                          </div>
                        </div>
                        <div className="flex items-center space-x-4">
                          <Badge variant="secondary">
                            {jobData.submissions.length} applications
                          </Badge>
                          <Badge
                            className={getStatusColor(jobData.job?.status)}
                          >
                            {jobData.job?.status}
                          </Badge>
                        </div>
                      </div>
                    </CollapsibleTrigger>
                    <CollapsibleContent>
                      <div className="border-t bg-gray-50 p-4 space-y-4">
                        {jobData.submissions.map((submission: any) => (
                          <div
                            key={submission.id}
                            className="bg-white border rounded-lg p-4"
                          >
                            <div className="flex items-start justify-between">
                              <div className="flex-1">
                                <div className="flex items-center space-x-3 mb-2">
                                  <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
                                    <User className="h-5 w-5 text-blue-600" />
                                  </div>
                                  <div>
                                    <h4 className="font-semibold text-gray-900">
                                      {submission.candidate?.first_name}{" "}
                                      {submission.candidate?.last_name}
                                    </h4>
                                    <p className="text-sm text-gray-600">
                                      {submission.candidate?.email}
                                    </p>
                                  </div>
                                  <Badge
                                    className={getStatusColor(
                                      submission.status
                                    )}
                                  >
                                    {getStatusLabel(submission.status)}
                                  </Badge>
                                </div>

                                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm text-gray-600 mb-3">
                                  <div className="flex items-center space-x-2">
                                    <Calendar className="h-4 w-4" />
                                    <span>
                                      Applied:{" "}
                                      {formatDate(submission.submitted_at)}
                                    </span>
                                  </div>
                                  <div className="flex items-center space-x-2">
                                    <DollarSign className="h-4 w-4" />
                                    <span>
                                      Expected:{" "}
                                      {formatSalary(submission.expected_salary)}
                                    </span>
                                  </div>
                                  <div className="flex items-center space-x-2">
                                    <Clock className="h-4 w-4" />
                                    <span>
                                      Available:{" "}
                                      {submission.availability_date
                                        ? new Date(
                                            submission.availability_date
                                          ).toLocaleDateString()
                                        : "Immediately"}
                                    </span>
                                  </div>
                                </div>

                                {submission.cover_letter && (
                                  <div className="mb-3">
                                    <p className="text-sm font-medium text-gray-700 mb-1">
                                      Cover Letter:
                                    </p>
                                    <p className="text-sm text-gray-600 line-clamp-2">
                                      {submission.cover_letter}
                                    </p>
                                  </div>
                                )}
                                {Array.isArray(
                                  (submission as any).notes_history
                                ) &&
                                  (submission as any).notes_history.length >
                                    0 && (
                                    <div className="mb-3">
                                      <p className="text-sm font-medium text-gray-700 mb-1">
                                        Notes
                                      </p>
                                      {(() => {
                                        const history = (submission as any)
                                          .notes_history as any[];
                                        const latest =
                                          history[history.length - 1];
                                        return (
                                          <div className="text-sm text-gray-600">
                                            <p className="line-clamp-2">
                                              {latest.note}
                                            </p>
                                            {latest.at && (
                                              <p className="text-xs text-gray-400 mt-1">
                                                {new Date(
                                                  latest.at
                                                ).toLocaleString()}
                                              </p>
                                            )}
                                          </div>
                                        );
                                      })()}
                                    </div>
                                  )}
                                {Array.isArray(
                                  (submission as any).attachments
                                ) &&
                                  (submission as any).attachments.length >
                                    0 && (
                                    <div className="mb-3">
                                      <p className="text-sm font-medium text-gray-700 mb-1 flex items-center gap-2">
                                        <Paperclip className="h-4 w-4" />
                                        Attachments
                                      </p>
                                      <div className="flex flex-wrap gap-2">
                                        {(submission as any).attachments.map(
                                          (att: any, idx: number) => (
                                            <a
                                              key={idx}
                                              href={att.url}
                                              target="_blank"
                                              rel="noreferrer"
                                              className="text-sm text-blue-600 hover:underline"
                                            >
                                              {att.name || att.url}
                                            </a>
                                          )
                                        )}
                                      </div>
                                    </div>
                                  )}
                              </div>

                              <DropdownMenu>
                                <DropdownMenuTrigger asChild>
                                  <Button variant="ghost" size="sm">
                                    <MoreHorizontal className="h-4 w-4" />
                                  </Button>
                                </DropdownMenuTrigger>
                                <DropdownMenuContent align="end">
                                  <DropdownMenuItem
                                    onClick={() =>
                                      navigate(
                                        `/dashboard/candidates/${submission.candidate?.id}`
                                      )
                                    }
                                  >
                                    <Eye className="h-4 w-4 mr-2" />
                                    View Candidate Profile
                                  </DropdownMenuItem>
                                  <DropdownMenuItem
                                    onClick={() => {
                                      setSelectedSubmission(submission);
                                      setShowStatusDialog(true);
                                    }}
                                  >
                                    <Edit className="h-4 w-4 mr-2" />
                                    Update Status
                                  </DropdownMenuItem>
                                  <DropdownMenuItem
                                    onClick={() => {
                                      setSelectedSubmission(submission);
                                      setShowNoteDialog(true);
                                    }}
                                  >
                                    <MessageSquare className="h-4 w-4 mr-2" />
                                    Add Note
                                  </DropdownMenuItem>
                                  <DropdownMenuItem
                                    onClick={() => {
                                      setSelectedSubmission(submission);
                                      setShowAttachmentDialog(true);
                                    }}
                                  >
                                    <Paperclip className="h-4 w-4 mr-2" />
                                    Add Attachment
                                  </DropdownMenuItem>
                                  <DropdownMenuSeparator />
                                  <DropdownMenuItem>
                                    <Mail className="h-4 w-4 mr-2" />
                                    Send Email
                                  </DropdownMenuItem>
                                  <DropdownMenuItem
                                    onClick={() => {
                                      setSelectedSubmission(submission);
                                      setShowScheduleDialog(true);
                                    }}
                                  >
                                    <Calendar className="h-4 w-4 mr-2" />
                                    Schedule Interview
                                  </DropdownMenuItem>
                                  <DropdownMenuSeparator />
                                  <DropdownMenuItem>
                                    <FileText className="h-4 w-4 mr-2" />
                                    Download Resume
                                  </DropdownMenuItem>
                                </DropdownMenuContent>
                              </DropdownMenu>
                            </div>
                          </div>
                        ))}
                      </div>
                    </CollapsibleContent>
                  </Collapsible>
                </div>
              ))}
            </div>
          ) : (
            // Simple list for candidates and vendors
            <div className="space-y-4">
              {submissions.map((submission) => (
                <div
                  key={submission.id}
                  className="border rounded-lg p-4 hover:shadow-md transition-shadow"
                >
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center space-x-3 mb-2">
                        <h3 className="text-lg font-semibold text-gray-900">
                          {submission.job?.title}
                        </h3>
                        <Badge className={getStatusColor(submission.status)}>
                          {getStatusLabel(submission.status)}
                        </Badge>
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 text-sm text-gray-600 mb-3">
                        <div className="flex items-center space-x-2">
                          <Building className="h-4 w-4" />
                          <span>{submission.job?.company_name}</span>
                        </div>
                        <div className="flex items-center space-x-2">
                          <MapPin className="h-4 w-4" />
                          <span>{submission.job?.location}</span>
                        </div>
                        <div className="flex items-center space-x-2">
                          <Calendar className="h-4 w-4" />
                          <span>
                            Applied: {formatDate(submission.submitted_at)}
                          </span>
                        </div>
                        <div className="flex items-center space-x-2">
                          <DollarSign className="h-4 w-4" />
                          <span>
                            Expected: {formatSalary(submission.expected_salary)}
                          </span>
                        </div>
                      </div>

                      {submission.cover_letter && (
                        <div className="mb-3">
                          <p className="text-sm font-medium text-gray-700 mb-1">
                            Cover Letter:
                          </p>
                          <p className="text-sm text-gray-600 line-clamp-2">
                            {submission.cover_letter}
                          </p>
                        </div>
                      )}

                      {submission.latestInterview && (
                        <div className="mt-2 p-3 bg-blue-50 rounded-lg text-sm space-y-1">
                          <div className="flex items-center gap-2 font-medium text-blue-800">
                            <Calendar className="h-4 w-4" />
                            Interview scheduled
                          </div>
                          <div className="text-blue-800">
                            {formatDate(
                              submission.latestInterview.scheduled_at
                            )}
                          </div>
                          {submission.latestInterview.meeting_link && (
                            <a
                              href={submission.latestInterview.meeting_link}
                              target="_blank"
                              rel="noreferrer"
                              className="text-blue-700 underline"
                            >
                              Join meeting
                            </a>
                          )}
                        </div>
                      )}
                    </div>

                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="sm">
                          <MoreHorizontal className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem
                          onClick={() => navigate(`/job/${submission.job?.id}`)}
                        >
                          <Eye className="h-4 w-4 mr-2" />
                          View Job Details
                        </DropdownMenuItem>
                        {user.role === "candidate" &&
                          submission.status === "submitted" && (
                            <DropdownMenuItem
                              className="text-red-600"
                              onClick={() =>
                                handleWithdrawApplication(submission.id)
                              }
                            >
                              <Trash className="h-4 w-4 mr-2" />
                              Withdraw Application
                            </DropdownMenuItem>
                          )}
                        <DropdownMenuSeparator />
                        <DropdownMenuItem
                          onClick={() => handleViewTimeline(submission)}
                        >
                          <ExternalLink className="h-4 w-4 mr-2" />
                          View Timeline
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </div>
                </div>
              ))}

              {/* Pagination */}
              {pagination.totalPages > 1 && (
                <div className="flex items-center justify-between mt-6">
                  <div className="text-sm text-gray-600">
                    Showing{" "}
                    {(pagination.currentPage - 1) * pagination.itemsPerPage + 1}{" "}
                    to{" "}
                    {Math.min(
                      pagination.currentPage * pagination.itemsPerPage,
                      pagination.totalItems
                    )}{" "}
                    of {pagination.totalItems} submissions
                  </div>
                  <div className="flex items-center space-x-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() =>
                        fetchSubmissions({
                          ...filters,
                          page: pagination.currentPage - 1,
                        })
                      }
                      disabled={!pagination.hasPrevPage}
                    >
                      Previous
                    </Button>
                    <span className="text-sm text-gray-600">
                      Page {pagination.currentPage} of {pagination.totalPages}
                    </span>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() =>
                        fetchSubmissions({
                          ...filters,
                          page: pagination.currentPage + 1,
                        })
                      }
                      disabled={!pagination.hasNextPage}
                    >
                      Next
                    </Button>
                  </div>
                </div>
              )}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Status Update Dialog */}
      <Dialog open={showStatusDialog} onOpenChange={setShowStatusDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Update Application Status</DialogTitle>
            <DialogDescription>
              Change the status of {selectedSubmission?.candidate?.first_name}{" "}
              {selectedSubmission?.candidate?.last_name}'s application
            </DialogDescription>
          </DialogHeader>
          <div className="py-4">
            <Select value={newStatus} onValueChange={setNewStatus}>
              <SelectTrigger>
                <SelectValue placeholder="Select new status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="under_review">Under Review</SelectItem>
                <SelectItem value="shortlisted">Shortlisted</SelectItem>
                <SelectItem value="interview_scheduled">
                  Interview Scheduled
                </SelectItem>
                <SelectItem value="interviewed">Interviewed</SelectItem>
                <SelectItem value="offered">Offered</SelectItem>
                <SelectItem value="hired">Hired</SelectItem>
                <SelectItem value="rejected">Rejected</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setShowStatusDialog(false)}
            >
              Cancel
            </Button>
            <Button onClick={handleStatusUpdate} disabled={!newStatus}>
              Update Status
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Add Note Dialog */}
      <Dialog open={showNoteDialog} onOpenChange={setShowNoteDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Add Note</DialogTitle>
            <DialogDescription>
              Add a note to {selectedSubmission?.candidate?.first_name}{" "}
              {selectedSubmission?.candidate?.last_name}'s application
            </DialogDescription>
          </DialogHeader>
          <div className="py-4">
            <Textarea
              placeholder="Enter your note here..."
              value={newNote}
              onChange={(e) => setNewNote(e.target.value)}
              rows={4}
            />
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowNoteDialog(false)}>
              Cancel
            </Button>
            <Button onClick={handleAddNote} disabled={!newNote.trim()}>
              Add Note
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Add Attachment Dialog */}
      <Dialog
        open={showAttachmentDialog}
        onOpenChange={setShowAttachmentDialog}
      >
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Add Attachment</DialogTitle>
            <DialogDescription>
              Link an attachment to {selectedSubmission?.candidate?.first_name}{" "}
              {selectedSubmission?.candidate?.last_name}'s application
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-3 py-4">
            <Input
              placeholder="Attachment URL"
              value={attachmentUrl}
              onChange={(e) => setAttachmentUrl(e.target.value)}
            />
            <Input
              placeholder="Optional display name"
              value={attachmentName}
              onChange={(e) => setAttachmentName(e.target.value)}
            />
          </div>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setShowAttachmentDialog(false)}
            >
              Cancel
            </Button>
            <Button
              onClick={handleAddAttachment}
              disabled={!attachmentUrl.trim()}
            >
              Add Attachment
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* View Timeline Dialog */}
      <Dialog open={showTimelineDialog} onOpenChange={setShowTimelineDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Application Timeline</DialogTitle>
            <DialogDescription>
              {selectedSubmission?.job?.title} at{" "}
              {selectedSubmission?.job?.company_name}
            </DialogDescription>
          </DialogHeader>
          {selectedSubmission && (
            <div className="space-y-4 py-2">
              <div className="flex items-start gap-3">
                <FileText className="h-4 w-4 mt-1 text-blue-600" />
                <div>
                  <p className="text-sm font-medium text-gray-900">
                    Application submitted
                  </p>
                  <p className="text-xs text-gray-500">
                    {formatDate(selectedSubmission.submitted_at)}
                  </p>
                </div>
              </div>
              {selectedSubmission.reviewed_at && (
                <div className="flex items-start gap-3">
                  <Eye className="h-4 w-4 mt-1 text-amber-600" />
                  <div>
                    <p className="text-sm font-medium text-gray-900">
                      Reviewed by recruiter
                    </p>
                    <p className="text-xs text-gray-500">
                      {formatDate(selectedSubmission.reviewed_at)}
                    </p>
                  </div>
                </div>
              )}
              {selectedSubmission.latestInterview && (
                <div className="flex items-start gap-3">
                  <Calendar className="h-4 w-4 mt-1 text-purple-600" />
                  <div>
                    <p className="text-sm font-medium text-gray-900">
                      Interview scheduled
                    </p>
                    <p className="text-xs text-gray-500">
                      {formatDate(
                        selectedSubmission.latestInterview.scheduled_at
                      )}
                    </p>
                  </div>
                </div>
              )}
              <div className="flex items-start gap-3">
                <CheckCircle className="h-4 w-4 mt-1 text-green-600" />
                <div>
                  <p className="text-sm font-medium text-gray-900">
                    Current status
                  </p>
                  <Badge className={getStatusColor(selectedSubmission.status)}>
                    {getStatusLabel(selectedSubmission.status)}
                  </Badge>
                  <p className="text-xs text-gray-500 mt-1">
                    Last updated{" "}
                    {formatDate(
                      selectedSubmission.updated_at ||
                        selectedSubmission.submitted_at
                    )}
                  </p>
                </div>
              </div>
            </div>
          )}
          <DialogFooter>
            <Button onClick={() => setShowTimelineDialog(false)}>Close</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {selectedSubmission && (
        <ScheduleInterviewDialog
          isOpen={showScheduleDialog}
          onClose={() => {
            setShowScheduleDialog(false);
            setSelectedSubmission(null);
          }}
          submission={selectedSubmission}
          onSuccess={() => {
            refresh();
            setShowScheduleDialog(false);
          }}
        />
      )}
    </div>
  );
};

export default Submissions;

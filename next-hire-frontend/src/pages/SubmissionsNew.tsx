import React, { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
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
} from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useSubmissions } from "@/hooks/useSubmissions";
import { useAuth } from "@/contexts/AuthContext";
import { submissionService } from "@/services/submissionService";
import { toast } from "sonner";

const Submissions = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { 
    submissions, 
    loading, 
    error, 
    pagination, 
    filters, 
    fetchSubmissions, 
    updateSubmissionStatus,
    addSubmissionNote,
    refresh,
    setFilters 
  } = useSubmissions();

  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [jobFilter, setJobFilter] = useState("all");
  const [expandedSubmissions, setExpandedSubmissions] = useState<Set<string>>(new Set());
  const [selectedSubmission, setSelectedSubmission] = useState<any>(null);
  const [showStatusDialog, setShowStatusDialog] = useState(false);
  const [showNoteDialog, setShowNoteDialog] = useState(false);
  const [newStatus, setNewStatus] = useState("");
  const [newNote, setNewNote] = useState("");

  // Group submissions by job for better organization
  const submissionsByJob = submissions.reduce((acc, submission) => {
    const jobKey = submission.job?.id || 'unknown';
    if (!acc[jobKey]) {
      acc[jobKey] = {
        job: submission.job,
        submissions: [],
      };
    }
    acc[jobKey].submissions.push(submission);
    return acc;
  }, {} as Record<string, any>);

  // Calculate stats
  const stats = {
    total: submissions.length,
    submitted: submissions.filter(s => s.status === "submitted").length,
    underReview: submissions.filter(s => s.status === "under_review").length,
    shortlisted: submissions.filter(s => s.status === "shortlisted").length,
    interviewed: submissions.filter(s => s.status === "interviewed").length,
    offered: submissions.filter(s => s.status === "offered").length,
    hired: submissions.filter(s => s.status === "hired").length,
    rejected: submissions.filter(s => s.status === "rejected").length,
  };

  const handleSearch = () => {
    const newFilters = {
      ...filters,
      search: searchTerm || undefined,
      status: statusFilter === "all" ? undefined : statusFilter,
      job_id: jobFilter === "all" ? undefined : jobFilter,
      page: 1,
    };
    fetchSubmissions(newFilters);
  };

  const handleStatusUpdate = async () => {
    if (!selectedSubmission || !newStatus) return;

    const success = await updateSubmissionStatus(selectedSubmission.id, newStatus);
    if (success) {
      setShowStatusDialog(false);
      setSelectedSubmission(null);
      setNewStatus("");
      refresh();
    }
  };

  const handleAddNote = async () => {
    if (!selectedSubmission || !newNote.trim()) return;

    const success = await addSubmissionNote(selectedSubmission.id, newNote);
    if (success) {
      setShowNoteDialog(false);
      setSelectedSubmission(null);
      setNewNote("");
      refresh();
    }
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
    if (user && ["recruiter", "candidate", "vendor"].includes(user.role)) {
      fetchSubmissions({ page: 1, limit: 50 });
    }
  }, [user?.role]);

  if (!user || !["recruiter", "candidate", "vendor"].includes(user.role)) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <AlertCircle className="h-8 w-8 text-red-500 mx-auto mb-2" />
          <p className="text-gray-600">Access denied. Only recruiters, candidates, and vendors can view submissions.</p>
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
            {user.role === "recruiter" ? "Job Applications" : 
             user.role === "candidate" ? "My Applications" : 
             "My Submissions"}
          </h1>
          <p className="text-gray-600">
            {user.role === "recruiter" ? "Manage applications for your job postings" : 
             user.role === "candidate" ? "Track your job applications" : 
             "Track your candidate submissions"}
          </p>
        </div>
        <div className="flex items-center space-x-2">
          <Button variant="outline">
            <FileSpreadsheet className="h-4 w-4 mr-2" />
            Export
          </Button>
          {user.role === "recruiter" && (
            <Button variant="outline">
              <Bot className="h-4 w-4 mr-2" />
              AI Insights
            </Button>
          )}
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-8 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="text-center">
              <p className="text-2xl font-bold text-blue-700">{stats.total}</p>
              <p className="text-sm text-gray-600">Total</p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="text-center">
              <p className="text-2xl font-bold text-blue-700">{stats.submitted}</p>
              <p className="text-sm text-gray-600">Submitted</p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="text-center">
              <p className="text-2xl font-bold text-yellow-700">{stats.underReview}</p>
              <p className="text-sm text-gray-600">Under Review</p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="text-center">
              <p className="text-2xl font-bold text-green-700">{stats.shortlisted}</p>
              <p className="text-sm text-gray-600">Shortlisted</p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="text-center">
              <p className="text-2xl font-bold text-purple-700">{stats.interviewed}</p>
              <p className="text-sm text-gray-600">Interviewed</p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="text-center">
              <p className="text-2xl font-bold text-emerald-700">{stats.offered}</p>
              <p className="text-sm text-gray-600">Offered</p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="text-center">
              <p className="text-2xl font-bold text-green-700">{stats.hired}</p>
              <p className="text-sm text-gray-600">Hired</p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="text-center">
              <p className="text-2xl font-bold text-red-700">{stats.rejected}</p>
              <p className="text-sm text-gray-600">Rejected</p>
            </div>
          </CardContent>
        </Card>
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
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger className="w-40">
                  <SelectValue placeholder="Status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Status</SelectItem>
                  <SelectItem value="submitted">Submitted</SelectItem>
                  <SelectItem value="under_review">Under Review</SelectItem>
                  <SelectItem value="shortlisted">Shortlisted</SelectItem>
                  <SelectItem value="interview_scheduled">Interview Scheduled</SelectItem>
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
                <RefreshCw className={`h-4 w-4 ${loading ? 'animate-spin' : ''}`} />
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Submissions List */}
      <Card>
        <CardHeader>
          <CardTitle>
            {user.role === "recruiter" ? "Applications by Job" : "Applications"} ({pagination.totalItems})
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
                {user.role === "candidate" ? "Start applying to jobs to see your applications here" : 
                 "Applications will appear here once candidates apply to your jobs"}
              </p>
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
                            <h3 className="font-semibold text-gray-900">{jobData.job?.title}</h3>
                            <p className="text-sm text-gray-600">{jobData.job?.company_name}</p>
                          </div>
                        </div>
                        <div className="flex items-center space-x-4">
                          <Badge variant="secondary">
                            {jobData.submissions.length} applications
                          </Badge>
                          <Badge className={getStatusColor(jobData.job?.status)}>
                            {jobData.job?.status}
                          </Badge>
                        </div>
                      </div>
                    </CollapsibleTrigger>
                    <CollapsibleContent>
                      <div className="border-t bg-gray-50 p-4 space-y-4">
                        {jobData.submissions.map((submission: any) => (
                          <div key={submission.id} className="bg-white border rounded-lg p-4">
                            <div className="flex items-start justify-between">
                              <div className="flex-1">
                                <div className="flex items-center space-x-3 mb-2">
                                  <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
                                    <User className="h-5 w-5 text-blue-600" />
                                  </div>
                                  <div>
                                    <h4 className="font-semibold text-gray-900">
                                      {submission.candidate?.first_name} {submission.candidate?.last_name}
                                    </h4>
                                    <p className="text-sm text-gray-600">{submission.candidate?.email}</p>
                                  </div>
                                  <Badge className={getStatusColor(submission.status)}>
                                    {getStatusLabel(submission.status)}
                                  </Badge>
                                </div>

                                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm text-gray-600 mb-3">
                                  <div className="flex items-center space-x-2">
                                    <Calendar className="h-4 w-4" />
                                    <span>Applied: {formatDate(submission.submitted_at)}</span>
                                  </div>
                                  <div className="flex items-center space-x-2">
                                    <DollarSign className="h-4 w-4" />
                                    <span>Expected: {formatSalary(submission.expected_salary)}</span>
                                  </div>
                                  <div className="flex items-center space-x-2">
                                    <Clock className="h-4 w-4" />
                                    <span>Available: {submission.availability_date ? new Date(submission.availability_date).toLocaleDateString() : 'Immediately'}</span>
                                  </div>
                                </div>

                                {submission.cover_letter && (
                                  <div className="mb-3">
                                    <p className="text-sm font-medium text-gray-700 mb-1">Cover Letter:</p>
                                    <p className="text-sm text-gray-600 line-clamp-2">{submission.cover_letter}</p>
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
                                  <DropdownMenuItem onClick={() => navigate(`/dashboard/candidates/${submission.candidate?.id}`)}>
                                    <Eye className="h-4 w-4 mr-2" />
                                    View Candidate Profile
                                  </DropdownMenuItem>
                                  <DropdownMenuItem onClick={() => {
                                    setSelectedSubmission(submission);
                                    setShowStatusDialog(true);
                                  }}>
                                    <Edit className="h-4 w-4 mr-2" />
                                    Update Status
                                  </DropdownMenuItem>
                                  <DropdownMenuItem onClick={() => {
                                    setSelectedSubmission(submission);
                                    setShowNoteDialog(true);
                                  }}>
                                    <MessageSquare className="h-4 w-4 mr-2" />
                                    Add Note
                                  </DropdownMenuItem>
                                  <DropdownMenuSeparator />
                                  <DropdownMenuItem>
                                    <Mail className="h-4 w-4 mr-2" />
                                    Send Email
                                  </DropdownMenuItem>
                                  <DropdownMenuItem>
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
                <div key={submission.id} className="border rounded-lg p-4 hover:shadow-md transition-shadow">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center space-x-3 mb-2">
                        <h3 className="text-lg font-semibold text-gray-900">{submission.job?.title}</h3>
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
                          <span>Applied: {formatDate(submission.submitted_at)}</span>
                        </div>
                        <div className="flex items-center space-x-2">
                          <DollarSign className="h-4 w-4" />
                          <span>Expected: {formatSalary(submission.expected_salary)}</span>
                        </div>
                      </div>

                      {submission.cover_letter && (
                        <div className="mb-3">
                          <p className="text-sm font-medium text-gray-700 mb-1">Cover Letter:</p>
                          <p className="text-sm text-gray-600 line-clamp-2">{submission.cover_letter}</p>
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
                        <DropdownMenuItem onClick={() => navigate(`/job/${submission.job?.id}`)}>
                          <Eye className="h-4 w-4 mr-2" />
                          View Job Details
                        </DropdownMenuItem>
                        {user.role === "candidate" && submission.status === "submitted" && (
                          <DropdownMenuItem className="text-red-600">
                            <Trash className="h-4 w-4 mr-2" />
                            Withdraw Application
                          </DropdownMenuItem>
                        )}
                        <DropdownMenuSeparator />
                        <DropdownMenuItem>
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
                    Showing {((pagination.currentPage - 1) * pagination.itemsPerPage) + 1} to{" "}
                    {Math.min(pagination.currentPage * pagination.itemsPerPage, pagination.totalItems)} of{" "}
                    {pagination.totalItems} submissions
                  </div>
                  <div className="flex items-center space-x-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => fetchSubmissions({ ...filters, page: pagination.currentPage - 1 })}
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
                      onClick={() => fetchSubmissions({ ...filters, page: pagination.currentPage + 1 })}
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
              Change the status of {selectedSubmission?.candidate?.first_name} {selectedSubmission?.candidate?.last_name}'s application
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
                <SelectItem value="interview_scheduled">Interview Scheduled</SelectItem>
                <SelectItem value="interviewed">Interviewed</SelectItem>
                <SelectItem value="offered">Offered</SelectItem>
                <SelectItem value="hired">Hired</SelectItem>
                <SelectItem value="rejected">Rejected</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowStatusDialog(false)}>
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
              Add a note to {selectedSubmission?.candidate?.first_name} {selectedSubmission?.candidate?.last_name}'s application
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
    </div>
  );
};

export default Submissions;

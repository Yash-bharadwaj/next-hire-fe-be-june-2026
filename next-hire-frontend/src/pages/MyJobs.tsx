import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Progress } from "@/components/ui/progress";
import { 
  Briefcase, 
  MapPin, 
  Clock, 
  DollarSign, 
  Filter, 
  Search, 
  Eye, 
  Building2,
  Calendar,
  TrendingUp,
  AlertCircle,
  CheckCircle,
  XCircle,
  Loader2,
  MoreHorizontal
} from "lucide-react";
import { useSubmissions, useSubmissionManagement } from "@/hooks/useSubmissions";
import { submissionService, SubmissionStatus } from "@/services/submissionService";
import { jobService } from "@/services/jobService";
import { toast } from "sonner";

export default function MyJobs() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState<SubmissionStatus | "all">("all");

  // Use submissions hook
  const { submissions, loading, error, pagination, searchSubmissions, loadMore } = useSubmissions();
  const { withdrawApplication, loading: withdrawing } = useSubmissionManagement();

  // Filter submissions based on search and status
  const filteredSubmissions = submissions.filter(submission => {
    const matchesSearch = !searchTerm || 
      submission.job?.title?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      submission.job?.company_name?.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesStatus = statusFilter === "all" || submission.status === statusFilter;
    
    return matchesSearch && matchesStatus;
  });

  const handleSearch = () => {
    const filters: any = {};
    
    if (statusFilter !== "all") {
      filters.status = statusFilter;
    }
    
    searchSubmissions(filters);
  };

  const handleWithdraw = async (submissionId: string) => {
    if (window.confirm("Are you sure you want to withdraw this application?")) {
      const success = await withdrawApplication(submissionId);
      if (success) {
        // Refresh the submissions list
        searchSubmissions({});
      }
    }
  };

  const getStatusIcon = (status: SubmissionStatus) => {
    switch (status) {
      case "submitted":
        return <Clock className="w-4 h-4" />;
      case "under_review":
        return <Eye className="w-4 h-4" />;
      case "shortlisted":
        return <TrendingUp className="w-4 h-4" />;
      case "interview_scheduled":
      case "interviewed":
        return <Calendar className="w-4 h-4" />;
      case "offered":
        return <CheckCircle className="w-4 h-4" />;
      case "hired":
        return <CheckCircle className="w-4 h-4" />;
      case "rejected":
        return <XCircle className="w-4 h-4" />;
      default:
        return <Clock className="w-4 h-4" />;
    }
  };

  const getStatusStats = () => {
    const stats = {
      total: submissions.length,
      submitted: 0,
      under_review: 0,
      shortlisted: 0,
      interview_scheduled: 0,
      interviewed: 0,
      offered: 0,
      hired: 0,
      rejected: 0,
    };

    submissions.forEach(submission => {
      stats[submission.status]++;
    });

    return stats;
  };

  const stats = getStatusStats();

  if (user?.role !== "candidate") {
    return (
      <div className="container mx-auto px-4 py-8">
        <Card>
          <CardContent className="p-12 text-center">
            <AlertCircle className="w-16 h-16 text-yellow-300 mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-gray-900 mb-2">Access Restricted</h3>
            <p className="text-gray-600">
              This page is only available for candidates.
            </p>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">My Applications</h1>
        <p className="text-gray-600">Track your job applications and their status</p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Total Applications</p>
                <p className="text-2xl font-bold text-gray-900">{stats.total}</p>
              </div>
              <Briefcase className="w-8 h-8 text-blue-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">In Progress</p>
                <p className="text-2xl font-bold text-yellow-600">
                  {stats.submitted + stats.under_review + stats.shortlisted + stats.interview_scheduled + stats.interviewed}
                </p>
              </div>
              <Clock className="w-8 h-8 text-yellow-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Offers</p>
                <p className="text-2xl font-bold text-green-600">{stats.offered + stats.hired}</p>
              </div>
              <CheckCircle className="w-8 h-8 text-green-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Success Rate</p>
                <p className="text-2xl font-bold text-purple-600">
                  {stats.total > 0 ? Math.round(((stats.offered + stats.hired) / stats.total) * 100) : 0}%
                </p>
              </div>
              <TrendingUp className="w-8 h-8 text-purple-600" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <Card className="mb-6">
        <CardContent className="p-6">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-1">
              <Input
                placeholder="Search by job title or company..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full"
              />
            </div>
            <div className="w-full md:w-48">
              <Select value={statusFilter} onValueChange={(value: any) => setStatusFilter(value)}>
                <SelectTrigger>
                  <SelectValue placeholder="Filter by status" />
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
            </div>
            <Button onClick={handleSearch} disabled={loading}>
              {loading ? (
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
              ) : (
                <Search className="w-4 h-4 mr-2" />
              )}
              Search
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Applications List */}
      <div className="space-y-4">
        {loading && submissions.length === 0 ? (
          <div className="flex items-center justify-center py-12">
            <Loader2 className="w-8 h-8 animate-spin text-green-600" />
            <span className="ml-2 text-gray-600">Loading applications...</span>
          </div>
        ) : filteredSubmissions.length === 0 ? (
          <Card>
            <CardContent className="p-12 text-center">
              <Briefcase className="w-16 h-16 text-gray-300 mx-auto mb-4" />
              <h3 className="text-xl font-semibold text-gray-900 mb-2">No applications found</h3>
              <p className="text-gray-600 mb-4">
                {submissions.length === 0 
                  ? "You haven't applied to any jobs yet. Start exploring opportunities!"
                  : "No applications match your current filters."
                }
              </p>
              <Button 
                onClick={() => navigate("/jobs")}
                className="bg-green-600 hover:bg-green-700"
              >
                Browse Jobs
              </Button>
            </CardContent>
          </Card>
        ) : (
          <>
            {filteredSubmissions.map((submission) => (
              <Card key={submission.id} className="hover:shadow-md transition-shadow">
                <CardContent className="p-6">
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-2">
                        <h3 className="text-xl font-semibold text-gray-900">
                          {submission.job?.title || "Unknown Job"}
                        </h3>
                        <Badge className={submissionService.getStatusColor(submission.status)}>
                          <div className="flex items-center gap-1">
                            {getStatusIcon(submission.status)}
                            {submissionService.getStatusLabel(submission.status)}
                          </div>
                        </Badge>
                      </div>
                      
                      <div className="flex items-center gap-4 text-gray-600 mb-3">
                        <div className="flex items-center gap-1">
                          <Building2 className="w-4 h-4" />
                          <span>{submission.job?.company_name || "Unknown Company"}</span>
                        </div>
                        <div className="flex items-center gap-1">
                          <MapPin className="w-4 h-4" />
                          <span>{submission.job?.location || "Location not specified"}</span>
                        </div>
                        <div className="flex items-center gap-1">
                          <DollarSign className="w-4 h-4" />
                          <span>
                            {submission.job ? jobService.formatSalaryRange(submission.job as any) : "Salary not specified"}
                          </span>
                        </div>
                      </div>

                      <div className="flex items-center gap-4 text-sm text-gray-500 mb-4">
                        <span>Applied: {submissionService.formatSubmissionDate(submission.submitted_at)}</span>
                        {submission.reviewed_at && (
                          <span>Last updated: {submissionService.formatSubmissionDate(submission.reviewed_at)}</span>
                        )}
                      </div>

                      {/* Progress Bar */}
                      <div className="mb-4">
                        <div className="flex items-center justify-between mb-2">
                          <span className="text-sm font-medium text-gray-700">Application Progress</span>
                          <span className="text-sm text-gray-500">
                            {submissionService.getSubmissionProgress(submission.status)}%
                          </span>
                        </div>
                        <Progress 
                          value={submissionService.getSubmissionProgress(submission.status)} 
                          className="h-2"
                        />
                      </div>

                      {submission.cover_letter && (
                        <div className="mb-4">
                          <p className="text-sm text-gray-600 line-clamp-2">
                            <strong>Cover Letter:</strong> {submission.cover_letter}
                          </p>
                        </div>
                      )}
                    </div>

                    <div className="flex flex-col items-end gap-2 ml-6">
                      <div className="flex gap-2">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => navigate(`/job/${submission.job_id}`)}
                        >
                          <Eye className="w-4 h-4 mr-1" />
                          View Job
                        </Button>
                        
                        {submissionService.canWithdraw(submission.status) && (
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleWithdraw(submission.id)}
                            disabled={withdrawing}
                            className="text-red-600 hover:text-red-700"
                          >
                            {withdrawing ? (
                              <Loader2 className="w-4 h-4 mr-1 animate-spin" />
                            ) : (
                              <XCircle className="w-4 h-4 mr-1" />
                            )}
                            Withdraw
                          </Button>
                        )}
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}

            {/* Load More Button */}
            {pagination.hasNextPage && (
              <div className="text-center py-8">
                <Button 
                  onClick={loadMore}
                  disabled={loading}
                  variant="outline"
                  size="lg"
                >
                  {loading ? (
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  ) : null}
                  Load More Applications
                </Button>
              </div>
            )}
          </>
        )}
      </div>

      {/* Pagination Info */}
      {pagination.totalItems > 0 && (
        <div className="text-center text-gray-600 mt-8">
          Showing {filteredSubmissions.length} of {pagination.totalItems} applications
        </div>
      )}
    </div>
  );
}

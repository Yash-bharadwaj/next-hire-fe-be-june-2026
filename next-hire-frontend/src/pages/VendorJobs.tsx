import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";
import {
  AlertCircle,
  Briefcase,
  Building2,
  Calendar,
  DollarSign,
  Filter,
  MapPin,
  RefreshCw,
  Search,
  Send,
  Target,
  Users,
} from "lucide-react";
import { useVendorJobs, useVendorCandidates } from "@/hooks/useVendor";
import { vendorService, Job } from "@/services/vendorService";
import { jobService } from "@/services/jobService";
import { toast } from "sonner";

const VendorJobs = () => {
  const { user } = useAuth();
  const navigate = useNavigate();

  const {
    jobs,
    loading,
    error,
    pagination,
    filters,
    searchJobs,
    refresh,
  } = useVendorJobs({ page: 1, limit: 10 });

  const { candidates, loading: candidatesLoading } = useVendorCandidates({
    page: 1,
    limit: 100,
  });

  const [searchTerm, setSearchTerm] = useState("");
  const [locationFilter, setLocationFilter] = useState("");
  const [skillsFilter, setSkillsFilter] = useState("");
  const [remoteOnly, setRemoteOnly] = useState(false);
  const [jobTypeFilter, setJobTypeFilter] = useState<string>("all");

  const [submitDialogOpen, setSubmitDialogOpen] = useState(false);
  const [selectedJob, setSelectedJob] = useState<Job | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submissionForm, setSubmissionForm] = useState({
    candidate_id: "",
    expected_salary: "",
    availability_date: "",
    cover_letter: "",
    notes: "",
  });

  if (!user || user.role !== "vendor") {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <AlertCircle className="h-8 w-8 text-red-500 mx-auto mb-2" />
          <p className="text-gray-600">
            Access denied. This workspace is only available for vendors.
          </p>
        </div>
      </div>
    );
  }

  const handleSearch = () => {
    const newFilters = {
      ...filters,
      search: searchTerm || undefined,
      location: locationFilter || undefined,
      skills: skillsFilter || undefined,
      remote_work_allowed: remoteOnly ? true : undefined,
      job_type: jobTypeFilter === "all" ? undefined : jobTypeFilter,
      page: 1,
    };
    searchJobs(newFilters);
  };

  const clearFilters = () => {
    setSearchTerm("");
    setLocationFilter("");
    setSkillsFilter("");
    setRemoteOnly(false);
    setJobTypeFilter("all");
    searchJobs({ page: 1, limit: pagination.itemsPerPage });
  };

  const openSubmitDialog = (job: Job) => {
    setSelectedJob(job);
    setSubmissionForm({
      candidate_id: "",
      expected_salary: job.salary_min ? job.salary_min.toString() : "",
      availability_date: "",
      cover_letter: "",
      notes: "",
    });
    setSubmitDialogOpen(true);
  };

  const handleSubmitCandidate = async () => {
    if (!selectedJob) return;
    if (!submissionForm.candidate_id) {
      toast.error("Please select a candidate to submit");
      return;
    }

    setIsSubmitting(true);
    try {
      const payload: {
        candidate_id: string;
        cover_letter?: string;
        expected_salary?: number;
        availability_date?: string;
        notes?: string;
      } = {
        candidate_id: submissionForm.candidate_id,
      };

      if (submissionForm.cover_letter.trim()) {
        payload.cover_letter = submissionForm.cover_letter.trim();
      }
      if (submissionForm.notes.trim()) {
        payload.notes = submissionForm.notes.trim();
      }
      if (submissionForm.expected_salary) {
        payload.expected_salary = Number(submissionForm.expected_salary);
      }
      if (submissionForm.availability_date) {
        payload.availability_date = submissionForm.availability_date;
      }

      await vendorService.submitCandidate(selectedJob.id, payload);
      toast.success("Candidate submitted successfully");
      setSubmitDialogOpen(false);
      setSubmissionForm({
        candidate_id: "",
        expected_salary: "",
        availability_date: "",
        cover_letter: "",
        notes: "",
      });
      refresh();
    } catch (err: any) {
      toast.error(err.message || "Failed to submit candidate");
    } finally {
      setIsSubmitting(false);
    }
  };

  const formatPostedDate = (date: string) => {
    const postedDate = new Date(date);
    return postedDate.toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
    });
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">
            Vendor Job Board
          </h1>
          <p className="text-gray-600">
            Browse vendor-eligible jobs and submit your best candidates.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            onClick={() => navigate("/dashboard/vendor/candidates")}
          >
            <Users className="h-4 w-4 mr-2" />
            Manage Candidates
          </Button>
          <Button variant="outline" onClick={() => refresh()}>
            <RefreshCw className={`h-4 w-4 ${loading ? "animate-spin" : ""}`} />
          </Button>
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            <span className="flex items-center gap-2">
              <Filter className="h-4 w-4" />
              Search & Filters
            </span>
            <Button variant="outline" size="sm" onClick={clearFilters}>
              Reset
            </Button>
          </CardTitle>
          <CardDescription>
            Find the right opportunities for your candidate pipeline.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="text-sm font-medium text-gray-700 mb-1 block">
                Keywords
              </label>
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 h-4 w-4" />
                <Input
                  placeholder="Role, company, tech stack..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-9"
                />
              </div>
            </div>
            <div>
              <label className="text-sm font-medium text-gray-700 mb-1 block">
                Location
              </label>
              <Input
                placeholder="City, state or remote"
                value={locationFilter}
                onChange={(e) => setLocationFilter(e.target.value)}
              />
            </div>
            <div>
              <label className="text-sm font-medium text-gray-700 mb-1 block">
                Skills
              </label>
              <Input
                placeholder="Java, Sales, Healthcare..."
                value={skillsFilter}
                onChange={(e) => setSkillsFilter(e.target.value)}
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="text-sm font-medium text-gray-700 mb-1 block">
                Job Type
              </label>
              <Select
                value={jobTypeFilter}
                onValueChange={setJobTypeFilter}
              >
                <SelectTrigger>
                  <SelectValue placeholder="All job types" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Types</SelectItem>
                  <SelectItem value="full_time">Full Time</SelectItem>
                  <SelectItem value="part_time">Part Time</SelectItem>
                  <SelectItem value="contract">Contract</SelectItem>
                  <SelectItem value="temporary">Temporary</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="flex items-center space-x-2 pt-6">
              <Checkbox
                id="remote-only"
                checked={remoteOnly}
                onCheckedChange={(checked) => setRemoteOnly(!!checked)}
              />
              <label htmlFor="remote-only" className="text-sm text-gray-700">
                Remote friendly roles only
              </label>
            </div>
            <div className="flex items-end">
              <Button className="w-full" onClick={handleSearch} disabled={loading}>
                <Search className="h-4 w-4 mr-2" />
                Search Jobs
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Open Roles ({pagination.totalItems})</CardTitle>
          <CardDescription>
            Only jobs eligible for vendor submissions are listed here.
          </CardDescription>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="space-y-4">
              {[1, 2, 3].map((n) => (
                <div key={n} className="h-28 bg-gray-100 animate-pulse rounded-xl" />
              ))}
            </div>
          ) : error ? (
            <div className="text-center py-10">
              <AlertCircle className="h-10 w-10 text-red-500 mx-auto mb-3" />
              <p className="text-gray-600">{error}</p>
              <Button className="mt-4" variant="outline" onClick={refresh}>
                Retry
              </Button>
            </div>
          ) : jobs.length === 0 ? (
            <div className="text-center py-10">
              <Briefcase className="h-10 w-10 text-gray-400 mx-auto mb-3" />
              <p className="text-gray-600">No jobs match your filters.</p>
              <p className="text-sm text-gray-500">
                Adjust your criteria or refresh to load all jobs.
              </p>
            </div>
          ) : (
            <div className="space-y-4">
              {jobs.map((job) => (
                <div
                  key={job.id}
                  className="border rounded-xl p-5 hover:shadow-md transition-shadow"
                >
                  <div className="flex flex-col md:flex-row md:justify-between gap-4">
                    <div className="flex-1">
                      <div className="flex items-start gap-3">
                        <div className="w-12 h-12 rounded-xl bg-vendor-100 flex items-center justify-center">
                          <Building2 className="h-6 w-6 text-vendor-600" />
                        </div>
                        <div>
                          <h3 className="text-xl font-semibold text-gray-900">
                            {job.title}
                          </h3>
                          <p className="text-sm text-gray-500">
                            {job.company_name} • Posted {formatPostedDate(job.created_at)}
                          </p>
                        </div>
                      </div>
                      <div className="flex flex-wrap gap-2 mt-3">
                        <Badge variant="secondary">{job.job_type}</Badge>
                        {job.remote_work_allowed && (
                          <Badge variant="outline">Remote</Badge>
                        )}
                        {job.vendor_eligible && (
                          <Badge className="bg-vendor-100 text-vendor-700 border-0">
                            Vendor Eligible
                          </Badge>
                        )}
                      </div>
                      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 mt-4 text-sm text-gray-700">
                        <div className="flex items-center gap-2">
                          <MapPin className="h-4 w-4" />
                          <span>{job.location || "Multiple locations"}</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <DollarSign className="h-4 w-4" />
                          <span>{jobService.formatSalaryRange(job as any)}</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <Users className="h-4 w-4" />
                          <span>{job.vendor_submissions || 0} submissions from you</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <Target className="h-4 w-4" />
                          <span>
                            {job.total_submissions || 0} total submissions
                          </span>
                        </div>
                      </div>
                      {job.required_skills && job.required_skills.length > 0 && (
                        <div className="mt-4">
                          <p className="text-xs font-semibold text-gray-600 uppercase">
                            Key skills
                          </p>
                          <div className="flex flex-wrap gap-1 mt-1">
                            {job.required_skills.slice(0, 5).map((skill) => (
                              <Badge key={skill} variant="outline" className="text-xs">
                                {skill}
                              </Badge>
                            ))}
                            {job.required_skills.length > 5 && (
                              <Badge variant="outline" className="text-xs">
                                +{job.required_skills.length - 5} more
                              </Badge>
                            )}
                          </div>
                        </div>
                      )}
                    </div>
                    <div className="flex flex-col gap-2 min-w-[200px]">
                      <Button
                        onClick={() => openSubmitDialog(job)}
                        disabled={candidates.length === 0}
                      >
                        <Send className="h-4 w-4 mr-2" />
                        Submit Candidate
                      </Button>
                      <Button
                        variant="outline"
                        onClick={() => navigate(`/job/${job.id}`)}
                      >
                        View Public Posting
                      </Button>
                    </div>
                  </div>
                </div>
              ))}

              {pagination.totalPages > 1 && (
                <div className="flex items-center justify-between pt-4">
                  <p className="text-sm text-gray-600">
                    Page {pagination.currentPage} of {pagination.totalPages}
                  </p>
                  <div className="flex items-center gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      disabled={!pagination.hasPrevPage}
                      onClick={() =>
                        searchJobs({ ...filters, page: pagination.currentPage - 1 })
                      }
                    >
                      Previous
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      disabled={!pagination.hasNextPage}
                      onClick={() =>
                        searchJobs({ ...filters, page: pagination.currentPage + 1 })
                      }
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

      <Dialog open={submitDialogOpen} onOpenChange={setSubmitDialogOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Submit Candidate</DialogTitle>
            <DialogDescription>
              {selectedJob
                ? `Submit a candidate to ${selectedJob.title} at ${selectedJob.company_name}`
                : "Select a candidate to proceed"}
            </DialogDescription>
          </DialogHeader>

          {selectedJob && (
            <div className="space-y-4">
              <div>
                <label className="text-sm font-medium text-gray-700 mb-1 block">
                  Candidate
                </label>
                <Select
                  value={submissionForm.candidate_id}
                  onValueChange={(value) =>
                    setSubmissionForm((prev) => ({ ...prev, candidate_id: value }))
                  }
                  disabled={candidatesLoading || candidates.length === 0}
                >
                  <SelectTrigger>
                    <SelectValue
                      placeholder={
                        candidatesLoading
                          ? "Loading candidates..."
                          : candidates.length === 0
                          ? "No candidates available"
                          : "Select a candidate"
                      }
                    />
                  </SelectTrigger>
                  <SelectContent>
                    {candidates.map((candidate) => (
                      <SelectItem key={candidate.id} value={candidate.id}>
                        {candidate.first_name} {candidate.last_name} •{" "}
                        {candidate.experience_years || 0} yrs exp
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                {candidates.length === 0 && (
                  <p className="text-xs text-gray-500 mt-1">
                    You have no candidates yet.{" "}
                    <button
                      className="text-vendor-600 underline"
                      onClick={() => navigate("/dashboard/vendor/candidates")}
                    >
                      Create one first.
                    </button>
                  </p>
                )}
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium text-gray-700 mb-1 block">
                    Expected Salary
                  </label>
                  <Input
                    type="number"
                    value={submissionForm.expected_salary}
                    onChange={(e) =>
                      setSubmissionForm((prev) => ({
                        ...prev,
                        expected_salary: e.target.value,
                      }))
                    }
                    placeholder="e.g. 120000"
                  />
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-700 mb-1 block">
                    Availability Date
                  </label>
                  <Input
                    type="date"
                    value={submissionForm.availability_date}
                    onChange={(e) =>
                      setSubmissionForm((prev) => ({
                        ...prev,
                        availability_date: e.target.value,
                      }))
                    }
                  />
                </div>
              </div>

              <div>
                <label className="text-sm font-medium text-gray-700 mb-1 block">
                  Cover Letter / Summary
                </label>
                <Textarea
                  rows={4}
                  value={submissionForm.cover_letter}
                  onChange={(e) =>
                    setSubmissionForm((prev) => ({
                      ...prev,
                      cover_letter: e.target.value,
                    }))
                  }
                  placeholder="Highlight why this candidate is a great fit..."
                />
              </div>

              <div>
                <label className="text-sm font-medium text-gray-700 mb-1 block">
                  Internal Notes
                </label>
                <Textarea
                  rows={3}
                  value={submissionForm.notes}
                  onChange={(e) =>
                    setSubmissionForm((prev) => ({
                      ...prev,
                      notes: e.target.value,
                    }))
                  }
                  placeholder="Share context with the recruiter (optional)"
                />
              </div>
            </div>
          )}

          <DialogFooter className="flex flex-col gap-2 sm:flex-row sm:justify-between">
            <Button
              type="button"
              variant="outline"
              onClick={() => setSubmitDialogOpen(false)}
            >
              Cancel
            </Button>
            <Button
              onClick={handleSubmitCandidate}
              disabled={
                isSubmitting ||
                candidates.length === 0 ||
                !submissionForm.candidate_id
              }
            >
              {isSubmitting ? (
                <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
              ) : (
                <Send className="h-4 w-4 mr-2" />
              )}
              Submit Candidate
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default VendorJobs;


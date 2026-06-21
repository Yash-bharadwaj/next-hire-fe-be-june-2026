import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { useToast } from "@/hooks/use-toast";
import { API_BASE_URL } from "@/lib/api";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
} from "@/components/ui/dropdown-menu";
import {
  ArrowLeft,
  Loader2,
  AlertCircle,
  Mail,
  Phone,
  MapPin,
  Calendar,
  DollarSign,
  Briefcase,
  Building,
  Star,
  FileText,
  Paperclip,
  Download,
  Edit,
  MoreHorizontal,
  MessageSquare,
  CheckCircle,
  Linkedin,
  Globe,
  Trash,
  Eye,
  Plus,
} from "lucide-react";
import {
  submissionService,
  Submission,
  SubmissionStatus,
} from "@/services/submissionService";
import { recruiterService } from "@/services/recruiterService";
import { ScheduleInterviewDialog } from "@/components/ScheduleInterviewDialog";
import { ExpandableText } from "@/components/ExpandableText";
import { ExpandableBadgeList } from "@/components/ExpandableBadgeList";
import { formatCompactCurrency, formatCompactRange } from "@/lib/format";

const STATUS_META: Record<string, { label: string; color: string }> = {
  new_candidate: { label: "Pipeline", color: "bg-gray-100 text-gray-800" },
  initial_scanning: { label: "Initial Scanning", color: "bg-blue-100 text-blue-800" },
  first_round: { label: "First Round", color: "bg-purple-100 text-purple-800" },
  technical_round: { label: "Technical Manager Round", color: "bg-yellow-100 text-yellow-800" },
  final_round: { label: "Final Round", color: "bg-orange-100 text-orange-800" },
  sourcing: { label: "Sourcing", color: "bg-gray-100 text-gray-800" },
  submitted: { label: "Submitted", color: "bg-blue-100 text-blue-800" },
  under_review: { label: "Under Review", color: "bg-yellow-100 text-yellow-800" },
  shortlisted: { label: "Shortlisted", color: "bg-green-100 text-green-800" },
  interview_scheduled: { label: "Interview Scheduled", color: "bg-purple-100 text-purple-800" },
  interviewed: { label: "Interviewed", color: "bg-indigo-100 text-indigo-800" },
  offered: { label: "Offered", color: "bg-emerald-100 text-emerald-800" },
  hired: { label: "Hired", color: "bg-green-100 text-green-800" },
  rejected: { label: "Rejected", color: "bg-red-100 text-red-800" },
};

const formatDateTime = (dateString?: string | null) => {
  if (!dateString) return "—";
  return new Date(dateString).toLocaleDateString("en-US", {
    year: "numeric",
    month: "short",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
};

const formatDateOnly = (dateString?: string | null) => {
  if (!dateString) return "—";
  return new Date(dateString).toLocaleDateString("en-US", {
    year: "numeric",
    month: "short",
    day: "numeric",
  });
};

const resolveFileUrl = (url?: string | null) => {
  if (!url) return null;
  if (url.startsWith("http://") || url.startsWith("https://")) return url;
  return `${API_BASE_URL}${url.startsWith("/") ? "" : "/"}${url}`;
};

const SubmissionDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const { toast } = useToast();

  const [submission, setSubmission] = useState<Submission | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [showStatusDialog, setShowStatusDialog] = useState(false);
  const [newStatus, setNewStatus] = useState("");
  const [statusNote, setStatusNote] = useState("");
  const [savingStatus, setSavingStatus] = useState(false);

  const [showNoteDialog, setShowNoteDialog] = useState(false);
  const [newNote, setNewNote] = useState("");
  const [savingNote, setSavingNote] = useState(false);

  const [showAttachmentDialog, setShowAttachmentDialog] = useState(false);
  const [attachmentUrl, setAttachmentUrl] = useState("");
  const [attachmentName, setAttachmentName] = useState("");
  const [savingAttachment, setSavingAttachment] = useState(false);

  const [showScheduleDialog, setShowScheduleDialog] = useState(false);

  const isRecruiter = user?.role === "recruiter";
  const isCandidate = user?.role === "candidate";

  const fetchSubmission = async () => {
    if (!id) return;
    try {
      setLoading(true);
      setError(null);
      const response = await submissionService.getSubmissionById(id);
      setSubmission(response.data.submission);
    } catch (err: any) {
      setError(
        err?.response?.data?.message || err?.message || "Failed to load submission"
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSubmission();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id]);

  const handleUpdateStatus = async () => {
    if (!submission || !newStatus) return;
    try {
      setSavingStatus(true);
      await submissionService.updateSubmissionStatus(submission.id, {
        status: newStatus as SubmissionStatus,
        notes: statusNote.trim() || undefined,
      });
      toast({ title: "Status updated" });
      setShowStatusDialog(false);
      setNewStatus("");
      setStatusNote("");
      fetchSubmission();
    } catch (err: any) {
      toast({
        title: "Failed to update status",
        description: err?.response?.data?.message || err?.message,
        variant: "destructive",
      });
    } finally {
      setSavingStatus(false);
    }
  };

  const handleAddNote = async () => {
    if (!submission || !newNote.trim()) return;
    try {
      setSavingNote(true);
      await recruiterService.addSubmissionNote(submission.id, newNote.trim());
      toast({ title: "Note added" });
      setNewNote("");
      setShowNoteDialog(false);
      fetchSubmission();
    } catch (err: any) {
      toast({
        title: "Failed to add note",
        description: err?.response?.data?.message || err?.message,
        variant: "destructive",
      });
    } finally {
      setSavingNote(false);
    }
  };

  const handleAddAttachment = async () => {
    if (!submission || !attachmentUrl.trim()) return;
    try {
      setSavingAttachment(true);
      await recruiterService.addSubmissionAttachment(submission.id, {
        url: attachmentUrl.trim(),
        name: attachmentName.trim() || undefined,
      });
      toast({ title: "Attachment added" });
      setAttachmentUrl("");
      setAttachmentName("");
      setShowAttachmentDialog(false);
      fetchSubmission();
    } catch (err: any) {
      toast({
        title: "Failed to add attachment",
        description: err?.response?.data?.message || err?.message,
        variant: "destructive",
      });
    } finally {
      setSavingAttachment(false);
    }
  };

  const handleWithdraw = async () => {
    if (!submission) return;
    if (!window.confirm("Are you sure you want to withdraw this application?")) return;
    try {
      await submissionService.withdrawSubmission(submission.id);
      toast({ title: "Application withdrawn" });
      navigate("/dashboard/submissions");
    } catch (err: any) {
      toast({
        title: "Failed to withdraw",
        description: err?.response?.data?.message || err?.message,
        variant: "destructive",
      });
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="flex items-center space-x-2 text-gray-600">
          <Loader2 className="h-6 w-6 animate-spin" />
          <span>Loading submission...</span>
        </div>
      </div>
    );
  }

  if (error || !submission) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="text-center">
          <AlertCircle className="h-12 w-12 text-red-500 mx-auto mb-4" />
          <h2 className="text-xl font-semibold mb-2">Submission Not Found</h2>
          <p className="text-muted-foreground mb-4">
            {error || "This submission doesn't exist or you don't have permission to view it."}
          </p>
          <Button onClick={() => navigate("/dashboard/submissions")}>
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Submissions
          </Button>
        </div>
      </div>
    );
  }

  const candidate = submission.candidate;
  const job = submission.job;
  const statusMeta =
    STATUS_META[submission.status] || { label: submission.status, color: "bg-gray-100 text-gray-800" };
  const salaryRange = job
    ? job.job_type === "contract"
      ? formatCompactRange(job.bill_rate_min, job.bill_rate_max, { suffix: "/hr" })
      : formatCompactRange(job.salary_min, job.salary_max)
    : "Not specified";

  const resumeUrl = resolveFileUrl(submission.resume_url || candidate?.resume_url);

  type TimelineEvent = { at: string; label: string; icon: JSX.Element; detail?: string };
  const timelineEvents: TimelineEvent[] = [
    {
      at: submission.submitted_at,
      label: "Submitted",
      icon: <Briefcase className="h-4 w-4 text-blue-600" />,
    },
    ...(submission.notes_history || []).map((entry) => ({
      at: entry.at,
      label: "Note added",
      icon: <MessageSquare className="h-4 w-4 text-gray-600" />,
      detail: entry.note,
    })),
    ...(submission.attachments || []).map((entry) => ({
      at: entry.at,
      label: "Attachment added",
      icon: <Paperclip className="h-4 w-4 text-gray-600" />,
      detail: entry.name,
    })),
    ...(submission.reviewed_at
      ? [
          {
            at: submission.reviewed_at,
            label: "Reviewed",
            icon: <CheckCircle className="h-4 w-4 text-green-600" />,
            detail: submission.reviewer?.recruiterProfile
              ? `${submission.reviewer.recruiterProfile.first_name} ${submission.reviewer.recruiterProfile.last_name}`
              : submission.reviewer?.email,
          },
        ]
      : []),
  ].sort((a, b) => new Date(a.at).getTime() - new Date(b.at).getTime());

  return (
    <div className="space-y-6 pb-10">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div className="flex items-start gap-4">
          <Button variant="ghost" size="sm" onClick={() => navigate("/dashboard/submissions")}>
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back
          </Button>
          <div>
            <div className="flex items-center gap-2 flex-wrap">
              <h1 className="text-2xl font-bold text-gray-900">
                {candidate?.first_name} {candidate?.last_name}
              </h1>
              <Badge className={statusMeta.color}>{statusMeta.label}</Badge>
              {submission.ai_score !== undefined && submission.ai_score !== null && (
                <Badge variant="outline" className="flex items-center gap-1">
                  <Star className="h-3 w-3 text-yellow-500" />
                  {submission.ai_score}% match
                </Badge>
              )}
            </div>
            <p className="text-gray-600 mt-1">
              Applied for{" "}
              <button
                onClick={() => navigate(`/dashboard/jobs/${job?.id}`)}
                className="font-medium text-gray-900 hover:text-blue-700 hover:underline"
              >
                {job?.title}
              </button>{" "}
              at {job?.company_name}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          {isRecruiter && (
            <>
              <Button onClick={() => setShowStatusDialog(true)}>
                <Edit className="h-4 w-4 mr-2" />
                Update Status
              </Button>
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="outline" size="icon">
                    <MoreHorizontal className="h-4 w-4" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  <DropdownMenuItem onClick={() => navigate(`/dashboard/candidates/${candidate?.id}`)}>
                    <Eye className="h-4 w-4 mr-2" />
                    View Candidate Profile
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => setShowScheduleDialog(true)}>
                    <Calendar className="h-4 w-4 mr-2" />
                    Schedule Interview
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => setShowNoteDialog(true)}>
                    <MessageSquare className="h-4 w-4 mr-2" />
                    Add Note
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => setShowAttachmentDialog(true)}>
                    <Paperclip className="h-4 w-4 mr-2" />
                    Add Attachment
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </>
          )}
          {isCandidate && submission.status === "submitted" && (
            <Button variant="destructive" onClick={handleWithdraw}>
              <Trash className="h-4 w-4 mr-2" />
              Withdraw Application
            </Button>
          )}
        </div>
      </div>

      <Tabs defaultValue="overview">
        <TabsList>
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="notes">Notes</TabsTrigger>
          <TabsTrigger value="documents">Documents</TabsTrigger>
          <TabsTrigger value="timeline">Timeline</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-6 mt-4">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-base">
                  <Briefcase className="h-4 w-4" />
                  Job
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3 text-sm">
                <div className="flex items-center gap-2 text-gray-700">
                  <Building className="h-4 w-4 text-gray-400" />
                  {job?.company_name}
                </div>
                <div className="flex items-center gap-2 text-gray-700">
                  <MapPin className="h-4 w-4 text-gray-400" />
                  {job?.location || "—"}
                </div>
                <div className="flex items-center gap-2 text-gray-700">
                  <DollarSign className="h-4 w-4 text-gray-400" />
                  {salaryRange}
                </div>
                {job?.required_skills && job.required_skills.length > 0 && (
                  <div className="pt-1">
                    <p className="text-xs font-medium text-gray-500 mb-1.5">Required Skills</p>
                    <ExpandableBadgeList items={job.required_skills} initialCount={6} />
                  </div>
                )}
                {job?.description && (
                  <div className="pt-1">
                    <p className="text-xs font-medium text-gray-500 mb-1.5">Description</p>
                    <ExpandableText text={job.description} maxLength={240} className="text-gray-600" />
                  </div>
                )}
                <Button variant="link" className="px-0 h-auto" onClick={() => navigate(`/dashboard/jobs/${job?.id}`)}>
                  View Job Details
                </Button>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-base">
                  <Mail className="h-4 w-4" />
                  Candidate
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3 text-sm">
                <div className="flex items-center gap-2 text-gray-700">
                  <Mail className="h-4 w-4 text-gray-400" />
                  {candidate?.user?.email || "—"}
                </div>
                {candidate?.phone && (
                  <div className="flex items-center gap-2 text-gray-700">
                    <Phone className="h-4 w-4 text-gray-400" />
                    {candidate.phone}
                  </div>
                )}
                {candidate?.location && (
                  <div className="flex items-center gap-2 text-gray-700">
                    <MapPin className="h-4 w-4 text-gray-400" />
                    {candidate.location}
                  </div>
                )}
                {candidate?.experience_years !== undefined && (
                  <div className="flex items-center gap-2 text-gray-700">
                    <Briefcase className="h-4 w-4 text-gray-400" />
                    {candidate.experience_years} years experience
                  </div>
                )}
                {(candidate?.linkedin_url || candidate?.portfolio_url) && (
                  <div className="flex items-center gap-3 pt-1">
                    {candidate.linkedin_url && (
                      <a
                        href={candidate.linkedin_url}
                        target="_blank"
                        rel="noreferrer"
                        className="flex items-center gap-1 text-blue-700 hover:underline"
                      >
                        <Linkedin className="h-4 w-4" />
                        LinkedIn
                      </a>
                    )}
                    {candidate.portfolio_url && (
                      <a
                        href={candidate.portfolio_url}
                        target="_blank"
                        rel="noreferrer"
                        className="flex items-center gap-1 text-blue-700 hover:underline"
                      >
                        <Globe className="h-4 w-4" />
                        Portfolio
                      </a>
                    )}
                  </div>
                )}
                {candidate?.skills && candidate.skills.length > 0 && (
                  <div className="pt-1">
                    <p className="text-xs font-medium text-gray-500 mb-1.5">Skills</p>
                    <ExpandableBadgeList items={candidate.skills} initialCount={6} />
                  </div>
                )}
                {candidate?.bio && (
                  <div className="pt-1">
                    <p className="text-xs font-medium text-gray-500 mb-1.5">Bio</p>
                    <ExpandableText text={candidate.bio} maxLength={240} className="text-gray-600" />
                  </div>
                )}
                <Button
                  variant="link"
                  className="px-0 h-auto"
                  onClick={() => navigate(`/dashboard/candidates/${candidate?.id}`)}
                >
                  View Full Profile
                </Button>
              </CardContent>
            </Card>
          </div>

          <Card>
            <CardHeader>
              <CardTitle className="text-base">Application Details</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3 text-sm">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <p className="text-xs font-medium text-gray-500">Submitted</p>
                  <p className="text-gray-800">{formatDateTime(submission.submitted_at)}</p>
                </div>
                <div>
                  <p className="text-xs font-medium text-gray-500">Expected Salary</p>
                  <p className="text-gray-800">
                    {formatCompactCurrency(submission.expected_salary) || "Not specified"}
                  </p>
                </div>
                <div>
                  <p className="text-xs font-medium text-gray-500">Availability</p>
                  <p className="text-gray-800">{formatDateOnly(submission.availability_date)}</p>
                </div>
              </div>
              {submission.submitter && (
                <div>
                  <p className="text-xs font-medium text-gray-500">Submitted By</p>
                  <p className="text-gray-800">
                    {submission.submitter.vendorProfile
                      ? `${submission.submitter.vendorProfile.company_name}${
                          submission.submitter.vendorProfile.contact_person_name
                            ? ` (${submission.submitter.vendorProfile.contact_person_name})`
                            : ""
                        }`
                      : submission.submitter.email}{" "}
                    <span className="text-gray-500">— {submission.submitter.role}</span>
                  </p>
                </div>
              )}
              {submission.cover_letter && (
                <div>
                  <p className="text-xs font-medium text-gray-500 mb-1">Cover Letter</p>
                  <ExpandableText text={submission.cover_letter} maxLength={320} className="text-gray-700" />
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="notes" className="mt-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle className="text-base">Notes</CardTitle>
              {isRecruiter && (
                <Button size="sm" onClick={() => setShowNoteDialog(true)}>
                  <Plus className="h-4 w-4 mr-2" />
                  Add Note
                </Button>
              )}
            </CardHeader>
            <CardContent>
              {submission.notes_history && submission.notes_history.length > 0 ? (
                <div className="space-y-4">
                  {[...submission.notes_history].reverse().map((entry, idx) => (
                    <div key={idx} className="border-l-2 border-gray-200 pl-4 py-1">
                      <p className="text-sm text-gray-800">{entry.note}</p>
                      <p className="text-xs text-gray-400 mt-1">{formatDateTime(entry.at)}</p>
                    </div>
                  ))}
                </div>
              ) : submission.notes ? (
                <div className="border-l-2 border-gray-200 pl-4 py-1">
                  <p className="text-sm text-gray-800">{submission.notes}</p>
                </div>
              ) : (
                <p className="text-sm text-gray-500">No notes yet.</p>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="documents" className="mt-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle className="text-base">Resume</CardTitle>
              </CardHeader>
              <CardContent>
                {resumeUrl ? (
                  <a
                    href={resumeUrl}
                    target="_blank"
                    rel="noreferrer"
                    className="flex items-center gap-2 text-blue-700 hover:underline text-sm"
                  >
                    <Download className="h-4 w-4" />
                    Download Resume
                  </a>
                ) : (
                  <p className="text-sm text-gray-500">No resume on file.</p>
                )}
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between">
                <CardTitle className="text-base">Attachments</CardTitle>
                {isRecruiter && (
                  <Button size="sm" onClick={() => setShowAttachmentDialog(true)}>
                    <Plus className="h-4 w-4 mr-2" />
                    Add
                  </Button>
                )}
              </CardHeader>
              <CardContent>
                {submission.attachments && submission.attachments.length > 0 ? (
                  <div className="space-y-2">
                    {submission.attachments.map((attachment, idx) => (
                      <a
                        key={idx}
                        href={attachment.url}
                        target="_blank"
                        rel="noreferrer"
                        className="flex items-center gap-2 text-blue-700 hover:underline text-sm"
                      >
                        <FileText className="h-4 w-4" />
                        {attachment.name}
                      </a>
                    ))}
                  </div>
                ) : (
                  <p className="text-sm text-gray-500">No attachments yet.</p>
                )}
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="timeline" className="mt-4">
          <Card>
            <CardContent className="pt-6">
              <div className="space-y-5">
                {timelineEvents.map((event, idx) => (
                  <div key={idx} className="flex items-start gap-3">
                    <div className="mt-0.5">{event.icon}</div>
                    <div>
                      <p className="text-sm font-medium text-gray-900">{event.label}</p>
                      {event.detail && <p className="text-sm text-gray-600">{event.detail}</p>}
                      <p className="text-xs text-gray-400">{formatDateTime(event.at)}</p>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      <Dialog open={showStatusDialog} onOpenChange={setShowStatusDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Update Submission Status</DialogTitle>
            <DialogDescription>
              Change the status of {candidate?.first_name} {candidate?.last_name}'s submission
            </DialogDescription>
          </DialogHeader>
          <div className="py-2 space-y-4">
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
            <Textarea
              placeholder="Add a note about this status change (optional)"
              value={statusNote}
              onChange={(e) => setStatusNote(e.target.value)}
            />
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowStatusDialog(false)}>
              Cancel
            </Button>
            <Button onClick={handleUpdateStatus} disabled={!newStatus || savingStatus}>
              {savingStatus ? "Updating..." : "Update Status"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={showNoteDialog} onOpenChange={setShowNoteDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Add Note</DialogTitle>
          </DialogHeader>
          <Textarea
            placeholder="Write a note..."
            value={newNote}
            onChange={(e) => setNewNote(e.target.value)}
            className="min-h-[100px]"
          />
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowNoteDialog(false)}>
              Cancel
            </Button>
            <Button onClick={handleAddNote} disabled={!newNote.trim() || savingNote}>
              {savingNote ? "Saving..." : "Add Note"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={showAttachmentDialog} onOpenChange={setShowAttachmentDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Add Attachment</DialogTitle>
          </DialogHeader>
          <div className="space-y-3">
            <Input
              placeholder="Attachment URL"
              value={attachmentUrl}
              onChange={(e) => setAttachmentUrl(e.target.value)}
            />
            <Input
              placeholder="Display name (optional)"
              value={attachmentName}
              onChange={(e) => setAttachmentName(e.target.value)}
            />
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowAttachmentDialog(false)}>
              Cancel
            </Button>
            <Button onClick={handleAddAttachment} disabled={!attachmentUrl.trim() || savingAttachment}>
              {savingAttachment ? "Saving..." : "Add Attachment"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {submission && (
        <ScheduleInterviewDialog
          isOpen={showScheduleDialog}
          onClose={() => setShowScheduleDialog(false)}
          submission={{
            id: submission.id,
            candidate: candidate
              ? {
                  first_name: candidate.first_name,
                  last_name: candidate.last_name,
                  email: candidate.user?.email || "",
                }
              : undefined,
            job: job ? { title: job.title || "", company_name: job.company_name || "" } : undefined,
          }}
          onSuccess={() => setShowScheduleDialog(false)}
        />
      )}
    </div>
  );
};

export default SubmissionDetail;

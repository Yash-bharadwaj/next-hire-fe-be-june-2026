import { useState, useEffect, useCallback } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { useToast } from "@/hooks/use-toast";
import { resolveDocumentUrl } from "@/lib/api";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Calendar as CalendarComponent } from "@/components/ui/calendar";
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
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
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
  Download,
  Edit,
  Linkedin,
  Globe,
  Trash,
  Plus,
  Search,
  UserCog,
  Bot,
  CheckSquare,
  Activity,
  Award,
  Target,
  Users,
  TrendingUp,
  UserCheck,
  AlertTriangle,
  FileText,
  Briefcase as BriefcaseIcon,
  LayoutGrid,
  Upload,
  Presentation,
} from "lucide-react";
import {
  submissionService,
  Submission,
  SubmissionStatus,
} from "@/services/submissionService";
import { recruiterService, Task, TaskPriority, TaskStatus, TeamMember, TASK_STATUS_LABELS, TASK_STATUS_OPTIONS } from "@/services/recruiterService";
import { jobService } from "@/services/jobService";
import { ScheduleInterviewDialog } from "@/components/ScheduleInterviewDialog";
import { ExpandableText } from "@/components/ExpandableText";
import { ExpandableBadgeList } from "@/components/ExpandableBadgeList";
import { NotesPanel } from "@/components/NotesPanel";
import { DocumentsPanel } from "@/components/DocumentsPanel";
import { JobProfitabilityPanel } from "@/components/JobProfitabilityPanel";
import { formatCompactCurrency, formatCompactRange } from "@/lib/format";
import { getSubmissionStatusMeta } from "@/lib/submissionStatus";
import { MAX_PAGE_SIZE } from "@/lib/constants";
import { PageLoadingState } from "@/components/PageLoadingState";
import { ActionsMenuTrigger } from "@/components/ActionsMenuTrigger";
import { computeSkillMatrix, summarizeSkillMatrix, getMatchLevelLabel } from "@/lib/skillMatching";

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

const tabTriggerClass = "data-[state=active]:bg-white data-[state=active]:shadow-sm";

const SubmissionDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const { toast } = useToast();

  const [submission, setSubmission] = useState<Submission | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [resumeOpening, setResumeOpening] = useState(false);

  const [showStatusDialog, setShowStatusDialog] = useState(false);
  const [newStatus, setNewStatus] = useState("");
  const [statusNote, setStatusNote] = useState("");
  const [savingStatus, setSavingStatus] = useState(false);

  const [showScheduleDialog, setShowScheduleDialog] = useState(false);

  const isRecruiter = user?.role === "recruiter";
  const isCandidate = user?.role === "candidate";

  const fetchSubmission = useCallback(async () => {
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
  }, [id]);

  useEffect(() => {
    fetchSubmission();
  }, [fetchSubmission]);

  // ── Team members (for Change Assignment / Task assignment) ─────────────
  const [teamOptions, setTeamOptions] = useState<TeamMember[]>([]);
  useEffect(() => {
    recruiterService.getTeamMembers().then(setTeamOptions).catch(() => {});
  }, []);
  const formatTeamMemberName = (member: TeamMember) => {
    const name = [member.recruiterProfile?.first_name, member.recruiterProfile?.last_name]
      .filter(Boolean)
      .join(" ")
      .trim();
    return name || member.email;
  };

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

  // ── Manual Search (deep-link into the job's existing Manual Search) ────
  const handleManualSearch = () => {
    if (submission?.job?.id) navigate(`/dashboard/jobs/${submission.job.id}?openManualSearch=1`);
  };

  // ── Change Assignment (reassign the job's owning recruiter) ─────────────
  const [showChangeAssignment, setShowChangeAssignment] = useState(false);
  const [reassignRecruiterId, setReassignRecruiterId] = useState("");
  const [savingAssignment, setSavingAssignment] = useState(false);

  const handleChangeAssignment = async () => {
    if (!submission?.job?.id || !reassignRecruiterId) return;
    setSavingAssignment(true);
    try {
      await jobService.updateJob(submission.job.id, { assigned_to: reassignRecruiterId });
      toast({ title: "Assignment updated" });
      setShowChangeAssignment(false);
      fetchSubmission();
    } catch (err: any) {
      toast({
        title: "Error",
        description: err?.response?.data?.message || "Failed to update assignment",
        variant: "destructive",
      });
    } finally {
      setSavingAssignment(false);
    }
  };

  // ── Assign to AI Agent (real Gemini re-score, persisted to ai_score) ───
  const [assigningAiAgent, setAssigningAiAgent] = useState(false);

  const handleAssignAiAgent = async () => {
    if (!submission) return;
    setAssigningAiAgent(true);
    try {
      const res = await recruiterService.assignSubmissionAiAgent(submission.id);
      toast({ title: "AI Agent", description: res.message });
      fetchSubmission();
    } catch (err: any) {
      toast({
        title: "Error",
        description: err?.response?.data?.message || "AI scoring is temporarily unavailable",
        variant: "destructive",
      });
    } finally {
      setAssigningAiAgent(false);
    }
  };

  // ── Tasks (scoped to this submission) ───────────────────────────────────
  const [tasks, setTasks] = useState<Task[]>([]);
  const [tasksLoading, setTasksLoading] = useState(false);
  const [showAddTask, setShowAddTask] = useState(false);
  const [newTaskTitle, setNewTaskTitle] = useState("");
  const [newTaskDueDate, setNewTaskDueDate] = useState("");
  const [newTaskPlannedCompletionDate, setNewTaskPlannedCompletionDate] = useState("");
  const [newTaskComments, setNewTaskComments] = useState("");
  const [newTaskPriority, setNewTaskPriority] = useState<TaskPriority>("medium");
  const [newTaskAssignee, setNewTaskAssignee] = useState("");
  const [savingTask, setSavingTask] = useState(false);
  const [reassigningTaskId, setReassigningTaskId] = useState<string | null>(null);
  const [tasksFilter, setTasksFilter] = useState("all");
  const [tasksSearch, setTasksSearch] = useState("");

  const fetchTasks = useCallback(async () => {
    if (!submission?.id) return;
    setTasksLoading(true);
    try {
      const res = await recruiterService.getTasks({ submission_id: submission.id, limit: MAX_PAGE_SIZE });
      setTasks((res as any)?.data?.tasks || []);
    } catch {
      // empty state handles failures gracefully
    } finally {
      setTasksLoading(false);
    }
  }, [submission?.id]);

  useEffect(() => {
    fetchTasks();
  }, [fetchTasks]);

  const filteredTasks = tasks.filter((task) => {
    const matchesFilter =
      tasksFilter === "all" ||
      task.status === tasksFilter ||
      task.priority === tasksFilter;
    const q = tasksSearch.toLowerCase();
    const matchesSearch =
      !q ||
      task.title.toLowerCase().includes(q) ||
      (task.description || "").toLowerCase().includes(q);
    return matchesFilter && matchesSearch;
  });

  const handleAddTask = async () => {
    if (!submission?.id || !newTaskTitle.trim()) return;
    setSavingTask(true);
    try {
      await recruiterService.createTask({
        title: newTaskTitle.trim(),
        submission_id: submission.id,
        priority: newTaskPriority,
        due_date: newTaskDueDate || undefined,
        planned_completion_date: newTaskPlannedCompletionDate || undefined,
        description: newTaskComments || undefined,
        assigned_to: newTaskAssignee || undefined,
      });
      toast({ title: "Task added" });
      setNewTaskTitle("");
      setNewTaskDueDate("");
      setNewTaskPlannedCompletionDate("");
      setNewTaskComments("");
      setNewTaskPriority("medium");
      setNewTaskAssignee("");
      setShowAddTask(false);
      fetchTasks();
    } catch (err: any) {
      toast({
        title: "Error",
        description: err?.response?.data?.message || "Failed to add task",
        variant: "destructive",
      });
    } finally {
      setSavingTask(false);
    }
  };

  const handleToggleTask = async (task: Task) => {
    const nextStatus = task.status === "completed" ? "not_started" : "completed";
    try {
      await recruiterService.updateTask(task.id, { status: nextStatus });
      setTasks((prev) => prev.map((t) => (t.id === task.id ? { ...t, status: nextStatus } : t)));
    } catch (err: any) {
      toast({
        title: "Error",
        description: err?.response?.data?.message || "Failed to update task",
        variant: "destructive",
      });
    }
  };

  const handleRescheduleTask = async (taskId: string, dueDate: Date) => {
    try {
      await recruiterService.updateTask(taskId, { due_date: dueDate.toISOString() });
      toast({ title: "Task rescheduled" });
      fetchTasks();
    } catch (err: any) {
      toast({
        title: "Error",
        description: err?.response?.data?.message || "Failed to reschedule task",
        variant: "destructive",
      });
    }
  };

  const handleReassignTask = async (taskId: string, assigneeId: string) => {
    try {
      await recruiterService.updateTask(taskId, { assigned_to: assigneeId });
      toast({ title: "Task reassigned" });
      setReassigningTaskId(null);
      fetchTasks();
    } catch (err: any) {
      toast({
        title: "Error",
        description: err?.response?.data?.message || "Failed to reassign task",
        variant: "destructive",
      });
    }
  };

  const handleDeleteTask = async (taskId: string) => {
    try {
      await recruiterService.deleteTask(taskId);
      setTasks((prev) => prev.filter((t) => t.id !== taskId));
    } catch (err: any) {
      toast({
        title: "Error",
        description: err?.response?.data?.message || "Failed to delete task",
        variant: "destructive",
      });
    }
  };

  // ── Related jobs (Pitch tab) ─────────────────────────────────────────────
  const [relatedJobs, setRelatedJobs] = useState<any[]>([]);
  const [relatedJobsLoading, setRelatedJobsLoading] = useState(false);

  const fetchRelatedJobs = useCallback(async () => {
    if (!submission?.id) return;
    setRelatedJobsLoading(true);
    try {
      const res = await recruiterService.getRelatedJobsForSubmission(submission.id);
      setRelatedJobs((res as any)?.data?.jobs || []);
    } catch {
      // empty state handles failures gracefully
    } finally {
      setRelatedJobsLoading(false);
    }
  }, [submission?.id]);

  useEffect(() => {
    fetchRelatedJobs();
  }, [fetchRelatedJobs]);

  if (loading) {
    return (
      <PageLoadingState
        label="Loading submission..."
        minHeightClassName="min-h-[60vh]"
        contentClassName="flex items-center space-x-2 text-gray-600"
      />
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
  const statusMeta = getSubmissionStatusMeta(submission.status);
  const salaryRange = job
    ? job.job_type === "contract"
      ? formatCompactRange(job.bill_rate_min, job.bill_rate_max, { suffix: "/hr" })
      : formatCompactRange(job.salary_min, job.salary_max)
    : "Not specified";

  const resumeKey = submission.resume_url || candidate?.resume_url;

  const handleOpenResume = async () => {
    if (!resumeKey) return;
    setResumeOpening(true);
    try {
      const url = await resolveDocumentUrl(resumeKey);
      if (!url) throw new Error("No URL returned");
      window.open(url, "_blank", "noopener,noreferrer");
    } catch (err: any) {
      toast({
        title: "Error",
        description: err?.response?.data?.message || "Failed to open resume",
        variant: "destructive",
      });
    } finally {
      setResumeOpening(false);
    }
  };

  const skillMatrix = computeSkillMatrix(job, candidate);
  const skillSummary = summarizeSkillMatrix(skillMatrix);

  const daysActive = Math.max(
    0,
    Math.round((Date.now() - new Date(submission.submitted_at).getTime()) / (1000 * 60 * 60 * 24))
  );

  type TimelineEvent = { at: string; label: string; icon: JSX.Element; detail?: string };
  const timelineEvents: TimelineEvent[] = [
    {
      at: submission.submitted_at,
      label: "Submitted",
      icon: <BriefcaseIcon className="h-4 w-4 text-blue-600" />,
    },
    ...(submission.status_history || []).map((entry) => ({
      at: entry.at,
      label: `Status changed to ${getSubmissionStatusMeta(entry.to).label}`,
      icon: <AlertTriangle className="h-4 w-4 text-yellow-600" />,
      detail: entry.notes,
    })),
    ...(submission.notes_history || []).map((entry) => ({
      at: entry.at,
      label: `Note added by ${entry.author}`,
      icon: <FileText className="h-4 w-4 text-gray-600" />,
      detail: entry.content,
    })),
    ...(submission.attachments || []).map((entry) => ({
      at: entry.at,
      label: "Document uploaded",
      icon: <FileText className="h-4 w-4 text-purple-600" />,
      detail: entry.name,
    })),
    ...(submission.reviewed_at
      ? [
          {
            at: submission.reviewed_at,
            label: "Reviewed",
            icon: <UserCheck className="h-4 w-4 text-green-600" />,
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
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <ActionsMenuTrigger variant="outline" />
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem
                  onClick={() => {
                    setNewStatus(submission.status);
                    setStatusNote("");
                    setShowStatusDialog(true);
                  }}
                >
                  <Edit className="h-4 w-4 mr-2" />
                  Edit Submission
                </DropdownMenuItem>
                <DropdownMenuItem onClick={handleManualSearch} disabled={!job?.id}>
                  <Search className="h-4 w-4 mr-2" />
                  Manual Search
                </DropdownMenuItem>
                <DropdownMenuItem
                  onClick={() => {
                    setReassignRecruiterId(job?.assigned_to || "");
                    setShowChangeAssignment(true);
                  }}
                >
                  <UserCog className="h-4 w-4 mr-2" />
                  Change Assignment
                </DropdownMenuItem>
                <DropdownMenuItem onClick={handleAssignAiAgent} disabled={assigningAiAgent}>
                  <Bot className="h-4 w-4 mr-2" />
                  {assigningAiAgent ? "Scoring..." : "Assign to AI Agent"}
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          )}
          {isCandidate && submission.status === "submitted" && (
            <Button variant="destructive" onClick={handleWithdraw}>
              <Trash className="h-4 w-4 mr-2" />
              Withdraw Application
            </Button>
          )}
        </div>
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-3">
            <div className="flex items-center gap-2 text-sm text-gray-600">
              <Calendar className="w-4 h-4 text-blue-600" />
              Submitted
            </div>
            <p className="font-semibold text-gray-900">{formatDateOnly(submission.submitted_at)}</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-3">
            <div className="flex items-center gap-2 text-sm text-gray-600">
              <DollarSign className="w-4 h-4 text-green-600" />
              {job?.job_type === "contract" ? "Bill Rate" : "Salary"}
            </div>
            <p className="font-semibold text-gray-900">{salaryRange}</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-3">
            <div className="flex items-center gap-2 text-sm text-gray-600">
              <Calendar className="w-4 h-4 text-orange-600" />
              Availability
            </div>
            <p className="font-semibold text-gray-900">{formatDateOnly(submission.availability_date)}</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-3">
            <div className="flex items-center gap-2 text-sm text-gray-600">
              <TrendingUp className="w-4 h-4 text-purple-600" />
              Experience
            </div>
            <p className="font-semibold text-gray-900">
              {candidate?.experience_years !== undefined ? `${candidate.experience_years}+ years` : "Not specified"}
            </p>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="overview">
        <TabsList className="flex-wrap h-auto bg-gray-100 p-1 rounded-lg gap-1">
          <TabsTrigger value="overview" className={tabTriggerClass}>
            <LayoutGrid className="w-4 h-4 mr-2" />
            Overview
          </TabsTrigger>
          <TabsTrigger value="matching" className={tabTriggerClass}>
            <Bot className="w-4 h-4 mr-2" />
            AI Matching
          </TabsTrigger>
          <TabsTrigger value="notes" className={tabTriggerClass}>
            <FileText className="w-4 h-4 mr-2" />
            Notes
          </TabsTrigger>
          {isRecruiter && (
            <TabsTrigger value="tasks" className={tabTriggerClass}>
              <CheckSquare className="w-4 h-4 mr-2" />
              Tasks
            </TabsTrigger>
          )}
          <TabsTrigger value="documents" className={tabTriggerClass}>
            <Upload className="w-4 h-4 mr-2" />
            Documents
          </TabsTrigger>
          <TabsTrigger value="timeline" className={tabTriggerClass}>
            <Activity className="w-4 h-4 mr-2" />
            Timeline
          </TabsTrigger>
          {isRecruiter && (
            <TabsTrigger value="profitability" className={tabTriggerClass}>
              <DollarSign className="w-4 h-4 mr-2" />
              Profitability
            </TabsTrigger>
          )}
          <TabsTrigger value="pitch" className={tabTriggerClass}>
            <Presentation className="w-4 h-4 mr-2" />
            Pitch
          </TabsTrigger>
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
                {submission.ai_score !== undefined && submission.ai_score !== null && (
                  <div className="bg-gradient-to-r from-purple-50 to-blue-50 rounded-lg p-3 border border-purple-100">
                    <Label className="text-xs font-medium text-purple-700">AI Skill Match</Label>
                    <div className="flex items-center gap-2 mt-1">
                      <Badge variant="outline" className="flex items-center gap-1 text-base font-bold px-3 py-1">
                        <Star className="h-4 w-4 text-yellow-500" />
                        {submission.ai_score}%
                      </Badge>
                      <span className="text-sm text-purple-600">{getMatchLevelLabel(submission.ai_score)} Match</span>
                    </div>
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
                <div className="flex items-center gap-2 pt-1">
                  {candidate?.user?.email && (
                    <a href={`mailto:${candidate.user.email}`}>
                      <Button size="sm" variant="outline">
                        <Mail className="h-4 w-4 mr-1" />
                        Email
                      </Button>
                    </a>
                  )}
                  {candidate?.phone && (
                    <a href={`tel:${candidate.phone}`}>
                      <Button size="sm" variant="outline">
                        <Phone className="h-4 w-4 mr-1" />
                        Call
                      </Button>
                    </a>
                  )}
                </div>
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

          {job?.client && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-base">
                  <Users className="h-4 w-4" />
                  Client
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3 text-sm">
                <p className="font-semibold text-gray-900">{job.client.name}</p>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                  {job.client.industry && (
                    <div>
                      <p className="text-xs font-medium text-gray-500">Industry</p>
                      <p className="text-gray-800">{job.client.industry}</p>
                    </div>
                  )}
                  {job.client.company_size && (
                    <div>
                      <p className="text-xs font-medium text-gray-500">Company Size</p>
                      <p className="text-gray-800 capitalize">{job.client.company_size}</p>
                    </div>
                  )}
                  {job.client.status && (
                    <div>
                      <p className="text-xs font-medium text-gray-500">Relationship</p>
                      <p className="text-gray-800 capitalize">{job.client.status}</p>
                    </div>
                  )}
                </div>
                {job.clientContact && (
                  <div className="pt-2 border-t">
                    <p className="text-xs font-medium text-gray-500">Primary Contact</p>
                    <p className="text-gray-800">
                      {job.clientContact.name}
                      {job.clientContact.title ? ` — ${job.clientContact.title}` : ""}
                    </p>
                  </div>
                )}
              </CardContent>
            </Card>
          )}

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
                      : submission.submitter.recruiterProfile
                      ? `${submission.submitter.recruiterProfile.first_name} ${submission.submitter.recruiterProfile.last_name}`
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

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <Card className="bg-gradient-to-br from-blue-50 to-blue-100 border-blue-200">
              <CardContent className="p-4 flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-blue-700">Days Active</p>
                  <p className="text-2xl font-bold text-blue-900">{daysActive}</p>
                </div>
                <Activity className="w-8 h-8 text-blue-600" />
              </CardContent>
            </Card>
            <Card className="bg-gradient-to-br from-green-50 to-green-100 border-green-200">
              <CardContent className="p-4 flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-green-700">Skills Matched</p>
                  <p className="text-2xl font-bold text-green-900">
                    {skillSummary.matchedCount}/{skillSummary.totalSkills}
                  </p>
                </div>
                <Target className="w-8 h-8 text-green-600" />
              </CardContent>
            </Card>
            <Card className="bg-gradient-to-br from-purple-50 to-purple-100 border-purple-200">
              <CardContent className="p-4 flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-purple-700">Tasks</p>
                  <p className="text-2xl font-bold text-purple-900">
                    {tasks.filter((t) => t.status !== "completed").length} open
                  </p>
                </div>
                <CheckSquare className="w-8 h-8 text-purple-600" />
              </CardContent>
            </Card>
            <Card className="bg-gradient-to-br from-orange-50 to-orange-100 border-orange-200">
              <CardContent className="p-4 flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-orange-700">Status</p>
                  <p className="text-lg font-bold text-orange-900">{statusMeta.label}</p>
                </div>
                <Users className="w-8 h-8 text-orange-600" />
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="matching" className="space-y-6 mt-4">
          <Card className="bg-gradient-to-r from-purple-50 to-blue-50 border-purple-200">
            <CardContent className="p-6">
              <div className="flex items-center justify-between mb-4 flex-wrap gap-3">
                <div>
                  <h3 className="text-xl font-bold text-gray-900">Overall AI Match Score</h3>
                  <p className="text-gray-600">Real-time score from Gemini, based on job and candidate profile</p>
                </div>
                {submission.ai_score !== undefined && submission.ai_score !== null ? (
                  <div className="flex items-center gap-3 px-6 py-3 rounded-xl font-bold text-3xl border-2 text-purple-700 bg-white border-purple-200">
                    <Star className="w-8 h-8 fill-current text-yellow-500" />
                    {submission.ai_score}%
                  </div>
                ) : (
                  <Button onClick={handleAssignAiAgent} disabled={assigningAiAgent || !isRecruiter}>
                    <Bot className="w-4 h-4 mr-2" />
                    {assigningAiAgent ? "Scoring..." : "Run AI Match"}
                  </Button>
                )}
              </div>
              <div className="grid grid-cols-3 gap-6">
                <div className="text-center">
                  <div className="text-2xl font-bold text-green-600">
                    {skillSummary.matchedCount}/{skillSummary.totalSkills}
                  </div>
                  <div className="text-sm text-gray-600">Skills Matched</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-blue-600">{skillSummary.avgScore}%</div>
                  <div className="text-sm text-gray-600">Avg. Skill Score</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-purple-600">{getMatchLevelLabel(skillSummary.avgScore)}</div>
                  <div className="text-sm text-gray-600">Skill Match Level</div>
                </div>
              </div>
              {submission.ai_reasoning && (
                <div className="mt-4 pt-4 border-t border-purple-200/60">
                  <p className="text-xs font-medium text-purple-700 mb-1">AI Reasoning</p>
                  <p className="text-sm text-gray-700">{submission.ai_reasoning}</p>
                </div>
              )}
            </CardContent>
          </Card>

          <Card className="shadow-sm">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Award className="w-5 h-5 text-purple-600" />
                Skill Coverage
              </CardTitle>
              <p className="text-sm text-gray-500">
                Based on the candidate's recorded skills against this job's required and preferred skills.
              </p>
            </CardHeader>
            <CardContent>
              {skillMatrix.length === 0 ? (
                <p className="text-center text-gray-500 py-8">This job has no required or preferred skills listed.</p>
              ) : (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Skill</TableHead>
                      <TableHead>Type</TableHead>
                      <TableHead>Category</TableHead>
                      <TableHead>Candidate Level</TableHead>
                      <TableHead>Experience</TableHead>
                      <TableHead className="text-center">Score</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {skillMatrix.map((row) => (
                      <TableRow key={`${row.requirement}-${row.skill}`}>
                        <TableCell className="font-semibold text-gray-900">
                          <div className="flex items-center gap-2">
                            <div className={`w-2 h-2 rounded-full ${row.matched ? "bg-green-500" : "bg-gray-300"}`} />
                            {row.skill}
                          </div>
                        </TableCell>
                        <TableCell>
                          <Badge variant="outline" className="text-xs">
                            {row.requirement}
                          </Badge>
                        </TableCell>
                        <TableCell className="text-gray-600">{row.category}</TableCell>
                        <TableCell className="font-medium text-gray-700">{row.candidateLevel}</TableCell>
                        <TableCell className="text-gray-600">
                          {row.yearsExperience !== undefined ? `${row.yearsExperience} years` : "—"}
                        </TableCell>
                        <TableCell className="text-center">
                          <Badge
                            className={
                              row.score >= 80
                                ? "bg-green-100 text-green-800"
                                : row.score >= 50
                                ? "bg-yellow-100 text-yellow-800"
                                : "bg-gray-100 text-gray-600"
                            }
                          >
                            {row.score}%
                          </Badge>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="notes" className="mt-4">
          <NotesPanel
            title="Submission Notes"
            description="Keep track of important observations and updates"
            notes={submission.notes_history || []}
            onAdd={async (data) => {
              await recruiterService.addSubmissionNote(submission.id, data);
              fetchSubmission();
            }}
            onUpdate={async (noteId, data) => {
              await recruiterService.updateSubmissionNote(submission.id, noteId, data);
              fetchSubmission();
            }}
            onDelete={async (noteId) => {
              await recruiterService.deleteSubmissionNote(submission.id, noteId);
              fetchSubmission();
            }}
          />
        </TabsContent>

        {isRecruiter && (
          <TabsContent value="tasks" className="mt-4">
            <Card>
              <CardHeader>
                <div className="flex flex-row items-center justify-between">
                  <CardTitle className="flex items-center gap-2 text-base">
                    <CheckSquare className="h-4 w-4" />
                    Tasks
                  </CardTitle>
                  <Dialog open={showAddTask} onOpenChange={setShowAddTask}>
                    <DialogTrigger asChild>
                      <Button size="sm">
                        <Plus className="h-4 w-4 mr-2" />
                        Add Task
                      </Button>
                    </DialogTrigger>
                    <DialogContent>
                      <DialogHeader>
                        <DialogTitle>Add Task</DialogTitle>
                      </DialogHeader>
                      <div className="space-y-3">
                        <Input
                          placeholder="Task title"
                          value={newTaskTitle}
                          onChange={(e) => setNewTaskTitle(e.target.value)}
                        />
                        <div className="grid grid-cols-2 gap-3">
                          <div className="space-y-1">
                            <Label className="text-xs text-gray-500">Due Date</Label>
                            <Input
                              type="date"
                              value={newTaskDueDate}
                              onChange={(e) => setNewTaskDueDate(e.target.value)}
                            />
                          </div>
                          <div className="space-y-1">
                            <Label className="text-xs text-gray-500">Planned Completion Date</Label>
                            <Input
                              type="date"
                              value={newTaskPlannedCompletionDate}
                              onChange={(e) => setNewTaskPlannedCompletionDate(e.target.value)}
                            />
                          </div>
                        </div>
                        <Select value={newTaskPriority} onValueChange={(v) => setNewTaskPriority(v as TaskPriority)}>
                          <SelectTrigger>
                            <SelectValue placeholder="Priority" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="low">Low</SelectItem>
                            <SelectItem value="medium">Medium</SelectItem>
                            <SelectItem value="high">High</SelectItem>
                          </SelectContent>
                        </Select>
                        <Select value={newTaskAssignee} onValueChange={setNewTaskAssignee}>
                          <SelectTrigger>
                            <SelectValue placeholder="Assign to (optional)" />
                          </SelectTrigger>
                          <SelectContent>
                            {teamOptions.map((member) => (
                              <SelectItem key={member.id} value={member.id}>
                                {formatTeamMemberName(member)}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                      <Textarea
                        placeholder="Comments (optional)"
                        value={newTaskComments}
                        onChange={(e) => setNewTaskComments(e.target.value)}
                        rows={2}
                      />
                      <DialogFooter>
                        <Button variant="outline" onClick={() => setShowAddTask(false)}>
                          Cancel
                        </Button>
                        <Button onClick={handleAddTask} disabled={!newTaskTitle.trim() || savingTask}>
                          {savingTask ? "Adding..." : "Add Task"}
                        </Button>
                      </DialogFooter>
                    </DialogContent>
                  </Dialog>
                </div>

                <div className="flex items-center gap-3 pt-4 border-t flex-wrap">
                  <div className="relative flex-1 max-w-sm">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-4 h-4" />
                    <Input
                      placeholder="Search tasks..."
                      value={tasksSearch}
                      onChange={(e) => setTasksSearch(e.target.value)}
                      className="pl-10"
                    />
                  </div>
                  <Select value={tasksFilter} onValueChange={setTasksFilter}>
                    <SelectTrigger className="w-40">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Tasks</SelectItem>
                      {TASK_STATUS_OPTIONS.map((status) => (
                        <SelectItem key={status} value={status}>
                          {TASK_STATUS_LABELS[status]}
                        </SelectItem>
                      ))}
                      <SelectItem value="high">High Priority</SelectItem>
                      <SelectItem value="medium">Medium Priority</SelectItem>
                      <SelectItem value="low">Low Priority</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </CardHeader>
              <CardContent>
                {tasksLoading ? (
                  <div className="flex items-center justify-center py-10 text-gray-500">
                    <Loader2 className="w-5 h-5 animate-spin mr-2" />
                    Loading tasks...
                  </div>
                ) : filteredTasks.length === 0 ? (
                  <p className="text-center text-gray-500 py-8">
                    {tasks.length === 0 ? "No tasks for this submission yet." : "No tasks match the selected filter."}
                  </p>
                ) : (
                  <div className="space-y-3">
                    {filteredTasks.map((todo) => (
                      <div key={todo.id} className="border rounded-lg p-4 hover:shadow-sm transition-shadow">
                        <div className="flex items-center justify-between gap-3 flex-wrap">
                          <div className="flex items-center gap-3 min-w-0">
                            <Checkbox
                              checked={todo.status === "completed"}
                              onCheckedChange={() => handleToggleTask(todo)}
                            />
                            <div className="min-w-0">
                              <h4
                                className={`font-semibold truncate ${
                                  todo.status === "completed" ? "line-through text-gray-500" : "text-gray-900"
                                }`}
                              >
                                {todo.title}
                              </h4>
                              {todo.description && <p className="text-sm text-gray-600">{todo.description}</p>}
                              <div className="flex items-center gap-3 text-sm text-gray-600">
                                <span>Due: {todo.due_date ? formatDateOnly(todo.due_date) : "—"}</span>
                                {todo.planned_completion_date && (
                                  <span>Planned: {formatDateOnly(todo.planned_completion_date)}</span>
                                )}
                                {todo.assignee && <span>Assigned to: {formatTeamMemberName(todo.assignee)}</span>}
                              </div>
                            </div>
                          </div>
                          <div className="flex items-center gap-2 flex-shrink-0">
                            <Badge
                              className={`text-xs ${
                                todo.priority === "high"
                                  ? "bg-red-100 text-red-800 border-red-200"
                                  : todo.priority === "medium"
                                  ? "bg-yellow-100 text-yellow-800 border-yellow-200"
                                  : "bg-green-100 text-green-800 border-green-200"
                              }`}
                            >
                              {todo.priority}
                            </Badge>
                            <Select
                              value={todo.status}
                              onValueChange={async (status) => {
                                try {
                                  await recruiterService.updateTask(todo.id, { status: status as TaskStatus });
                                  setTasks((prev) => prev.map((t) => (t.id === todo.id ? { ...t, status: status as TaskStatus } : t)));
                                } catch (err: any) {
                                  toast({ title: "Error", description: err?.response?.data?.message || "Failed to update status", variant: "destructive" });
                                }
                              }}
                            >
                              <SelectTrigger className="h-8 w-36 text-xs">
                                <SelectValue />
                              </SelectTrigger>
                              <SelectContent>
                                {TASK_STATUS_OPTIONS.map((status) => (
                                  <SelectItem key={status} value={status}>
                                    {TASK_STATUS_LABELS[status]}
                                  </SelectItem>
                                ))}
                              </SelectContent>
                            </Select>
                            <Popover>
                              <PopoverTrigger asChild>
                                <Button size="sm" variant="outline" className="text-blue-600 hover:bg-blue-50">
                                  <Calendar className="w-4 h-4" />
                                </Button>
                              </PopoverTrigger>
                              <PopoverContent className="w-auto p-0">
                                <CalendarComponent
                                  mode="single"
                                  selected={todo.due_date ? new Date(todo.due_date) : undefined}
                                  onSelect={(date) => date && handleRescheduleTask(todo.id, date)}
                                  initialFocus
                                />
                              </PopoverContent>
                            </Popover>
                            <Dialog
                              open={reassigningTaskId === todo.id}
                              onOpenChange={(open) => setReassigningTaskId(open ? todo.id : null)}
                            >
                              <DialogTrigger asChild>
                                <Button size="sm" variant="outline" className="text-purple-600 hover:bg-purple-50">
                                  <UserCog className="w-4 h-4" />
                                </Button>
                              </DialogTrigger>
                              <DialogContent>
                                <DialogHeader>
                                  <DialogTitle>Reassign Task</DialogTitle>
                                </DialogHeader>
                                <Select onValueChange={(v) => handleReassignTask(todo.id, v)}>
                                  <SelectTrigger>
                                    <SelectValue placeholder="Select assignee" />
                                  </SelectTrigger>
                                  <SelectContent>
                                    {teamOptions.map((member) => (
                                      <SelectItem key={member.id} value={member.id}>
                                        {formatTeamMemberName(member)}
                                      </SelectItem>
                                    ))}
                                  </SelectContent>
                                </Select>
                              </DialogContent>
                            </Dialog>
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => handleDeleteTask(todo.id)}
                              className="text-red-600 hover:bg-red-50"
                            >
                              <Trash className="w-4 h-4" />
                            </Button>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>
        )}

        <TabsContent value="documents" className="space-y-6 mt-4">
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Resume</CardTitle>
            </CardHeader>
            <CardContent>
              {resumeKey ? (
                <button
                  onClick={handleOpenResume}
                  disabled={resumeOpening}
                  className="flex items-center gap-2 text-blue-700 hover:underline text-sm disabled:opacity-60"
                >
                  {resumeOpening ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : (
                    <Download className="h-4 w-4" />
                  )}
                  Download Resume
                </button>
              ) : (
                <p className="text-sm text-gray-500">No resume on file.</p>
              )}
            </CardContent>
          </Card>

          <DocumentsPanel
            title="Submission Documents"
            documents={submission.attachments || []}
            onUpload={async (data) => {
              await recruiterService.addSubmissionAttachment(submission.id, data);
              fetchSubmission();
            }}
          />
        </TabsContent>

        <TabsContent value="timeline" className="mt-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-base">
                <Activity className="h-4 w-4 text-indigo-600" />
                Activity Timeline
              </CardTitle>
              <p className="text-sm text-gray-600">Complete history of submission activities and changes</p>
            </CardHeader>
            <CardContent className="pt-2">
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

        {isRecruiter && (
          <TabsContent value="profitability" className="mt-4">
            {job?.id && <JobProfitabilityPanel jobId={job.id} />}
          </TabsContent>
        )}

        <TabsContent value="pitch" className="space-y-6 mt-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Briefcase className="h-5 w-5" />
                Job Summary
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <h4 className="font-semibold text-sm text-gray-600">Position</h4>
                  <p className="text-gray-900">{job?.title}</p>
                </div>
                <div>
                  <h4 className="font-semibold text-sm text-gray-600">Company</h4>
                  <p className="text-gray-900">{job?.company_name}</p>
                </div>
                <div>
                  <h4 className="font-semibold text-sm text-gray-600">Location</h4>
                  <p className="text-gray-900">{job?.location || "—"}</p>
                </div>
                <div>
                  <h4 className="font-semibold text-sm text-gray-600">Job Type</h4>
                  <p className="text-gray-900 capitalize">{job?.job_type?.replace("_", " ") || "—"}</p>
                </div>
              </div>
              {job?.required_skills && job.required_skills.length > 0 && (
                <div className="mt-4">
                  <h4 className="font-semibold text-sm text-gray-600 mb-2">Key Requirements</h4>
                  <ul className="list-disc list-inside text-gray-700 space-y-1">
                    {job.required_skills.map((skill) => (
                      <li key={skill}>{skill}</li>
                    ))}
                  </ul>
                </div>
              )}
            </CardContent>
          </Card>

          {job?.client && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Building className="h-5 w-5" />
                  Client Summary
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <h4 className="font-semibold text-sm text-gray-600">Company</h4>
                    <p className="text-gray-900">{job.client.name}</p>
                  </div>
                  {job.client.industry && (
                    <div>
                      <h4 className="font-semibold text-sm text-gray-600">Industry</h4>
                      <p className="text-gray-900">{job.client.industry}</p>
                    </div>
                  )}
                  {job.client.company_size && (
                    <div>
                      <h4 className="font-semibold text-sm text-gray-600">Company Size</h4>
                      <p className="text-gray-900 capitalize">{job.client.company_size}</p>
                    </div>
                  )}
                  {job.client.status && (
                    <div>
                      <h4 className="font-semibold text-sm text-gray-600">Partnership Status</h4>
                      <p className="text-gray-900 capitalize">{job.client.status}</p>
                    </div>
                  )}
                </div>
                {job.client.notes && (
                  <div className="mt-4">
                    <h4 className="font-semibold text-sm text-gray-600 mb-2">About the Company</h4>
                    <p className="text-gray-700">{job.client.notes}</p>
                  </div>
                )}
              </CardContent>
            </Card>
          )}

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Target className="h-5 w-5" />
                Candidate Skill Matching Matrix
              </CardTitle>
            </CardHeader>
            <CardContent>
              {skillMatrix.length === 0 ? (
                <p className="text-center text-gray-500 py-6">No required or preferred skills listed for this job.</p>
              ) : (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Skill</TableHead>
                      <TableHead>Type</TableHead>
                      <TableHead>Candidate Level</TableHead>
                      <TableHead>Score</TableHead>
                      <TableHead>Experience</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {skillMatrix.map((row) => (
                      <TableRow key={`${row.requirement}-${row.skill}`}>
                        <TableCell className="font-medium">{row.skill}</TableCell>
                        <TableCell>{row.requirement}</TableCell>
                        <TableCell>{row.candidateLevel}</TableCell>
                        <TableCell>
                          <Badge variant={row.score >= 80 ? "default" : row.score >= 50 ? "secondary" : "outline"}>
                            {row.score}%
                          </Badge>
                        </TableCell>
                        <TableCell>{row.yearsExperience !== undefined ? `${row.yearsExperience} years` : "—"}</TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              )}
            </CardContent>
          </Card>

          {skillMatrix.some((r) => !r.matched) && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <TrendingUp className="h-5 w-5" />
                  Areas of Improvement
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {skillMatrix
                    .filter((r) => !r.matched)
                    .map((row) => (
                      <div key={row.skill} className="p-4 bg-yellow-50 rounded-lg border border-yellow-200">
                        <h4 className="font-semibold text-yellow-800 mb-1">{row.skill}</h4>
                        <p className="text-yellow-700 text-sm">
                          This {row.requirement.toLowerCase()} skill has no record on the candidate's profile.
                        </p>
                      </div>
                    ))}
                </div>
              </CardContent>
            </Card>
          )}

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Search className="h-5 w-5" />
                Other Jobs That Could Be of Interest
              </CardTitle>
              <p className="text-sm text-gray-600">Other active jobs ranked by overlap with this candidate's skills</p>
            </CardHeader>
            <CardContent>
              {relatedJobsLoading ? (
                <div className="flex items-center justify-center py-8 text-gray-500">
                  <Loader2 className="w-5 h-5 animate-spin mr-2" />
                  Loading...
                </div>
              ) : relatedJobs.length === 0 ? (
                <p className="text-center text-gray-500 py-6">No other active jobs match this candidate's skills yet.</p>
              ) : (
                <div className="space-y-4">
                  {relatedJobs.map((r) => (
                    <button
                      key={r.job.id}
                      onClick={() => navigate(`/dashboard/jobs/${r.job.id}`)}
                      className="w-full text-left p-4 border rounded-lg hover:bg-gray-50 transition-colors"
                    >
                      <div className="flex justify-between items-start mb-2">
                        <h4 className="font-semibold text-gray-900">{r.job.title}</h4>
                        <Badge className="bg-green-100 text-green-800">{r.matchScore}% match</Badge>
                      </div>
                      <p className="text-gray-600 text-sm">
                        {r.job.company_name} • {r.job.location || "Remote"}
                      </p>
                    </button>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Edit Submission / Status Dialog */}
      <Dialog open={showStatusDialog} onOpenChange={setShowStatusDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Edit Submission</DialogTitle>
            <DialogDescription>
              Update the status of {candidate?.first_name} {candidate?.last_name}'s submission
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
              {savingStatus ? "Updating..." : "Save"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Change Assignment Dialog */}
      <Dialog open={showChangeAssignment} onOpenChange={setShowChangeAssignment}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Change Assignment</DialogTitle>
            <DialogDescription>Reassign the recruiter who owns this job's pipeline.</DialogDescription>
          </DialogHeader>
          <Select value={reassignRecruiterId} onValueChange={setReassignRecruiterId}>
            <SelectTrigger>
              <SelectValue placeholder="Select recruiter" />
            </SelectTrigger>
            <SelectContent>
              {teamOptions.map((member) => (
                <SelectItem key={member.id} value={member.id}>
                  {formatTeamMemberName(member)}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowChangeAssignment(false)}>
              Cancel
            </Button>
            <Button onClick={handleChangeAssignment} disabled={!reassignRecruiterId || savingAssignment}>
              {savingAssignment ? "Saving..." : "Reassign"}
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

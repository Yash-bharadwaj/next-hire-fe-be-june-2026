import { useState, useEffect, useCallback } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
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
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Calendar as CalendarComponent } from "@/components/ui/calendar";
import { Checkbox } from "@/components/ui/checkbox";
import {
  ArrowLeft,
  Calendar as CalendarIcon,
  Clock,
  Video,
  Phone,
  MapPin,
  Link as LinkIcon,
  Mail,
  Briefcase,
  Building,
  User,
  Star,
  FileText,
  Plus,
  Trash2,
  Loader2,
  Globe,
  Linkedin,
  CheckSquare,
  History,
  Download,
  Edit,
  MoreHorizontal,
  ChevronDown,
  Search,
  UserCog,
  Bot,
} from "lucide-react";
import { useInterviewDetail, useInterviewManagement } from "@/hooks/useInterviews";
import { useToast } from "@/hooks/use-toast";
import { format } from "date-fns";
import { interviewService, InterviewStatus, InterviewType } from "@/services/interviewService";
import { recruiterService, Task, TaskPriority, TeamMember } from "@/services/recruiterService";
import { ScheduleInterviewDialog } from "@/components/ScheduleInterviewDialog";
import { ExpandableText } from "@/components/ExpandableText";
import { ExpandableBadgeList } from "@/components/ExpandableBadgeList";
import { InterviewNotesPanel } from "@/components/InterviewNotesPanel";
import { InterviewDocumentsPanel } from "@/components/InterviewDocumentsPanel";
import { formatCompactCurrency, formatCompactRange } from "@/lib/format";

const statusColors: Record<string, string> = {
  scheduled: "bg-blue-100 text-blue-800",
  in_progress: "bg-yellow-100 text-yellow-800",
  completed: "bg-green-100 text-green-800",
  cancelled: "bg-red-100 text-red-800",
  no_show: "bg-gray-100 text-gray-800",
};

const typeIcons: Record<string, JSX.Element> = {
  video: <Video className="h-4 w-4" />,
  phone: <Phone className="h-4 w-4" />,
  in_person: <MapPin className="h-4 w-4" />,
  technical: <Video className="h-4 w-4" />,
  behavioral: <Video className="h-4 w-4" />,
};

const formatDateTime = (iso?: string) => (iso ? format(new Date(iso), "PPP, p") : "Not set");
const formatDateOnly = (iso?: string) => (iso ? format(new Date(iso), "PPP") : "—");

const InterviewDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { toast } = useToast();

  const { interview, loading, error, refresh } = useInterviewDetail(id);
  const { updateInterview } = useInterviewManagement();

  const submission = interview?.submission;
  const job = submission?.job;
  const candidate = submission?.candidate;

  const status = interview?.status || "scheduled";
  const type = interview?.interview_type || "video";

  const handleCopyLink = () => {
    if (interview?.meeting_link) {
      navigator.clipboard.writeText(interview.meeting_link);
      toast({ title: "Meeting link copied" });
    }
  };

  // ── Team members (for ToDo assignment) ─────────────────────────────────
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

  // ── Edit Interview (Actions menu) ───────────────────────────────────────
  const [showEditDialog, setShowEditDialog] = useState(false);
  const [editType, setEditType] = useState<InterviewType>("video");
  const [editDate, setEditDate] = useState("");
  const [editTime, setEditTime] = useState("");
  const [editDuration, setEditDuration] = useState("60");
  const [editLocation, setEditLocation] = useState("");
  const [editMeetingLink, setEditMeetingLink] = useState("");
  const [editInterviewerId, setEditInterviewerId] = useState("");
  const [newStatus, setNewStatus] = useState<InterviewStatus | "">("");
  const [newRating, setNewRating] = useState<string>("");
  const [newFeedback, setNewFeedback] = useState("");
  const [savingStatus, setSavingStatus] = useState(false);

  const openEditDialog = () => {
    if (!interview) return;
    const scheduled = new Date(interview.scheduled_at);
    const pad = (n: number) => n.toString().padStart(2, "0");
    setEditType(interview.interview_type);
    setEditDate(`${scheduled.getFullYear()}-${pad(scheduled.getMonth() + 1)}-${pad(scheduled.getDate())}`);
    setEditTime(`${pad(scheduled.getHours())}:${pad(scheduled.getMinutes())}`);
    setEditDuration(String(interview.duration_minutes || 60));
    setEditLocation(interview.location || "");
    setEditMeetingLink(interview.meeting_link || "");
    setEditInterviewerId(interview.interviewer_id || "");
    setNewStatus(status);
    setNewRating(interview.rating ? String(interview.rating) : "");
    setNewFeedback(interview.feedback || "");
    setShowEditDialog(true);
  };

  const handleSaveEdit = async () => {
    if (!interview || !editDate || !editTime) return;
    setSavingStatus(true);
    const [hours, minutes] = editTime.split(":");
    const scheduledAt = new Date(editDate);
    scheduledAt.setHours(parseInt(hours, 10), parseInt(minutes, 10));

    const result = await updateInterview(interview.id, {
      interview_type: editType,
      scheduled_at: scheduledAt.toISOString(),
      duration_minutes: Number(editDuration),
      location: editLocation || undefined,
      meeting_link: editMeetingLink || undefined,
      interviewer_id: editInterviewerId || undefined,
      status: newStatus || undefined,
      rating: newRating ? Number(newRating) : undefined,
      feedback: newFeedback || undefined,
    });
    setSavingStatus(false);
    if (result) {
      setShowEditDialog(false);
      refresh();
    }
  };

  // ── Change Assignment (interviewer reassignment) ────────────────────────
  const [showChangeAssignment, setShowChangeAssignment] = useState(false);
  const [reassignInterviewerId, setReassignInterviewerId] = useState("");
  const [savingAssignment, setSavingAssignment] = useState(false);

  const handleChangeAssignment = async () => {
    if (!interview || !reassignInterviewerId) return;
    setSavingAssignment(true);
    const result = await updateInterview(interview.id, { interviewer_id: reassignInterviewerId });
    setSavingAssignment(false);
    if (result) {
      setShowChangeAssignment(false);
      refresh();
    }
  };

  // ── Manual Search (deep-link into the job's existing Manual Search) ────
  const handleManualSearch = () => {
    if (job?.id) navigate(`/dashboard/jobs/${job.id}?openManualSearch=1`);
  };

  // ── Assign to AI Agent (real Gemini re-score, persisted to ai_score) ───
  const [assigningAiAgent, setAssigningAiAgent] = useState(false);

  const handleAssignAiAgent = async () => {
    if (!interview) return;
    setAssigningAiAgent(true);
    try {
      const res = await interviewService.assignAiAgent(interview.id);
      toast({ title: "AI Agent", description: res.message });
      refresh();
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

  // ── Rounds (all real interviews for this submission) ───────────────────
  const [rounds, setRounds] = useState<any[]>([]);
  const [roundsLoading, setRoundsLoading] = useState(false);
  const [showScheduleNext, setShowScheduleNext] = useState(false);

  const fetchRounds = useCallback(async () => {
    if (!submission?.id) return;
    setRoundsLoading(true);
    try {
      const res = await interviewService.getInterviews({ submission_id: submission.id, limit: 50 });
      setRounds(res.data.interviews || []);
    } catch {
      // surfaced via the page-level error state is unnecessary here
    } finally {
      setRoundsLoading(false);
    }
  }, [submission?.id]);

  useEffect(() => {
    fetchRounds();
  }, [fetchRounds]);


  // ── ToDo (Tasks scoped to this submission) ──────────────────────────────
  const [tasks, setTasks] = useState<Task[]>([]);
  const [tasksLoading, setTasksLoading] = useState(false);
  const [showAddTask, setShowAddTask] = useState(false);
  const [newTaskTitle, setNewTaskTitle] = useState("");
  const [newTaskDueDate, setNewTaskDueDate] = useState("");
  const [newTaskPriority, setNewTaskPriority] = useState<TaskPriority>("medium");
  const [newTaskAssignee, setNewTaskAssignee] = useState("");
  const [savingTask, setSavingTask] = useState(false);
  const [reassigningTaskId, setReassigningTaskId] = useState<string | null>(null);
  const [todoFilter, setTodoFilter] = useState<"all" | "pending" | "completed" | TaskPriority>("all");

  const filteredTasks = tasks.filter((task) => {
    if (todoFilter === "all") return true;
    if (todoFilter === "pending") return task.status !== "completed";
    if (todoFilter === "completed") return task.status === "completed";
    return task.priority === todoFilter;
  });

  const fetchTasks = useCallback(async () => {
    if (!submission?.id) return;
    setTasksLoading(true);
    try {
      const res = await recruiterService.getTasks({ submission_id: submission.id, limit: 100 });
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

  const handleAddTask = async () => {
    if (!submission?.id || !newTaskTitle.trim()) return;
    setSavingTask(true);
    try {
      await recruiterService.createTask({
        title: newTaskTitle.trim(),
        submission_id: submission.id,
        priority: newTaskPriority,
        due_date: newTaskDueDate || undefined,
        assigned_to: newTaskAssignee || undefined,
      });
      toast({ title: "Task added" });
      setNewTaskTitle("");
      setNewTaskDueDate("");
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
    const nextStatus = task.status === "completed" ? "pending" : "completed";
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

  if (loading) {
    return <div className="text-center text-gray-600 py-16">Loading interview...</div>;
  }
  if (error) {
    return <div className="text-center text-red-600 py-16">{error}</div>;
  }
  if (!interview) {
    return <div className="text-center text-gray-600 py-16">Interview not found.</div>;
  }

  const salaryRange = job
    ? job.job_type === "contract"
      ? formatCompactRange(job.bill_rate_min, job.bill_rate_max, { suffix: "/hr" })
      : formatCompactRange(job.salary_min, job.salary_max)
    : "Not specified";

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div className="flex items-center gap-3">
          <Button variant="ghost" size="icon" onClick={() => navigate(-1)}>
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <div>
            <h1 className="text-2xl font-bold">Interview Details</h1>
            <p className="text-gray-600">{(interview as any).interview_id || `Interview #${interview.id}`}</p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <Badge className={statusColors[status] || "bg-gray-100 text-gray-800"}>{status.replace("_", " ")}</Badge>
          <Badge variant="outline" className="capitalize">
            {type}
          </Badge>

          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline">
                <MoreHorizontal className="h-4 w-4 mr-2" />
                Actions
                <ChevronDown className="h-3 w-3 ml-1" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem onClick={openEditDialog}>
                <Edit className="h-4 w-4 mr-2" />
                Edit Interview
              </DropdownMenuItem>
              <DropdownMenuItem onClick={handleManualSearch} disabled={!job?.id}>
                <Search className="h-4 w-4 mr-2" />
                Manual Search
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => { setReassignInterviewerId(interview.interviewer_id || ""); setShowChangeAssignment(true); }}>
                <UserCog className="h-4 w-4 mr-2" />
                Change Assignment
              </DropdownMenuItem>
              <DropdownMenuItem onClick={handleAssignAiAgent} disabled={assigningAiAgent}>
                <Bot className="h-4 w-4 mr-2" />
                {assigningAiAgent ? "Scoring..." : "Assign to AI Agent"}
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>

          <Button variant="outline" onClick={refresh} disabled={loading}>
            Refresh
          </Button>
        </div>
      </div>

      {/* Edit Interview Dialog */}
      <Dialog open={showEditDialog} onOpenChange={setShowEditDialog}>
        <DialogContent className="max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Edit Interview</DialogTitle>
          </DialogHeader>
          <div className="space-y-3">
            <div>
              <Label>Interview Type</Label>
              <Select value={editType} onValueChange={(v) => setEditType(v as InterviewType)}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="video">Video</SelectItem>
                  <SelectItem value="phone">Phone</SelectItem>
                  <SelectItem value="in_person">In Person</SelectItem>
                  <SelectItem value="technical">Technical</SelectItem>
                  <SelectItem value="behavioral">Behavioral</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <Label>Date</Label>
                <Input type="date" value={editDate} onChange={(e) => setEditDate(e.target.value)} />
              </div>
              <div>
                <Label>Time</Label>
                <Input type="time" value={editTime} onChange={(e) => setEditTime(e.target.value)} />
              </div>
            </div>
            <div>
              <Label>Duration (minutes)</Label>
              <Input type="number" min={15} max={480} value={editDuration} onChange={(e) => setEditDuration(e.target.value)} />
            </div>
            {editType === "in_person" ? (
              <div>
                <Label>Location</Label>
                <Input value={editLocation} onChange={(e) => setEditLocation(e.target.value)} placeholder="Office address or meeting room" />
              </div>
            ) : (
              <div>
                <Label>Meeting Link</Label>
                <Input value={editMeetingLink} onChange={(e) => setEditMeetingLink(e.target.value)} placeholder="https://..." />
              </div>
            )}
            <div>
              <Label>Interviewer</Label>
              <Select value={editInterviewerId} onValueChange={setEditInterviewerId}>
                <SelectTrigger>
                  <SelectValue placeholder="Select interviewer" />
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
            <div>
              <Label>Status</Label>
              <Select value={newStatus} onValueChange={(v) => setNewStatus(v as InterviewStatus)}>
                <SelectTrigger>
                  <SelectValue placeholder="Status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="scheduled">Scheduled</SelectItem>
                  <SelectItem value="in_progress">In Progress</SelectItem>
                  <SelectItem value="completed">Completed</SelectItem>
                  <SelectItem value="cancelled">Cancelled</SelectItem>
                  <SelectItem value="no_show">No Show</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label>Rating (optional)</Label>
              <Select value={newRating} onValueChange={setNewRating}>
                <SelectTrigger>
                  <SelectValue placeholder="Rating (optional)" />
                </SelectTrigger>
                <SelectContent>
                  {[1, 2, 3, 4, 5].map((r) => (
                    <SelectItem key={r} value={String(r)}>
                      {"★".repeat(r)}
                      {"☆".repeat(5 - r)}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label>Feedback (optional)</Label>
              <Textarea placeholder="Feedback (optional)" value={newFeedback} onChange={(e) => setNewFeedback(e.target.value)} />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowEditDialog(false)}>
              Cancel
            </Button>
            <Button onClick={handleSaveEdit} disabled={!editDate || !editTime || savingStatus}>
              {savingStatus ? "Saving..." : "Save Changes"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Change Assignment Dialog */}
      <Dialog open={showChangeAssignment} onOpenChange={setShowChangeAssignment}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Change Assignment</DialogTitle>
            <DialogDescription>Reassign the interviewer for this interview.</DialogDescription>
          </DialogHeader>
          <Select value={reassignInterviewerId} onValueChange={setReassignInterviewerId}>
            <SelectTrigger>
              <SelectValue placeholder="Select interviewer" />
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
            <Button onClick={handleChangeAssignment} disabled={!reassignInterviewerId || savingAssignment}>
              {savingAssignment ? "Saving..." : "Reassign"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Tabs defaultValue="overview">
        <TabsList>
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="applicant">Applicant</TabsTrigger>
          <TabsTrigger value="client">Client</TabsTrigger>
          <TabsTrigger value="rounds">Rounds</TabsTrigger>
          <TabsTrigger value="notes">Notes</TabsTrigger>
          <TabsTrigger value="todo">ToDo</TabsTrigger>
          <TabsTrigger value="documents">Documents</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-6 mt-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-base">
                <Briefcase className="h-4 w-4" />
                Job
              </CardTitle>
            </CardHeader>
            <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
              <div className="space-y-2">
                <div className="font-semibold text-gray-900">{job?.title || "N/A"}</div>
                <div className="flex items-center gap-2 text-gray-600">
                  <Building className="h-4 w-4" />
                  {job?.company_name || "—"}
                </div>
                <div className="flex items-center gap-2 text-gray-600">
                  <MapPin className="h-4 w-4" />
                  {job?.location || "—"}
                </div>
                <div className="text-gray-600">Job ID: {(job as any)?.job_id || job?.id}</div>
                <div className="text-gray-800 font-medium">{salaryRange}</div>
                <Button
                  variant="link"
                  className="px-0 h-auto"
                  onClick={() => job?.id && navigate(`/dashboard/jobs/${job.id}`)}
                >
                  View Job Details
                </Button>
              </div>
              <div className="space-y-2">
                <div className="flex items-center gap-2 text-gray-700">
                  <CalendarIcon className="h-4 w-4" />
                  {formatDateTime(interview.scheduled_at)}
                </div>
                <div className="flex items-center gap-2 text-gray-700">
                  <Clock className="h-4 w-4" />
                  {interview.duration_minutes || 60} minutes
                </div>
                <div className="flex items-center gap-2 text-gray-700 capitalize">
                  {typeIcons[type] || <Video className="h-4 w-4" />}
                  {type.replace("_", " ")}
                </div>
                {interview.meeting_link && (
                  <div className="flex items-center gap-2 text-blue-700">
                    <LinkIcon className="h-4 w-4" />
                    <a href={interview.meeting_link} target="_blank" rel="noreferrer" className="underline">
                      Join meeting
                    </a>
                    <Button size="sm" variant="ghost" onClick={handleCopyLink}>
                      Copy
                    </Button>
                  </div>
                )}
                <div className="text-gray-600">
                  Interviewer:{" "}
                  {interview.interviewer?.recruiterProfile?.first_name
                    ? `${interview.interviewer.recruiterProfile.first_name} ${interview.interviewer.recruiterProfile.last_name || ""}`.trim()
                    : interview.interviewer?.email || "Not set"}
                </div>
                {interview.notes && (
                  <div className="text-gray-600">
                    <span className="font-medium text-gray-700">Latest note: </span>
                    {interview.notes}
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="applicant" className="space-y-6 mt-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-base">
                <User className="h-4 w-4" />
                Applicant
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3 text-sm">
              <div className="font-semibold text-gray-900">
                {candidate ? `${candidate.first_name || ""} ${candidate.last_name || ""}`.trim() : "N/A"}
              </div>
              {submission?.ai_score !== undefined && submission?.ai_score !== null && (
                <div className="flex items-center gap-2 text-yellow-700 bg-yellow-50 border border-yellow-200 rounded-md px-3 py-2 w-fit">
                  <Star className="h-4 w-4" />
                  <span className="font-semibold">{submission.ai_score}% match score</span>
                </div>
              )}
              <div className="flex items-center gap-2 text-gray-700">
                <Mail className="h-4 w-4 text-gray-400" />
                <a href={`mailto:${candidate?.user?.email || ""}`} className="hover:underline">
                  {candidate?.user?.email || "—"}
                </a>
              </div>
              {candidate?.phone && (
                <div className="flex items-center gap-2 text-gray-700">
                  <Phone className="h-4 w-4 text-gray-400" />
                  <a href={`tel:${candidate.phone}`} className="hover:underline">
                    {candidate.phone}
                  </a>
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
              <div className="grid grid-cols-2 gap-4 text-gray-700">
                <div>
                  <p className="text-xs font-medium text-gray-500">Current Salary</p>
                  {formatCompactCurrency(candidate?.current_salary) || "Not specified"}
                </div>
                <div>
                  <p className="text-xs font-medium text-gray-500">Expected Salary</p>
                  {formatCompactCurrency(candidate?.expected_salary) || "Not specified"}
                </div>
              </div>
              {(candidate?.linkedin_url || candidate?.portfolio_url || candidate?.resume_url) && (
                <div className="flex items-center gap-4 pt-1">
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
                  {candidate.resume_url && (
                    <a
                      href={candidate.resume_url}
                      target="_blank"
                      rel="noreferrer"
                      className="flex items-center gap-1 text-blue-700 hover:underline"
                    >
                      <Download className="h-4 w-4" />
                      Resume
                    </a>
                  )}
                </div>
              )}
              {candidate?.skills && candidate.skills.length > 0 && (
                <div className="pt-1">
                  <p className="text-xs font-medium text-gray-500 mb-1.5">Skills</p>
                  <ExpandableBadgeList items={candidate.skills} initialCount={8} />
                </div>
              )}
              {submission?.cover_letter && (
                <div className="pt-1">
                  <p className="text-xs font-medium text-gray-500 mb-1">Cover Letter</p>
                  <ExpandableText text={submission.cover_letter} maxLength={320} className="text-gray-700" />
                </div>
              )}
              <Button
                variant="link"
                className="px-0 h-auto"
                onClick={() => candidate?.id && navigate(`/dashboard/candidates/${candidate.id}`)}
              >
                View Full Profile
              </Button>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="client" className="space-y-6 mt-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-base">
                <Building className="h-4 w-4" />
                Client
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4 text-sm">
              {job?.client ? (
                <div className="space-y-2">
                  <p className="font-semibold text-gray-900">{job.client.name}</p>
                  {job.client.primary_email && (
                    <div className="flex items-center gap-2 text-gray-700">
                      <Mail className="h-4 w-4 text-gray-400" />
                      <a href={`mailto:${job.client.primary_email}`} className="hover:underline">
                        {job.client.primary_email}
                      </a>
                    </div>
                  )}
                  {job.client.primary_phone && (
                    <div className="flex items-center gap-2 text-gray-700">
                      <Phone className="h-4 w-4 text-gray-400" />
                      <a href={`tel:${job.client.primary_phone}`} className="hover:underline">
                        {job.client.primary_phone}
                      </a>
                    </div>
                  )}
                </div>
              ) : (
                <p className="text-gray-500">No client linked to this job yet.</p>
              )}

              {job?.clientContact && (
                <div className="pt-3 border-t space-y-2">
                  <p className="text-xs font-medium text-gray-500">Client Contact</p>
                  <p className="font-medium text-gray-900">
                    {job.clientContact.name}
                    {job.clientContact.title ? ` — ${job.clientContact.title}` : ""}
                  </p>
                  {job.clientContact.email && (
                    <div className="flex items-center gap-2 text-gray-700">
                      <Mail className="h-4 w-4 text-gray-400" />
                      <a href={`mailto:${job.clientContact.email}`} className="hover:underline">
                        {job.clientContact.email}
                      </a>
                    </div>
                  )}
                  {job.clientContact.phone && (
                    <div className="flex items-center gap-2 text-gray-700">
                      <Phone className="h-4 w-4 text-gray-400" />
                      <a href={`tel:${job.clientContact.phone}`} className="hover:underline">
                        {job.clientContact.phone}
                      </a>
                    </div>
                  )}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="rounds" className="space-y-6 mt-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle className="flex items-center gap-2 text-base">
                <History className="h-4 w-4" />
                Interview Rounds
              </CardTitle>
              <Button size="sm" onClick={() => setShowScheduleNext(true)}>
                <Plus className="h-4 w-4 mr-2" />
                Schedule Next Round
              </Button>
            </CardHeader>
            <CardContent>
              {roundsLoading ? (
                <div className="flex items-center justify-center py-10 text-gray-500">
                  <Loader2 className="w-5 h-5 animate-spin mr-2" />
                  Loading rounds...
                </div>
              ) : rounds.length === 0 ? (
                <p className="text-center text-gray-500 py-8">No interview rounds found.</p>
              ) : (
                <div className="space-y-3">
                  {[...rounds]
                    .sort((a, b) => new Date(a.scheduled_at).getTime() - new Date(b.scheduled_at).getTime())
                    .map((round) => (
                      <div
                        key={round.id}
                        className={`border rounded-lg p-4 ${
                          round.id === interview.id ? "border-blue-300 bg-blue-50/40" : "border-gray-200"
                        }`}
                      >
                        <div className="flex items-start justify-between gap-3 flex-wrap">
                          <div>
                            <div className="flex items-center gap-2 mb-1">
                              <Badge className={statusColors[round.status] || "bg-gray-100 text-gray-800"}>
                                {round.status.replace("_", " ")}
                              </Badge>
                              <Badge variant="outline" className="capitalize">
                                {round.interview_type}
                              </Badge>
                              {round.id === interview.id && (
                                <Badge variant="outline" className="text-blue-700 border-blue-300">
                                  Viewing
                                </Badge>
                              )}
                            </div>
                            <p className="text-sm text-gray-700">{formatDateTime(round.scheduled_at)}</p>
                            <p className="text-xs text-gray-500">{round.duration_minutes || 60} minutes</p>
                          </div>
                          <div className="text-right text-sm text-gray-600">
                            <p>
                              {round.interviewer?.recruiterProfile?.first_name
                                ? `${round.interviewer.recruiterProfile.first_name} ${round.interviewer.recruiterProfile.last_name || ""}`.trim()
                                : round.interviewer?.email || "Unassigned"}
                            </p>
                            {round.rating && (
                              <p className="text-yellow-600">
                                {"★".repeat(round.rating)}
                                {"☆".repeat(5 - round.rating)}
                              </p>
                            )}
                          </div>
                        </div>
                        {round.feedback && (
                          <p className="text-sm text-gray-700 mt-2 bg-white/70 rounded p-2">{round.feedback}</p>
                        )}
                        {round.id !== interview.id && (
                          <Button
                            variant="link"
                            className="px-0 h-auto mt-1"
                            onClick={() => navigate(`/dashboard/interviews/${round.id}`)}
                          >
                            View Round
                          </Button>
                        )}
                      </div>
                    ))}
                </div>
              )}

              <div className="grid grid-cols-5 gap-3 mt-6">
                {(["scheduled", "in_progress", "completed", "cancelled", "no_show"] as const).map((s) => (
                  <div key={s} className="text-center p-3 bg-gray-50 rounded-lg">
                    <div className="text-xl font-bold text-gray-800">
                      {rounds.filter((r) => r.status === s).length}
                    </div>
                    <div className="text-xs text-gray-600 capitalize">{s.replace("_", " ")}</div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="notes" className="mt-4">
          <InterviewNotesPanel interviewId={interview.id} notes={interview.notes_history || []} onChanged={refresh} />
        </TabsContent>

        <TabsContent value="todo" className="mt-4">
          <Card>
            <CardHeader>
              <div className="flex flex-row items-center justify-between">
                <CardTitle className="flex items-center gap-2 text-base">
                  <CheckSquare className="h-4 w-4" />
                  ToDo
                </CardTitle>
                <div className="flex items-center gap-2">
                  <Select value={todoFilter} onValueChange={(v) => setTodoFilter(v as typeof todoFilter)}>
                    <SelectTrigger className="w-40">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Items</SelectItem>
                      <SelectItem value="pending">Pending</SelectItem>
                      <SelectItem value="completed">Completed</SelectItem>
                      <SelectItem value="high">High Priority</SelectItem>
                      <SelectItem value="medium">Medium Priority</SelectItem>
                      <SelectItem value="low">Low Priority</SelectItem>
                    </SelectContent>
                  </Select>
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
                      <Input
                        type="date"
                        value={newTaskDueDate}
                        onChange={(e) => setNewTaskDueDate(e.target.value)}
                      />
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
                    </div>
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
              </div>
              <div className="flex items-center gap-4 pt-4 border-t text-sm">
                <span className="text-blue-600">Total: {tasks.length}</span>
                <span className="text-green-600">Completed: {tasks.filter((t) => t.status === "completed").length}</span>
                <span className="text-orange-600">Pending: {tasks.filter((t) => t.status !== "completed").length}</span>
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
                  {tasks.length === 0 ? "No tasks for this interview yet." : "No tasks match the selected filter."}
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
                            <div className="flex items-center gap-3 text-sm text-gray-600">
                              <span>Due: {todo.due_date ? formatDateOnly(todo.due_date) : "—"}</span>
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
                          <Popover>
                            <PopoverTrigger asChild>
                              <Button size="sm" variant="outline" className="text-blue-600 hover:bg-blue-50">
                                <CalendarIcon className="w-4 h-4" />
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
                                <User className="w-4 h-4" />
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
                            <Trash2 className="w-4 h-4" />
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

        <TabsContent value="documents" className="space-y-6 mt-4">
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Candidate Resume</CardTitle>
            </CardHeader>
            <CardContent>
              {candidate?.resume_url ? (
                <a
                  href={candidate.resume_url}
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

          <InterviewDocumentsPanel interviewId={interview.id} documents={interview.attachments || []} onChanged={refresh} />
        </TabsContent>
      </Tabs>

      {/* Schedule Next Round Dialog */}
      {submission?.id && (
        <ScheduleInterviewDialog
          isOpen={showScheduleNext}
          onClose={() => setShowScheduleNext(false)}
          submission={{
            id: submission.id,
            candidate: candidate
              ? {
                  first_name: candidate.first_name,
                  last_name: candidate.last_name,
                  email: candidate.user?.email || "",
                }
              : undefined,
            job: job ? { title: job.title, company_name: job.company_name } : undefined,
          }}
          onSuccess={() => {
            setShowScheduleNext(false);
            fetchRounds();
          }}
        />
      )}
    </div>
  );
};

export default InterviewDetail;
